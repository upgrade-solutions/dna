# role-hierarchy Specification

## Purpose
TBD - created by archiving change add-role-hierarchy. Update Purpose after archive.
## Requirements
### Requirement: Role.parent resolution

A `Role.parent` value SHALL reference the `name` of another declared `Role` within the same Operational document. The validator SHALL emit an error naming the missing parent and the available Role names when the reference does not resolve.

#### Scenario: Parent resolves to a declared Role
- **WHEN** an Operational document declares Roles `Underwriter` and `SeniorUnderwriter` with `SeniorUnderwriter.parent = "Underwriter"`
- **THEN** validation passes for the parent reference

#### Scenario: Parent does not resolve
- **WHEN** a Role declares `parent = "Manager"` and no Role named `Manager` exists in the document
- **THEN** validation fails with an error at path `roles/<child>/parent` whose message names `"Manager"` and lists the available Role names alphabetically and quoted

### Requirement: Cycle detection in Role.parent chains

The validator SHALL reject any cycle in the chain of `Role.parent` references, whether two Roles point at each other or a longer chain closes back on a member. The error SHALL name every Role participating in the cycle in walk order.

#### Scenario: Two-Role cycle
- **WHEN** `RoleA.parent = "RoleB"` and `RoleB.parent = "RoleA"`
- **THEN** validation fails with one error whose message names both `"RoleA"` and `"RoleB"`

#### Scenario: Three-Role cycle
- **WHEN** `A.parent = "B"`, `B.parent = "C"`, `C.parent = "A"`
- **THEN** validation fails with one error whose message names `"A"`, `"B"`, and `"C"` in walk order

#### Scenario: Self-parent
- **WHEN** `RoleA.parent = "RoleA"`
- **THEN** validation fails with one error whose message names `"RoleA"`

### Requirement: Effective scope inheritance

A Role with no declared `scope` SHALL inherit its parent Role's effective scope. Resolution walks the parent chain until it reaches a Role with a declared `scope` or the chain terminates. A Role with no declared scope and no parent (or whose ancestors all have no declared scope) is global, exactly as it is today.

#### Scenario: Child without scope inherits parent's scope
- **WHEN** `Underwriter.scope = "BankDepartment"` and `SeniorUnderwriter.parent = "Underwriter"` with no own `scope`
- **THEN** `SeniorUnderwriter`'s effective scope is `["BankDepartment"]` and Membership/scope cross-checks elsewhere in the validator behave as if `SeniorUnderwriter.scope = "BankDepartment"` were declared explicitly

#### Scenario: Inheritance through a multi-step chain
- **WHEN** `A.scope = "Tenant"`, `B.parent = "A"` (no own scope), `C.parent = "B"` (no own scope)
- **THEN** `C`'s effective scope is `["Tenant"]`

#### Scenario: Root with no declared scope is global
- **WHEN** `A` has no `parent` and no `scope`, and `B.parent = "A"` with no own scope
- **THEN** both `A` and `B` are global; no scope-related error is emitted on either

### Requirement: Narrower-or-equal scope subset rule

A Role that declares its own `scope` SHALL have an effective scope that is **narrower than or equal to** its parent's effective scope. Subset is evaluated entry-by-entry against the parent's effective scope set:

- A Group entry is narrower-or-equal to a parent Group entry when the child Group equals the parent Group, or the child Group's `Group.parent` chain reaches the parent Group.
- A Person entry equals only itself; a Person entry is never narrower-or-equal to a Group entry.
- An array scope is a subset when every entry meets one of the rules above against some entry in the parent's scope.

When the parent's effective scope is unresolved (cycle, or upstream resolution error), this check SHALL be skipped on the child to avoid cascading errors.

#### Scenario: Child equals parent
- **WHEN** `Parent.scope = "BankDepartment"` and `Child.parent = "Parent"` with `Child.scope = "BankDepartment"`
- **THEN** validation passes

#### Scenario: Child Group is a sub-group of parent Group
- **WHEN** `Parent.scope = "BankDepartment"`, the document declares `Group RetailBranch` with `RetailBranch.parent = "BankDepartment"`, and `Child.parent = "Parent"` with `Child.scope = "RetailBranch"`
- **THEN** validation passes

#### Scenario: Child scope is unrelated to parent scope
- **WHEN** `Parent.scope = "BankDepartment"` and `Child.parent = "Parent"` with `Child.scope = "Tenant"`
- **THEN** validation fails with an error at path `roles/<child>/scope` whose message names both scopes and explains that `"Tenant"` is not narrower-or-equal to the parent's effective scope

#### Scenario: Child array scope is wider than parent
- **WHEN** `Parent.scope = ["Workspace", "Tenant"]` and `Child.parent = "Parent"` with `Child.scope = ["Workspace", "Tenant", "Region"]`
- **THEN** validation fails with an error at path `roles/<child>/scope` naming the offending entry `"Region"`

#### Scenario: Child Person scope under parent Group scope (without Membership backing)
- **WHEN** `Parent.scope = "Hospital"` and `Child.parent = "Parent"` with `Child.scope = "Patient"` (a Person)
- **THEN** validation fails with an error explaining that a Person scope is not narrower-or-equal to a Group scope

#### Scenario: Cycle suppresses subset check
- **WHEN** `A.parent = "B"`, `B.parent = "A"`, and `B.scope = "BankDepartment"`
- **THEN** the cycle error is emitted, and no separate subset error is emitted on `A` or `B` for that ill-formed chain

### Requirement: Action and Membership inheritance are explicitly out of scope

The validator SHALL NOT infer `actions[]` on a child Role from its parent. Each Role's `actions[]` is exactly the array declared on that Role.

The validator SHALL NOT widen Membership to cover child Roles based on a parent Membership. A `Membership.role` reference SHALL match the named Role exactly.

#### Scenario: Parent action is not visible on child
- **WHEN** `Underwriter.actions = [{ name: "Activate" }]` and `SeniorUnderwriter.parent = "Underwriter"` with no own `actions`
- **THEN** the validator and any output adapter treat `SeniorUnderwriter` as having zero actions; `SeniorUnderwriter.Activate` is NOT a valid Operation target

#### Scenario: Membership for parent does not cover child
- **WHEN** a Membership pins a Person to `Underwriter` and another Operation requires `SeniorUnderwriter`
- **THEN** the validator does NOT treat the parent Membership as satisfying the child requirement; explicit Memberships against `SeniorUnderwriter` are required

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

