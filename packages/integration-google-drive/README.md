# `@dna-codes/dna-integration-google-drive`

> 🚧 **Stub package.** This package implements the `@dna-codes/dna-ingest` `Integration` contract end-to-end so downstream consumers can build against a real shape today. **Real Google Drive auth + API calls ship in a follow-up change.**

Use this package to:
- Validate that your `dna-ingest` orchestrator works with a real-shape integration.
- Drive integration-shaped tests in your own code without standing up Drive credentials.
- Anchor the `gdrive://` URI scheme in your code; when real Drive lands, you'll only swap the factory call.

For real Drive fetches today: use a different mechanism (e.g. download the file locally and use the built-in `file://` fetcher in `dna-ingest`).

## Installation

```bash
npm install @dna-codes/dna-integration-google-drive @dna-codes/dna-ingest
```

## Usage

```ts
import googleDriveIntegration from '@dna-codes/dna-integration-google-drive'
import { ingest } from '@dna-codes/dna-ingest'

const drive = googleDriveIntegration({
  mock: {
    'gdrive://abc': { contents: '# SOP for loan origination\n\n...', mimeType: 'text/markdown' },
    'gdrive://def': { contents: 'Underwriter responsibilities: ...',  mimeType: 'text/plain' },
  },
})

const result = await ingest({
  sources: ['gdrive://abc', 'gdrive://def'],
  integrations: { gdrive: drive },
  inputs: { 'text/*': inputText },
  llm: { model: 'claude-opus-4-7', temperature: 0, seed: 42 },
})
```

## API

### `googleDriveIntegration(opts?: DriveIntegrationOptions): Integration`

Default export. Returns an object satisfying `@dna-codes/dna-ingest`'s `Integration` interface.

```ts
interface DriveIntegrationOptions {
  mock?: Record<string, { contents: string | Buffer; mimeType: string }>
}
```

- If `fetch(uri)` is called with a URI present in `mock`, resolves with the contents wrapped in `{ contents, mimeType, source: { uri, loadedAt } }`. `loadedAt` is set to `new Date().toISOString()` at fetch time (not at factory construction).
- Otherwise, throws `NotImplementedError` (an `Error` with `name === 'NotImplementedError'`) whose message names both Google Drive and the `mock` parameter, instructing callers what to do.

### `NotImplementedError`

Exported `Error` subclass thrown by unmocked fetches. Its `.name` is `'NotImplementedError'` so callers can switch on `err.name` if they prefer name-based checks.

## What this package does *not* do (yet)

- No OAuth flow, no service-account auth, no token refresh.
- No Drive API calls. No file metadata lookup, no MIME sniffing from Drive.
- No streaming download — when the real version lands it'll likely buffer entire file contents.

These ship in a separate change. Track progress in the OpenSpec changes folder at the repo root.

## Forking notes

If you want to write a real integration today (e.g. against a different system), don't fork this package — it's a stub. Fork [`packages/integration-example`](../integration-example/) instead, which ships a complete API client + webhook receiver + CLI as a starting point. The `Integration` contract you implement comes from `@dna-codes/dna-ingest`; everything else is yours to design.
