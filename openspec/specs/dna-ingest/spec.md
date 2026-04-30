# dna-ingest Specification

## Purpose

Defines the orchestration capability for multi-source DNA extraction. The `@dna-codes/dna-ingest` package fans out across many documents (Drive SOPs, Notion notes, local files), fetches each via the appropriate `integration-*`, dispatches contents to the correct `input-*` adapter by MIME type, and merges the per-source DNA chunks into a single Operational DNA strand with typed conflict, error, and provenance reporting. It also publishes the `Integration` contract that every reader-side integration package implements to participate in ingest. The orchestrator imports zero `integration-*` or `input-*` packages — both maps are injected by the caller — keeping the orchestrator dependency-free and the package graph acyclic.

## Requirements

### Requirement: `ingest()` orchestrates fetch, extract, and merge across multiple sources

The `@dna-codes/dna-ingest` package SHALL export a single `ingest()` function that takes `{ sources, integrations, inputs, llm, concurrency? }` and returns `{ dna, conflicts, errors, provenance }`. The function MUST fetch each source via the appropriate integration, dispatch the fetched contents to the appropriate input adapter by MIME type, and merge the resulting per-source DNA chunks into a single Operational DNA document.

#### Scenario: End-to-end ingest with two sources fans into one DNA
- **WHEN** `ingest()` is called with two sources (one `file://` path, one `gdrive://` URI), with a `gdrive` integration provided and a `text/*` input adapter provided
- **THEN** the result `dna` is a valid Operational DNA containing primitives contributed from both sources, `errors` is empty, and `provenance` lists both source URIs against the primitives they contributed

#### Scenario: A failed source does not abort the run
- **WHEN** one of three sources fails to fetch (e.g., 404 from the integration) and the other two succeed
- **THEN** the result `dna` contains primitives from the two successful sources, `errors` contains exactly one entry naming the failed source with `stage: "fetch"`, and the function does not throw

### Requirement: Orchestrator imports zero `integration-*` or `input-*` packages

The `dna-ingest` package SHALL NOT declare any workspace-internal `integration-*` or `input-*` package as a runtime dependency. All integration clients and input adapters MUST be supplied by the caller via the `integrations` and `inputs` options.

#### Scenario: Package.json declares no input/integration deps
- **WHEN** `packages/ingest/package.json` is inspected
- **THEN** its `dependencies` and `peerDependencies` contain no entry whose name starts with `@dna-codes/dna-input-` or `@dna-codes/dna-integration-`

#### Scenario: Caller can run ingest with a minimal subset of adapters
- **WHEN** `ingest()` is called with only `inputs: { 'text/*': inputText }` and only `integrations: { gdrive: driveClient }` and a single `gdrive://` text source
- **THEN** the run completes successfully without requiring any other input or integration to be installed or configured

### Requirement: URI scheme dispatches to the correct integration

The orchestrator SHALL parse each source URI and dispatch fetching as follows: `file://` URIs and bare filesystem paths are handled by a built-in fs-based fetcher; URIs with any other scheme are dispatched to `integrations[<scheme>]`. An unknown scheme (no matching integration) MUST produce a non-fatal entry in `errors[]` and skip that source.

#### Scenario: file:// URI is fetched without requiring an integration
- **WHEN** `ingest()` is called with `sources: ['file:///tmp/sop.md']` and `integrations: {}`
- **THEN** the file is read from disk, processed through the matching input adapter, and contributes to the merged DNA

#### Scenario: Bare filesystem path is treated as file://
- **WHEN** `ingest()` is called with `sources: ['/tmp/sop.md']` (no scheme prefix)
- **THEN** the source is handled by the built-in fs fetcher, identical to the `file://` case

#### Scenario: Unknown scheme produces a non-fatal error
- **WHEN** `ingest()` is called with `sources: ['notion://abc']` but no `notion` key is provided in `integrations`
- **THEN** the result `errors` contains an entry `{ source: 'notion://abc', stage: 'fetch', error: <message naming the missing scheme> }` and the run continues with other sources

### Requirement: MIME type dispatches to the correct input adapter via glob match

The orchestrator SHALL select an input adapter by glob-matching the MIME type returned by the integration against the keys of the `inputs` map. Glob matching MUST support `*` as a wildcard within a MIME type segment (e.g., `text/*` matches `text/plain` and `text/markdown`). If no key matches, the orchestrator MUST add a non-fatal entry to `errors[]` and skip that source.

#### Scenario: text/* matches text/markdown
- **WHEN** an integration returns `mimeType: 'text/markdown'` and `inputs` contains a key `'text/*'`
- **THEN** the input adapter under `'text/*'` is invoked with the contents

#### Scenario: Unmatched MIME type produces a non-fatal error
- **WHEN** an integration returns `mimeType: 'application/zip'` and no key in `inputs` matches `application/zip`
- **THEN** the result `errors` contains an entry with `stage: 'extract'` naming the source and unmatched MIME type, and the run continues

#### Scenario: Specific match preferred over wildcard
- **WHEN** `inputs` contains both `'text/markdown'` and `'text/*'` and the integration returns `mimeType: 'text/markdown'`
- **THEN** the more specific `'text/markdown'` adapter is selected

### Requirement: `Integration` contract is a typed interface published from `dna-ingest`

The `dna-ingest` package SHALL export a TypeScript interface named `Integration` with a single async method `fetch(uri: string): Promise<{ contents: string | Buffer, mimeType: string, source: { uri: string, loadedAt: string } }>`. The `loadedAt` field MUST be an ISO 8601 timestamp.

#### Scenario: Stub integration satisfies the Integration contract
- **WHEN** `@dna-codes/dna-integration-google-drive` is imported and its default export instantiated
- **THEN** the resulting object satisfies the `Integration` interface (has a `fetch` method with the documented signature)

#### Scenario: loadedAt is ISO 8601
- **WHEN** any integration's `fetch()` resolves with a `source.loadedAt` value
- **THEN** the value parses successfully via `new Date(value)` and round-trips back to the same string via `.toISOString()`

### Requirement: Provenance is returned as a separate map keyed by primitive path

The result SHALL include a `provenance` field that maps dotted primitive paths (e.g., `'resources.Loan'`, `'resources.Loan.attributes.amount'`, `'roles.Underwriter'`) to an array of `{ uri, loadedAt }` entries identifying which source(s) contributed that primitive. The merged `dna` object MUST NOT contain inline provenance fields; the merged DNA MUST validate against the existing Operational schema unchanged.

#### Scenario: Provenance lists all contributing sources for a shared primitive
- **WHEN** two sources both describe a `Loan` Resource (with different attributes)
- **THEN** `provenance['resources.Loan']` contains two entries, one per source URI

#### Scenario: Merged DNA has no inline provenance fields
- **WHEN** the result `dna` is validated against `@dna-codes/dna-schemas` Operational schema
- **THEN** validation passes and no inline `_provenance`, `_source`, or similar field is present anywhere in the DNA tree

### Requirement: LLM options are passed through to every input adapter

The orchestrator SHALL accept `llm: { model, temperature, seed }` in `IngestOptions` and pass these values verbatim to every input adapter invocation. The `dna-ingest` package SHALL NOT mutate, default, or interpret these values beyond forwarding them.

#### Scenario: Same model/temperature/seed reaches every adapter
- **WHEN** `ingest()` is called with `llm: { model: 'claude-opus-4-7', temperature: 0, seed: 42 }` and three sources
- **THEN** every input adapter invocation receives those exact values; no adapter is called with different `llm` options unless the caller has wrapped that adapter to override them

### Requirement: Bounded concurrency with sensible default

The orchestrator SHALL process sources with bounded concurrency. The default concurrency MUST be 4 in flight; callers MAY override via `IngestOptions.concurrency`. A `concurrency` value less than 1 MUST be rejected.

#### Scenario: Default concurrency is 4
- **WHEN** `ingest()` is called with 10 sources and no `concurrency` option
- **THEN** at most 4 sources are in flight (fetching or extracting) at any moment

#### Scenario: Custom concurrency is honored
- **WHEN** `ingest()` is called with `concurrency: 1`
- **THEN** sources are processed strictly serially

#### Scenario: Invalid concurrency is rejected
- **WHEN** `ingest()` is called with `concurrency: 0`
- **THEN** the function rejects synchronously with a clear validation error

### Requirement: Built-in `fileIntegration()` factory is exported

The `dna-ingest` package SHALL export a `fileIntegration()` factory function that returns an `Integration` for `file://` URIs and bare paths. This is the same implementation used internally for the built-in dispatch; exporting it lets callers test integration-shaped flows without relying on private internals.

#### Scenario: fileIntegration() returns a valid Integration
- **WHEN** `fileIntegration().fetch('file:///tmp/sop.md')` is called against an existing UTF-8 text file
- **THEN** the promise resolves to `{ contents, mimeType, source }` with `mimeType` reflecting the file extension and `source.uri === 'file:///tmp/sop.md'`
