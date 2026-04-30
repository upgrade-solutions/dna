## 1. Pre-implementation (open questions resolved in design.md)

Q1–Q4 are resolved (see design.md "Resolved Questions"). Q5 (layered constructor surfacing conflicts) and Q6 (validation cost on merge() emit loop) remain — to be answered during implementation.

- [ ] 1.1 Confirm Q5 by surveying existing layered-constructor consumers — does any existing caller rely on `result()` having no `conflicts` field? If yes, gate the new field behind an option; if no, add it directly.
- [ ] 1.2 Resolve Q6 during merge() retrofit (§5): measure validation cost on the canonical fixtures with default-on validation; if negligible, leave merge() validating; if material, opt out via `{ validate: false }` and document why.

## 2. TypeScript types for Operational primitives

- [ ] 2.1 Hand-write TS types for each Operational primitive in `packages/core/src/types/operational.ts` (Resource, Person, Role, Group, Membership, Operation, Trigger, Rule, Task, Process), kept in sync with `@dna-codes/dna-schemas`
- [ ] 2.2 Add a contract test that loads each schema's `examples[]` from the JSON file and asserts each example type-checks against the corresponding TS type — fails the build if the schema gains a field the type doesn't know about
- [ ] 2.3 Re-export the new types from `@dna-codes/dna-core`'s entry point alongside `OperationalDNA`

## 3. Builder module

- [ ] 3.1 Create `packages/core/src/builders/` with `index.ts`, per-primitive files, and `shared.ts`
- [ ] 3.2 Implement `createOperationalDna(opts)` in `create.ts` returning an empty-but-valid Operational DNA shell
- [ ] 3.3 Implement the merge-on-add helper in `shared.ts` — internally delegates to `merge([dna, dnaWithJustThatPrimitive])` and unwraps the result into `{ dna, conflicts }`
- [ ] 3.4 Implement `addResource`, `addPerson`, `addRole`, `addGroup` (noun primitives) in their respective files; each returns `{ dna, conflicts }`
- [ ] 3.5 Implement `addMembership`, `addOperation`, `addTrigger`, `addRule`, `addTask`, `addProcess` (activity primitives) in their respective files; each returns `{ dna, conflicts }`
- [ ] 3.6 Wire default-on runtime validation (`{ validate: true }`) through every builder — validates the primitive input against `@dna-codes/dna-schemas` before composing; throws with a clear message on schema violation
- [ ] 3.7 Wire the `{ validate: false }` opt-out through every builder for hot-path callers (used by merge() emit loop)
- [ ] 3.8 Re-export every builder from `@dna-codes/dna-core`'s public entry point

## 4. Builder tests

- [ ] 4.1 Unit tests for `createOperationalDna` (empty case, with name, with full domain payload)
- [ ] 4.2 Unit tests for each noun builder covering: empty-DNA add, add-then-add-different (union), add-same-name (compose-on-add returns empty conflicts when child lists union cleanly), add-same-name-with-scalar-disagreement (returns scalar conflict + writes recommendation), input immutability, same-input-same-output
- [ ] 4.3 Unit tests for each activity builder covering the same matrix
- [ ] 4.4 TS-level "negative" tests via `@ts-expect-error` proving wrong-type / missing-required-field calls fail at compile time
- [ ] 4.5 Runtime-validation tests: invalid input throws by default; same input passes silently when `validate: false`; thrown error message names the offending field
- [ ] 4.6 End-to-end test: compose a non-trivial DNA via builders, then `DnaValidator.validate(result, 'operational')` returns `valid: true`
- [ ] 4.7 Regression test: produced DNA contains no inline `_provenance` / `_source` fields
- [ ] 4.8 Never-throws-on-duplicate-name test: adding a same-named primitive twice never throws regardless of whether the inputs agree on scalars; conflicts are returned as data

## 5. Refactor `merge()` to use builders

The end-state of merge() is a thin orchestrator: collect primitives across chunks, feed each to the matching `add*` (with `{ validate: false }` since chunks pre-validated), accumulate conflicts and provenance.

- [ ] 5.1 Read every existing `merge()` test in `packages/core/src/merge/merge.test.ts` and confirm the spec contract surface
- [ ] 5.2 Replace `merge()`'s bespoke per-primitive merge logic with a loop over chunk primitives that calls the matching `add*` builder for each one, accumulating returned `conflicts` into the merge result
- [ ] 5.3 Provenance map construction stays inside merge() (builders don't know about provenance — they take/return a single DNA, no source metadata)
- [ ] 5.4 Cross-reference resolution stays inside merge() (it operates on the final composed DNA, not per-primitive)
- [ ] 5.5 Verify all 18 existing merge tests still pass without modification
- [ ] 5.6 Round-trip a representative chunk corpus through pre- and post-refactor; assert deep equality of `{ dna, conflicts, provenance }`
- [ ] 5.7 Resolve Q6: time the new merge() emit loop with `{ validate: false }` vs default; pick the cheaper path that keeps merge() tests passing in under 1s on the canonical fixtures

## 6. Refactor `input-json` to use builders

The walker today maintains `Map<name, ParsedResource>` plus a per-attribute `seen` set; both go away. Walker becomes: emit each scalar key as a single-attribute Resource via `addResource(dna, { name, attributes: [oneAttr] })`. Same-named children compose, attribute-level dedup happens in the builder.

- [ ] 6.1 Read existing `input-json` tests; confirm the contract surface (especially the relationship-emission and array-of-scalars-dropped behavior)
- [ ] 6.2 Replace the walker's `Map`/`seen` bookkeeping with repeated `addResource` calls on a builder-managed DNA
- [ ] 6.3 Decide where relationships get emitted — builder pattern is `addRelationship(dna, r)`; walker accumulates and emits them the same way
- [ ] 6.4 Verify every existing input-json test passes without modification

## 7. Refactor `input-text/layered/constructor` to use builders

The intentional behavior change: `duplicate_name` as a tool-call error code goes away. An LLM re-emitting a Resource with new attributes silently composes; an LLM re-emitting with conflicting scalars surfaces the conflict in `result()`. Iteration cap (`maxToolCalls`) backstops infinite loops.

- [ ] 7.1 Read existing layered-constructor tests; confirm the contract surface (especially the LLM tool-call lifecycle, finalize-retry, transcript bookkeeping)
- [ ] 7.2 Replace the `DraftDocument` mutable arrays with builder-produced state (`draft = addResource(draft, ...).dna` per tool call result)
- [ ] 7.3 Remove the `duplicate_name` error code and its pre-check; same-named tool calls now compose via the builder
- [ ] 7.4 Resolve Q5: surface composed-on-add conflicts via `result()` (returns `{ document, conflicts }` instead of just `document`); audit existing callers and update if needed
- [ ] 7.5 Preserve every other guard rail (duplicate-call detection by signature, unknown-target detection, finalize-retry behavior, iteration cap)
- [ ] 7.6 Update or remove the specific tests that asserted the old `duplicate_name` behavior — every other test passes without modification

## 8. Documentation

- [ ] 8.1 Write `packages/core/docs/builders.md` covering: the API surface, the immutable / merge-on-add semantics, the runtime-validation opt-in, the v1 simplifications (flatten sub-domains; pure functions; no fluent API yet)
- [ ] 8.2 Add a builders usage section to `packages/core/README.md` linking out to `docs/builders.md`
- [ ] 8.3 Update `packages/ingest/AGENTS.md` to recommend using the builders for any future input-* package being forked
- [ ] 8.4 Update `packages/input-example/AGENTS.md` (if it exists) with the same recommendation

## 9. Release

- [ ] 9.1 Bump `@dna-codes/dna-core` to `0.6.0`; update the dna-core dep range in every sibling that depends on it from `^0.5.0` to `^0.6.0`; bump those siblings by one patch (release-cascade pattern `add-dna-ingest` established in commit a9a816a)
- [ ] 9.2 Bump `@dna-codes/dna-input-json` to `0.4.2` (pure refactor patch)
- [ ] 9.3 Bump `@dna-codes/dna-input-text` to `0.5.0` (minor — drops `duplicate_name`, adds `conflicts` to `result()`); audit `@dna-codes/dna-integration-jira`'s call sites to determine whether its `^0.4.0` dep range needs widening to `^0.5.0` (and a patch bump if so)
- [ ] 9.4 Tag `v0.6.0` and push the tag; publish workflow handles the cascade automatically (skip-on-409 already in place)
- [ ] 9.5 Smoke-test from a fresh consumer project: install `@dna-codes/dna-core@0.6.0` and run a tiny script that composes a DNA via the builders end-to-end and validates it
