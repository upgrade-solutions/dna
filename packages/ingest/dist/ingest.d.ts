import type { IngestOptions, IngestResult } from './types';
/**
 * Multi-source DNA orchestrator. See `packages/ingest/README.md` for the
 * full contract. High-level flow per source:
 *
 *   1. Dispatch URI scheme → integration (`file://` and bare paths use the
 *      built-in fs fetcher; other schemes route to `integrations[scheme]`).
 *   2. Dispatch MIME type → input adapter via glob match (specific keys
 *      preferred over wildcards).
 *   3. Run the adapter with the caller's `llm` options forwarded verbatim.
 *
 * All per-source DNA chunks are then handed to `dna-core.merge()` for
 * fan-in. Fetch and extract failures are recorded in `errors[]` and never
 * abort the run.
 */
export declare function ingest(opts: IngestOptions): Promise<IngestResult>;
//# sourceMappingURL=ingest.d.ts.map