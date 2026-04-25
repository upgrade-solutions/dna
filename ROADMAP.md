# DNA Operational Layer Reorg — Roadmap

Working plan for the next major refactor of `@dna-codes/schemas` (operational layer) and downstream consumers. This document is the source of truth while the work is in flight; the README will be updated to match once the schemas land.

## Goal

The Operational layer should articulate **organizational modeling** — what an organization is and what it does, regardless of UI, API, or deployment technology. Cross-domain stress-testing (mass tort, sales, ecommerce, healthcare, education, marketplace, government, banking) confirmed the **Actor > Action > Subject** triad is the right core, where Actors are organizational People (filling Roles in Groups) and Subjects are Entities the organization manages. This reorg restructures the layer along organizational lines rather than the earlier product-flavored Structure/Behavior split.

> **Plain-language gateway.** Business analysts already think in nouns and verbs: the **nouns** an organization deals with (people, places, things) and the **verbs** that bind them together (what gets done, when, by whom). DNA's People and Entities categories are the organizational nouns; Activities are the verbs and the orchestration that strings them together. The specific primitives below are what you reach for once you're past the gateway — but the README and input-text prompt should keep noun/verb as the on-ramp.

## Final decisions

### Operational is organizational modeling

Drop the Structure/Behavior split — that vocabulary was borrowed from product/data modeling. Organizational modeling has its own native categories:

| Category | Primitives | Captures |
|---|---|---|
| **People** | Person, Role, Group, Membership | Who's in the organization |
| **Entities** | Resource, Attribute, Relationship | What the org manages |
| **Activities** | Operation, Task, Step, Process, Trigger, Rule, Outcome, Signal, Equation | What gets done |

`Domain` is the bounded-context wrapper, sitting above the three.

### People primitives

Each People primitive captures a distinct organizational concept. Person, Role, and Group are conceptually **kinds of Resources** — they're nouns the organization recognizes, with state and identity — but they live in their own top-level collections (`persons[]`, `roles[]`, `groups[]`) and add primitive-specific fields. Membership is its own shape (a relationship template, not a noun-with-state).

**Shared noun shape.** Resource, Person, Role, and Group all support the same base fields: `name`, `attributes[]`, `actions[]`, optional `parent`. This is **shape duplication, not schema inheritance** — each primitive's JSON Schema redeclares these fields rather than composing a base via `allOf`/`$ref`. JSON Schema inheritance is awkward with required-fields and additionalProperties; the small redundancy is worth the clarity.

**Action template.** Each entry in a noun's `actions[]` is an object with a uniform sub-schema, used identically across all four noun primitives (no string shorthand — object-only):

```
Action entry (sub-schema)
{
  name:        string   (required)              // verb (Approve, Disburse, GetAdmitted)
  description: string   (optional)
  type:        enum     (optional)              // read | write | destructive
  idempotent:  boolean  (optional)
}
```

The action entry is the catalog declaration of what verbs apply to a noun. Operations (top-level) reference the (noun, action-name) pair and carry orchestration metadata (Rules, Outcomes, Signals) — those don't go on the action entry itself. No top-level `Action` primitive; no cross-noun verb sharing; just a uniform per-action declaration shape.

**Person** — individual template (Employee, Customer, Patient, Borrower, Contractor). Attributes; optional actions (Patient.GetAdmitted, Patient.GetDischarged). A Person is the *kind* of human the organization deals with — not a specific named individual (instance-level data lives in Product/Technical layers).

**Role** — position/capacity template (Underwriter, Doctor, ChargeNurse, LeadCounsel, SuperAdmin). Adds `scope` (the Group type the Role is exercised within, single or array), optional `parent` (Role hierarchy — deferred), optional `system: true` flag for non-human actors, optional `resource:` link when a system Role is backed by a Resource template. May have actions for org-admin lifecycle (Underwriter.Activate, Doctor.Certify).

**Group** — work-unit / container template (BankDepartment, Hospital, Case, Workspace, Family). Attributes, optional actions (Case.Open, Case.Settle), optional `parent` Group for org hierarchy. Groups are entity-like but their organizational primary purpose is to be the container Roles are scoped to.

**Membership** — template-level eligibility statement: "Persons of type X may hold Roles of type Y, optionally in Groups of type Z." Captures organizational RBAC at the template level — the *kinds* of people who can fill *kinds* of roles in *kinds* of groups — without binding specific person-instances. Instance-level (Joe × Father × Family-4271) bindings live in Product/Technical. Membership does NOT share the noun shape — it has no attributes/actions of its own.

```
Resource Loan {
  attributes: [amount, status],
  actions: [
    { name: Apply,    type: write },
    { name: Approve,  type: write },
    { name: Reject,   type: write },
    { name: Disburse, type: destructive }
  ]
}

Person Employee  { }
Person Patient   {
  attributes: [dob, allergies],
  actions: [
    { name: GetAdmitted,   type: write },
    { name: GetDischarged, type: write }
  ]
}
Person Borrower  { attributes: [creditScore] }

Group BankDepartment { attributes: [region] }
Group Case {
  attributes: [caseNumber, filedAt],
  actions: [
    { name: Open,   type: write },
    { name: Settle, type: write },
    { name: Close,  type: destructive }
  ]
}

Role Underwriter {
  scope: BankDepartment,
  actions: [
    { name: Activate, type: write },
    { name: Retire,   type: destructive }
  ]
}
Role LeadCounsel             { scope: Case }
Role SuperAdmin              { scope: [Workspace, Tenant] }                    // multi-scope
Role NightlyDelinquencySweep { system: true, resource: ScheduledJob }

Membership EmployeeUnderwriter    { person: Employee, role: Underwriter }
Membership PartnerLeadCounsel     { person: Partner,  role: LeadCounsel }
Membership EmployeeAdminWorkspace { person: Employee, role: SuperAdmin, group: Workspace }
```

### Renames

**`Capability` → `Operation`**
- "Capability" has Business Capability Modeling baggage (TOGAF, Gartner) — used for coarse org functions like "Customer Management." DNA's Resource.Action pair is finer-grained; wrong altitude for that term.
- Product Core already uses `Operation` as the projection of Operational `Capability`. Renaming unifies vocabulary across layers.

**`Cause` → `Trigger`**
- "Cause" was vague. "Trigger" is the industry term (GitHub Actions `on:`, EventBridge, Zapier, n8n) and pairs cleanly with Outcome. Source: `user | schedule | webhook | operation`.

### Trigger targets are Operation OR Process — nothing else

Task-level and Step-level targets add no expressive power.

- **Operation target** = "this Action can be initiated standalone" (ad-hoc API call, cron firing it directly).
- **Process target** = "kick off this whole SOP from its `startStep`."

The two are **orthogonal, not redundant**. Same first-Step Operation can have an Operation-level Trigger (ad-hoc invocation) AND its containing Process can have a Process-level Trigger (full SOP kickoff via webhook). Different intents.

```
Trigger {
  source: 'user' | 'schedule' | 'webhook' | 'operation'
  target: { operation: 'Loan.Apply' }   // OR
  target: { process:   'LoanOrigination' }
}
```

### Operation / Task / Step / Process — the orchestration chain

- **Operation** = `Subject.Action` pair. Subject can be any noun primitive — Resource, Person, Role, or Group. Each noun lists its actions in `actions[]`; an Operation is a top-level, named binding of (Subject, Action) that carries the metadata the orchestration layer hangs off (Rules, Outcomes, Signals reference Operations, not bare action names). Operations on Roles cover org-admin lifecycle (Underwriter.Activate, Doctor.Certify), not "what an Underwriter does." Actor-agnostic *what*.
- **Task** = `(role, operation)` binding. Reusable named assignment (`UnderwriterApproval` = Underwriter performs Loan.Approve). Referenced by Step.
- **Step** = orchestration node within one Process. References **exactly one Task** — many tasks at one node = a sub-process, not a multi-task step. Owns DAG edges. Step-level conditions reference Rules compositionally ("Rule 1 AND Rule 2 must be true to execute").
- **Process** = named SOP — owns the DAG of Steps and an explicit `startStep`.

**Why Step → Task and not Step → Operation directly:** Rule.access is a *bound* (which Roles may), not a *pin* (which Role does in this Process). The same Operation may need different Roles per Process; Task is the named pin. Dropping Task would force `(operation, role)` inline at every Step site — recreating Task with no name and no reuse.

### Process gets explicit `startStep`

ASL-style (`StartAt`); matches Temporal `@WorkflowMethod` and n8n trigger nodes. Explicit beats implicit-from-DAG: the validator catches missing/wrong references with a clear error, and it disambiguates Processes with multiple entry-eligible Steps.

### Characteristics of noun primitives

The differences between Resource, Person, Role, Group, and Process aren't naming or schema-shape alone — they're **the slots each primitive can fill in the rest of the model**. Each noun primitive is defined by a combination of characteristics:

| Characteristic | What it enables |
|---|---|
| **targetable** | Can be `Operation.target` — state mutates here |
| **actorable** | Can be `Task.actor` / `Rule.allow[].role` — it acts on others |
| **scopeable** | Can be `Role.scope` — Roles are exercised within it |
| **memberable** | Can be `Membership.role` — a position someone fills |
| **executable** | Has steps and orchestration (Process-like lifecycle) |

The canonical primitives are well-known combinations of these characteristics:

| Primitive | targetable | actorable | scopeable | memberable | executable |
|---|---|---|---|---|---|
| Resource | ✓ |  |  |  |  |
| Person | ✓ | ✓ | ✓ |  |  |
| Group | ✓ |  | ✓ |  |  |
| Role | ✓ | ✓ |  | ✓ |  |
| Process | ✓ |  |  |  | ✓ |

This decomposition documents the validator's actual behavior, not a configurable layer. Every noun is targetable; only Roles and Persons are actorable; Groups and Persons are scopeable (a Role can be scoped to a population — `Engineers` — or to a specific Person — `AttendingPhysician.scope = Patient`); only Roles are memberable; only Processes are executable. Any future noun primitive earns its place by combining characteristics in a way the existing five don't cover.

**Vocabulary preferences** (a company that says "Position" instead of "Role", "Individual" instead of "Person") are surface concerns, **not schema concerns**. The DNA primitive vocabulary stays canonical; output adapters carry a `rename` map for company-friendly rendering. See `output-markdown` for the reference implementation.

## Operational primitives — final list

### People

| Primitive | One-liner |
|---|---|
| Person | Individual template (Employee, Patient, Borrower); shares noun base (attributes, actions, parent) |
| Role | Position/capacity template; shares noun base + `scope`, optional `parent`, optional `system`, optional `resource` link |
| Group | Work-unit / container template; shares noun base + optional `parent` Group |
| Membership | Template-level eligibility: which Person types may hold which Roles in which Groups (does *not* share noun base — no actions/attributes) |

### Entities

| Primitive | One-liner |
|---|---|
| Resource | Entity template — thing the org manages (Loan, Account, Product, Document); shares noun base (attributes, actions, parent) |
| Attribute | Field on any noun primitive (Resource, Person, Role, or Group) |
| Relationship | Between any two noun primitives |

### Activities

| Primitive | One-liner |
|---|---|
| Operation | `Subject.Action` pair (Subject = any noun primitive: Resource, Person, Role, or Group) |
| Task | A `(role, operation)` binding — the named, reusable assignment |
| Step | Orchestration node within a Process; references exactly one Task |
| Process | Named SOP — DAG of Steps with explicit `startStep` |
| Trigger | What initiates an Operation or Process (`user | schedule | webhook | operation`) |
| Rule | Constraint on an Operation: `access` (which Roles may) or `condition` (what must be true) |
| Outcome | State changes and downstream triggers after an Operation executes |
| Signal | Named domain event published after an Operation; carries a typed payload |
| Equation | Named, technology-agnostic computation (implemented by a Technical Script) |

### Cross-cutting

| Primitive | One-liner |
|---|---|
| Domain | Bounded-context wrapper — names a sub-business; primitives belong to a Domain |

## Validation surfaces

Two parallel validation efforts to demonstrate that the reorg holds up beyond the bookshop fixture.

### Cross-domain examples

Canonical DNA documents under [`examples/<domain>/`](./examples), each validated by `packages/core/src/examples.test.ts` against the schemas + cross-layer rules, with per-domain shape assertions catching silent capability loss.

| Domain | Status | Demonstrates |
|---|---|---|
| `lending` | Needs rework | Standard Operation/Task/Process flow; system Role; scoped Role; multi-target Triggers |
| `mass-tort` | Needs rework | Case as Group; multi-Membership (Partner can be LeadCounsel; Associate can be PlaintiffAttorney); multi-Process domain |
| `marketplace` | Needs rework | Same Person template (Member) eligible for peer Roles (Host, Guest) across multiple Groups (Listing, Booking); global Role |
| `healthcare` | Needs rework | Patient as Person (not Resource+Group); Doctor Role with hierarchy; multiple Group types (Hospital, Ward, Patient as care-context Group?) |
| `manufacturing` | Needs rework | Multiple system Roles backed by Resources; parallel fan-out+fan-in; schedule-source Triggers |
| `education` | Needs rework | CourseOffering vs Course (Group vs Resource); same Person template can be Instructor + Student (separate Memberships); three scope tiers |
| `banking` | Deferred | Overlapping with `lending` — defer until a banking-specific shape motivates a separate example |

### Framework comparisons

Concept-by-concept mappings under [`docs/frameworks/`](./docs/frameworks), each with a concrete translation pointing at one of the examples above.

| Framework | Status |
|---|---|
| [BPMN 2.0](./docs/frameworks/bpmn.md) | Shipped (needs primitive-reference updates) |
| [Domain-Driven Design](./docs/frameworks/ddd.md) | Shipped (needs primitive-reference updates) |
| [ArchiMate 3](./docs/frameworks/archimate.md) | Shipped (needs primitive-reference updates) |
| [C4 Model](./docs/frameworks/c4.md) | Shipped (needs primitive-reference updates) |
| [Event Storming](./docs/frameworks/event-storming.md) | Shipped (needs primitive-reference updates) |
| [TOGAF](./docs/frameworks/togaf.md) | Shipped (needs primitive-reference updates) |
| ER / IDEF1X | Deferred (trivial Resource/Attribute/Relationship mapping) |

The framework docs all map external concepts to old primitives like "Resources used as Roles, Memberships nested under user-Resources." Those mappings need to be rewritten in terms of Person, Role, Group, Membership as first-class primitives.

## Open questions

1. **Role hierarchy and Group scope interaction.** *(Defer to v2 — none of the shipped examples need it.)*
   - How do Role parent chains (`parent`) interact with Group `scope`?
   - What happens if a parent and child Role declare different scopes?

2. **Validator inference rules.** *(Settled — keep loose.)*
   - Hard errors only for dangling references (Task.actor → Role, Role.scope → Group, Role.resource → Resource, Membership.person/role/group, Step.task, Trigger.target, Process.startStep, Operation.target).
   - Warnings only for clearly-unused declarations (Membership references a Role no Task uses; Person never appears in a Membership and has no actions).
   - Multi-scope Role validation: if `Role.scope` is array and `Membership.group` is unspecified, error (ambiguous); if specified, must match one entry.

3. **Operation target breadth.** *(Settled — Resource | Person | Role | Group.)*
   - All four noun primitives share the noun base shape and may declare actions.
   - Memberships cannot be Operation targets (template-level relationship, not a noun with state).
   - `Operation.target` resolves across the four noun collections; the schema accepts a string name and the validator looks across `resources[]`, `persons[]`, `roles[]`, `groups[]`. (Object-shape one-of `{resource}|{person}|{role}|{group}` is an alternative; settle when wiring up the validator.)

4. **Cross-layer impact on Product Core.**
   - Old `roles[]` slice is replaced by per-People-primitive projections. Options:
     - (a) Surface all four (`persons[]`, `roles[]`, `groups[]`, `memberships[]`) to Product Core
     - (b) Surface a flattened `actors[]` derived from Tasks (covers human + system Roles uniformly) plus `groups[]` for org-chart needs
     - (c) Skip the projection entirely; let Product Core consume Operational refs directly
   - Recommendation TBD — settle when Product Core's actual API/UI consumers force a choice.

## Examples revision pass

The shipped examples were authored before the People primitive split. Each needs:

- Replace instance-level user Resources (JaneEsq, Joe, DrAdams, DrPatel) with type-level Person templates (Partner, Associate, Host, Guest, Doctor, Instructor, Student, etc.)
- Add explicit Group declarations for Cases, Listings, Bookings, Hospitals, Wards, Patients-as-care-contexts, CourseOfferings, BankDepartments
- Add Membership declarations capturing template-level eligibility ("Partners may be LeadCounsels", "Members may be Hosts", etc.)
- Move attributes from former user-Resources onto the new Person/Group as appropriate
- Remove `Resource.memberships[]` everywhere
- Update READMEs to reflect that "same user across many groups" is a *template-level eligibility* concern (Memberships) — not an instance enumeration
- Update per-example shape assertions in `packages/core/src/examples.test.ts`

## Implementation plan

### 1. Schemas (`packages/schemas/operational/`)

**Shared noun shape** — Resource, Person, Role, and Group each declare the same base fields (`name`, `attributes[]`, `actions[]`, optional `parent`) directly in their own schema file, without `allOf`/`$ref` composition. Small redundancy, simpler schemas, no inheritance gymnastics.

**Action sub-schema** — define an `action.json` (or inline equivalent) for the action entry shape (`name`, optional `description`, optional `type` enum, optional `idempotent`). Each noun schema's `actions[]` items reference this shape. Object-only (no string shorthand) — uniform shape across every noun, discoverable template fields, and forward-compatible: relaxing later to accept strings is non-breaking; the reverse would require another major bump.

**Add** (new files):
- `person.json` — noun base shape (name, attributes, actions, optional parent)
- `group.json` — noun base shape + optional parent Group for org hierarchy
- `membership.json` — Membership primitive (name, person, role, optional group); does NOT share the noun shape — no attributes/actions

**Rename**:
- `capability.json` → `operation.json`
- `cause.json` → `trigger.json`

**Rewrite**:
- `role.json` — noun base shape + `scope` (string or array of Group names), optional `parent` (Role), optional `system: true`, optional `resource:` (Resource name)
- `resource.json` — noun base shape only. Strip `memberships[]`, `scope`, `kind` (any leftover from earlier drafts). Resource is the unspecialized noun.
- `operation.json` — `target` resolves across all four noun collections; `action` is a string that must match an entry in the target's `actions[]`
- `process.json` — keep `startStep`, `steps[]` (already in)
- `operational.json` — collections list: `domains`, `persons`, `roles`, `groups`, `memberships`, `resources`, `attributes`, `relationships`, `operations`, `tasks`, `processes`, `triggers`, `rules`, `outcomes`, `signals`, `equations`

**Delete**:
- `user.json` (was already removed in earlier draft)

### 2. Validator (`packages/core/src/validator.ts`)

- Drop any remaining User-primitive checks
- Cross-reference checks (existence + structural):
  - `Task.actor` resolves to a defined Role
  - `Role.scope` (each entry, if array) resolves to a defined Group
  - `Role.resource` resolves to a defined Resource (when present)
  - `Membership.person` resolves to a Person
  - `Membership.role` resolves to a Role
  - `Membership.group` resolves to a Group AND matches one of `Role.scope`'s entries (if Role has multi-scope and Membership specifies group, must match; if Role has single-scope, Membership.group is optional but must match if present)
  - `Operation.target` is `{resource}|{person}|{group}` and resolves
  - `Trigger.target` shape (Operation vs Process)
  - `Step.task` resolves to a defined Task
  - `Process.startStep` resolves to a Step in that Process
- Update name normalization for renamed primitives

### 3. Core fixture and tests

- Update bookshop fixture (`packages/core/src/fixtures/bookshop.ts`) and `types.ts` to use Person, Role, Group, Membership shapes
- Update `validator.test.ts` and `index.test.ts` assertions
- Rebuild `packages/core/dist/` (the compiled validator)

### 4. Examples

- Each domain folder under `examples/`: rewrite operational.json with new primitives; rewrite README.md
- Update per-example shape assertions in `packages/core/src/examples.test.ts`

### 5. Output adapters

- `output-markdown`, `output-mermaid`, `output-html`, `output-text`: render new People sections (Persons, Roles, Groups, Memberships); update `Resource` rendering (no more memberships nested under it); update tests

### 6. Input adapters

- `input-text`: rewrite OPERATIONAL_SKELETON and LAYER_GUIDE in prompt.ts to teach the People/Entities/Activities split and the new primitives
- `input-json`, `input-openapi`: update emitted shapes; for `input-json` the heuristic for inferring Person vs Resource may need tuning (presence of person-shaped attributes like email/dob)

### 7. Documentation

- README operational layer section: rewrite with People/Entities/Activities split + Person/Role/Group/Membership detail
- `packages/core/AGENTS.md` and `packages/core/docs/operational.md`: update vocabulary
- Framework docs (`docs/frameworks/*.md`): update mappings to reference new primitives
- `docs/frameworks/README.md`: minor — table descriptions reference primitives by new names
- Migration doc: `docs/migration-from-pre-reorg.md` — short guide for existing DNA users

### 8. Versioning

- Major bump for `@dna-codes/schemas` and `@dna-codes/core` (breaking)
- Coordinated bump for all input-/output-/integration-* packages
- Migration note in README

## Sequencing

1. Land schemas (new + renamed + rewritten) in one wave with `operational.json` collections list updated
2. Update validator alongside schemas; run `packages/core` tests
3. Update fixture and core tests; verify green
4. Rework examples one at a time (lending → mass-tort → marketplace → healthcare → manufacturing → education); run examples.test.ts after each
5. Update output adapters (purely render-side, low risk); run their tests
6. Update input adapters (text first since it's flexible; then deterministic)
7. Update README, AGENTS, framework docs
8. Coordinated version bump and publish

## Out of scope

- Product layer changes beyond what cross-references force (Product Core's `roles[]` projection question is open but separable)
- Technical layer — untouched
- Integration packages — untouched apart from any DNA shape they emit/consume

## Landed post-reorg

### Role hierarchy
Shipped via the `add-role-hierarchy` OpenSpec change (see `openspec/changes/archive/`). `Role.parent` now drives effective-scope inheritance and a narrower-or-equal subset rule; cycles are rejected. Action and Membership inheritance remain explicitly out of scope. Demonstrated in `examples/lending/` via `SeniorUnderwriter.parent = Underwriter`.

## Future enhancements (post-reorg)

### Optional Resource `uses` config
Once the reorg lands and we've lived with the four-primitive People model, consider an **optional** declaration on Resource that names how it's intended to be used (`uses: [actor]`, `uses: [target]`, etc.). Stays opt-in; addresses any validator-strictness loss without re-introducing mandatory metadata.

### Membership constraints
Membership-level fields beyond `person`/`role`/`group`: cardinality limits ("at most one Underwriter per BankDepartment"), tenure ("temporary" vs "permanent"), exclusivity. Defer until a real example needs them.
