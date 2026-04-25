## Why

Real organizations layer positions: `SeniorUnderwriter` works under `Underwriter`, `ChargeNurse` under `Nurse`. Today the Operational layer treats every Role as flat, so we can't express "this is a stricter version of that role" without copy-pasting attributes and actions across siblings. Lending and healthcare examples already feel the gap; the rest of the post-reorg roadmap (`Role.parent`) is the smallest shippable piece that closes it.

## What Changes

- `Role.parent` already exists in `packages/schemas/operational/role.json` and the validator already resolves it to a declared Role. The schema currently notes "Inheritance semantics deferred to v2." — **this change is v2.**
- Update the schema `description` on `parent` to document the inheritance + subset rules (no shape change).
- Validator (`packages/core/src/validator.ts`) gains two new checks for `Role.parent`:
  1. **No cycles**: `A.parent = B`, `B.parent = A` is rejected (and longer cycles)
  2. **Scope narrower-or-equal**: if a child declares its own `scope`, that scope must be a subset of the parent's resolved scope (after walking the chain). Single Group narrower-or-equal a parent Group; a Person scope is narrower than a Group scope only if the Person belongs to that Group via Membership; child scope set must be `⊆` parent scope set when both are arrays.
- **Scope inheritance**: a child Role with no `scope` inherits the parent's effective scope. The validator's existing scope-resolution and Membership rules then apply transparently.
- **Action inheritance**: explicitly **out of scope** — children declare their own `actions[]` (documented under non-goals)
- **Membership inheritance**: explicitly **out of scope** — Membership rows still reference a single Role by name (documented under non-goals)
- Lending example gains `SeniorUnderwriter.parent = Underwriter` to exercise the new field end-to-end
- Docs updated: `packages/core/docs/operational.md` (Role section), `ROADMAP.md` ("Role hierarchy" moves out of Future enhancements)

## Capabilities

### New Capabilities
- `role-hierarchy`: How Role-to-Role parentage is declared, validated, and resolved (scope inheritance, narrower-or-equal subset rule, cycle detection)

### Modified Capabilities
<!-- None — this is the first OpenSpec change in the repo, so there are no pre-existing specs to modify. -->

## Impact

- **Schema**: `@dna-codes/schemas/operational/role.json` (additive — no breaking change to existing `role.json` consumers)
- **Validator**: `@dna-codes/core/src/validator.ts` adds resolution + cycle + scope-subset checks; reuses existing `quoteList`/`availability` error helpers for consistency
- **Examples**: `examples/lending/operational.json`
- **Docs**: `packages/core/docs/operational.md`, `ROADMAP.md`
- **Adapters**: `output-markdown` and `output-html` Role rendering — surface the parent link if present (small section change, no API change)
- **Tests**: ~4 new validator cases; existing 309 tests must continue to pass
