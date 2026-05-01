/**
 * Import-isolation enforcement for `@dna-codes/dna-adapters`.
 *
 * Every `.ts` file under `src/{input,output,integration}/<name>/` is
 * scanned for `import` and `require` statements. The rules:
 *
 *   - Library files (everything except `cli.ts` / `cli.test.ts`) MUST NOT
 *     import any sibling adapter, by relative path or by the package's
 *     own subpath self-reference.
 *
 *   - CLI files under `src/integration/<name>/` MAY import sibling
 *     `input/<x>` and `output/<x>` adapters, but ONLY via the package's
 *     published subpath form (`@dna-codes/dna-adapters/...`). Relative
 *     paths into a sibling folder are rejected so the CLI's source is
 *     identical pre- and post-extraction.
 *
 *   - CLI files under `src/input/<x>/` or `src/output/<x>/` MAY NOT use
 *     this carve-out — only integration CLIs may.
 *
 *   - No `src/util/`, `src/shared/`, or other package-level helper
 *     directory may exist (would block extraction).
 */

import * as fs from 'fs'
import * as path from 'path'

const SRC = path.join(__dirname)
const PKG_NAME = '@dna-codes/dna-adapters'

const KINDS = ['input', 'output', 'integration'] as const
type Kind = (typeof KINDS)[number]

const FORBIDDEN_TOP_LEVEL_DIRS = ['util', 'shared', 'lib', 'helpers', 'common']

interface AdapterFile {
  kind: Kind
  name: string
  /** path relative to packages/adapters/src/<kind>/<name>/ */
  relPath: string
  /** absolute path */
  absPath: string
  isCli: boolean
}

function listAdapterFiles(): AdapterFile[] {
  const files: AdapterFile[] = []
  for (const kind of KINDS) {
    const kindDir = path.join(SRC, kind)
    if (!fs.existsSync(kindDir)) continue
    for (const name of fs.readdirSync(kindDir)) {
      const adapterDir = path.join(kindDir, name)
      if (!fs.statSync(adapterDir).isDirectory()) continue
      walk(adapterDir, (abs) => {
        if (!abs.endsWith('.ts')) return
        const rel = path.relative(adapterDir, abs)
        const base = path.basename(abs)
        files.push({
          kind,
          name,
          relPath: rel,
          absPath: abs,
          isCli: base === 'cli.ts' || base === 'cli.test.ts',
        })
      })
    }
  }
  return files
}

function walk(dir: string, cb: (abs: string) => void): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, cb)
    else cb(abs)
  }
}

const IMPORT_RE = /(?:^|\n)\s*(?:import\b[^'"\n]*?from\s+|import\s*\(\s*|require\s*\(\s*)['"]([^'"]+)['"]/g

function importsOf(absPath: string): string[] {
  const src = fs.readFileSync(absPath, 'utf-8')
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = IMPORT_RE.exec(src)) !== null) out.push(m[1])
  return out
}

describe('package isolation', () => {
  it('has no top-level helper directories that would couple adapters', () => {
    const offenders: string[] = []
    for (const dir of FORBIDDEN_TOP_LEVEL_DIRS) {
      if (fs.existsSync(path.join(SRC, dir))) offenders.push(`src/${dir}/`)
    }
    expect(offenders).toEqual([])
  })

  describe('library files (non-CLI)', () => {
    it('do not import sibling adapters via relative paths', () => {
      const violations: string[] = []
      for (const f of listAdapterFiles()) {
        if (f.isCli) continue
        const adapterRoot = path.join(SRC, f.kind, f.name)
        for (const spec of importsOf(f.absPath)) {
          if (!spec.startsWith('.')) continue
          const resolved = path.resolve(path.dirname(f.absPath), spec)
          // Allow imports that stay inside this adapter's folder (the resolved
          // path may be a directory like the adapter root or a file inside it).
          const inside = resolved === adapterRoot || resolved.startsWith(adapterRoot + path.sep)
          if (inside) continue
          violations.push(`${f.kind}/${f.name}/${f.relPath}: '${spec}' escapes adapter folder`)
        }
      }
      expect(violations).toEqual([])
    })

    it('do not import sibling adapters via package self-reference', () => {
      const violations: string[] = []
      const selfRefRe = new RegExp(`^${PKG_NAME.replace(/[/.]/g, '\\$&')}/(input|output|integration)/([^/]+)`)
      for (const f of listAdapterFiles()) {
        if (f.isCli) continue
        for (const spec of importsOf(f.absPath)) {
          const m = selfRefRe.exec(spec)
          if (!m) continue
          // Self-import of own subpath would also be wrong; treat any self-ref as a violation in library files.
          violations.push(
            `${f.kind}/${f.name}/${f.relPath}: library file imports '${spec}' (self-reference forbidden in library code)`,
          )
        }
      }
      expect(violations).toEqual([])
    })
  })

  describe('CLI files under integration adapters', () => {
    it('may not import sibling adapters via relative paths', () => {
      const violations: string[] = []
      for (const f of listAdapterFiles()) {
        if (!f.isCli) continue
        if (f.kind !== 'integration') continue
        const adapterRoot = path.join(SRC, f.kind, f.name)
        for (const spec of importsOf(f.absPath)) {
          if (!spec.startsWith('.')) continue
          const resolvedDir = path.dirname(path.resolve(path.dirname(f.absPath), spec))
          const inside = resolvedDir === adapterRoot || resolvedDir.startsWith(adapterRoot + path.sep)
          if (inside) continue
          violations.push(
            `${f.kind}/${f.name}/${f.relPath}: relative path '${spec}' escapes adapter; use the published subpath form instead`,
          )
        }
      }
      expect(violations).toEqual([])
    })

    it('use only the published subpath form when importing sibling adapters', () => {
      const violations: string[] = []
      const selfRefRe = new RegExp(`^${PKG_NAME.replace(/[/.]/g, '\\$&')}/(input|output|integration)/([^/]+)`)
      for (const f of listAdapterFiles()) {
        if (!f.isCli) continue
        if (f.kind !== 'integration') continue
        for (const spec of importsOf(f.absPath)) {
          const m = selfRefRe.exec(spec)
          if (!m) continue
          // Allow imports of input/<x> and output/<x>; forbid imports of other integrations.
          const [, kind] = m
          if (kind === 'integration') {
            violations.push(`${f.kind}/${f.name}/${f.relPath}: integration CLI imports another integration ('${spec}') — forbidden`)
          }
        }
      }
      expect(violations).toEqual([])
    })
  })

  describe('CLI files under input/output adapters', () => {
    it('do not use the integration carve-out (sibling subpath imports forbidden)', () => {
      const violations: string[] = []
      const selfRefRe = new RegExp(`^${PKG_NAME.replace(/[/.]/g, '\\$&')}/(input|output|integration)/([^/]+)`)
      for (const f of listAdapterFiles()) {
        if (!f.isCli) continue
        if (f.kind === 'integration') continue
        for (const spec of importsOf(f.absPath)) {
          if (selfRefRe.test(spec)) {
            violations.push(`${f.kind}/${f.name}/${f.relPath}: only integration CLIs may import sibling adapters via subpath ('${spec}' rejected)`)
          }
        }
      }
      expect(violations).toEqual([])
    })
  })
})
