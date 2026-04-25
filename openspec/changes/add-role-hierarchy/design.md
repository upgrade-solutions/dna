## Context

`Role.parent` is already in the schema (`packages/schemas/operational/role.json:32-36`) and the validator already checks that it resolves to a declared Role (`packages/core/src/validator.ts:492-498`). The schema description still reads "Inheritance semantics deferred to v2." — this change *is* v2: cycle detection, scope inheritance, and a narrower-or-equal scope-subset rule.

The existing scope model already supports two shapes per Role: a single Group name (`Underwriter.scope = "BankDepartment"`) or an array of Group names (`SuperAdmin.scope = ["Workspace", "Tenant"]`). Person can also be scopeable (`AttendingPhysician.scope = "Patient"`). Membership rows can pin a Role to a specific group instance — the Membership-vs-Role-scope rule is enforced today.

The validator already exposes `quoteList(names)` and `availability(label, names)` helpers (added in the recent error-UX polish), and a `primitives.pool('scopeable')` accessor. New checks will reuse these — no new helpers required for resolution or messaging.

## Goals / Non-Goals

**Goals:**
- A child Role with no `scope` inherits the parent's effective scope (walk the chain to root).
- A child Role with its own `scope` must be **narrower or equal** to the parent's effective scope.
- Cycles in the parent chain are rejected with a clear error naming the cycle members.
- All existing 309 tests pass; new behavior covered by ~4 validator tests.
- One example domain (`examples/lending/`) gains a parent Role to demonstrate the feature end-to-end.

**Non-Goals:**
- Action inheritance — children declare their own `actions[]`. Rationale: explicit declarations are easier to read and audit; nothing about `Role` is supposed to be hidden behind a parent pointer.
- Membership inheritance — a Membership for `Underwriter` does NOT implicitly cover `SeniorUnderwriter`. Rationale: org RBAC should be explicit; an implicit widening of access is a security footgun.
- Multi-parent roles — `parent` stays a single string. Rationale: real org charts are tree-shaped at the Role level; mixin-style multi-inheritance has no example forcing it yet.
- Cross-domain parent (parent in a different `Domain`) — defer until an example forces it.

## Decisions

### 1. Subset semantics for the narrower-or-equal check

The "narrower or equal" rule reduces to: every entry in the child's normalized scope set must equal, or be reachable from, an entry in the parent's effective scope set.

| Parent scope            | Child scope                   | Verdict                                                                  |
|-------------------------|-------------------------------|--------------------------------------------------------------------------|
| `BankDepartment`        | (none)                        | ✓ inherits `BankDepartment`                                              |
| `BankDepartment`        | `BankDepartment`              | ✓ equal                                                                  |
| `BankDepartment`        | `RetailBranch` (subgroup)     | ✓ if `RetailBranch.parent = BankDepartment`                              |
| `BankDepartment`        | `Tenant`                      | ✗ unrelated Group                                                        |
| `BankDepartment`        | `Loan` (Person/Resource)      | ✓ only if Membership pins the Person to a `BankDepartment`-typed group; otherwise ✗ |
| `[Workspace, Tenant]`   | `Workspace`                   | ✓ subset                                                                 |
| `[Workspace, Tenant]`   | `[Workspace, Tenant, Region]` | ✗ wider                                                                  |
| `Patient` (Person)      | `Patient`                     | ✓ equal                                                                  |
| `Patient` (Person)      | `Hospital` (Group)            | ✗ Person is narrower than Group, never wider                             |

The Group→Group case relies on the existing `Group.parent` chain (already validated). Person scopes are only "narrower" than themselves — Person can equal a Person, but Person→Group widening is rejected.

**Rejected alternative:** evaluate subsets purely on string equality. Simpler, but it would force every child to repeat the parent's exact scope, defeating the point of inheritance.

### 2. Cycle detection

Walk the chain from each Role. If a Role is visited twice in the walk, emit one error per cycle (deduped by sorted member set) listing the cycle members in walk order. Two-Role cycles (`A↔B`) and longer ones use the same code path.

**Rejected alternative:** Tarjan's SCC. Overkill — Role graphs are tiny (10s of Roles in the largest realistic domain) and the simple walk produces friendlier error messages.

### 3. Effective-scope resolution

Add `Role.effectiveScope(name) → string[]` semantics inside the validator (not exported). Resolution: if the Role declares `scope`, normalize to array and return; otherwise look up the parent and recurse. Cache per call to `validate()` to keep the algorithm O(n) per chain regardless of fan-in.

If the chain hits a cycle, effective scope returns `null`; the cycle error already covers that case so the subset check on this Role is skipped (avoids cascading errors on bad input).

### 4. Where the new checks live

The `roles` block at `validator.ts:488-516` already iterates each Role and validates `parent` and `scope`. Both new checks attach there — single iteration, sequential checks. Cycle detection runs once before the per-Role pass to populate `effectiveScope` cache.

### 5. Schema description update only

Don't add new fields to `role.json`. Just rewrite the `parent` description to document the v2 semantics. The "Inheritance semantics deferred to v2" line goes away.

### 6. Example: `lending`

Add `SeniorUnderwriter.parent = Underwriter` (no own scope — inherits `BankDepartment`). Demonstrates the most useful case (inheritance) without needing any change to the rest of the example. Skip mass-tort and healthcare for now — they'd need a sibling Role invented just for the demo, which is exactly the kind of contrived addition the recent examples-update agent flagged as forced.

## Risks / Trade-offs

- **Risk:** Subset rule for Person scopes depends on Membership data, which the validator already resolves but in a different pass. → Mitigation: scope-subset check runs after Membership resolution; if Memberships are themselves invalid, child-scope-subset for Person gets skipped (with a warning, not an error) to avoid cascading failures from upstream errors.
- **Risk:** Existing examples might inadvertently violate the new subset rule. → Mitigation: grep current examples for `Role.parent` first — at this writing none exist outside what's added by this change, so no migration needed.
- **Risk:** Documenting a v2 semantics change in `role.json`'s description bloats the schema. → Mitigation: keep the description tight (~3 sentences); offload nuance to `packages/core/docs/operational.md`.
- **Trade-off:** Choosing single-parent over multi-parent now means a future multi-parent feature is a breaking schema change (`parent: string` → `parent: string | string[]`). Accepted: no real-world example needs multi-parent today, and hypothetical multi-inheritance is harder to validate than its rare value justifies.
