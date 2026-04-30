import type { Conflict, OperationalDNA, Provenance, Source } from '@dna-codes/dna-core';
export type { Conflict, OperationalDNA, Provenance, Source };
/**
 * The shape an `Integration.fetch()` resolves with — fetched bytes plus a
 * MIME type the orchestrator can route on, plus a `source` record that
 * flows through into provenance and conflict reporting.
 */
export interface FetchResult {
    contents: string | Buffer;
    mimeType: string;
    source: Source;
}
/**
 * The contract every reader-side `integration-*` package implements to
 * participate in `dna-ingest`. PDF/Office text extraction is the
 * integration's responsibility — return already-normalized text or bytes.
 *
 * Errors thrown from `fetch()` are caught by the orchestrator and surfaced
 * as `errors[]` entries with `stage: 'fetch'`. The run continues with the
 * remaining sources.
 */
export interface Integration {
    fetch(uri: string): Promise<FetchResult>;
}
/**
 * LLM options forwarded verbatim to every input adapter invocation. The
 * orchestrator never mutates, defaults, or interprets these values.
 */
export interface LlmOptions {
    model: string;
    temperature: number;
    seed: number;
}
/**
 * The second argument every `input-*` adapter receives. Existing adapters
 * (`input-text`, `input-transcript`, `input-image`) already accept this
 * shape; new adapters MUST keep `llm` respected as-is and MAY extend the
 * options object with adapter-specific fields.
 */
export interface InputAdapterOptions {
    llm: LlmOptions;
}
/**
 * The shape every `input-*` adapter exposes — single document → DNA.
 */
export type InputAdapter = (contents: string | Buffer, options: InputAdapterOptions) => Promise<OperationalDNA>;
export interface IngestOptions {
    /** Source URIs to fetch + extract. `file://` and bare paths are handled by the built-in fs fetcher. */
    sources: string[];
    /** Map from URI scheme → Integration. The orchestrator imports zero `integration-*` packages itself. */
    integrations: Record<string, Integration>;
    /** Map from MIME glob (e.g. `text/markdown`, `text/*`) → InputAdapter. More specific keys win. */
    inputs: Record<string, InputAdapter>;
    /** LLM options forwarded verbatim to every adapter invocation. */
    llm: LlmOptions;
    /** Maximum sources processed in parallel. Default 4. Must be >= 1. */
    concurrency?: number;
}
/**
 * One non-fatal failure during ingest. The run continues with the
 * remaining sources; the caller decides whether the partial result is
 * acceptable by checking `errors.length`.
 */
export interface IngestError {
    source: string;
    stage: 'fetch' | 'extract';
    error: string;
}
export interface IngestResult {
    dna: OperationalDNA;
    conflicts: Conflict[];
    errors: IngestError[];
    provenance: Provenance;
}
//# sourceMappingURL=types.d.ts.map