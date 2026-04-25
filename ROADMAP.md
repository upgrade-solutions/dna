# DNA Operational Layer Reorg — Roadmap

Working plan for the next major refactor of `@dna-codes/schemas` (operational layer) and downstream consumers. This document is the source of truth while the work is in flight; the README will be updated to match once the schemas land.

## Goal

The Operational layer should articulate **pure business logic** — what the business does, regardless of UI, API, or deployment technology. Cross-domain stress-testing (mass tort, sales, ecommerce, healthcare, education, marketplace, government, banking) confirmed the **Actor > Action > Resource** triad is the right core. This reorg cleans up the surrounding primitives so they reflect that core honestly.

## Final decisions

### Two buckets, no third
Drop the "Actor primitives" header. Operational DNA has only **Structure** (vocabulary) and **Behavior** (lifecycle, orchestration). Roles, Tasks, and Processes are behaviors, not a separate category.

### Resources is the only noun collection
All actors are Resources. There is no separate `actors` or `groups` collection.

**Resources do not declare a type.** A Resource is just a Resource — a named, attribute-bearing entity that may have Actions. Its semantic role (whether it functions as a target, a role, a user, a group, etc.) is **inferred from how it is referenced**, not declared on the Resource itself.

| Resource | What makes it that semantic role | Inferred role |
|---|---|---|
| `Loan` | Referenced as Operation target (`Loan.Approve`) | target |
| `Underwriter` | Referenced from `Membership.role`, `Task.actor` | role |
| `JoeKleier` | Has `memberships[]` | user |
| `Family` | Referenced from `Membership.in`, `Role.scope` | group |
| `RoutingEngine` | Referenced from `Task.actor` with no `Membership.role` references | system actor |

This is structural typing — the same Resource can play multiple roles simultaneously without ever declaring them. Customer is both an Operation target and an actor; Account is target + actor + group. No multi-flag declaration needed.

The triad still holds — "the **Actor** (a Resource used in actor context) performs an **Action** on a **Resource** (target)." Both ends are Resources at the schema level.

**Validator implication:** without a declared type, the validator cannot enforce semantic appropriateness like "`Membership.role` must point to a role-capable Resource" with a static field check. Recovery: structural inference. If a Resource is referenced from `Membership.role` in any document, it is role-capable; the validator can flag inconsistent uses (e.g., the same Resource referenced as both a Membership.role *and* as a non-actor Operation target with no actions, depending on rules we settle on). The field name `type` is reserved for places it is genuinely load-bearing (e.g., possibly on Membership itself if we later need to distinguish flavors of membership) — not on Resource.

### Membership is 3-way: User × Role × Group

A flat `User.roles[]` loses scope. Roles are always exercised within a Group:

> Joe is a *father* in a *family*, a *husband* in a *marriage*, a *member* of a *running club*.

Cross-domain confirmation:

| Domain | Role | Group |
|---|---|---|
| Mass tort | Lead Counsel | Case |
| Sales | Account Manager | Account |
| Education | Instructor | CourseOffering |
| Healthcare | Charge Nurse | Ward |
| Marketplace | Host | Listing |
| Government | Inspector | District |
| SaaS | Admin | Workspace |

Schema shape (illustrative — exact field names TBD):

```
Resource JoeKleier {
  memberships: [
    { role: "Father",  in: "Family" },
    { role: "Husband", in: "Marriage" },
    { role: "Member",  in: "RunningClub" }
  ]
}
```

A Resource being used as a Role may declare an optional `scope` naming the Resource it must be exercised within (its Group). The validator enforces that `membership.in` matches `scope`. Roles with no scope are global. Declaring `scope` is itself one of the structural signals that a Resource is being used as a Role.

```
Resource Father       { scope: Family }
Resource Underwriter  { scope: BankDepartment }
Resource SuperAdmin   { }       // no scope = global
```

### Renames

**`Capability` → `Operation`**
- "Capability" has Business Capability Modeling baggage (TOGAF, Gartner) — used for coarse org functions like "Customer Management." DNA's Resource.Action pair is finer-grained; wrong altitude for that term.
- Product Core already uses `Operation` as the projection of Operational `Capability`. Renaming unifies vocabulary across layers (Resource → Resource, Action → Action, Operation → Operation), removing the lone asymmetry.
- Bonus: "Operational layer defines Operations" forces bizops to articulate real units of work rather than vague capabilities.

**`Cause` → `Trigger`**
- "Cause" was vague. "Trigger" is the industry term (GitHub Actions `on:`, EventBridge, Zapier, n8n) and pairs cleanly with Outcome. Source field stays the same: `user | schedule | webhook | operation`.

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

- **Operation** = `Resource.Action` pair. Actor-agnostic *what*. Referenced by Trigger, Rule, Outcome, Signal, Equation.
- **Task** = `(actor, operation)` binding. Reusable named assignment (`UnderwriterApproval` = Underwriter performs Loan.Approve). Referenced by Step.
- **Step** = orchestration node within one Process. References **exactly one Task** — many tasks at one node = a sub-process, not a multi-task step. Owns DAG edges. Step-level conditions reference Rules compositionally ("Rule 1 AND Rule 2 must be true to execute").
- **Process** = named SOP — owns the DAG of Steps and an explicit `startStep`.

**Why Step → Task and not Step → Operation directly:** Rule.access is a *bound* (which Roles may), not a *pin* (which Role does in this Process). The same Operation may need different Roles per Process; Task is the named pin. Dropping Task would force `(operation, role)` inline at every Step site — recreating Task with no name and no reuse.

### Process gets explicit `startStep`

ASL-style (`StartAt`); matches Temporal `@WorkflowMethod` and n8n trigger nodes. Explicit beats implicit-from-DAG: the validator catches missing/wrong references with a clear error, and it disambiguates Processes with multiple entry-eligible Steps.

## Behavior primitives — final list

| Primitive | One-liner |
|---|---|
| Trigger | What initiates an Operation or Process (`user | schedule | webhook | operation`) |
| Rule | Constraint on an Operation: `access` (which Roles may) or `condition` (what must be true) |
| Outcome | State changes and downstream triggers after an Operation executes |
| Signal | Named domain event published after an Operation; carries a typed payload |
| Equation | Named, technology-agnostic computation (implemented by a Technical Script) |
| Task | A `(role, operation)` binding — the named, reusable assignment |
| Step | Orchestration node within a Process; references exactly one Task |
| Process | Named SOP — DAG of Steps with explicit `startStep` |

## Open questions

These need to settle before schemas change:

1. **Membership shape and cardinality.**
   - One `in:` per membership, or can a membership span multiple groups (rare but possible)?
   - Are memberships first-class (own collection) or always nested under a Resource that's acting as a user?
   - Does Membership itself need a `type` field to distinguish flavors of membership (e.g., `direct` vs `delegated` vs `temporary`)?

2. **Role hierarchy and Group scope interaction.**
   - How do Role parent chains (`parent`) interact with Group `scope`? E.g., if `SeniorUnderwriter.parent = Underwriter` and `Underwriter.scope = BankDepartment`, does the parent chain inherit the scope?
   - What happens if a parent and child Role declare different scopes?

3. **Validator inference rules.**
   - Without a declared Resource `type`, the validator infers semantic role from references. Need to spec exactly what inferences run and what inconsistencies they flag.
   - Example rules to consider: "if a Resource is referenced from `Membership.role` AND has no `actions[]`, it is role-only"; "if a Resource appears in `Membership.in`, it is group-capable."

4. **Cross-layer impact.**
   - Product Core currently surfaces a `roles[]` slice from Operational. With no declared Resource `type`, the surfacing logic must derive the Role slice from references (Resources referenced as `Membership.role` or `Task.actor`). Need to design what Product Core sees.

## Implementation plan

### 1. Schemas (`packages/schemas/operational/`)
- Rename `capability.json` → `operation.json`
- Rename `cause.json` → `trigger.json`
- Delete `user.json`, `role.json` — fold into `resource.json`. **No `type` discriminator on Resource.** Add optional `scope` and `memberships[]` fields; both are signals that a Resource is being used as a Role or User respectively.
- Add `task.json`, `step.json`
- Add `startStep` and `steps[]` to `process.json`
- Update `operational.json` collections list: `resources`, `operations`, `triggers`, `rules`, `outcomes`, `signals`, `equations`, `tasks`, `processes`

### 2. Validator (`packages/core/src/validator.ts`)
- Drop `User`/`Role` primitive checks
- Cross-reference checks (existence + structural inference):
  - `Trigger.target` shape (Operation vs Process)
  - `Step.task` resolves to a defined Task
  - `Process.startStep` resolves to a Step in that Process
  - `Membership.role` resolves to a Resource; `Membership.in` resolves to a Resource and matches the referenced Role's `scope` (if declared)
  - Inferred-role consistency checks (rules to be specced — see open question #3)
- Update name normalization for renamed primitives

### 3. Documentation
- Rewrite README "Operational Layer" section with Structure/Behavior split and final primitive list
- Add cross-domain examples table (the one in this roadmap)
- Document Resource/Actor/Group duality with examples (Customer, Family, Account)
- Update minimal example in README to use new names
- Update `packages/core/AGENTS.md` and any package-local docs

### 4. Fixture
- Update bookshop fixture in `@dna-codes/core` for new primitive names + Membership shape
- Bump assertion counts in all output adapter tests

### 5. Adapters
- **Output** (`output-markdown`, `output-mermaid`, `output-html`, `output-text`): rename collections, add Membership rendering, update section names
- **Input — deterministic** (`input-json`, `input-openapi`): emit new primitive names; `input-json` may need to infer `kind` heuristically from sample shape
- **Input — probabilistic** (`input-text`): update prompt vocabulary; balance prompt for Resource kinds and Memberships

### 6. Versioning
- Major bump for `@dna-codes/schemas` and `@dna-codes/core` (breaking)
- Coordinated bump for all input-/output-/integration-* packages
- Migration note in README + a short `docs/migration-from-pre-reorg.md` for users on the old schemas

## Sequencing

1. Resolve the open questions above (Actor model details, Membership cardinality, cross-layer impact)
2. Write the new schemas in a feature branch with the validator updates
3. Update fixture + run tests across the monorepo to verify the wave
4. Update README, AGENTS.md, and adapter READMEs
5. Update output adapters (purely render-side, low risk)
6. Update input adapters (text first since it's flexible; then deterministic)
7. Coordinated version bump and publish

## Out of scope

- Product layer changes beyond what cross-references force (e.g., Product Core's surfaced Role slice may need a small update, but Product API/UI primitives stay as-is)
- Technical layer — untouched
- Integration packages — untouched apart from any DNA shape they emit/consume

## Future enhancements (post-reorg)

### Optional Resource `uses` config
Once the reorg lands and we've lived with structural typing for a bit, consider an **optional** declaration on Resource that names how it's intended to be used — e.g., `uses: [actor, group]` or `uses: [actor]`. This stays opt-in (no Resource is required to declare it) and serves two purposes:

- **Stricter validation** — when present, the validator can reject inconsistent references (e.g., `Membership.role` pointing at a Resource whose `uses` doesn't include `actor`)
- **Documentation hint** — readers see at a glance how a Resource is meant to participate, without having to scan all reference sites

Resources that omit `uses` continue to rely on structural inference. This addresses the validator-strictness loss from dropping the required type discriminator without re-introducing it as mandatory metadata. Vocabulary for `uses` values (`actor`, `group`, `target`, etc.) can be settled when we build it.
