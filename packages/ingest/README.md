# `@dna-codes/dna-ingest`

Multi-source DNA orchestrator. Takes a list of source URIs, fetches each through a caller-supplied `Integration`, dispatches the fetched contents to a caller-supplied `InputAdapter` by MIME type, and merges the per-source DNA chunks into a single Operational DNA via `@dna-codes/dna-core`'s `merge()`.

```
[source URIs] → integration-* (fetch) → input-* (extract) → DNA chunk
                                                              │
                                                              ▼
                                                        dna-core.merge()
                                                              │
                                                              ▼
                                                    { dna, conflicts, errors, provenance }
```

The orchestrator is a thin coordinator: **it imports zero `@dna-codes/dna-input-*` or `@dna-codes/dna-integration-*` packages**. Callers wire whatever integrations and input adapters they need via dependency injection.

## Installation

```bash
npm install @dna-codes/dna-ingest @dna-codes/dna-core
```

## Usage

```ts
import { ingest } from '@dna-codes/dna-ingest'
import { inputText } from '@dna-codes/dna-input-text'
import driveIntegration from '@dna-codes/dna-integration-google-drive'

const result = await ingest({
  sources: [
    'gdrive://abc',
    'file:///etc/sop.md',
    '/tmp/policies.md',
  ],
  integrations: {
    gdrive: driveIntegration({ mock: { 'gdrive://abc': { contents: '...', mimeType: 'text/markdown' } } }),
    // file:// and bare paths are handled by a built-in fs fetcher — no integration needed.
  },
  inputs: {
    'text/*': inputText,
  },
  llm: { model: 'claude-opus-4-7', temperature: 0, seed: 42 },
  concurrency: 4, // optional — default 4
})

result.dna          // merged Operational DNA
result.conflicts    // Conflict[] from merge()
result.errors       // Errors per failed fetch/extract; the run is non-fatal
result.provenance   // dotted-path → contributing sources
```

## API

### `ingest(opts: IngestOptions): Promise<IngestResult>`

Orchestrates fetch → extract → merge across all sources.

```ts
interface IngestOptions {
  sources: string[]
  integrations: Record<string, Integration>
  inputs: Record<string, InputAdapter>
  llm: { model: string; temperature: number; seed: number }
  concurrency?: number  // default 4; must be >= 1
}

interface IngestResult {
  dna: OperationalDNA
  conflicts: Conflict[]
  errors: IngestError[]
  provenance: Provenance
}

interface IngestError {
  source: string
  stage: 'fetch' | 'extract'
  error: string
}
```

### `Integration` — the contract every reader-side integration implements

```ts
interface Integration {
  fetch(uri: string): Promise<{
    contents: string | Buffer
    mimeType: string
    source: { uri: string; loadedAt: string /* ISO 8601 */ }
  }>
}
```

PDF/Office text extraction is **the integration's job**, not the orchestrator's. Integrations return already-normalized text/audio/image bytes alongside a sensible MIME type; the orchestrator routes by MIME type into the matching input adapter.

### `InputAdapter` — the shape every `input-*` exposes

```ts
interface InputAdapter {
  (
    contents: string | Buffer,
    options: { llm: { model: string; temperature: number; seed: number } },
  ): Promise<OperationalDNA>
}
```

The orchestrator forwards `llm` options verbatim to every adapter call — it never mutates, defaults, or interprets them.

### `fileIntegration(): Integration`

Built-in fetcher for `file://` URIs and bare filesystem paths. Already used internally for the built-in dispatch; exported so callers can test integration-shaped flows without reaching for private internals.

## Dispatch rules

**URI scheme** (fetch stage):
- `file://` URIs and bare paths → built-in fs fetcher.
- Any other scheme → `integrations[<scheme>]`.
- Unknown scheme → non-fatal `errors[]` entry with `stage: 'fetch'`; run continues.

**MIME type** (extract stage):
- Glob match against `inputs` keys. `*` is a wildcard within a MIME segment (`text/*` matches `text/markdown`).
- More specific keys (`text/markdown`) preferred over wildcards (`text/*`) when both are present.
- No match → non-fatal `errors[]` entry with `stage: 'extract'`; run continues.

## Concurrency

Sources are processed with bounded parallelism. Default 4 in flight; configurable via `IngestOptions.concurrency`. `concurrency: 1` is strictly serial. `concurrency: 0` (or any value < 1) is rejected synchronously.

## Determinism caveats

`@dna-codes/dna-ingest` is a probabilistic package by transitive dependency: most `input-*` adapters are LLM-backed. Even with `temperature: 0` and a fixed `seed`, model-provider-side changes can introduce drift between runs. The orchestrator itself is deterministic given identical inputs from each adapter; merge ordering is also deterministic given input ordering.

## Forking & extending

See [`AGENTS.md`](./AGENTS.md) for guidance on writing a new `integration-*` that participates in `dna-ingest`.
