## 1. Tighten Operational schemas

- [x] 1.1 Add `"additionalProperties": false` at the top level of `packages/schemas/operational/operational.json`.
- [x] 1.2 Add it to `packages/schemas/operational/operation.json`.
- [x] 1.3 Add it to `packages/schemas/operational/trigger.json`.
- [x] 1.4 Add it to `packages/schemas/operational/process.json`.
- [x] 1.5 Add it to `packages/schemas/operational/rule.json`.
- [x] 1.6 Add it to `packages/schemas/operational/task.json`.
- [x] 1.7 Add it to `packages/schemas/operational/attribute.json`.
- [x] 1.8 Add it to `packages/schemas/operational/relationship.json`.

## 2. Verify nothing is accidentally exposed

- [x] 2.1 Run `npm test --workspace=@dna-codes/core`. Bookshop fixture validation should still pass; if it fails, identify and fix the offending field on the fixture (do not relax the schema).
- [x] 2.2 Write a one-shot script (or extend the existing approach used during the test drive) that loads each example operational.json and validates it against `operational`. All 6 (lending, healthcare, manufacturing, marketplace, mass-tort, education) MUST pass. Fix any unknown fields in the examples before proceeding.

## 3. Lock the contract with explicit rejection tests

In `packages/core/src/validator.test.ts`, add tests that prove each forbidden shape now produces an Ajv `additionalProperties` error:

- [x] 3.1 Add: top-level Operational doc with `widgets: []` (or any unknown collection) → `validate(doc, 'operational').valid === false` and at least one error has `keyword: 'additionalProperties'`.
- [x] 3.2 Add: Operation with `initiates: ['X.Y']` → `validate(op, 'operational/operation').valid === false` with `additionalProperties` error at `/initiates`.
- [x] 3.3 Add: Trigger with `condition: { ... }` → same shape, `/condition`.
- [x] 3.4 Add: Process with `emits: ['Foo']` → same shape, `/emits`.
- [x] 3.5 Add: Rule, Task, Attribute, Relationship each with one made-up unknown field → assert `additionalProperties` rejection. Group these into a single `describe` block; each is a tiny `it()`.
- [x] 3.6 Add a smoke test that walks each example file and asserts `validate(doc, 'operational').valid === true`. (Read paths from the `examples/` directory; one assertion per example.)

## 4. Build and final verification

- [x] 4.1 Run `npm run build --workspace=@dna-codes/core` so dist/ artifacts reflect the schema changes.
- [x] 4.2 Run `npm test` from the repo root; 11/12 workspaces green. Sole failure is `integration-jira` — pre-existing breakage from the unfinished Capability rename, untouched by this change.
- [x] 4.3 Run `npx openspec validate enforce-additional-properties-in-operational-schemas` — change is valid.
- [ ] 4.4 Commit: `Enforce additionalProperties: false on Operational schemas` (single commit covering schema + tests + dist).
