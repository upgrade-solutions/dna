## Why

The Technical-layer `Script` primitive exists solely as "the concrete implementation of an Operational Equation" (per `packages/schemas/technical/script.json:5`). With Equation removed in the previous change, Script's reason to exist is gone — its required `equation` field references a primitive that no longer exists, and no example, fixture, or test uses Script. Leaving it leaves a self-contradictory schema in main.

## What Changes

- Delete `packages/schemas/technical/script.json`
- Remove the `scripts[]` collection (and its `$ref`) from `packages/schemas/technical/technical.json`
- Remove the `script: load('technical/script.json')` entry from `packages/core/src/index.ts`
- **BREAKING (schema)**: any Technical DNA document declaring `scripts[]` will fail validation. No published consumers depend on this.

## Capabilities

### New Capabilities
<!-- None — Script was never given a canonical OpenSpec spec. -->

### Modified Capabilities
- `operational-event-model`: extend the existing canonical spec (which already documents that Equation is absent) with one ADDED requirement: Technical layer no longer ships a Script primitive that depended on Equation

## Impact

- **Files**: 1 deletion + 2 small edits
- **Tests**: none — Script had no tests
- **Reversibility**: trivial — restore from git history if a real use case appears
