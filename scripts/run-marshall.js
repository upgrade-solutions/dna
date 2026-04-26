const { parse } = require('@dna-codes/input-text')
const http = require('node:http')
const https = require('node:https')

function longFetch(urlStr, init = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr)
    const lib = url.protocol === 'https:' ? https : http
    const req = lib.request(
      {
        method: init.method ?? 'GET',
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        headers: init.headers ?? {},
      },
      (res) => {
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const buf = Buffer.concat(chunks)
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: async () => buf.toString('utf8'),
            json: async () => JSON.parse(buf.toString('utf8')),
          })
        })
      },
    )
    req.setTimeout(30 * 60_000)
    req.on('error', reject)
    if (init.body) req.write(init.body)
    req.end()
  })
}

const instructions = `
DOMAIN-SPECIFIC GUIDANCE FOR THIS TRANSCRIPT:

1. Role.actions MUST be objects, never bare strings. Every entry needs at minimum { "name": "...", "type": "read" | "write" | "destructive" }. This applies to roles[], persons[], groups[], and resources[] equally.

2. Do NOT invent triggers the text does not describe. The transcript names no scheduled jobs and no webhooks. Every Trigger must use source: "user" (a person initiates it) or source: "operation" (chained after another Operation completes). Do not emit source: "schedule" or source: "webhook" anywhere.

3. Every noun the transcript NAMES must appear in the appropriate noun collection. Specifically:
   - Resources: IntakeSubmission, Claim, Evidence, Property, MarshallFireIncident, Firm, Attorney
   - Persons: Claimant (external; submits the form themselves)
   - Groups: Case, Firm
   - Roles: IntakeSpecialist, CaseManager, AssociateAttorney, Paralegal, PartnerAttorney, FirmAdmin
   Note: a name can appear as both a Resource and a Group when usage demands (e.g. Firm is a tracked entity AND a scoping container for Roles). Same for Case.

4. Memberships pin Person templates to Role templates. The IntakeSpecialist, CaseManager, Paralegal, AssociateAttorney, PartnerAttorney, and FirmAdmin Roles are all held by FIRM STAFF — model an Employee (or per-role Person templates like Partner, Associate, Paraprofessional) and pin them. Claimant holds NO Role; Claimant is an external Person who triggers Operations directly via Rule.allow[].person.

5. Required attributes:
   - Case must include a "status" enum attribute (intake, preparation, resolution, closed) — the transcript says "advance the case status through the milestones."
   - Attorney must include an "active" boolean and a "firm_id" reference — the transcript says "we only assign active attorneys" and "every Attorney belongs to exactly one Firm."
   - Evidence must include a "verified" boolean — the transcript says "I verify it for authenticity."
   - Claim must include a "status" enum (filed, settled, dismissed).
   - MarshallFireIncident must include the date that drives the statute-of-limitations rule.

6. Processes must reflect the workflow described, not invented orchestration:
   - CasePreparation: three steps run in parallel (Property.Assess, Evidence.Upload, Case.AdvanceMilestone), then a fourth step (Claim.ReviewPackage by AssociateAttorney) with depends_on listing all three parallel step ids. This is fan-out / fan-in via depends_on.
   - ClaimResolution: Paralegal files the Claim, PartnerAttorney reviews for legal sufficiency, then status updates to settled or dismissed (use Step.else for the abort path).
   - EvidenceCollection: Paralegal uploads, then CaseManager verifies. Add a condition Rule "ClaimNotResolved" that gates Evidence.Upload on Claim.status not being settled or dismissed.
   - ClientWithdrawal: CaseManager processes, dismisses open Claims, advances Case.status to closed. Add an access Rule allowing only the assigned attorney OR an admin Role.

7. Rules to include:
   - "ActiveAttorney" condition Rule: gates Claim.AssignAttorney on Attorney.active = true.
   - "WithinFireZone" condition Rule: gates IntakeSubmission.Qualify on Claimant.address being in [Superior, Louisville, UnincorporatedBoulderCounty].
   - "WithinStatuteOfLimitations" condition Rule: gates IntakeSubmission.Qualify on (now - MarshallFireIncident.date) <= 2 years. Reference the MarshallFireIncident attribute, do NOT hard-code a date.
   - "ClaimNotResolved" condition Rule: as described above.

8. Do NOT model the same Operation as both an Operation and a separate Action on a different Resource. AssignAttorney belongs on Claim (or on Case), not on Claimant.

FINAL CHECKLIST — your output MUST satisfy every item below before you emit it. Re-read the JSON you generated and verify each one:

A. operations[] is a REQUIRED top-level array. Every Action declared on any Resource/Person/Group/Role must have a corresponding entry in operations[] of the form { "target": "<Pascal>", "action": "<Pascal>", "name": "<Pascal>.<Pascal>" }. If you wrote a tasks[] or triggers[] or rules[] entry that references an Operation, that Operation MUST exist in operations[].

B. PascalCase EVERYWHERE for Target.Action references. The schema enforces /^[A-Z][a-zA-Z]*\\.[A-Z][a-zA-Z]*$/. Examples of CORRECT: "Claim.AssignAttorney", "Evidence.Upload", "IntakeSubmission.Qualify". Examples of WRONG (will fail validation): "claim.assign-attorney", "intake-submission.qualify", "evidence.upload". This applies to operations[].name, triggers[].operation, rules[].operation, AND tasks[].operation.

C. Condition operators MUST be one of these literal strings ONLY: "eq", "neq", "gt", "gte", "lt", "lte", "in", "not_in", "present", "absent". NEVER use "==", "!=", "<=", ">=", "<", ">". For "Claim.status not in [settled, dismissed]", use { "operator": "not_in", "value": ["settled", "dismissed"] }.

D. memberships[] is a REQUIRED top-level array (you dropped it last time). Pin every firm-staff Role to its Person template:
   - { "name": "EmployeeIntakeSpecialist", "person": "Employee", "role": "IntakeSpecialist", "group": "Firm" }
   - { "name": "EmployeeCaseManager",      "person": "Employee", "role": "CaseManager",      "group": "Firm" }
   - { "name": "AttorneyAssociate",         "person": "Attorney", "role": "AssociateAttorney", "group": "Firm" }
   - { "name": "AttorneyPartner",           "person": "Attorney", "role": "PartnerAttorney",   "group": "Firm" }
   - { "name": "EmployeeParalegal",         "person": "Employee", "role": "Paralegal",         "group": "Firm" }
   - { "name": "EmployeeFirmAdmin",         "person": "Employee", "role": "FirmAdmin",         "group": "Firm" }
   The Attorney Person template is REQUIRED in persons[] (separate from the Attorney Resource).

E. Every Role MUST have a "scope" field naming a Group it operates within. IntakeSpecialist/CaseManager/AssociateAttorney/Paralegal/PartnerAttorney all scope to Case. FirmAdmin scopes to Firm.

F. Every Step.task value MUST exactly match a tasks[].name entry. Do not reference task names that are not declared. If a Process Step needs an action, ADD the corresponding Task to tasks[] first.

G. WithinStatuteOfLimitations rule: model as a single condition with attribute "claimant.submitted_at", operator "gte", and value referencing the incident date — but since DNA condition values are literals, this rule is best modeled as a documented condition with attribute: "marshall_fire_incident.date", operator: "present", and a description noting the 2-year cutoff is enforced in business logic. Do NOT invent expression syntax in the attribute field.

H. ClaimNotResolved rule: { "name": "ClaimNotResolved", "operation": "Evidence.Upload", "type": "condition", "conditions": [{ "attribute": "claim.status", "operator": "not_in", "value": ["settled", "dismissed"] }] }
`.trim()

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

async function main() {
  const text = process.argv[2] ?? (await readStdin())
  if (!text.trim()) {
    console.error('Pass text as argv[2] or pipe via stdin.')
    process.exit(1)
  }

  const mode = process.env.MARSHALL_MODE === 'one-shot' ? 'one-shot' : 'layered'
  const result = await parse(text, {
    provider: 'openai',
    apiKey: 'ollama',
    baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
    model: process.env.OLLAMA_MODEL ?? 'qwen2.5:14b',
    layers: ['operational'],
    instructions,
    fetchImpl: longFetch,
    mode,
  })

  if (!result.operational) {
    console.error('No operational layer parsed. Raw response:')
    console.error(result.raw)
    process.exit(1)
  }
  console.log(JSON.stringify({ operational: result.operational }, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
