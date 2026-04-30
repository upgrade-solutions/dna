## Context

DNA today is one document → one adapter → one DNA. That works for `examples/lending` and similar single-source scenarios, but it does not match how real organizations describe themselves: SOPs in Drive, meeting notes in Notion, policy PDFs on a shared filesystem, transcripts from interview recordings. We need a way to fan many sources into one canonical DNA without losing per-primitive provenance.

Two architectural questions drove the decisions below:

1. **Retrieval vs. traversal.** RAG/vector approaches were considered. They were rejected because DNA extraction must surface *every* Role, Resource, Operation, Rule, etc. — semantic retrieval is built for "find the relevant chunk" and would systematically drop rarely-mentioned primitives. The right shape is exhaustive per-document extraction followed by typed merge.
2. **Fat hub vs. thin orchestrator.** A monolithic `input-*` package that knows about every source and every format would be a bottleneck and a dependency hairball. The orchestrator is kept thin: it imports zero `integration-*` or `input-*` packages and instead receives them via dependency injection from the caller.

Existing pipeline (`integration → input-* → DNA → output-* → integration`) stays valid. `dna-ingest` is a container around the left half of that pipeline, repeated per source, with `dna-core.merge()` as the fan-in.

## Goals / Non-Goals

**Goals:**
- Multi-source ingestion with a single function call: `ingest({ sources, integrations, inputs, llm })`.
- Zero direct dependencies from `dna-ingest` to any specific `integration-*` or `input-*` package.
- A typed `Integration` contract that future reader packages implement to participate.
- A pure, deterministic `merge()` in `dna-core` that produces explicit `conflicts[]` (each with a `recommendation`) — never silent last-writer-wins.
- Provenance on every primitive: which doc(s) contributed to each Resource/Role/Operation/etc.
- Non-fatal error handling: a failed fetch on one source doesn't abort the whole run.
- Operational layer fully covered for v1.

**Non-Goals:**
- Real Google Drive API integration (auth, OAuth, actual file fetching). Stub only.
- Product or Technical layer extraction. Operational only for v1.
- Vector/RAG-based retrieval. Wrong tool for this task; not deferred — explicitly out.
- A `dna-cli ingest` command. Library-first; CLI lands later once the shape stabilizes.
- Caching of fetched contents or extracted DNA chunks.
- Concurrency tuning beyond a sensible default (e.g., advanced rate limiting, backpressure). Reasonable bounded parallelism is in; sophisticated control is not.

## Decisions

### D1: Dependency injection over auto-discovery

`dna-ingest` accepts `integrations: Record<string, Integration>` and `inputs: Record<string, InputAdapter>` from the caller. It does not import or require any specific implementation.

```ts
ingest({
  sources: ['gdrive://abc', 'file:///etc/sop.md', 'notion://page-id'],
  integrations: { gdrive: driveClient, notion: notionClient },
  inputs: { 'text/*': inputText, 'audio/*': inputTranscript, 'image/*': inputImage },
  llm: { model, temperature, seed }
})
```

**Why:** Auto-discovery (e.g., `import('integration-google-drive')` based on URI scheme) creates implicit dependencies, breaks tree-shaking, and forces tests/CI to install the universe. DI keeps the orchestrator a thin coordinator with zero workspace-internal dependencies beyond `dna-core`.

**Alternative considered:** A plugin registry (`registerIntegration(scheme, client)` module-level state). Rejected — module-level state breaks parallel test runs and creates ordering bugs.

**Trade-off:** Slightly more verbose call sites. Acceptable; consumers will typically wrap `ingest()` in their own thin app-level helper that pre-bundles their integration set.

### D2: Two-stage dispatch (URI scheme → integration, MIME → input)

Stage 1 (fetch): orchestrator parses each source's URI scheme. `file://` and bare paths use a built-in fs reader; everything else is dispatched to `integrations[scheme]`. Unknown schemes produce a non-fatal entry in `errors[]`.

Stage 2 (extract): integration returns `{ contents, mimeType, source }`. Orchestrator finds the first matching adapter in `inputs` (glob match: `text/*` matches `text/plain`, `text/markdown`). Unmatched MIME types produce a non-fatal entry in `errors[]`.

**Why:** Keeps fetch concerns (auth, rate limits, format normalization) inside integrations and keeps extraction concerns (LLM prompting, schema mapping) inside inputs. Neither stage knows about the other beyond the `{ contents, mimeType, source }` boundary.

**Alternative considered:** Have integrations return DNA directly (skip the input-* dispatch). Rejected — it would force every integration to embed an LLM, duplicating logic that already lives in `input-text`/`input-transcript`/`input-image`.

### D3: `Integration` contract is a typed interface, not a base class

```ts
interface Integration {
  fetch(uri: string): Promise<{
    contents: string | Buffer
    mimeType: string
    source: { uri: string; loadedAt: string /* ISO 8601 */ }
  }>
}
```

Lives in `@dna-codes/dna-ingest` types and is re-exported. PDF/Office text extraction is the integration's responsibility — integrations return *already-normalized* text, audio, or image bytes. Orchestrator does not parse PDFs.

**Why:** Interface (vs. abstract class) keeps integrations zero-dep. Putting extraction inside integrations means PDF-specific logic doesn't leak into every adapter or the orchestrator.

**Trade-off:** Each integration that supports PDFs ends up with a PDF parser dependency. This is correct: it scopes that dep to the integrations that actually need it.

### D4: Merge lives in `dna-core`, not a new `dna-merge` package

`merge(dnas: OperationalDNA[]): { dna: OperationalDNA, conflicts: Conflict[] }` is exported from `@dna-codes/dna-core`. Pure function, no I/O, no LLM. Deterministic given input ordering.

**Why:** Merge is plain object composition + cross-reference resolution. It's the kind of utility `dna-core` already implements (validation, normalization), and consumers who want merge will already have `dna-core` installed. A separate `dna-merge` package would be one more workspace to maintain for ~300 lines of code.

**Alternative considered:** New `@dna-codes/dna-merge` package. Rejected for reasons above.

### D5: Identity-by-name within type; union-by-name for collections

Two chunks both naming `Loan` (Resource) refer to the same Resource. Merge unions `attributes[]` and `actions[]` by `name`. Scalar fields (`parent`, `description`, etc.) use a tiered policy:

- **Set in only one chunk:** that value wins, no conflict.
- **Set in multiple chunks with the same value:** that value wins, no conflict.
- **Set in multiple chunks with different values:** all values recorded in `conflicts[]`; merger picks one and includes it as `recommendation`. The picked value is also written into the merged DNA so the result is always valid against the schema.

**Recommendation policy (initial):**
1. Prefer the value with the most explicit support across sources (count of distinct sources backing it).
2. Tie-break by the value from the most recent `loadedAt`.
3. Tie-break further by the value with the longest non-empty string representation (proxy for "more specific" — e.g., a description with more detail).
4. Final tie-break: arbitrary stable ordering.

The reason for the pick is included in `Conflict.recommendation.reason` so a reviewer can audit. The recommendation policy is documented as v1 — future changes may introduce LLM-assisted recommendations.

**Why this policy:** It is deterministic, schema-pure (always produces valid DNA), and explicit (every conflict is visible). Last-writer-wins without conflict reporting was rejected as dangerously silent.

### D6: Cross-reference resolution after merge, with warnings not drops

After noun primitives are merged, the merger walks Operations, Memberships, Triggers, Tasks, Steps, and Rules and verifies that every named reference (`target`, `actor`, `person`, `role`, `group`, `operation`, `task`) resolves against the merged noun set. Unresolved references are added to `conflicts[]` as warnings — the referencing primitive is still emitted (so partial DNA stays usable for review) and validation against `dna-core` schemas is run separately. The caller sees both the conflict warning and the validation result.

**Why:** Silent drops during merge would erase information a human reviewer needs to fix the source documents. Better to emit-and-warn than to delete-and-hide.

### D7: Provenance is a separate map, not embedded in DNA

The merged DNA matches the existing Operational schema exactly — no extra `_provenance` fields. Provenance is returned as a separate map keyed by primitive path:

```ts
provenance: {
  'resources.Loan': [{ uri: 'gdrive://abc', loadedAt: '...' }, { uri: 'file:///sop.md', loadedAt: '...' }],
  'resources.Loan.attributes.amount': [{ uri: 'gdrive://abc', loadedAt: '...' }],
  'roles.Underwriter': [{ uri: 'file:///sop.md', loadedAt: '...' }]
}
```

**Why:** Keeps the DNA result schema-clean and downstream-compatible (any existing `output-*` adapter consumes the merged DNA without changes). Provenance is opt-in — callers who don't care just ignore the field.

**Alternative considered:** Embedding `_source` on every primitive. Rejected — pollutes the schema and forces every output adapter to handle/strip the field.

### D8: Non-fatal errors

Fetch failures (404, auth expired, network error) and extraction failures (input adapter throws) are caught and recorded in `errors[]`. The orchestrator continues with remaining sources. The result includes whatever DNA was successfully assembled from the surviving sources.

```ts
errors: [
  { source: 'gdrive://abc', stage: 'fetch', error: 'GoogleDriveAuth: token expired' },
  { source: 'file:///broken.pdf', stage: 'extract', error: 'input-text: LLM returned malformed JSON' }
]
```

**Why:** A 10-document corpus where one doc 404s should still produce useful DNA from the other nine. Caller decides whether the partial result is acceptable.

**Trade-off:** Callers who want "all-or-nothing" semantics must check `errors.length === 0` before using `dna`. That's a small, explicit ask.

### D9: Determinism contract

`ingest()` accepts explicit `model`, `temperature`, `seed` in `llm` options. `dna-ingest` passes these through to every input adapter. The merge step is deterministic given input ordering. The README's existing probabilistic-package convention is followed: `dna-ingest`'s package README documents that even with `temperature: 0` and a fixed `seed`, model-provider-side changes can introduce drift.

**Why:** Honest determinism story is required by the existing probabilistic-package convention; pretending merge fixes non-determinism would be misleading.

### D10: Bounded parallelism

Sources are fetched and extracted with bounded concurrency (default: 4 in flight). Configurable via `ingest({ concurrency: N })`. No advanced rate-limiting — that's an integration concern.

**Why:** Reasonable default, fits the v1 scope. Sophisticated rate-limiting belongs in individual `integration-*` packages.

### D11: Stub `integration-google-drive` validates the contract

The stub package implements `Integration` and ships:
- A constructor that accepts `{ mock?: Record<uri, { contents, mimeType }> }`.
- A `fetch()` that, if `mock` contains the URI, returns its contents wrapped in the `{ contents, mimeType, source }` shape.
- A `fetch()` that, if `mock` does not contain the URI, throws a clear `NotImplementedError("integration-google-drive: real Drive API not yet wired; pass a mock map for now")`.

**Why:** This validates the `Integration` interface end-to-end (a real package implements it; `dna-ingest` consumes it; tests pass) without committing to the OAuth/Drive-API scope yet. Downstream consumers can build against the stub today.

### D12: Public API surface of `dna-ingest`

```ts
export interface Integration { /* ... */ }
export interface InputAdapter { /* ... */ }
export interface IngestOptions { /* ... */ }
export interface IngestResult { /* ... */ }
export function ingest(opts: IngestOptions): Promise<IngestResult>
export function fileIntegration(): Integration  // built-in for file:// + bare paths
```

The `fileIntegration()` factory keeps the built-in fetcher discoverable and testable in isolation, even though it's also dispatched automatically for `file://` URIs.

## Risks / Trade-offs

- **[Risk]** Recommendation policy in D5 may produce non-intuitive picks (e.g., "longest string" can favor verbose-but-wrong over terse-but-right). → **Mitigation**: every conflict carries the full list of competing values and their sources; reviewer always has the data to override. Document the policy explicitly so reviewers know what the heuristic is.
- **[Risk]** The `Integration` contract is published from `dna-ingest`, but existing reader-side `integration-*` packages (`integration-jira`) don't implement it yet. → **Mitigation**: this proposal does not require them to. They can opt in via a follow-up change. The stub `integration-google-drive` is sufficient to validate the contract.
- **[Risk]** Bounded concurrency of 4 may be too aggressive for some integrations (rate-limited APIs) and too conservative for others (local fs). → **Mitigation**: configurable via `concurrency`. Document recommended values per integration in their READMEs over time.
- **[Risk]** LLM-backed extraction is the dominant cost; bounded parallelism doesn't help cost. → **Mitigation**: out of scope. Caching of extracted DNA chunks (D-future) addresses this.
- **[Trade-off]** Merge is order-dependent for the recency tie-break. Two callers passing the same sources in different order may get different recommendations on tied conflicts. → Accepted: documented in `merge()` JSDoc and the `dna-core` README. Callers who want strict order-independence can pre-sort by `loadedAt`.
- **[Trade-off]** Operational-only v1 means a corpus describing API endpoints or deployment topology produces incomplete DNA. → Accepted: this is the same trade-off `input-text` already documents; expanding to Product/Technical is a separate proposal.

## Migration Plan

This is a pure addition. No existing packages change behavior; no schemas change. Migration:

1. Land the change on `main`.
2. Bump versions: `dna-core` minor (added `merge`), `dna-ingest` 0.1.0 (new), `dna-integration-google-drive` 0.1.0 (new).
3. Tag release `v0.5.0` (or whatever the next minor is at land time).
4. Push tag — existing `publish.yml` workflow handles publish to GitHub Packages via `--workspaces`.

**Rollback:** Unpublish the two new packages; revert the `merge` export from `dna-core` and re-publish a patch. No consumer can have taken a runtime dependency on `merge` before its release, so the rollback surface is contained.

## Open Questions

- **Q1**: Should `ingest()` accept a pre-merged DNA as a "seed" for the merge (e.g., to incrementally add new sources to an existing DNA)? Leaning yes for v1 — the merge utility is general-purpose enough that this is just `merge([existingDna, ...newChunks])`. Document the pattern in the README rather than adding a dedicated parameter.
- **Q2**: Should the recommendation policy be pluggable (caller passes a `pickRecommendation` callback)? Leaning no for v1 — keep the deterministic default; revisit if real conflicts demonstrate the heuristic is wrong more often than it's right.
- **Q3**: Should there be a `dryRun` flag that returns provenance and conflicts *without* spending LLM tokens (i.e., uses cached/precomputed extractions)? Out of scope for v1; revisit alongside caching.
