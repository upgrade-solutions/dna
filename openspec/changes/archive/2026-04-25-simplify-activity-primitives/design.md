## Context

The Operational layer's seven Activity primitives (Operation, Task, Step, Process, Trigger, Rule, Outcome) were stress-tested against the example domains during the `add-role-hierarchy` and `add-role-cardinality-and-exclusivity` work. The audit done after those two changes shipped surfaced three smells:

- **`Outcome.initiates: Operation[]`** — declared in the schema, walked by the validator, used by zero examples. It would be a third orchestration path: `Trigger.after` already chains entry-point Operations; `Step.depends_on` orchestrates within a Process. `Outcome.initiates` would let any Operation chain to any other Operation outside both — exactly the kind of implicit graph the Process primitive was designed to make explicit.
- **`Outcome` itself** — once `initiates` is gone, an Outcome is a thin wrapper holding `changes[]` (state mutations). No example has more than one Outcome per Operation, so the wrapper buys nothing. Worse, it forces standalone Operations (those fired directly by a Trigger with no Process) to round-trip through an Outcome to declare what they mutate.
- **`Trigger.condition`** — declared in the schema, walked by the validator, used by zero examples. `Step.conditions` already gates intra-Process branching with the same operators; anything `Trigger.condition` can express ("don't fire if X") can be expressed by a first Step with `conditions: [X]` and `else: abort`. The triggers-and-events framework doc already states that fine-grained payload filtering is a runtime concern — meaning we shipped a coarse field that doesn't fit DNA's modeling philosophy and didn't fit a real workflow tool's filtering ambitions either.

This change continues the pruning pattern established by `remove-signal-and-equation` (no first-class event primitive without a consumer) and `remove-script-primitive` (no compute deployment without an Operational source).

## Goals / Non-Goals

**Goals:**
- Remove `Outcome.initiates`, the `Outcome` primitive entirely, and `Trigger.condition` from schema, validator, examples, fixtures, and adapter goldens
- Move `changes[]` (the only thing Outcome carried) onto Operation as a first-class field, with the same item shape it had on Outcome
- Cut the Activity primitive count from 7 to 6: Operation, Task, Step, Process, Trigger, Rule
- Document Step's status precisely: it's a sub-primitive of Process (defined inline in `process.json`); Task is the standalone equivalent
- Keep the change atomic — schema, validator, every example, every doc in one apply pass

**Non-Goals:**
- Adding a new Operation-chain primitive — `Trigger.after` covers entry-point chaining, Process covers orchestration, that's enough
- Promoting Step to a top-level `step.json` schema — this change goes the other direction (it confirms inline-only)
- Reintroducing `Trigger.condition` in a different shape (e.g., expression-based) — if richer entry gating becomes necessary later, propose it with a real example
- Adding multi-outcome semantics to Operation (e.g., success/failure variants of `changes`) — explicit YAGNI; if a domain demonstrates it, propose then

## Decisions

### 1. `changes` lives on Operation, not Step

The mutation an Operation produces is intrinsic to the `Resource.Action` pair. `Loan.Approve` changes `Loan.status` to `approved` regardless of which Process invokes it or whether any Process invokes it at all.

Putting `changes` on Step would:
- Force Operations triggered by `Trigger`-only flows (no Process) to have no place to declare mutations
- Allow two Steps invoking the same Operation to declare different `changes`, which means it's not really the same Operation — reintroducing the multi-outcome ambiguity we're removing
- Couple state-mutation modeling to orchestration modeling, when in practice they're orthogonal

Putting `changes` on Operation keeps the atomic unit atomic and lets the validator do attribute-existence checking once per Operation declaration instead of once per call site.

**Rejected alternative:** A separate `state-machine` primitive that names the state field plus its transitions per Operation. Cleaner in theory, more primitives to learn in practice. `Operation.changes[]` is a single optional field; a state-machine primitive would be a new top-level collection. The current item shape (`{attribute, set}` / `{attribute, from, to}`) already handles the simple cases; a richer state-machine model can be a follow-up if examples demand it.

### 2. Delete Outcome rather than keep it as an empty wrapper

Once `initiates` is removed and `changes` moves to Operation, Outcome has no fields left. Keeping it as a hollow primitive — a name with no slots — would be schema clutter. Delete it.

This matches the `remove-signal-and-equation` precedent: when a primitive's last useful field is gone, the primitive goes too.

**Rejected alternative:** Keep Outcome with just `changes[]` for "future extensibility." This is precisely the speculative-headroom argument we rejected when removing Signal. Schemas are reversible.

### 3. Hard removal, not deprecation

The repo has no published external consumers, OpenSpec records the rationale, and reintroduction is a small reverse-PR. No `deprecated: true` annotation, no soft cutover.

The only migration anyone has to do is mechanical: take each `outcomes[]` entry, find its Operation by `operation` field, and move `changes[]` onto that Operation. Removed entirely: `initiates`, `Trigger.condition`. The validator surfaces any miss as a hard error.

**Rejected alternative:** Two changes (remove `initiates` first, then remove Outcome). Three coupled deletions, one rationale ("primitives must earn their place"), one apply pass. Splitting wastes test cycles and risks the second change losing context.

### 4. Step stays inline in `process.json`; doc clarifies why

Step is not promoted to `step.json`. Step has no meaning outside a Process — its `depends_on`, `conditions`, and `else` fields all reference sibling Steps in the same Process. Promoting to a top-level schema would imply standalone Steps are valid, which they aren't.

`operational.md` currently lists Step among the seven primitives without explaining the asymmetry. After this change, the doc will state explicitly:
- **Task** is the atomic SOP unit ("Role performs Operation"). It can stand alone or be referenced by Steps.
- **Step** is a Task wrapped with orchestration metadata (`depends_on`, `conditions`, `else`). It exists only inside a `Process.steps[]` array.

The Activity primitive list in both `README.md` and `operational.md` becomes: Operation, Task, Step, Process, Trigger, Rule (6).

### 5. Validator reshaping is mechanical, not architectural

The validator currently:
- Iterates `outcomes[]`, resolves `Outcome.operation` to a known Operation, validates `Outcome.changes[]` attribute references, validates `Outcome.initiates[]` Operation references
- Iterates `triggers[]`, validates `Trigger.condition.attribute` if present

After this change:
- Outcome iteration is gone entirely
- The attribute-existence check moves into the existing `operations[]` iteration: validate `Operation.changes[]` against the target Resource's attributes
- The `Trigger.condition` block is deleted

No new cross-reference logic. No new primitives to register. The validator should net-shrink.

### 6. Examples migrate file-by-file in one pass

All six examples are touched, but only `lending`, `manufacturing`, `marketplace`, and `healthcare` actually have `outcomes[]` (per the audit). The migration per file is:

1. For each `outcomes[]` entry, find the Operation it points at by `operation`. Move its `changes[]` onto `Operation.changes[]`. If the entry has `initiates`, drop it (no example uses it).
2. Delete the now-empty `outcomes[]` collection.
3. If any Trigger has `condition`, drop the field. (Audit found none, but check defensively.)
4. Update the example's README if it referenced "Outcome" by name.

`education` and `mass-tort` have no `outcomes[]` to migrate (per the audit) — they may have a `Trigger.condition` to remove, but probably not.

## Risks / Trade-offs

- **Risk:** A downstream consumer relies on the `outcomes[]` collection or `Outcome.initiates`. → Mitigation: no known external consumers; the BREAKING flag in the proposal makes future archaeology easy. Reverse-PR is cheap if needed.
- **Risk:** Moving `changes` to Operation makes the Operation schema bigger and harder to scan. → Mitigation: `changes[]` is optional and only present where state mutation is modeled. The schema gains one optional field and loses an entire primitive file plus a top-level collection — net simplification.
- **Risk:** Someone wants to model a Process where the same Operation produces different state changes depending on the Step invoking it. → Mitigation: that's the multi-outcome scenario we explicitly de-supported. If it appears, the right fix is two Operations (`Loan.ApproveStandard` vs `Loan.ApproveExpedited`), not multi-outcome on one Operation.
- **Risk:** Removing `Trigger.condition` reduces expressiveness for entry gating. → Mitigation: `Step.conditions` + `else: abort` covers it. Anyone writing entry gating today (no one in the examples) does one extra Step declaration. Trade-off: slightly more verbose, strictly more uniform — gating logic is in one place instead of two.
- **Trade-off:** The audit also flagged that `Outcome.coverage` is sparse in `education` and `mass-tort`. Folding `changes` onto Operation doesn't fix that; those examples still won't declare state mutations. That's a separate "examples are thin" concern, not a model concern, and it stays for a future pass.
