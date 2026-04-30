import { merge, type MergeChunk } from '@dna-codes/dna-core'
import { runBounded } from './concurrency'
import { adapterFor, integrationFor, schemeOf } from './dispatch'
import { fileIntegration } from './file-integration'
import type { IngestError, IngestOptions, IngestResult, OperationalDNA, Source } from './types'

const DEFAULT_CONCURRENCY = 4

interface PerSourceOutcome {
  source: string
  chunk?: { dna: OperationalDNA; source: Source }
  error?: IngestError
}

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
export async function ingest(opts: IngestOptions): Promise<IngestResult> {
  const concurrency = opts.concurrency ?? DEFAULT_CONCURRENCY
  if (!Number.isFinite(concurrency) || concurrency < 1) {
    throw new Error(`dna-ingest: concurrency must be >= 1 (got ${concurrency})`)
  }

  const builtIn = fileIntegration()
  const outcomes = await runBounded(opts.sources, concurrency, async (uri) => {
    return processSource(uri, opts, builtIn)
  })

  const chunks: MergeChunk[] = []
  const errors: IngestError[] = []
  for (const outcome of outcomes) {
    if (outcome.chunk) chunks.push({ dna: outcome.chunk.dna, source: outcome.chunk.source })
    if (outcome.error) errors.push(outcome.error)
  }

  const mergeResult = merge(chunks)

  return {
    dna: mergeResult.dna,
    conflicts: mergeResult.conflicts,
    errors,
    provenance: mergeResult.provenance,
  }
}

async function processSource(
  uri: string,
  opts: IngestOptions,
  builtIn: ReturnType<typeof fileIntegration>,
): Promise<PerSourceOutcome> {
  const integration = integrationFor(uri, opts.integrations, builtIn)
  if (!integration) {
    const scheme = schemeOf(uri)
    return {
      source: uri,
      error: {
        source: uri,
        stage: 'fetch',
        error: `dna-ingest: no integration registered for URI scheme "${scheme}"`,
      },
    }
  }

  let fetched
  try {
    fetched = await integration.fetch(uri)
  } catch (err) {
    return {
      source: uri,
      error: {
        source: uri,
        stage: 'fetch',
        error: messageOf(err),
      },
    }
  }

  const match = adapterFor(fetched.mimeType, opts.inputs)
  if (!match) {
    return {
      source: uri,
      error: {
        source: uri,
        stage: 'extract',
        error: `dna-ingest: no input adapter registered for MIME type "${fetched.mimeType}"`,
      },
    }
  }

  let dna
  try {
    dna = await match.adapter(fetched.contents, { llm: opts.llm })
  } catch (err) {
    return {
      source: uri,
      error: {
        source: uri,
        stage: 'extract',
        error: messageOf(err),
      },
    }
  }

  return {
    source: uri,
    chunk: { dna, source: fetched.source },
  }
}

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}
