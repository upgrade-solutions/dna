# integration-google-drive Specification

## Purpose

Defines the stub package `@dna-codes/dna-integration-google-drive` whose role is to validate the `Integration` contract from `dna-ingest` end-to-end and give downstream consumers a real shape to build against. The package implements the contract, serves predetermined fetches from an in-memory mock map (so callers can wire up `dna-ingest` flows in tests today), and throws a clear `NotImplementedError` for real Google Drive API calls — those land in a separate change once OAuth and the Drive client are wired. The stub is the smallest thing that can prove the `Integration` interface works against a non-trivial second implementation (alongside the built-in `fileIntegration()`), unblocking adopters without committing to the auth/API surface prematurely.

## Requirements

### Requirement: Stub package implements the `Integration` contract

`@dna-codes/dna-integration-google-drive` SHALL export a default factory whose return value satisfies the `Integration` interface from `@dna-codes/dna-ingest`. The package's purpose is to validate the contract end-to-end and to give downstream consumers a real shape to build against; real Google Drive API calls are explicitly out of scope for this package version.

#### Scenario: Default export returns an Integration
- **WHEN** the package's default factory is invoked
- **THEN** the result has an async `fetch(uri)` method whose return shape matches `{ contents, mimeType, source: { uri, loadedAt } }`

### Requirement: Mock map serves predetermined fetches

The factory SHALL accept an options object `{ mock?: Record<string, { contents: string | Buffer, mimeType: string }> }`. When `fetch(uri)` is called with a URI present in `mock`, the integration MUST resolve with `{ contents, mimeType, source: { uri, loadedAt } }` where `loadedAt` is the current time as an ISO 8601 string.

#### Scenario: Fetching a mocked URI returns its contents
- **WHEN** the factory is constructed with `mock: { 'gdrive://abc': { contents: 'hello', mimeType: 'text/plain' } }` and `fetch('gdrive://abc')` is called
- **THEN** the promise resolves with `contents: 'hello'`, `mimeType: 'text/plain'`, and `source.uri: 'gdrive://abc'`

#### Scenario: loadedAt is set at fetch time, not factory construction
- **WHEN** a factory is constructed at T1 with a mock entry, and `fetch()` is called at T2 > T1
- **THEN** `source.loadedAt` parses to a time at or after T2 (not T1)

### Requirement: Unmocked fetches throw `NotImplementedError` with a clear message

When `fetch(uri)` is called with a URI not present in the `mock` map (or no `mock` was provided), the integration MUST throw a `NotImplementedError` (or an Error whose `name` is `'NotImplementedError'`) whose message clearly states that the real Google Drive API is not yet wired and instructs the caller to provide a `mock` entry.

#### Scenario: Unmocked URI throws NotImplementedError
- **WHEN** the factory is constructed with no mock and `fetch('gdrive://anything')` is called
- **THEN** the promise rejects with an error whose `name` is `'NotImplementedError'` and whose `message` references both Google Drive and the `mock` parameter

#### Scenario: Mocked factory still throws for URIs absent from the map
- **WHEN** the factory is constructed with `mock: { 'gdrive://abc': {...} }` and `fetch('gdrive://other')` is called
- **THEN** the promise rejects with `NotImplementedError`

### Requirement: Package is published as `@dna-codes/dna-integration-google-drive`

The package SHALL be published under the existing `@dna-codes` scope at `packages/integration-google-drive`, listed in the README's Integrations table marked as a stub, and included in the workspace publish via the existing tag-driven workflow.

#### Scenario: Package is wired into the workspace
- **WHEN** the workspace is built (`npm run build --workspaces`)
- **THEN** `packages/integration-google-drive` builds successfully and produces published artifacts under the `@dna-codes/dna-integration-google-drive` name
