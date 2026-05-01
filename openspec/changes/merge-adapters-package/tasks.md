## 1. Scaffold the merged package

- [x] 1.1 Create `packages/adapters/` with `package.json` (name `@dna-codes/dna-adapters`, version `0.7.0` to match the post-`factor-jira-to-pure-io` version line, `repository`, `publishConfig.access: "public"`, `dna-core`/`dna-ingest`/`dna-schemas`/`@apidevtools/swagger-parser`/`js-yaml` deps, jest/ts devDeps)
- [x] 1.2 Create `packages/adapters/tsconfig.json` (rootDir=src, outDir=dist, examples/** excluded so per-adapter `examples/` scripts don't enter the build closure)
- [x] 1.3 Add `packages/adapters/src/{input,output,integration}/` (.gitkeep placeholders, removed as adapters land)
- [x] 1.4 Author the `exports` map starting empty (just `./package.json`); each subpath is added when its adapter folder lands so the exports-coverage test stays green throughout the migration. No `"."` entry.
- [x] 1.5 Add `packages/adapters` to root `package.json#workspaces`

## 2. Land the isolation contract before any adapter code

- [x] 2.1 Author `packages/adapters/src/package-isolation.test.ts` covering: library files reject sibling imports (relative + self-reference); CLI files in integrations may import via published subpath but not via relative paths; CLI files in input/output adapters may not use the carve-out; no top-level helper directories
- [x] 2.2 Author `packages/adapters/src/exports-coverage.test.ts` asserting bidirectional coverage between adapter folders and the `exports` map plus the absence of a `"."` root entry
- [x] 2.3 Both tests pass against the empty package skeleton

## 3. Move input adapters

- [x] 3.1 `git mv` input-json's `src/*` and `README.md` into `packages/adapters/src/input/json/`
- [x] 3.2 Repeat for `input-openapi`, `input-text` (preserving `layered/`, `tools/`, `prompt.ts`, `providers.ts`, and `examples/` subtree), and `input-example` (with `AGENTS.md` and `examples/`)
- [x] 3.3 Updated each adapter's `examples/run-*.ts` to import from `..` (the adapter's own index) instead of the old `../src` path; isolation test confirms no sibling-adapter imports
- [x] 3.4 Removed leftover `packages/input-{json,openapi,text,example}/` (git rm of package.json/tsconfig; emptied dist/ and removed empty dirs)
- [x] 3.5 Removed four `packages/input-*` entries from root `package.json#workspaces`
- [x] 3.6 Workspace symlinks refresh via the existing tree (no `npm install` needed since the merged package consumes already-installed deps); `npm run build -w @dna-codes/dna-adapters` clean; tests green (91 pass)

## 4. Move output adapters

- [x] 4.1 `git mv` output-markdown's `src/*` (including `sections/`) and README into `packages/adapters/src/output/markdown/`
- [x] 4.2 Same for `output-html`, `output-mermaid` (with `diagrams/`), `output-openapi` (with `__snapshots__/`), `output-text` (with `operation.ts`/`process.ts`/`resource.ts`/`util.ts`), `output-example` (with `sections/`, AGENTS.md)
- [x] 4.3 Isolation test green — no cross-adapter imports introduced
- [x] 4.4 Old `packages/output-*/` workspaces removed (configs git-rm'd; emptied dist/; empty dirs deleted); workspace entries dropped from root `package.json`
- [x] 4.5 Build + test of `@dna-codes/dna-adapters` clean (168 tests, 15 suites)

## 5. Move integration adapters and their CLI

- [x] 5.1 `git mv` integration-jira's `src/*` (adf, cli, client, types, index, tests) + README + AGENTS.md into `packages/adapters/src/integration/jira/`
- [x] 5.2 Moved `bin/integration-jira.js` to `packages/adapters/bin/`; updated its `require` to `../dist/integration/jira/cli`
- [x] 5.3 Added `"bin": { "dna-integration-jira": "./bin/integration-jira.js", "dna-integration-example": "./bin/integration-example.js" }` to `packages/adapters/package.json`; `bin` already in `files`
- [x] 5.4 No `"private": true` carried over — merged package is public (decision held since `factor-jira-to-pure-io` already dropped Jira's private flag)
- [x] 5.5 Moved integration-google-drive and integration-example similarly (preserving READMEs, AGENTS.md, integration-example's bin)
- [x] 5.6 Jira CLI's imports of `@dna-codes/dna-input-text` and `@dna-codes/dna-output-text` (the only adapter imports remaining post-`factor-jira-to-pure-io`) converted to `@dna-codes/dna-adapters/input/text` and `@dna-codes/dna-adapters/output/text` — the package's own published-subpath self-reference; aligned with Decision 3's CLI carve-out. tsconfig got minimal `paths` mappings so type-checking resolves these at compile time.
- [x] 5.7 Old `packages/integration-*/` removed; root `package.json#workspaces` now lists just `[schemas, core, ingest, adapters]`
- [x] 5.8 Full workspace build + test green; `node packages/adapters/bin/integration-jira.js --help` works; `node packages/adapters/bin/integration-example.js help` works

## 6. Update `dna-ingest`

- [x] 6.1 Updated `package-deps.test.ts` with three new assertions: no `@dna-codes/dna-output-*` runtime dep, no `@dna-codes/dna-integration-*` runtime dep (existing), no `@dna-codes/dna-adapters` runtime dep, plus the existing assertion that `dna-core` is the only `@dna-codes/*` runtime dep
- [x] 6.2 `packages/ingest/package.json#dependencies` = `{ @dna-codes/dna-core }`; verified
- [x] 6.3 Ingest tests green (40 tests)

## 7. Subpath import smoke test

- [x] 7.1 Added `packages/adapters/src/subpath-smoke.test.ts` covering all 13 documented subpaths against `dist/` artifacts with expected exports (parse / render / createClient / etc.)
- [x] 7.2 Smoke green — every subpath resolves and exports the expected symbol

## 8. Documentation sweep

- [x] 8.1 Pipeline diagram in root `README.md` updated to show `adapters/{input,output,integration}/<name>` as the import surface
- [x] 8.2 Install snippet replaced with `npm install @dna-codes/dna-adapters` + per-subpath import examples
- [x] 8.3 Collapsed all per-kind package tables into a single "Adapters (subpaths of `@dna-codes/dna-adapters`)" table covering inputs, outputs, integrations, and templates with status legend
- [x] 8.4 Root `AGENTS.md` rewritten to describe the four-package shape (schemas, core, ingest, adapters), the merged-adapters layout, the carve-out for integration CLIs, and the isolation rules
- [x] 8.5 `docs/frameworks/{bpmn,togaf,event-storming,c4}.md` updated: `output-mermaid`/`output-markdown` shorthand → `@dna-codes/dna-adapters/output/{mermaid,markdown}`, `@dna-codes/core` → `@dna-codes/dna-core`, `integration-* package` → `@dna-codes/dna-adapters/integration/<system>`, hypothetical `output-c4` adapter shorthand → `output/c4`
- [x] 8.6 `ROADMAP.md` had no per-adapter package references — no change needed

## 9. Extraction dry-run (forcing function for Decision 3)

- [x] 9.1 Scratch worktree at `$TMPDIR/dna-extract-dryrun/packages/output-example/` populated with the adapter source plus a fresh `package.json` and `tsconfig.json`
- [x] 9.2 `tsc` clean; `jest` clean — 8/8 tests passing in the extracted package; **zero source-file edits**
- [x] 9.3 Recipe captured at `openspec/changes/merge-adapters-package/extraction-dry-run.md`; worktree discarded
- [x] 9.4 No source edit was required — the strict isolation contract holds for `output/example`

## 10. Release readiness

- [x] 10.1 `packages/adapters/package.json#version` = `0.7.0` and matches `@dna-codes/dna-core` (and the rest of the post-`factor-jira-to-pure-io` version line)
- [x] 10.2 Full workspace build clean; full workspace test green — 527 tests passing across 4 packages
- [x] 10.3 Publish workflow iterates `root package.json#workspaces`, which is now `[schemas, core, ingest, adapters]`; the merged adapters package is not private so it publishes; dropped per-adapter workspaces are absent and ignored automatically
- [x] 10.4 Stopped before tagging — release goes through the user
