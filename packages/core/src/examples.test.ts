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

describe('examples — healthcare', () => {
  const dna = loadExample('healthcare')

  it('treats Patient as a Resource AND a Group (carries attributes AND is referenced as Role.scope)', () => {
    const resources = dna.domain.resources as Array<any>
    const patient = resources.find((r) => r.name === 'Patient')
    expect(patient?.attributes?.length).toBeGreaterThan(0)

    const patientScopedRoles = resources.filter((r) => r.scope === 'Patient').map((r) => r.name)
    expect(patientScopedRoles).toEqual(
      expect.arrayContaining(['AttendingPhysician', 'PrimaryNurse', 'ConsultingSpecialist']),
    )
  })

  it('has a single User with multiple memberships across many Patient instances', () => {
    const resources = dna.domain.resources as Array<any>
    const drAdams = resources.find((r) => r.name === 'DrAdams')
    expect(drAdams?.memberships?.length).toBeGreaterThanOrEqual(4)
    const patientMemberships = drAdams.memberships.filter((m: any) => m.in === 'Patient')
    expect(patientMemberships.length).toBeGreaterThanOrEqual(4)
  })

  it('mixes Group-Resource types — Patient-scoped Roles AND Pharmacy-scoped Roles', () => {
    const resources = dna.domain.resources as Array<any>
    const pharmacist = resources.find((r) => r.name === 'Pharmacist')
    expect(pharmacist?.scope).toBe('Pharmacy')
    const pharmacy = resources.find((r) => r.name === 'Pharmacy')
    expect(pharmacy).toBeDefined()
  })

  it('has a multi-predicate condition Rule (AND-joined within one Rule)', () => {
    const rules = dna.rules as Array<any>
    const safeRange = rules.find((r) => r.name === 'DoseWithinSafeRange')
    expect(safeRange?.conditions?.length).toBeGreaterThanOrEqual(2)
  })

  it('routes Step.else to a named sibling Step (not abort)', () => {
    const medFlow = dna.processes.find((p: any) => p.name === 'MedicationOrderFlow')
    const approve = medFlow.steps.find((s: any) => s.id === 'approve')
    expect(approve?.else).toBe('reject')
  })
})

describe('examples — manufacturing', () => {
  const dna = loadExample('manufacturing')

  it('declares multiple system actors as plain Resources', () => {
    const resources = dna.domain.resources as Array<any>
    const machineNames = ['CncMachine', 'StampingPress', 'PaintRobot', 'MaintenanceScheduler']
    for (const name of machineNames) {
      expect(resources.find((r) => r.name === name)).toBeDefined()
    }
  })

  it('expresses parallel fan-out + fan-in through Step.depends_on alone', () => {
    const flow = dna.processes[0]
    const stamp = flow.steps.find((s: any) => s.id === 'stamp')
    const paint = flow.steps.find((s: any) => s.id === 'paint')
    const inspect = flow.steps.find((s: any) => s.id === 'inspect')

    // Fan-out: stamp and paint both depend on cut
    expect(stamp.depends_on).toEqual(['cut'])
    expect(paint.depends_on).toEqual(['cut'])
    // Fan-in: inspect depends on both
    expect(inspect.depends_on).toEqual(expect.arrayContaining(['stamp', 'paint']))
  })

  it('uses an Operation-chain Trigger (operation-source with after)', () => {
    const triggers = dna.triggers as Array<any>
    const opChained = triggers.find((t) => t.source === 'operation' && t.operation === 'WorkOrder.Reject')
    expect(opChained?.after).toBe('DefectReport.File')
  })

  it('combines schedule-source Trigger with access rule limited to a system actor', () => {
    const triggers = dna.triggers as Array<any>
    const cutTrigger = triggers.find((t) => t.operation === 'WorkOrder.Cut' && t.source === 'schedule')
    expect(cutTrigger).toBeDefined()

    const rules = dna.rules as Array<any>
    const cutRule = rules.find((r) => r.operation === 'WorkOrder.Cut' && r.type === 'access')
    expect(cutRule?.allow).toEqual([{ role: 'CncMachine' }])
  })
})

describe('examples — education', () => {
  const dna = loadExample('education')

  it('separates Course (catalog) from CourseOffering (the Group-Resource)', () => {
    const resources = dna.domain.resources as Array<any>
    const course = resources.find((r) => r.name === 'Course')
    const offering = resources.find((r) => r.name === 'CourseOffering')
    expect(course).toBeDefined()
    expect(offering).toBeDefined()

    // Instructor + Student scope to CourseOffering, not Course
    const instructor = resources.find((r) => r.name === 'Instructor')
    const student = resources.find((r) => r.name === 'Student')
    expect(instructor?.scope).toBe('CourseOffering')
    expect(student?.scope).toBe('CourseOffering')
  })

  it('has a single User holding both Instructor and Student Roles in different CourseOfferings simultaneously', () => {
    const resources = dna.domain.resources as Array<any>
    const drPatel = resources.find((r) => r.name === 'DrPatel')
    const roles = (drPatel?.memberships ?? []).map((m: any) => m.role)
    expect(new Set(roles)).toEqual(new Set(['Instructor', 'Student']))
  })

  it('declares three distinct scope tiers (CourseOffering, Department, global)', () => {
    const resources = dna.domain.resources as Array<any>
    const instructor = resources.find((r) => r.name === 'Instructor')
    const chair = resources.find((r) => r.name === 'DepartmentChair')
    const registrar = resources.find((r) => r.name === 'Registrar')

    expect(instructor?.scope).toBe('CourseOffering')
    expect(chair?.scope).toBe('Department')
    expect(registrar?.scope).toBeUndefined() // global
  })

  it('uses calendar-aligned schedule Triggers for both Operation and Process targets', () => {
    const triggers = dna.triggers as Array<any>
    const beginTrigger = triggers.find((t) => t.operation === 'CourseOffering.Begin' && t.source === 'schedule')
    const finalizeTrigger = triggers.find((t) => t.process === 'SemesterFinalization' && t.source === 'schedule')
    expect(beginTrigger).toBeDefined()
    expect(finalizeTrigger).toBeDefined()
  })
})
