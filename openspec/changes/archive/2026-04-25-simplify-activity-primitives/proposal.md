## Why

The Operational layer currently has 7 Activity primitives (Operation, Task, Step, Process, Trigger, Rule, Outcome) and several optional fields that are either dead code or redundant with more general primitives. An audit across all six example domains found:

- `Outcome.initiates` is unused in every example. It would be a third orchestration path (alongside `Trigger.after` for entry-point chaining and `Step.depends_on` for intra-Process orchestration), violating the "Process is the orchestrator; nothing else orchestrates" principle.
- `Outcome` itself, once `initiates` is removed, contains only `changes[]` (state mutations). No example declares more than one Outcome per Operation, so the wrapper earns nothing — and putting `changes` on Outcome (a Process-coupled artifact in practice) means standalone Operations triggered without a Process can't declare mutations.
- `Trigger.condition` is unused in every example. `Step.conditions` is strictly more general (handles mid-Process branching as well as entry gating) and can express anything `Trigger.condition` does via a first Step with `else: abort`.
- `operational.md` describes Step as one of 7 Activity primitives but Step has no top-level schema — it's defined inline inside `process.json`. This is correct (Step is meaningful only inside a Process) but undocumented.

This change continues the pruning pattern established by `remove-signal-and-equation` and `remove-script-primitive`: delete primitives and fields that don't earn their keep, document the remaining model precisely.

## What Changes

- **BREAKING** Remove `Outcome.initiates` field from the schema and validator.
- **BREAKING** Delete the `Outcome` primitive entirely. Move `changes[]` onto `Operation` as `Operation.changes[]` with the same item shape.
- **BREAKING** Remove `Trigger.condition` field from the schema and validator.
- Update `packages/core/docs/operational.md` to clarify that Step is a sub-primitive of Process (not a top-level noun) and Task is the standalone equivalent. Update the Activity primitive list from 7 to 6: Operation, Task, Step, Process, Trigger, Rule.
- Migrate all six example `operational.json` files: rewrite `outcomes[]` entries as `Operation.changes[]` on the corresponding Operation; remove any `Outcome.initiates`; remove any `Trigger.condition`.
- Update example READMEs and `docs/triggers-and-events.md` to drop references to the removed fields/primitive.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `operational-event-model`: Replace `Outcome.changes` as the canonical event-shaped output with `Operation.changes`. Add scenarios rejecting `outcomes[]`, `Outcome.initiates`, and `Trigger.condition`. Existing scenarios that reject signals/equations remain unchanged.

## Impact

- **Schemas** — `packages/schemas/operational/operation.json` (add `changes[]`), `packages/schemas/operational/outcome.json` (deleted), `packages/schemas/operational/operational.json` (drop `outcomes[]` collection), `packages/schemas/operational/trigger.json` (drop `condition`).
- **Validator** — `packages/core/src/validator.ts` drops Outcome cross-ref logic; reapplies attribute-existence checks against `Operation.changes`; drops `Trigger.condition` checks.
- **Tests** — `packages/core/src/validator.test.ts` updates fixtures and adds rejection tests for the removed shapes.
- **Examples** — six `operational.json` files migrate (`lending`, `healthcare`, `manufacturing`, `marketplace`, `mass-tort`, `education`); their READMEs lose any Outcome references.
- **Docs** — `README.md`, `packages/core/docs/operational.md`, `docs/triggers-and-events.md`, `ROADMAP.md` (if anything was deferred to it).
- **Downstream layers** — Product/Technical layers do not currently reference `Outcome`, `Outcome.initiates`, or `Trigger.condition`, so no downstream breakage is expected. Verified via grep before proposal.
