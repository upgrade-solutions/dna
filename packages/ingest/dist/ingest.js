"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingest = ingest;
const dna_core_1 = require("@dna-codes/dna-core");
const concurrency_1 = require("./concurrency");
const dispatch_1 = require("./dispatch");
const file_integration_1 = require("./file-integration");
const DEFAULT_CONCURRENCY = 4;
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
async function ingest(opts) {
    const concurrency = opts.concurrency ?? DEFAULT_CONCURRENCY;
    if (!Number.isFinite(concurrency) || concurrency < 1) {
        throw new Error(`dna-ingest: concurrency must be >= 1 (got ${concurrency})`);
    }
    const builtIn = (0, file_integration_1.fileIntegration)();
    const outcomes = await (0, concurrency_1.runBounded)(opts.sources, concurrency, async (uri) => {
        return processSource(uri, opts, builtIn);
    });
    const chunks = [];
    const errors = [];
    for (const outcome of outcomes) {
        if (outcome.chunk)
            chunks.push({ dna: outcome.chunk.dna, source: outcome.chunk.source });
        if (outcome.error)
            errors.push(outcome.error);
    }
    const mergeResult = (0, dna_core_1.merge)(chunks);
    return {
        dna: mergeResult.dna,
        conflicts: mergeResult.conflicts,
        errors,
        provenance: mergeResult.provenance,
    };
}
async function processSource(uri, opts, builtIn) {
    const integration = (0, dispatch_1.integrationFor)(uri, opts.integrations, builtIn);
    if (!integration) {
        const scheme = (0, dispatch_1.schemeOf)(uri);
        return {
            source: uri,
            error: {
                source: uri,
                stage: 'fetch',
                error: `dna-ingest: no integration registered for URI scheme "${scheme}"`,
            },
        };
    }
    let fetched;
    try {
        fetched = await integration.fetch(uri);
    }
    catch (err) {
        return {
            source: uri,
            error: {
                source: uri,
                stage: 'fetch',
                error: messageOf(err),
            },
        };
    }
    const match = (0, dispatch_1.adapterFor)(fetched.mimeType, opts.inputs);
    if (!match) {
        return {
            source: uri,
            error: {
                source: uri,
                stage: 'extract',
                error: `dna-ingest: no input adapter registered for MIME type "${fetched.mimeType}"`,
            },
        };
    }
    let dna;
    try {
        dna = await match.adapter(fetched.contents, { llm: opts.llm });
    }
    catch (err) {
        return {
            source: uri,
            error: {
                source: uri,
                stage: 'extract',
                error: messageOf(err),
            },
        };
    }
    return {
        source: uri,
        chunk: { dna, source: fetched.source },
    };
}
function messageOf(err) {
    if (err instanceof Error)
        return err.message;
    return String(err);
}
//# sourceMappingURL=ingest.js.map