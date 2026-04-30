# AGENTS.md — `@dna-codes/dna-integration-google-drive`

Guidance for AI agents working on this package.

## What this package is

A **stub** that satisfies the `@dna-codes/dna-ingest` `Integration` contract end-to-end. Two responsibilities:

1. Serve `fetch(uri)` requests from an in-memory mock map (when constructed with one).
2. Throw a clear `NotImplementedError` for any URI not in the mock map, instructing the caller to either provide a mock or wait for real Drive auth.

That's it. The package exists to validate the `Integration` contract and to give downstream consumers a real shape to build against — not to do real Drive work.

## When real Drive lands

A separate OpenSpec change will replace the stub fetch path with real auth + Drive API calls. When that happens:

- **Keep the `mock` option.** Real-Drive integrations should still accept a mock for tests; consumers will rely on this for offline test runs.
- **Keep the `loadedAt` semantics.** `loadedAt` MUST be set inside `fetch()` (fetch-time), not at factory construction. Retries naturally get fresh timestamps.
- **Keep the package name and default export shape.** `import googleDriveIntegration from '@dna-codes/dna-integration-google-drive'` should not change for consumers.
- **Bump minor (0.x.0), not major.** Adding real fetch capability is additive; the stub path remains as a fallback for unmocked URIs that callers haven't authorized.

## Hard rules until real Drive lands

- **No `googleapis` dependency.** Do not pre-install the SDK "for later." Keeps the stub zero-runtime-dep.
- **Do not silently succeed.** Unmocked fetches MUST throw `NotImplementedError` with a clear message. Returning empty contents would mask real bugs in caller code.
- **Do not invent fake DNA.** This is an integration, not an input adapter. If you find yourself returning DNA, you've crossed wires — return raw contents + MIME type and let the orchestrator route to an input adapter.

## Testing checklist

- [ ] Default factory returns an object with an async `fetch` method.
- [ ] Mocked fetches resolve with `{ contents, mimeType, source: { uri, loadedAt } }`.
- [ ] `loadedAt` is fetch-time, not factory-time, and is ISO 8601 round-trippable.
- [ ] Unmocked fetches throw an Error whose `name === 'NotImplementedError'`.
- [ ] The error message references both Google Drive and the `mock` parameter.
- [ ] `package.json` declares only `@dna-codes/dna-ingest` as a runtime `@dna-codes/*` dependency.
