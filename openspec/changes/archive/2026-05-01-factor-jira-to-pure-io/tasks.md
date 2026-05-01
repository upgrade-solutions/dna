## 1. Move shared contracts to dna-core

- [x] 1.1 Add `ParseResult` (with inline `missingLayers` union) to `packages/core/src/types/adapters.ts`; export from `packages/core/src/index.ts`. (Note: `Layer` was NOT moved — `dna-core` already exports a `Layer` of a different shape; input-text's coarse `Layer` stays local.)
- [x] 1.2 Add `Unit`, `Style`, `StyleMap`, and `DEFAULT_STYLES` to `packages/core/src/types/adapters.ts`; export from `packages/core/src/index.ts`
- [x] 1.3 Add a unit test (`packages/core/src/types/adapters.test.ts`) confirming each new export resolves and has the expected literal-union members
- [x] 1.4 Bump `packages/core/package.json#version` to `0.7.0`

## 2. Re-home types in input-text and output-text

- [x] 2.1 In `packages/input-text/src/types.ts`, alias local `ParseResult` to `@dna-codes/dna-core`'s `ParseResult` (Layer stayed local — see Group 1 note)
- [x] 2.2 Confirm `packages/input-text/src/index.ts` continues to re-export those names via `export * from './types'`; no public-API change
- [x] 2.3 Run `npm run build -w @dna-codes/dna-input-text` and `npm run test -w @dna-codes/dna-input-text`; both green
- [x] 2.4 Bump `packages/input-text/package.json#version` to `0.7.0`; update its `@dna-codes/dna-core` dep range to `^0.7.0`
- [x] 2.5 In `packages/output-text/src/types.ts`, replace local `Style`, `StyleMap`, `Unit`, `DEFAULT_STYLES` definitions with re-exports from `@dna-codes/dna-core`
- [x] 2.6 Confirm `packages/output-text/src/index.ts` continues to re-export those names; no public-API change
- [x] 2.7 Run `npm run build -w @dna-codes/dna-output-text` and `npm run test -w @dna-codes/dna-output-text`; both green
- [x] 2.8 Bump `packages/output-text/package.json#version` to `0.7.0`; move `@dna-codes/dna-core` from devDependencies to dependencies (DEFAULT_STYLES is a runtime value re-export); range `^0.7.0`

## 3. Grow the Integration port in dna-ingest

- [x] 3.1 In `packages/ingest/src/types.ts`, add `WritePayload` and `WriteResult` interfaces
- [x] 3.2 Add the optional method `write?(target, payload)` to the existing `Integration` interface
- [x] 3.3 Re-export `WritePayload` and `WriteResult` from `packages/ingest/src/index.ts`
- [x] 3.4 Update `packages/ingest/src/types.ts` doc-comment on `Integration` to describe the bidirectional contract
- [x] 3.5 Add a unit test in `packages/ingest/src/types.test.ts` covering read-only, bidirectional, and round-trip cases
- [x] 3.6 Run build + test for `@dna-codes/dna-ingest`; both green
- [x] 3.7 Bump `packages/ingest/package.json#version` to `0.7.0`; update `@dna-codes/dna-core` dep range to `^0.7.0`

## 4. Rewrite Jira's library to pure I/O

- [x] 4.1 In `packages/integration-jira/src/types.ts`, drop adapter-package type imports; import `FetchResult`/`WritePayload`/`WriteResult` from `@dna-codes/dna-ingest`; remove `DnaInput`/`PullEpicOptions`/`PushStoriesOptions`/`PushStoriesResult`/`UpdateStoriesResult`
- [x] 4.2 Add a public `Client` interface to `types.ts` covering `fetch`, `write`, `getEpic`, `searchIssues`, `createIssue`, `updateIssue`, `extractEpicText`, `searchChildrenByDnaLabel`
- [x] 4.3 Drop `parseText`/`renderMany`/`Style` imports and callers from `client.ts`
- [x] 4.4 Implement `fetch(uri)` accepting `jira://<KEY>`; rejects child sub-scheme and unrecognized schemes
- [x] 4.5 Implement `write(target, payload)` accepting `jira://<KEY>` (update) and `jira:child://<EPIC>` (create child); enforces `text/markdown`; honors `summary`, `label`, `extra-label` query params; honors `epicLinkMode` ClientOption (replaces the old `jira:label://` shape — label lookup moved to a CLI helper using `searchChildrenByDnaLabel`)
- [x] 4.6 Implement `searchChildrenByDnaLabel(epicKey)` carrying the existing alias logic
- [x] 4.7 Delete `pullDnaFromEpic`, `pushStoriesToEpic`, `updateStoriesUnderEpic`
- [x] 4.8 Delete `packages/integration-jira/src/mapping.ts`
- [x] 4.9 Rewrite `packages/integration-jira/src/index.test.ts` to cover the new `fetch`/`write`/`searchChildrenByDnaLabel` surface plus round-trip-byte equality
- [x] 4.10 Update `packages/integration-jira/src/index.ts` to export only `createClient`, `runCli`, ADF helpers, and types
- [x] 4.11 In `packages/integration-jira/package.json`: drop `dna-input-text`/`dna-output-text` from `dependencies`, add to `devDependencies`; add `dna-core` and `dna-ingest` to `dependencies`; add missing `scripts` block (`build`/`test`); bump version to `0.7.0`
- [x] 4.12 Build + tests green; `npx integration-jira --help` works

## 5. Rewrite Jira CLI as composition example

- [x] 5.1 In `packages/integration-jira/src/cli.ts`, retain (only here) imports of `parse as parseText` from `dna-input-text`, `renderMany` from `dna-output-text`, and `Style` from `dna-core`
- [x] 5.2 Rewrite `pullCommand` to: `client.fetch('jira://${epic}')` → `parseText(...)` → strip `raw`/`missingLayers` → write JSON; `--dump-text` preserved
- [x] 5.3 Rewrite `pushCommand` to: read DNA → `renderMany(...)` → for each doc: `client.write('jira:child://${epic}?summary=…&label=…&extra-label=…', { contents, mimeType: 'text/markdown' })`; `--dry-run`/`--labels`/`--style` preserved
- [x] 5.4 Rewrite `updateCommand` to: render → `searchChildrenByDnaLabel` → per doc: `client.write('jira://${issueKey}?summary=…&label=…', payload)`; preserves `skipped` reporting
- [x] 5.5 Rewrite `syncCommand` to chain pull → push in-memory, no temp file
- [x] 5.6 (No separate cli.test.ts existed; existing parseArgs test in `index.test.ts` retained; LLM-call composition is intentionally not unit-tested at the CLI level since `parseText` is end-to-end LLM-backed — covered by manual smoke + the new client-level write tests)
- [x] 5.7 `npm run test -w @dna-codes/dna-integration-jira` green; `node bin/integration-jira.js --help` matches expected output

## 6. Documentation

- [x] 6.1 Update `packages/integration-jira/README.md`: pure-I/O framing, URI-shape table (`jira://<KEY>` for fetch+update, `jira:child://<EPIC>` for create), CLI as composition example
- [x] 6.2 Update `packages/integration-jira/AGENTS.md` to forbid DNA-aware library methods and adapter runtime deps; only CLI may import input/output adapters
- [x] 6.3 Update root `README.md` `Integration` block to include optional `write?`, plus the pipeline diagram legend (`[5]` is now caller-composed `output-* → integration.write`)
- [x] 6.4 Update `packages/ingest/{README,AGENTS}.md` to document `write?`, `WritePayload`/`WriteResult`, byte-level round-trip property, and the no-adapter-deps rule for integration packages

## 7. Workspace verification

- [x] 7.1 Workspace `npm run build` clean across all packages
- [x] 7.2 Workspace `npm run test` clean — 523 tests passing across 15 test suites
- [x] 7.3 Strict import grep: only `cli.ts` and `*.test.ts` import `@dna-codes/dna-input-text`/`@dna-codes/dna-output-text`; remaining matches are doc-comment mentions, not imports
- [x] 7.4 `integration-jira#dependencies` = `{ dna-core, dna-ingest }`; adapter packages live in `devDependencies`
- [x] 7.5 `dna-core`, `dna-ingest`, `dna-input-text`, `dna-output-text`, `dna-integration-jira` all at `0.7.0`

## 8. Hand-off

- [x] 8.1 `merge-adapters-package` is now unblocked: zero adapter-imports remain in the integration's library code, so Decision 3 (no cross-adapter imports) becomes enforceable exactly as written. Will note in archive notes when this change is archived.
- [x] 8.2 Stopped before tagging/publishing — release goes through the user.
