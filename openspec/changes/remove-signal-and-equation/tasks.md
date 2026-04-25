## 1. Schemas

- [x] 1.1 Delete `packages/schemas/operational/signal.json`.
- [x] 1.2 Delete `packages/schemas/operational/equation.json`.
- [x] 1.3 In `packages/schemas/operational/operational.json`, remove the `signals` and `equations` properties from the top-level object schema; remove their `$ref` imports if any.
- [x] 1.4 In `packages/schemas/operational/outcome.json`, remove the `emits` property and any references to Signal in description/examples.
- [x] 1.5 In `packages/schemas/operational/process.json`, remove the `emits` property.
- [x] 1.6 In `packages/schemas/operational/trigger.json`, remove `"signal"` from the `source` enum and remove the `signal` field. Update the description to list only `user | schedule | webhook | operation`.
- [x] 1.7 In `packages/schemas/index.ts` (or wherever schemas are exported), remove signal.json and equation.json from the schema bundle. (Done in `packages/core/src/index.ts` and pruned `signals`/`equations` references from `packages/schemas/product/product.core.json`.)

## 2. TypeScript types

- [x] 2.1 In `packages/core/src/fixtures/types.ts`, drop the `Signal` and `Equation` exports and the `signals`/`equations` arrays from the operational input type. Drop `emits` from `Outcome`/`Process` and the `signal` field on `Trigger`.
- [x] 2.2 Mirror the type changes in `packages/output-markdown/src/types.ts` and `packages/output-html/src/types.ts` (and any other adapter that has a local types copy). (Also updated `packages/output-text/src/types.ts`.)

## 3. Validator

- [x] 3.1 In `packages/core/src/validator.ts`, remove the `signalNames` Set, the `Signal.operation` cross-reference loop, the Outcome.emits Signal-resolution loop, the Trigger.signal cross-reference, the `Process.emits` cross-reference loop, and any `equations` collection handling.
- [x] 3.2 Remove `Signal`/`Equation` mentions from the `OperationalDNA` interface in validator.ts.
- [x] 3.3 Run `npx tsc --noEmit` in `packages/core` to confirm no dangling references. (Verified via `npm run build --workspace=@dna-codes/core`.)

## 4. Fixtures

- [x] 4.1 In `packages/core/src/fixtures/bookshop.ts`, remove the `signals[]` array, any `outcomes[].emits` entries, and any `processes[].emits` entries.

## 5. Examples

- [x] 5.1 `examples/lending/operational.json` — remove `signals[]`; strip `outcomes[].emits`, `processes[].emits`, and any `triggers[]` entries with `source: "signal"`.
- [x] 5.2 `examples/healthcare/operational.json` — same.
- [x] 5.3 `examples/education/operational.json` — same.
- [x] 5.4 `examples/manufacturing/operational.json` — same.
- [x] 5.5 `examples/marketplace/operational.json` — same.
- [x] 5.6 `examples/mass-tort/operational.json` — same.

## 6. Output adapters

- [x] 6.1 In `packages/output-markdown/src/sections/operations.ts`, remove the "**Signals published:**" block and any signal-payload rendering.
- [x] 6.2 In `packages/output-markdown/src/sections/summary.ts`, remove the `Signals` count line.
- [x] 6.3 In `packages/output-html/src/sections/operations.ts`, remove signal rendering.
- [x] 6.4 In `packages/output-html/src/sections/summary.ts`, remove signal counts.
- [x] 6.5 If `output-mermaid` or `output-text` reference Signals, drop those references too. (Pruned `t.signal` rendering and `outcome.emits` from `output-text`; also dropped `Process.emits` rendering from `output-markdown/src/sections/sops.ts`.)

## 7. Tests

- [x] 7.1 In `packages/core/src/validator.test.ts`, drop the Signal/Equation cross-reference tests (Signal.operation, Outcome.emits, Trigger.signal, Process.emits).
- [x] 7.2 In `packages/core/src/index.test.ts`, drop any Signal/Equation export assertions.
- [x] 7.3 In `packages/output-markdown/src/index.test.ts`, drop signal-related expectations and update Summary primitive-count assertions to match the trimmed bookshop fixture.
- [x] 7.4 Same for `packages/output-html/src/index.test.ts`.
- [x] 7.5 In `packages/core/src/examples.test.ts` (or wherever examples are validated), confirm all 6 examples still pass after their `signals[]` arrays are stripped.
- [x] 7.6 Run `npm test --workspaces --if-present` from the repo root; confirm green across all workspaces.

## 8. Docs

- [x] 8.1 In `README.md` (root), remove `Signal` and `Equation` from any primitive lists and update narrative text that describes them.
- [x] 8.2 In `packages/core/docs/operational.md`, remove Signal/Equation from the People/Entities/Activities lists; update the "History" paragraph to note these were removed (with a link to this OpenSpec change).
- [x] 8.3 In `docs/frameworks/event-storming.md`, remove the row that maps "Event (orange) = Signal" and replace with a note that DNA currently models state changes as `Outcome.changes` only — no first-class event primitive.
- [x] 8.4 If any per-package README references Signal/Equation (output-markdown, output-html, etc.), prune those mentions too. (Updated `packages/output-markdown/README.md`, `packages/core/README.md`, `packages/output-mermaid/README.md`, the four example READMEs that called out Signal/Equation, plus minimal pruning in `docs/frameworks/bpmn.md`, `docs/frameworks/ddd.md`, `docs/frameworks/togaf.md`, `packages/core/docs/product.md`, and `packages/core/docs/technical.md`.)

## 9. Wrap-up

- [x] 9.1 Run `npm test` from the repo root one more time after docs land; confirm green.
- [x] 9.2 Run `npx openspec validate remove-signal-and-equation` to confirm the OpenSpec artifacts still pass.
- [ ] 9.3 Commit schema + type + validator + fixture + examples + adapters + tests + docs together with one conventional commit message that flags the schema breaking change. (Skipped per instructions — leaving changes uncommitted for human review.)
