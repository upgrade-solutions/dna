## Context

`openspec/specs/operational-event-model/spec.md` contains scenarios like "schema validation fails with an additionalProperties error" for shapes that no longer exist (`signals[]`, `outcomes[]`, `equations[]`, `Operation.initiates`, `Trigger.condition`, `Process.emits`). The intent is that the schemas are closed: only declared properties are allowed.

Reality differs. Of the 14 Operational primitive schemas plus the top-level layer schema, only 6 declare `additionalProperties: false` (action, domain, group, membership, person, resource, role). The other 8 (`operational.json`, `operation.json`, `trigger.json`, `process.json`, `rule.json`, `task.json`, `attribute.json`, `relationship.json`) are open. Combined with Ajv's `strict: false` config (validator.ts:236), unknown properties pass silently — confirmed via test drive.

This change closes the gap by tightening those 8 schemas. No requirement text changes; the existing rejection scenarios stop being aspirational.

## Goals / Non-Goals

**Goals:**
- All 14 Operational primitive schemas + the top-level Operational schema reject undeclared properties.
- Forbidden shapes called out by existing scenarios (`signals[]`, `outcomes[]`, `equations[]`, `Operation.initiates`, `Trigger.condition`, `Process.emits`) generate Ajv `additionalProperties` errors.
- Bookshop fixture and all 6 examples continue to validate clean — i.e., this change exposes no accidental drift.

**Non-Goals:**
- Tightening Product schemas (only `product.core.json` already has it; rest unchanged here).
- Tightening Technical schemas.
- Changing Ajv `strict: false` to `strict: true` — that's a separate change with broader fallout.
- Changing the cross-layer (`validateCrossLayer`) checks.

## Decisions

**1. Add `additionalProperties: false` at the top level of each affected schema, not inside nested objects.**

The 8 schemas all have a single top-level `properties` block. Adding the flag once per file is enough to close the surface tested by the spec scenarios. Nested objects (e.g., `Operation.changes[].set`, `Process.steps[]`, `Rule.condition`) are not the target of any existing scenario; tightening them would expand scope and risk surfacing intentional flexibility (e.g., `condition` is intentionally polymorphic across rule kinds).

If a future scenario calls out a nested-object rejection, tighten there in a follow-up.

**2. Validate the bookshop fixture and all 6 examples before declaring success.**

The risk of `additionalProperties: false` is exposing pre-existing drift — a fixture or example that quietly carried an unknown field. Run `npm test` (which validates the bookshop fixture) and a script over the 6 examples against the tightened schemas. If anything breaks, fix it as part of this change rather than relaxing the schema.

**3. Add explicit rejection tests for each forbidden shape, not just a smoke test.**

Existing scenarios in `operational-event-model/spec.md` describe rejection but don't prove enforcement. Add Jest cases to `validator.test.ts` that build a doc with each forbidden shape (`signals[]` on layer, `outcomes[]` on layer, `equations[]` on layer, `initiates` on Operation, `condition` on Trigger, `emits` on Process, etc.) and assert the validator returns a non-empty `errors[]` whose entries include `additionalProperties`. This locks the contract.

**4. Don't touch Ajv `strict: false`.**

`strict: true` would error on schema constructs Ajv considers risky (e.g., unknown keywords, type unions). This change targets one specific gap — closed object schemas — without taking on whatever else `strict: true` would flag. A separate proposal can investigate.

## Risks / Trade-offs

- **[Risk]** A fixture or example carries an unknown field nobody noticed → **Mitigation:** run validation as part of the change; fix the field rather than relax the schema. Likely candidates are leftover legacy fields (e.g., `Operation.outcomes` references after the recent simplification, though those should already be migrated).
- **[Risk]** A future feature wants to add a new property and forgets to declare it on the schema first → **Mitigation:** this is the intended behavior. The validator now requires schema-first changes, which matches OpenSpec's discipline.
- **[Trade-off]** Closed schemas slightly increase friction for ad-hoc experimentation. Acceptable: the Operational vocabulary is small and well-known; experiments belong in a separate layer or a spike branch.
