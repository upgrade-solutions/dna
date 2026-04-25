## Why

Six of our six example domains describe per-scope-instance Role constraints in their READMEs and Role descriptions, but the model has no way to declare them. Healthcare says `AttendingPhysician` is "primary responsibility for a Patient" (one per Patient) and `ConsultingSpecialist` "multiple may exist per Patient"; mass-tort describes `LeadCounsel` and `Judge` as singular per Case; marketplace's `Host` and `Guest` are owner/booker bindings (one per Listing/Booking); education's `DepartmentChair` and manufacturing's `ShiftSupervisor` are conventionally singular. Today these read as prose only — runtime systems and downstream adapters can't see the constraint.

Two related shapes are equally well-grounded: mutual exclusivity within a scope instance. Healthcare doesn't want one Doctor to be both `AttendingPhysician` and `ConsultingSpecialist` on the *same* Patient; mass-tort doesn't want one Partner to be both `LeadCounsel` and `CoCounsel` on the *same* Case.

This is the smallest shippable piece of the ROADMAP's "Membership constraints" item — cardinality + exclusivity on Role. Tenure (the ROADMAP's third sub-item) stays deferred: no example currently forces it.

## What Changes

- `Role.cardinality: "one" | "many"` (default `"many"`) — declares how many Persons may hold this Role per scoped instance. `"one"` requires the Role to have a declared or inherited `scope`; global Roles cannot be cardinality-constrained per-scope.
- `Role.required: boolean` (default `false`) — declares whether at least one Person must hold this Role per scoped instance. Composes with `cardinality`:
  - `{ cardinality: "one" }` → 0..1 per scope instance
  - `{ cardinality: "one", required: true }` → exactly 1 per scope instance
  - `{}` → 0..∞ (default — current behavior)
  - `{ required: true }` → 1..∞ per scope instance
  - `required: true` requires a declared or inherited `scope` (parallel to cardinality).
- `Role.excludes: string[]` — names of other Roles that the same Person SHALL NOT simultaneously hold within the same scope instance. Validation:
  - Every name resolves to a declared Role (reuses `quoteList` / `availability` helpers).
  - The two Roles must share at least one effective scope entry; cross-scope `excludes` are rejected with a message that names both effective scopes.
  - Symmetric: if `A.excludes` contains `B`, the validator treats it as if `B.excludes` contained `A` (and emits one canonical error per ordered pair, not two).
  - No self-reference (`A.excludes` containing `A` is rejected).
- `Role.cardinality`, `Role.required`, and `Role.excludes` are all incompatible with `system: true`. System Roles aren't filled by Persons, so per-Person constraints don't apply.
- These are **modeling-layer declarations**. The validator checks the well-formedness of the document; runtime systems are expected to enforce the constraints at assignment time. The validator does not have runtime assignment data, so it cannot verify "exactly one Lead Counsel exists on Case 17" — only that the model declared the intent.
- Update each example to declare the constraints actually motivated by its README/role descriptions:
  - `examples/healthcare/`: `AttendingPhysician.cardinality = "one"`; `PrimaryNurse.cardinality = "one"`; `AttendingPhysician.excludes = ["ConsultingSpecialist"]`
  - `examples/mass-tort/`: `LeadCounsel.cardinality = "one"` + `required: true`; `Judge.cardinality = "one"` + `required: true`; `LeadCounsel.excludes = ["CoCounsel"]`
  - `examples/marketplace/`: `Host.cardinality = "one"` + `required: true`; `Guest.cardinality = "one"` + `required: true`
  - `examples/education/`: `DepartmentChair.cardinality = "one"`
  - `examples/manufacturing/`: `ShiftSupervisor.cardinality = "one"`
- Docs updated: `packages/core/docs/operational.md` (Role hierarchy section grows a "Role cardinality and exclusion" subsection); `README.md` (Role bullet under "Operational Layer"); `ROADMAP.md` ("Membership constraints" entry shrinks to just tenure, with a pointer to this change for the cardinality + exclusion piece).

## Capabilities

### New Capabilities
<!-- None — cardinality and exclusion are role-shape extensions, captured under the existing role-hierarchy capability. -->

### Modified Capabilities
- `role-hierarchy`: gains four requirements covering `Role.cardinality`, `Role.required`, `Role.excludes`, and the modeling-vs-runtime boundary.

## Impact

- **Schema**: `@dna-codes/schemas/operational/role.json` (additive — three new optional fields; no breaking change to existing consumers).
- **Validator**: `@dna-codes/core/src/validator.ts` — new per-Role checks layered into the existing `roles` block at `validator.ts:545-592`; reuses `effectiveScope` cache, `quoteList`, and `availability` helpers.
- **Examples**: `examples/{healthcare,mass-tort,marketplace,education,manufacturing}/operational.json` — declare the constraints already implied by their READMEs.
- **Docs**: `packages/core/docs/operational.md`, `README.md`, `ROADMAP.md`.
- **Adapters**: no changes required (`output-markdown` / `output-html` don't render Role sections today; see prior `add-role-hierarchy` task 7 deferral).
- **Tests**: ~10 new validator cases; existing test count must continue to pass.
