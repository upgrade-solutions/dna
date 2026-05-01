## MODIFIED Requirements

### Requirement: `Integration` contract is a typed interface published from `dna-ingest`

The `dna-ingest` package SHALL export a TypeScript interface named `Integration` with two methods:

1. A required async method `fetch(uri: string): Promise<{ contents: string | Buffer, mimeType: string, source: { uri: string, loadedAt: string } }>`. The `loadedAt` field MUST be an ISO 8601 timestamp.
2. An OPTIONAL async method `write(target: string, payload: { contents: string | Buffer; mimeType: string }): Promise<{ target: string; meta?: Record<string, unknown> }>`. Read-only integrations SHALL leave `write` undefined; bidirectional integrations SHALL implement it. The `target` argument identifies the destination (a parent URI to create-under, an existing object URI to update, or any integration-specific URI shape). The returned `target` identifies the resulting remote object — which MAY differ from the input (e.g. creating a child returns the new child's URI). The `meta` field is free-form integration-specific metadata.

The `dna-ingest` package SHALL also export the supporting types `WritePayload` and `WriteResult` matching the `write` argument and return shapes above.

#### Scenario: Stub integration satisfies the Integration contract
- **WHEN** `@dna-codes/dna-integration-google-drive` is imported and its default export instantiated
- **THEN** the resulting object satisfies the `Integration` interface (has a `fetch` method with the documented signature) and MAY omit `write`

#### Scenario: loadedAt is ISO 8601
- **WHEN** any integration's `fetch()` resolves with a `source.loadedAt` value
- **THEN** the value parses successfully via `new Date(value)` and round-trips back to the same string via `.toISOString()`

#### Scenario: Bidirectional integration implements write
- **WHEN** `@dna-codes/dna-integration-jira`'s client is instantiated
- **THEN** it exposes a `write(target, payload)` method whose signature matches the optional `Integration.write` shape and whose return value resolves with `{ target, meta? }`

#### Scenario: write payload is the dual of fetch result
- **WHEN** an integration round-trips bytes via `const r = await i.fetch(uri); await i.write(target, { contents: r.contents, mimeType: r.mimeType })`
- **THEN** the same `(contents, mimeType)` shape that `fetch` returned is the shape `write` accepts; no integration-specific transformation is required at the boundary

#### Scenario: write is undefined on read-only integrations
- **WHEN** a caller inspects `typeof readOnlyIntegration.write` for an integration that has not implemented the optional method
- **THEN** the value is `'undefined'`; the TypeScript type checker rejects unguarded calls (`readOnly.write(...)`) and accepts only `readOnly.write?.(...)`
