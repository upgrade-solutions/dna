export { ingest } from './ingest'
export { fileIntegration, resolveFilePath } from './file-integration'
export { runBounded } from './concurrency'
export { adapterFor, integrationFor, schemeOf } from './dispatch'

export type {
  Conflict,
  FetchResult,
  IngestError,
  IngestOptions,
  IngestResult,
  InputAdapter,
  InputAdapterOptions,
  Integration,
  LlmOptions,
  OperationalDNA,
  Provenance,
  Source,
  WritePayload,
  WriteResult,
} from './types'
