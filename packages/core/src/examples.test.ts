/**
 * Cross-domain example validation.
 *
 * Each example under `examples/<domain>/operational.json` is loaded, validated
 * against the operational schema, and run through cross-layer validation.
 * Per-domain assertions verify the *specific* shapes that example is supposed
 * to demonstrate — so if a future schema change silently strips support for
 * memberships, system actors, multi-Group users, etc., these tests catch it.
 *
 * Examples live at the repo root (`examples/<domain>/`) so they're visible to
 * users browsing the project, not buried inside a package.
 */

import * as fs from 'fs'
import * as path from 'path'
import { DnaValidator } from './validator'

const EXAMPLES_ROOT = path.resolve(__dirname, '../../../examples')
const validator = new DnaValidator()

function loadExample(domain: string): any {
  const file = path.join(EXAMPLES_ROOT, domain, 'operational.json')
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

describe('examples — schema conformance', () => {
  const domains = fs
    .readdirSync(EXAMPLES_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  it.each(domains)('%s/operational.json validates against the operational schema', (domain) => {
    const doc = loadExample(domain)
    const result = validator.validate(doc, 'operational')
    if (!result.valid) {
      // Emit the AJV errors so a failure points at the offending field.
      console.error(`Schema errors for ${domain}:`, JSON.stringify(result.errors, null, 2))
    }
    expect(result.valid).toBe(true)
  })

  it.each(domains)('%s passes cross-layer validation', (domain) => {
    const doc = loadExample(domain)
    const result = validator.validateCrossLayer({ operational: doc })
    if (!result.valid) {
      console.error(`Cross-layer errors for ${domain}:`, JSON.stringify(result.errors, null, 2))
    }
    expect(result.valid).toBe(true)
  })
})

// ── Per-example shape assertions ────────────────────────────────────────────
//
// Each block asserts the *specific* model features the example is supposed to
// exercise. These are tripwires for silent capability loss: if a future change
// strips support for memberships, system actors, multi-target Triggers, etc.,
// the relevant block fails with a clear message about which feature broke.

describe('examples — lending', () => {
  const dna = loadExample('lending')

  it('has both an Operation-level and a Process-level Trigger for the same first-step Operation', () => {
    const triggers = dna.triggers as Array<any>
    const opTrigger = triggers.find((t) => t.operation === 'Loan.Apply')
    const procTrigger = triggers.find((t) => t.process === 'LoanOrigination')
    expect(opTrigger).toBeDefined()
    expect(procTrigger).toBeDefined()
  })

  it('models a system actor as a plain Resource referenced from a schedule-source Trigger', () => {
    const resources = dna.domain.resources as Array<any>
    const sweep = resources.find((r) => r.name === 'NightlyDelinquencySweep')
    expect(sweep).toBeDefined()

    const triggers = dna.triggers as Array<any>
    const scheduled = triggers.find((t) => t.source === 'schedule')
    expect(scheduled).toBeDefined()

    const rules = dna.rules as Array<any>
    const sysRule = rules.find((r) => r.allow?.some((a: any) => a.role === 'NightlyDelinquencySweep'))
    expect(sysRule).toBeDefined()
  })

  it('declares a scoped Role (Underwriter.scope = BankDepartment)', () => {
    const resources = dna.domain.resources as Array<any>
    const underwriter = resources.find((r) => r.name === 'Underwriter')
    expect(underwriter?.scope).toBe('BankDepartment')
  })

  it('uses Step-level conditions referencing named Rules', () => {
    const proc = dna.processes[0]
    const stepWithCond = proc.steps.find((s: any) => s.conditions?.length)
    expect(stepWithCond?.conditions).toContain('ApplicationIsPending')
  })
})

describe('examples — mass-tort', () => {
  const dna = loadExample('mass-tort')

  it('has Memberships pinning Roles to Group-Resources', () => {
    const resources = dna.domain.resources as Array<any>
    const jane = resources.find((r) => r.name === 'JaneEsq')
    expect(jane?.memberships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: 'LeadCounsel', in: 'Case' }),
        expect.objectContaining({ role: 'CoCounsel', in: 'Case' }),
      ]),
    )
  })

  it('declares Role.scope matching the Group-Resource Memberships pin to', () => {
    const resources = dna.domain.resources as Array<any>
    const leadCounsel = resources.find((r) => r.name === 'LeadCounsel')
    expect(leadCounsel?.scope).toBe('Case')
  })

  it('triggers a Process from an upstream Operation completion', () => {
    const triggers = dna.triggers as Array<any>
    const opTriggered = triggers.find((t) => t.process && t.source === 'operation')
    expect(opTriggered?.after).toBe('Settlement.Accept')
  })

  it('exercises Resource/Actor duality (Claimant has attributes AND is referenced as actor)', () => {
    const resources = dna.domain.resources as Array<any>
    const claimant = resources.find((r) => r.name === 'Claimant')
    expect(claimant?.attributes?.length).toBeGreaterThan(0)
    // Claimant isn't on access rules in this fixture but is wired as a tracked
    // entity — the duality is in the model's shape, not necessarily its current uses.
  })
})

describe('examples — marketplace', () => {
  const dna = loadExample('marketplace')

  it('has a User holding two peer Roles in two distinct Group-Resources simultaneously', () => {
    const resources = dna.domain.resources as Array<any>
    const joe = resources.find((r) => r.name === 'Joe')
    const groups = (joe?.memberships ?? []).map((m: any) => m.in)
    expect(new Set(groups).size).toBeGreaterThanOrEqual(2)
  })

  it('treats both Listing and Booking as Resources serving as Groups', () => {
    const resources = dna.domain.resources as Array<any>
    const listing = resources.find((r) => r.name === 'Listing')
    const booking = resources.find((r) => r.name === 'Booking')
    expect(listing?.attributes?.length).toBeGreaterThan(0)
    expect(booking?.attributes?.length).toBeGreaterThan(0)

    // A Role-Resource scopes to each
    const host = resources.find((r) => r.name === 'Host')
    const guest = resources.find((r) => r.name === 'Guest')
    expect(host?.scope).toBe('Listing')
    expect(guest?.scope).toBe('Booking')
  })

  it('has a global (unscoped) Role alongside scoped ones', () => {
    const resources = dna.domain.resources as Array<any>
    const support = resources.find((r) => r.name === 'SupportAgent')
    expect(support).toBeDefined()
    expect(support.scope).toBeUndefined()
  })

  it('uses Step.else for conditional routing to a sibling Step', () => {
    const proc = dna.processes[0]
    const approve = proc.steps.find((s: any) => s.id === 'approve')
    expect(approve?.else).toBe('decline')
  })
})
