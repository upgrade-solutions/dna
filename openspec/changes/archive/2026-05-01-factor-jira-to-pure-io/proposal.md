## Why

Today `@dna-codes/dna-integration-jira` does three jobs: it talks to Jira's REST API, it parses Epic prose into DNA via `@dna-codes/dna-input-text`, and it renders DNA into Story prose via `@dna-codes/dna-output-text`. The two adapter dependencies are baked into Jira's runtime — `client.ts` calls `parseText()` directly, `mapping.ts` and `client.ts` call `renderMany()` directly. This is a category error: integrations should talk to third parties and report back, not embed format-conversion pipelines.

The smell shows up immediately when you try to merge adapters into a single package (paused change `merge-adapters-package`): the isolation contract — "no adapter imports another adapter" — falls apart for Jira because its current shape requires it. The reader path already proves the right factoring works: `Integration.fetch()` returns raw `{ contents, mimeType, source }` and the orchestrator dispatches to the matching input adapter by MIME. The writer path needs the same separation.

Fixing this is the prerequisite that lets the merge proceed without compromising Decision 3.

## What Changes

- **BREAKING** Add `Integration.write(target, payload)` to `@dna-codes/dna-ingest`'s `Integration` port as the dual of `fetch()`. Payload is `{ contents: string | Buffer; mimeType: string }` plus a `target` URI/identifier. `write` is OPTIONAL on the interface — read-only integrations leave it undefined.
- **BREAKING** Strip parse/render from `@dna-codes/dna-integration-jira`. Public surface becomes pure I/O: `fetchEpic(key) → FetchResult`, `extractEpicText(epic)` (kept — it's ADF→text, a Jira concern), `writeStory({ contents, mimeType }) → CreateIssueResponse`, `updateStory(key, { contents, mimeType }) → void`, plus the existing low-level `getEpic`, `searchIssues`, `createIssue`, `updateIssue`. Remove `pullDnaFromEpic`, `pushStoriesToEpic`, `updateStoriesUnderEpic`, and the `dnaToStoryFields` helper — they're pipelines, not transport.
- **BREAKING** Drop `@dna-codes/dna-input-text` and `@dna-codes/dna-output-text` from `packages/integration-jira/package.json#dependencies`. After this change, the package depends only on `@dna-codes/dna-ingest` (for the `Integration` and `FetchResult` types) and `@dna-codes/dna-core` (for DNA types).
- Move the `ParseResult` shape from `@dna-codes/dna-input-text` to `@dna-codes/dna-core` as the canonical "parsed DNA + parse-time metadata" type any text-style input adapter returns. `dna-input-text` re-exports it for back-compat. Other input adapters that produce partial DNA SHOULD adopt this type going forward.
- Move `Style`, `StyleMap`, `Unit`, and `DEFAULT_STYLES` from `@dna-codes/dna-output-text` to `@dna-codes/dna-core` as the canonical text-rendering style vocabulary. `dna-output-text` re-exports them.
- Convert the Jira CLI (`bin/integration-jira.js` → `src/cli.ts`) into a composition example: it imports `@dna-codes/dna-input-text`, `@dna-codes/dna-output-text`, AND `@dna-codes/dna-integration-jira` and explicitly wires the pipeline (Epic fetch → input-text.parse → write OR DNA → output-text.renderMany → write). The CLI is the only place these three packages co-exist; the integration itself imports zero adapters.
- Update `packages/integration-jira/AGENTS.md` and `README.md` to document the pure-I/O contract and show the CLI as the canonical composition pattern.
- Update `dna-ingest`'s spec to cover the new `write()` contract.
- Bump `@dna-codes/dna-integration-jira`, `@dna-codes/dna-ingest`, `@dna-codes/dna-input-text`, `@dna-codes/dna-output-text`, and `@dna-codes/dna-core` to `0.7.0` to signal the contract changes (per pre-1.0 minor-bump-for-breaking rule).

## Capabilities

### New Capabilities
- `integration-port-contract`: defines the integration ↔ adapter boundary — integrations are pure I/O; parsing/rendering is composed externally — and codifies the `write()` dual of `fetch()` plus the rule that integration packages declare no input-/output-adapter dependencies.

### Modified Capabilities
- `dna-ingest`: the `Integration` port grows an optional `write(target, payload)` method; the spec text and scenarios add the writer path.

## Impact

- **Affected paths**: `packages/integration-jira/src/{client,mapping,types,cli}.ts` (significant rewrite), `packages/integration-jira/package.json` (deps removed), `packages/ingest/src/types.ts` (Integration interface grows `write?`), `packages/ingest/src/index.ts` (re-export), `packages/core/src/**` (new exports for `ParseResult`, `Style`, etc.), `packages/input-text/src/types.ts` + `index.ts` (re-export from core), `packages/output-text/src/types.ts` + `index.ts` (re-export from core), `packages/integration-jira/{README,AGENTS}.md`, root `README.md` (pipeline diagram now shows integration as pure I/O).
- **Backwards compatibility**: hard break for any direct caller of `pullDnaFromEpic` / `pushStoriesToEpic` / `updateStoriesUnderEpic`. The CLI commands (`pull`, `push`, `update`, `sync`) keep their flags and behavior — they call the new pure-I/O surface internally. Library consumers (rare; Jira is private/`"private": true`) move to composing input-text + Jira themselves; the CLI is the worked example.
- **Risk profile**: medium. The Jira rewrite is non-trivial — `updateStoriesUnderEpic` has subtle dna-label matching logic that must survive the move into a CLI orchestrator. The mitigation is the existing test suite plus a new test that exercises the CLI's composition end-to-end with mocked adapters.
- **Unblocks**: `merge-adapters-package`. Once Jira is pure I/O, no integration imports a sibling adapter, and Decision 3 in that change's design (strict no-cross-adapter-imports) becomes the correct, enforceable invariant.
