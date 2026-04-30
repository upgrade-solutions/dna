import type { Integration } from './types';
/**
 * Built-in fetcher for `file://` URIs and bare filesystem paths. Used
 * internally by the orchestrator and exported so callers can test
 * integration-shaped flows without reaching for private internals.
 */
export declare function fileIntegration(): Integration;
/**
 * Convert a `file://` URI or bare path to an absolute filesystem path.
 * Exported for test reuse.
 */
export declare function resolveFilePath(uri: string): string;
//# sourceMappingURL=file-integration.d.ts.map