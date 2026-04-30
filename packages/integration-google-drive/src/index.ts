import type { FetchResult, Integration } from '@dna-codes/dna-ingest'

export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotImplementedError'
  }
}

export interface MockEntry {
  contents: string | Buffer
  mimeType: string
}

export interface DriveIntegrationOptions {
  /**
   * In-memory map from URI → mock fetch payload. When `fetch(uri)` is called
   * with a key present here, the integration resolves with the payload
   * wrapped in the `Integration` contract shape. Other URIs throw
   * `NotImplementedError` until a follow-up change wires real Drive auth.
   */
  mock?: Record<string, MockEntry>
}

/**
 * Factory for `@dna-codes/dna-integration-google-drive`.
 *
 * **Stub.** Real Google Drive auth + API calls are explicitly out of scope
 * for this package version — see the package README for the migration
 * path. Use the `mock` option to drive integration-shaped flows in tests
 * and downstream development today.
 *
 * Available as both a named export and the default export. Prefer the
 * named export from Node ESM consumers — Node's CJS-interop semantics
 * make `import googleDriveIntegration from '...'` bind to the wrapping
 * module object rather than the function itself.
 */
export function googleDriveIntegration(opts: DriveIntegrationOptions = {}): Integration {
  const mock = opts.mock ?? {}
  return {
    async fetch(uri: string): Promise<FetchResult> {
      const entry = mock[uri]
      if (!entry) {
        throw new NotImplementedError(
          `@dna-codes/dna-integration-google-drive: real Google Drive API is not yet wired (uri: ${uri}). Pass a \`mock\` map to googleDriveIntegration({ mock: { [uri]: { contents, mimeType } } }) for now.`,
        )
      }
      return {
        contents: entry.contents,
        mimeType: entry.mimeType,
        source: { uri, loadedAt: new Date().toISOString() },
      }
    },
  }
}

export default googleDriveIntegration

export type { FetchResult, Integration }
