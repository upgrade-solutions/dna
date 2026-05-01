## Context

`@dna-codes/dna-integration-jira` shipped as a turnkey "Epic ⇄ DNA ⇄ Stories" tool. Convenient at the time; wrong factoring in retrospect. Concretely:

- `client.ts` imports `parse as parseText` from `dna-input-text` and `renderMany, Style` from `dna-output-text`. `pullDnaFromEpic()` runs the parse internally; `updateStoriesUnderEpic()` runs the render internally.
- `mapping.ts` imports `renderMany, Style` and uses them inside `dnaToStoryFields()`.
- `types.ts` re-exports `ParseResult` (input-text) and `Style` (output-text) as part of Jira's public type surface.
- The CLI consumes those Jira methods directly. Three commands — `pull`, `push`, `update`, `sync` — each invoke a baked pipeline.

Reader path on `Integration` is already clean: `fetch()` returns `{ contents, mimeType, source }` and the orchestrator (`dna-ingest`) does the parsing. Writer path is missing — there's no `write()`, so Jira's pipeline absorbed both write transport and DNA rendering.

`merge-adapters-package` is paused because Jira's current shape forces "integrations may import inputs/outputs," which is the wrong invariant. Fixing Jira fixes the merge.

## Goals / Non-Goals

**Goals:**
- Jira (and every future integration) is pure I/O: fetch external bytes, write external bytes. No format conversion in the runtime path.
- `Integration` port grows a symmetric `write(target, payload)` method, OPTIONAL on the interface so read-only integrations don't need to stub it.
- `ParseResult`, `Style`, `StyleMap`, `Unit`, `DEFAULT_STYLES` move to a shared home (`dna-core`) as canonical contracts. Existing adapters re-export to avoid churning unrelated callers.
- Jira CLI is rewritten as a composition example: `Epic fetch → input-text.parse → caller's DNA file` and `caller's DNA file → output-text.renderMany → Jira write`. The CLI is the only place all three packages meet.
- Existing CLI behavior (flag set, env vars, exit codes, dna-label matching for `update`) is preserved bit-for-bit. The factoring is internal to how the CLI is wired.

**Non-Goals:**
- Implementing `write()` for `dna-google-drive` or `integration-example`. The port grows the optional method; only Jira implements it in this change.
- Generalizing `update`/`upsert` semantics. Jira's `updateStoriesUnderEpic` has Jira-specific label-matching; that logic stays in Jira (just exposed via lower-level methods like `searchIssuesByDnaLabel`).
- Touching the merge proposal. This change unblocks it; landing the merge is separate.
- Rewriting input-text or output-text. Moving a few types out is the only edit those packages take.

## Decisions

### 1. `Integration.write()` shape

```ts
export interface WritePayload {
  contents: string | Buffer
  mimeType: string
}

export interface WriteResult {
  /** Identifier of the created/updated remote object (Jira issue key, file id, etc.). */
  target: string
  /** Free-form metadata the integration wants to surface (URL, version, etc.). */
  meta?: Record<string, unknown>
}

export interface Integration {
  fetch(uri: string): Promise<FetchResult>
  /**
   * Write `payload` to `target`. Optional — read-only integrations omit this.
   * `target` is integration-specific: a parent URI to create-under, or an
   * existing object URI to update. The integration decides which based on
   * the URI shape it accepts.
   */
  write?(target: string, payload: WritePayload): Promise<WriteResult>
}
```

**Rationale**: mirrors `fetch()` (single string identifier + bytes + MIME). Returns a `WriteResult` so callers can chain or log without requiring integration-specific return types. Marking `write?` optional keeps Drive (read-only stub today) and any future read-only integration free of dummy implementations.

**Alternative considered**: a separate `Writer` interface alongside `Integration`. Rejected — splits a single bidirectional concept across two types and forces callers to ask "is this object also a Writer?" The optional method keeps one type while documenting that not every integration writes.

### 2. Jira's public API after the change

```ts
export interface JiraClient {
  // Pure I/O — Integration impl
  fetch(uri: string): Promise<FetchResult>          // uri = jira://<EPIC-KEY>
  write(target: string, payload: WritePayload): Promise<WriteResult>
                                                     // target = jira://<EPIC-KEY> creates a child;
                                                     // target = jira://<STORY-KEY> updates that issue.

  // Jira-specific helpers (escape hatches; no DNA knowledge)
  getEpic(key: string): Promise<JiraIssue>
  searchIssues(jql: string, fields?: string[]): Promise<JiraSearchResponse>
  createIssue(fields: JiraIssueFields): Promise<CreateIssueResponse>
  updateIssue(key: string, fields: Partial<JiraIssueFields>): Promise<void>

  // ADF normalization — kept here because it's a Jira concern
  extractEpicText(epic: JiraIssue): string

  // dna-label index — used by the CLI to drive update flows
  searchChildrenByDnaLabel(epicKey: string): Promise<Map<string, string>>
}
```

Removed: `pullDnaFromEpic`, `pushStoriesToEpic`, `updateStoriesUnderEpic`, `dnaToStoryFields`. The CLI re-implements the equivalent flows by composing `input-text.parse`, `output-text.renderMany`, and the new pure-I/O methods.

The exported `Style` and `ParseResult` types are dropped from Jira's public surface (they were only there to flow through pipeline arguments that no longer exist).

`fetch(uri)` accepts `jira://<EPIC-KEY>` and returns `{ contents: extractEpicText(epic), mimeType: 'text/markdown', source: { uri, loadedAt } }`. This makes Jira a first-class `dna-ingest` integration alongside `fileIntegration()` for the read path.

`write(target, payload)`:
- `target = "jira://<EPIC-KEY>"` → POST a new child issue under that Epic. Returns `{ target: "jira://<NEW-KEY>", meta: { id, summary } }`.
- `target = "jira://<STORY-KEY>"` → PUT update on that issue. Returns `{ target, meta: { } }`.
- `target = "jira:label://<EPIC-KEY>?dna=<id>"` → look up child by `dna:<id>` label, PUT update. Returns the same shape; throws if no match. This URI form replaces the matching logic that lived in `updateStoriesUnderEpic`.

`payload.mimeType` is required to be `text/markdown` for now; Jira converts via existing `fromMarkdown(contents)` ADF helper. Other MIMEs throw.

**Rationale**: every Jira-specific concern (label matching, ADF, Story creation vs update) is exposed through the interface or via low-level helpers. The CLI uses these primitives — no special "DNA" methods on the client.

### 3. CLI as the canonical composition example

`bin/integration-jira.js` continues to launch `src/cli.ts`. Inside `cli.ts`:

```ts
import { parse as parseText } from '@dna-codes/dna-input-text'
import { renderMany, type Style } from '@dna-codes/dna-output-text'
import { createClient } from './client'
```

The CLI is the only file in the workspace where input-text and output-text appear. Each command becomes:

- `pull`: `client.fetch(jira://${epic})` → `parseText(result.contents, llmOpts)` → `writeFileSync(out, JSON.stringify(dna))`.
- `push`: `JSON.parse(readFileSync(in))` → `renderMany(dna, { styles: { capability: style } })` → for each doc: `client.write(jira://${epic}, { contents: doc.body, mimeType: 'text/markdown' })`.
- `update`: same render, then `client.write(jira:label://${epic}?dna=${doc.id}, { contents, mimeType })` per doc; skip on lookup miss with the existing reason text.
- `sync`: chained `pull` then `push` against the in-memory DNA, no temp file.

`pushStoriesToEpic`'s field-shape logic (issuetype/parent/customfield_10014, label rewriting) moves into the CLI alongside `client.createIssue`/`client.updateIssue` — but only the Jira-side bits. The DNA-side bits (style, doc.id → label) are CLI-local because they're only meaningful when DNA is in play.

**Alternative considered**: Keep the high-level methods on the client but move only the imports — i.e. inject `parseText` and `renderMany` into the client. Rejected — it preserves the architectural smell (client knows about DNA conversion) while just shuffling dependencies. The whole point is that the integration shouldn't know DNA exists.

### 4. Type relocations

Move from adapters to `dna-core` (and re-export from origin):

| Type | Current home | New canonical home | Rationale |
|---|---|---|---|
| `ParseResult` | `dna-input-text/src/types.ts` | `dna-core` | Any text-style parser returns `{ operational?, product?, technical?, missingLayers, raw }`. That contract belongs to the data model. |
| `Layer` (`'operational' \| 'product' \| 'technical'`) | `dna-input-text/src/types.ts` | `dna-core` | Identifies which DNA layer a primitive lives in — pure model concept. |
| `Style` (`'user-story' \| 'gherkin' \| 'product-dna'`) | `dna-output-text/src/types.ts` | `dna-core` | Vocabulary for "how to render a DNA unit as text" — model-adjacent, used by anyone composing text output (Jira, future Linear, future Notion). |
| `Unit` (`'operation' \| 'resource' \| 'process'`) | `dna-output-text/src/types.ts` | `dna-core` | Names DNA primitive kinds; canonical model term. |
| `StyleMap`, `DEFAULT_STYLES` | `dna-output-text/src/types.ts` | `dna-core` | Trail along with `Style`/`Unit`. |
| `Provider` (LLM provider enum) | `dna-input-text/src/types.ts` | **stays in `dna-input-text`** | Provider-specific concern; not part of the DNA model. |
| `ParseOptions` | `dna-input-text/src/types.ts` | **stays in `dna-input-text`** | Input-text-specific (LLM provider, instructions). |

Both `dna-input-text` and `dna-output-text` `export type *` re-export the moved types from `dna-core` so existing imports continue to compile. No deprecation; this is contract centralization, not API change.

**Rationale**: `merge-adapters-package` Decision 3 forbids cross-adapter imports. Today Jira imports `Style`/`ParseResult` because they're stranded in adapters — but they're contracts, not adapter internals. Moving them to `dna-core` lets Jira (and any other integration) name them without depending on a sibling adapter.

**Alternative considered**: leave types where they are; have Jira inline its own minimal versions. Rejected — forks the contract. If `Style` adds `'jobs-to-be-done'` next quarter, Jira's copy goes stale.

### 5. Single-version bump (0.7.0)

All five packages (`dna-core`, `dna-ingest`, `dna-input-text`, `dna-output-text`, `dna-integration-jira`) bump to `0.7.0` together. The contract surface moves; consumers pin against one number.

**Rationale**: pre-1.0 minor-bump-for-breaking rule, applied uniformly. Mismatched minors across these five would let callers pin combinations that don't compile (e.g. `dna-integration-jira@0.7.0` + `dna-output-text@0.6.0` — the `Style` re-export wouldn't exist on the older version). One bump avoids that.

### 6. Spec home for the new contract

A new capability `integration-port-contract` in `openspec/specs/integration-port-contract/spec.md` codifies the architectural rule: integrations are pure I/O; integration packages MUST NOT depend on input-/output-adapter packages. This is the rule that future PRs (and the merge-adapters-package isolation test) lean on.

The `dna-ingest` spec gets a delta covering the new optional `write()` method.

**Rationale**: the rule "integrations are pure I/O" is bigger than Jira and bigger than ingest — it's a property of the architecture. It deserves its own spec home so future integration adapters can be reviewed against it.

## Risks / Trade-offs

- **[Risk] CLI rewrite drops a subtle behavior of `updateStoriesUnderEpic`.** The current method handles legacy `dna:capability-…` ↔ `dna:…` label aliasing and rewrites labels to the canonical form on update. → Mitigation: `searchChildrenByDnaLabel(epicKey)` returns the same `Map` shape (canonical-id → issue-key) using the same alias rules; the CLI uses it identically. Existing `client.test.ts` cases for label aliasing migrate to test the new helper.
- **[Risk] Type re-exports break tooling that does `import type { ... } from 'package/src/types'`.** → Mitigation: only the public re-exports from each package's `index.ts` are guaranteed contracts. We confirm via grep that no internal cross-package code reaches into `*/src/types`. README and AGENTS.md continue to document only top-level imports.
- **[Risk] Adding `write?` to `Integration` makes existing integrations technically "incomplete."** → Mitigation: the `?` makes it optional. `dna-google-drive` and `integration-example` keep working without changes. Tests for the port assert only `fetch` exists; `write` is opted into.
- **[Risk] Rewriting the Jira CLI introduces a regression in shipped flags or env vars.** → Mitigation: snapshot test on `parseArgs` (already exists) plus an end-to-end CLI test that calls `runCli(['pull', '--epic', 'X', '--out', tmp])` with mocked `fetch` + mocked LLM and asserts the same output bytes as today.
- **[Trade-off] CLI now imports two adapters that the integration itself doesn't.** → Accepted; this is precisely the desired shape — the CLI is the composition example, and showing how to wire the pipeline is its purpose. The integration's `package.json` remains free of adapter deps.
- **[Trade-off] Five-package version bump to 0.7.0.** → Accepted (Decision 5). Worth one cross-cutting bump to keep contracts coherent.

## Migration Plan

1. Land contract moves first (low-risk, mechanical):
   - Add `ParseResult`, `Layer`, `Style`, `StyleMap`, `Unit`, `DEFAULT_STYLES` to `dna-core`.
   - In `dna-input-text` and `dna-output-text`, replace local definitions with re-exports from `dna-core`. Bump both to `0.7.0`.
2. Grow the port:
   - Add `WritePayload`, `WriteResult` and the optional `write?` method to `Integration` in `dna-ingest`. Re-export from `dna-ingest/src/index.ts`. Bump to `0.7.0`.
3. Rewrite Jira's runtime:
   - Implement `fetch()` and `write()` on the client.
   - Add `searchChildrenByDnaLabel(epicKey)` helper.
   - Delete `pullDnaFromEpic`, `pushStoriesToEpic`, `updateStoriesUnderEpic`, `dnaToStoryFields`. Drop `mapping.ts` (its remaining label-rewrite logic moves into the client or CLI as appropriate).
   - Remove `@dna-codes/dna-input-text` and `@dna-codes/dna-output-text` from `package.json#dependencies`.
4. Rewrite Jira's CLI:
   - `cli.ts` imports `parseText` and `renderMany` directly.
   - Each command composes the pipeline using the pure-I/O client.
   - Bump to `0.7.0`.
5. Bump `dna-core` to `0.7.0` (it's the contract change everything else lines up against).
6. Update READMEs and AGENTS.md.
7. Verify: full workspace build + test, `npx integration-jira pull` smoke against a fixture mock.

**Rollback**: revert the change commits. Old per-package contracts are restored. The deprecated 0.6.x line on npm is unaffected.

## Open Questions

- Should `Integration.fetch()`'s return type also pick up a `target` URI of its own (mirroring `WriteResult.target`) so `dna-ingest` can canonicalize how it talks about source identifiers? Out of scope here; `source.uri` already carries that information. Worth revisiting if a third integration shows similar friction.
- Do we want `Integration.delete?(target)` symmetry too? Not in this change; add it the first time a real consumer needs delete semantics.
- The `update` URI form `jira:label://<EPIC>?dna=<id>` is novel — should the CLI compose it, or should the client expose `writeByLabel(epicKey, label, payload)` directly? Default in this design: URI form. If it proves awkward in practice, the helper is a one-line addition.
