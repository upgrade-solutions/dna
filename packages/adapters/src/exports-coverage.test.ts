/**
 * Exports-coverage check: every adapter folder under
 * `src/{input,output,integration}/<name>/` has a matching `./` + kind +
 * `/` + name entry in `package.json#exports`, and every entry in that
 * exports map (other than `./package.json`) maps to an `index.ts` that
 * actually exists. Catches drift in either direction.
 */

import * as fs from 'fs'
import * as path from 'path'

const PKG_DIR = path.resolve(__dirname, '..')
const SRC = path.join(PKG_DIR, 'src')

const KINDS = ['input', 'output', 'integration'] as const

interface ExportEntry {
  subpath: string
  defaultPath: string
  typesPath: string
}

function readExports(): ExportEntry[] {
  const pkg = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf-8'))
  const exports: Record<string, { types?: string; default?: string } | string> = pkg.exports ?? {}
  const out: ExportEntry[] = []
  for (const [subpath, body] of Object.entries(exports)) {
    if (subpath === './package.json') continue
    if (typeof body === 'string') {
      out.push({ subpath, defaultPath: body, typesPath: body })
      continue
    }
    out.push({
      subpath,
      defaultPath: body.default ?? '',
      typesPath: body.types ?? '',
    })
  }
  return out
}

function adapterFolders(): Array<{ kind: string; name: string }> {
  const out: Array<{ kind: string; name: string }> = []
  for (const kind of KINDS) {
    const kindDir = path.join(SRC, kind)
    if (!fs.existsSync(kindDir)) continue
    for (const name of fs.readdirSync(kindDir)) {
      const dir = path.join(kindDir, name)
      if (fs.statSync(dir).isDirectory()) out.push({ kind, name })
    }
  }
  return out
}

describe('exports coverage', () => {
  it('every adapter folder has a corresponding exports entry', () => {
    const exportsBySubpath = new Set(readExports().map((e) => e.subpath))
    const missing: string[] = []
    for (const { kind, name } of adapterFolders()) {
      const expected = `./${kind}/${name}`
      if (!exportsBySubpath.has(expected)) missing.push(expected)
    }
    expect(missing).toEqual([])
  })

  it('every exports entry has a matching adapter folder with an index.ts', () => {
    const orphans: string[] = []
    for (const e of readExports()) {
      const m = /^\.\/(input|output|integration)\/([^/]+)$/.exec(e.subpath)
      if (!m) continue
      const [, kind, name] = m
      const indexTs = path.join(SRC, kind, name, 'index.ts')
      if (!fs.existsSync(indexTs)) orphans.push(`${e.subpath} → ${path.relative(PKG_DIR, indexTs)} missing`)
    }
    expect(orphans).toEqual([])
  })

  it('package.json declares no root entry — every consumer imports via subpath', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf-8'))
    expect(pkg.exports['.']).toBeUndefined()
  })
})
