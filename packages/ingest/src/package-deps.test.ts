import * as fs from 'fs'
import * as path from 'path'

describe('package.json dependency invariants', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'),
  ) as {
    dependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }

  const declaredFor = (group: 'dependencies' | 'peerDependencies') => Object.keys(pkg[group] ?? {})

  it('has no @dna-codes/dna-input-* runtime dependency', () => {
    for (const group of ['dependencies', 'peerDependencies'] as const) {
      const offending = declaredFor(group).filter((d) => d.startsWith('@dna-codes/dna-input-'))
      expect(offending).toEqual([])
    }
  })

  it('has no @dna-codes/dna-integration-* runtime dependency', () => {
    for (const group of ['dependencies', 'peerDependencies'] as const) {
      const offending = declaredFor(group).filter((d) => d.startsWith('@dna-codes/dna-integration-'))
      expect(offending).toEqual([])
    }
  })

  it('has no @dna-codes/dna-output-* runtime dependency', () => {
    for (const group of ['dependencies', 'peerDependencies'] as const) {
      const offending = declaredFor(group).filter((d) => d.startsWith('@dna-codes/dna-output-'))
      expect(offending).toEqual([])
    }
  })

  it('has no @dna-codes/dna-adapters runtime dependency', () => {
    for (const group of ['dependencies', 'peerDependencies'] as const) {
      const offending = declaredFor(group).filter((d) => d === '@dna-codes/dna-adapters')
      expect(offending).toEqual([])
    }
  })

  it('declares @dna-codes/dna-core as the only @dna-codes/* runtime dependency', () => {
    const dnaDeps = declaredFor('dependencies').filter((d) => d.startsWith('@dna-codes/'))
    expect(dnaDeps).toEqual(['@dna-codes/dna-core'])
  })
})
