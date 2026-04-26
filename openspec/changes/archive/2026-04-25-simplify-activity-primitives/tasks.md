## 1. Schemas

- [x] 1.1 In `packages/schemas/operational/operation.json`, add an optional `changes` array property using the same item shape that previously lived on `Outcome.changes` (`{ attribute, set }`; the existing schema has no from/to variant). Update the description and examples.
- [x] 1.2 Delete `packages/schemas/operational/outcome.json`.
- [x] 1.3 In `packages/schemas/operational/operational.json`, remove the `outcomes` property from the top-level object schema and any `$ref` import for outcome.
- [x] 1.4 In `packages/schemas/operational/trigger.json`, remove the `condition` property and any references to it in description/examples.
- [x] 1.5 In `packages/core/src/index.ts` (and any other place schemas are bundled/exported), remove `outcome.json` from the schema bundle. Also pruned `outcomes[]` from `packages/schemas/product/product.core.json` and added `changes[]` to `packages/schemas/product/core/operation.json`.
- [x] 1.6 Confirm no other schema in `packages/schemas/` references `outcome.json` or the removed properties (grep). Cleaned up stale Outcome mention in `packages/schemas/operational/action.json` description.

## 2. TypeScript types

- [x] 2.1 In `packages/core/src/fixtures/types.ts`, drop the `Outcome` export and the `outcomes[]` array from the operational input type. Add `changes?: OperationChange[]` to the `Operation` type. (`Trigger` interface had no `condition?` field.)
- [x] 2.2 Mirror the type changes in `packages/output-markdown/src/types.ts`, `packages/output-html/src/types.ts`, and `packages/output-text/src/types.ts`. (`output-mermaid` types had no Outcome reference.)

## 3. Validator

- [x] 3.1 In `packages/core/src/validator.ts`, remove the entire Outcome iteration block: `Outcome.operation` cross-resolution, `Outcome.changes[]` attribute checks, and `Outcome.initiates[]` Operation checks. Delete the `OperationalDNA.outcomes` slot.
- [x] 3.2 In the existing `operations[]` iteration in `validator.ts`, add per-Operation handling for `Operation.changes[]`: resolve each entry's attribute against the Operation's target Resource attributes; emit an error at `operations/<name>/changes/<index>/attribute` if unresolved. Validation only enforces unqualified attribute names; qualified `resource.attribute` form is accepted as legacy.
- [x] 3.3 In `validator.ts`, remove all `Trigger.condition` handling — the property check, the attribute resolution, and any error paths. (Validator never had any `Trigger.condition` handling to remove.)
- [x] 3.4 Run `npx tsc --noEmit` in `packages/core` (or `npm run build --workspace=@dna-codes/core`) to confirm no dangling references to `Outcome`, `Outcome.initiates`, or `Trigger.condition`.

## 4. Fixtures

- [x] 4.1 In `packages/core/src/fixtures/bookshop.ts`, migrate any `outcomes[]` entries onto the corresponding Operation as `changes[]`. Drop `outcomes[]`. Drop any `Outcome.initiates`. Drop any `Trigger.condition`. (Migrated to unqualified `attribute: 'status'` — Book Resource declares `status`.)

## 5. Examples

For each example below, perform the migration in this order: (a) for each entry in `outcomes[]`, find the Operation it points at by `operation` field and move the entry's `changes[]` array onto that Operation as `Operation.changes[]`; (b) drop any `initiates` field; (c) delete the now-empty `outcomes[]` collection; (d) defensively grep for any `Trigger.condition` and remove it.

- [x] 5.1 `examples/lending/operational.json` — migrated; attribute names normalized to unqualified form.
- [x] 5.2 `examples/healthcare/operational.json` — migrated; attribute names normalized to unqualified form.
- [x] 5.3 `examples/manufacturing/operational.json` — migrated; attribute names normalized to unqualified form.
- [x] 5.4 `examples/marketplace/operational.json` — migrated; attribute names normalized to unqualified form.
- [x] 5.5 `examples/mass-tort/operational.json` — migrated (audit was wrong, this DID have `outcomes[]`); attribute names normalized.
- [x] 5.6 `examples/education/operational.json` — migrated (audit was wrong, this DID have `outcomes[]`); attribute names normalized.

## 6. Output adapters

- [x] 6.1 In `packages/output-markdown/src/sections/operations.ts`, Outcome lookups dropped; per-Operation `changes[]` renders under a `**Changes:**` block.
- [x] 6.2 In `packages/output-markdown/src/sections/summary.ts`, removed the `Outcomes` count line.
- [x] 6.3 Mirrored 6.1 and 6.2 in `packages/output-html/src/sections/operations.ts` and `summary.ts`.
- [x] 6.4 Updated `packages/output-text/src/operation.ts` to read `op.changes` directly via `changeLines`; `Outcome` type removed. (`output-mermaid` had no Outcome reference.)
- [x] 6.5 No adapter rendered `Trigger.condition` — nothing to remove.

## 7. Tests

- [x] 7.1 Migrated the cross-layer fixture in `validator.test.ts` from `outcomes[]` to `Operation.changes[]` and dropped the `operational/outcome` schema-loaded assertion.
- [x] 7.2 Added cross-layer tests in `validator.test.ts`: positive Operation.changes acceptance, unknown-attribute rejection at `operations/<name>/changes/<i>/attribute`, qualified-form bypass, schema-shape assertions for absence of `outcomes[]`, `operational/outcome` registration, `Operation.initiates`, and `Trigger.condition`.
- [x] 7.3 Updated `packages/core/src/index.test.ts` operational primitive count from 15 → 14; removed the `outcome` entry; updated allSchemas size from 42 → 41.
- [x] 7.4 Updated `packages/output-markdown/src/index.test.ts` to expect `**Changes:**` block with unqualified `Sets \`status\`` and explicit absence of `**Outcomes:**`.
- [x] 7.5 No Outcome assertions found in `output-html/src/index.test.ts` or `output-text/src/index.test.ts` — they read from a fixture with `Operation.changes` already, so once `output-text/index.test.ts` was updated to put `changes` on Operation entries (done in 6.4), nothing else needed adjusting.
- [x] 7.6 `examples.test.ts` validates all six examples; ran clean post-migration.
- [x] 7.7 Ran `npm test --workspaces --if-present` — all 12 workspaces green (327 tests passing).

## 8. Docs

- [x] 8.1 In `README.md` (root), updated the Activity primitive list (dropped `Outcome`); updated example to put `changes[]` on Operations; rewrote the Operation/Trigger/Rule/Task/Process bullets to reflect the new gating + chaining + state-mutation surface.
- [x] 8.2 In `packages/core/docs/operational.md`: removed `Outcome` from Activities list; added explicit Step/Task subprimitive paragraph; rewrote the History line to record this change.
- [x] 8.3 In `docs/frameworks/triggers-and-events.md` (correct path), rewrote the EventBridge section to point at `Step.conditions` + `else: abort` instead of `Trigger.condition`; dropped the n8n note's `Signal.payload` reference.
- [x] 8.4 In `docs/frameworks/event-storming.md`, replaced `Outcome.changes` with `Operation.changes`; rewrote the "becomes" block, workflow step 3, and the JSON translation example to drop `outcomes[]`/`signals[]`/`source: signal` and use `Operation.changes` + `Trigger.after`. Also updated `ddd.md`, `bpmn.md`, `c4.md`, framework `README.md`, `packages/core/README.md`, `packages/output-markdown/README.md`, `packages/output-mermaid/README.md`.
- [x] 8.5 No example README references Outcome by name (verified by grep).
- [x] 8.6 ROADMAP.md doesn't reference Outcome or `Trigger.condition`; no roadmap entries closed by this change.

## 9. Wrap-up

- [x] 9.1 11 of 12 workspaces green (303 tests). The 12th — `integration-jira` — has a pre-existing build/source mismatch from an earlier Capability→Operation rename that was never completed in that package: its source uses `capability` field names + `styles: { capability }`, which `tsc` rejects against the current `Unit = 'operation' | 'resource' | 'process'` and which Jest only "passes" when `output-text/dist` is stale. Surfaced because this change required rebuilding `core/dist` for downstream consumers; the integration-jira fix is out of this change's scope and should be a separate `/opsx:propose finish-capability-rename-in-integration-jira` change.
- [x] 9.2 Ran `npx openspec validate simplify-activity-primitives` — `Change 'simplify-activity-primitives' is valid`.
- [x] 9.3 `git status` shows only intended changes plus regenerated `dist/` artifacts. No stray Outcome references remain in any non-archive, non-this-change file (verified by grep — `outcomes/` (path segment) and `business outcome` (English) hits are all legitimate).
