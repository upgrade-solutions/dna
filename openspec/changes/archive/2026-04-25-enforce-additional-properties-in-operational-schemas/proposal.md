## Why

Eight Operational schemas omit `additionalProperties: false`, so unknown or removed fields pass schema validation silently — even though `openspec/specs/operational-event-model/spec.md` already asserts they should be rejected (e.g., "Operational schema rejects `signals[]`/`outcomes[]`/`equations[]`", "Operation schema rejects `initiates`", "Trigger schema rejects `condition`", "Process schema rejects `emits`"). The recent test drive confirmed those scenarios are aspirational: corrupting an example with `Operation.initiates` or `Trigger.condition` does not fail validation. The spec promises enforcement that the schemas don't deliver.

## What Changes

- Add `additionalProperties: false` to the 8 Operational schemas currently missing it: `operational.json` (top-level), `operation.json`, `trigger.json`, `process.json`, `rule.json`, `task.json`, `attribute.json`, `relationship.json`.
- Add validator tests that exercise the existing forbidden-shape scenarios end-to-end (signals[], outcomes[], equations[], scripts[], Operation.initiates, Trigger.condition, Process.emits) and confirm Ajv now produces an `additionalProperties` error for each.
- Verify the bookshop fixture and all six examples (lending, healthcare, manufacturing, marketplace, mass-tort, education) still pass schema validation — i.e., this change must surface no accidental unknown fields. If any are found, fix them (likely typos or stragglers) before tightening the schema.

Not breaking for any documented usage: the Operational layer's vocabulary is fixed and these fields were already meant to be rejected.

## Capabilities

### Modified Capabilities
- `operational-event-model`: existing scenarios that say "schema validation fails" become enforced rather than aspirational. No new requirements; the existing requirements gain teeth.

## Impact

- `packages/schemas/operational/{operational,operation,trigger,process,rule,task,attribute,relationship}.json` — add `additionalProperties: false` at top level.
- `packages/core/src/validator.test.ts` — add forbidden-shape rejection tests.
- No source changes outside schemas + tests. No example or doc changes expected (validated as part of the work).
- Out of scope: tightening Product or Technical schemas; changing Ajv `strict` mode. Both can be separate proposals if a gap surfaces there too.
