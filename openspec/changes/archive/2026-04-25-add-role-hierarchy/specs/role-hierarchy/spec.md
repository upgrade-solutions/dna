## ADDED Requirements

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
