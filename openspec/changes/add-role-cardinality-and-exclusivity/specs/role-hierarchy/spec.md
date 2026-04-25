## ADDED Requirements

### Requirement: Role.cardinality declares per-scope-instance count limit

A Role MAY declare `cardinality: "one" | "many"`. The default is `"many"` (current behavior). When `cardinality = "one"`, the model declares that at most one Person SHALL hold this Role on any given scope instance at runtime. The validator does NOT enforce assignment counts (it has no runtime data); it validates only the well-formedness of the declaration itself.

`cardinality = "one"` SHALL be rejected on a Role with no declared or inherited `scope`. Per-scope-instance constraints have no instance to attach to when the Role is global.

`cardinality` SHALL be rejected on a Role with `system: true`. System Roles are not filled by Persons; per-Person count limits do not apply.

#### Scenario: Cardinality "one" on a scoped Role validates
- **WHEN** a Role declares `scope: "Patient"` and `cardinality: "one"`
- **THEN** validation passes

#### Scenario: Cardinality "one" inherits scope from parent Role
- **WHEN** `Underwriter.scope = "BankDepartment"` and `SeniorUnderwriter.parent = "Underwriter"` with no own `scope` and `cardinality: "one"`
- **THEN** validation passes; `SeniorUnderwriter`'s effective scope `["BankDepartment"]` is treated as scope-bearing for the cardinality check

#### Scenario: Cardinality "one" on a global Role fails
- **WHEN** a Role has no `scope`, no `parent` chain that resolves to a scope, and declares `cardinality: "one"`
- **THEN** validation fails with one error at path `roles/<name>/cardinality` whose message names the Role and explains that `cardinality: "one"` requires a declared or inherited scope

#### Scenario: Cardinality "one" on a system Role fails
- **WHEN** a Role declares `system: true` and `cardinality: "one"`
- **THEN** validation fails with one error at path `roles/<name>/cardinality` whose message names the Role and explains that cardinality does not apply to system Roles

#### Scenario: Default cardinality is "many"
- **WHEN** a Role omits `cardinality`
- **THEN** validation passes regardless of scope, and downstream consumers SHALL treat the Role as `cardinality: "many"`

### Requirement: Role.required declares per-scope-instance presence

A Role MAY declare `required: true | false`. The default is `false` (current behavior — no presence requirement). When `required = true`, the model declares that at least one Person SHALL hold this Role on any given scope instance at runtime. The validator does NOT enforce that runtime invariant; it validates only the well-formedness of the declaration.

`required: true` SHALL be rejected on a Role with no declared or inherited `scope` (parallel to cardinality — the constraint has no instance to attach to).

`required: true` SHALL be rejected on a Role with `system: true`.

#### Scenario: Required on a scoped Role validates
- **WHEN** a Role declares `scope: "Case"` and `required: true`
- **THEN** validation passes

#### Scenario: Required on a global Role fails
- **WHEN** a Role has no scope (declared or inherited) and declares `required: true`
- **THEN** validation fails with one error at path `roles/<name>/required` whose message names the Role and explains that `required: true` requires a declared or inherited scope

#### Scenario: Required on a system Role fails
- **WHEN** a Role declares `system: true` and `required: true`
- **THEN** validation fails with one error at path `roles/<name>/required` whose message names the Role and explains that `required` does not apply to system Roles

#### Scenario: Required and cardinality "one" together compose to "exactly one"
- **WHEN** a Role declares `scope: "Case"`, `cardinality: "one"`, and `required: true`
- **THEN** validation passes; the combined declaration MAY be surfaced by downstream consumers as "exactly one per Case"

### Requirement: Role.excludes declares same-scope mutual exclusion

A Role MAY declare `excludes: string[]`, an array of other Role names. The model declares that the same Person SHALL NOT simultaneously hold both Roles on the same scope instance at runtime. The validator does NOT enforce runtime assignments; it validates only that the declaration is well-formed.

The validator SHALL apply the following checks:

- Every entry in `excludes` SHALL resolve to a declared Role; missing names emit one error per missing reference, naming the missing Role and listing available Role names with `quoteList` / `availability`.
- `excludes` SHALL NOT contain the declaring Role's own name (no self-exclusion).
- The declaring Role and each named Role SHALL share at least one entry in their effective scopes; an exclusion across disjoint effective scopes has no shared instance to land on.
- `excludes` SHALL NOT appear on a Role with `system: true`.
- `excludes` is symmetric: if `A.excludes` contains `B`, the validator SHALL treat the constraint as if `B.excludes` also contained `A`. Validation errors are emitted **once per unordered pair**, not once per direction.

#### Scenario: Excludes between two same-scope Roles validates
- **WHEN** `AttendingPhysician.scope = "Patient"`, `ConsultingSpecialist.scope = "Patient"`, and `AttendingPhysician.excludes = ["ConsultingSpecialist"]`
- **THEN** validation passes; downstream consumers SHALL treat `ConsultingSpecialist.excludes` as effectively containing `"AttendingPhysician"` even though it is not declared

#### Scenario: Excludes references unknown Role
- **WHEN** a Role declares `excludes: ["NotARole"]` and no Role named `NotARole` exists in the document
- **THEN** validation fails with one error at path `roles/<name>/excludes` whose message names `"NotARole"` and lists the available Role names

#### Scenario: Excludes contains the declaring Role
- **WHEN** `RoleA.excludes = ["RoleA"]`
- **THEN** validation fails with one error at path `roles/RoleA/excludes` whose message names `"RoleA"` and explains that a Role cannot exclude itself

#### Scenario: Excludes across disjoint scopes fails
- **WHEN** `RoleA.scope = "BankDepartment"`, `RoleB.scope = "Tenant"`, and `RoleA.excludes = ["RoleB"]`
- **THEN** validation fails with one error whose message names both Roles and both effective scopes and explains that exclusion requires a shared scope

#### Scenario: Excludes on a system Role fails
- **WHEN** a Role declares `system: true` and `excludes: ["AnyRole"]`
- **THEN** validation fails with one error at path `roles/<name>/excludes` whose message names the Role and explains that `excludes` does not apply to system Roles

#### Scenario: Symmetric exclusion emits one error, not two
- **WHEN** `RoleA.excludes = ["RoleB"]` and `RoleB.excludes = ["RoleA"]` (the same constraint declared on both sides) violates one of the rules above (e.g., disjoint scopes)
- **THEN** the validator emits exactly one error for the `(RoleA, RoleB)` pair, deduped by sorted-name pair

### Requirement: Role cardinality, required, and excludes are modeling-layer declarations only

The validator SHALL NOT attempt to count runtime assignments or to verify that the declared cardinality, required, or exclusion constraints actually hold at runtime. The validator has no per-instance assignment data; these fields declare *intent* that runtime systems (auth middleware, admin tooling, seed scripts) are expected to enforce.

The validator SHALL only check:
- The well-formedness of the declarations (types, references, scope compatibility).
- The intra-document consistency (no system Role + cardinality, no self-exclusion, no cross-scope exclusion, no global Role + required).

#### Scenario: Validator does not require Memberships or Persons to satisfy "required"
- **WHEN** a Role declares `required: true` and the document contains no Memberships pinning a Person to that Role
- **THEN** validation passes; the `required` declaration is a runtime intent, not a compile-time invariant on the document

#### Scenario: Validator does not count declared Memberships against cardinality
- **WHEN** a Role declares `cardinality: "one"` and the document contains two distinct Memberships pinning two different Person templates to that Role
- **THEN** validation passes; Memberships declare *eligibility*, not *assignment*, so multiple Memberships are not a cardinality violation
