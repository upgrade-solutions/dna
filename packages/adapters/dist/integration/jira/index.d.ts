/**
 * @dna-codes/dna-integration-jira — pure-I/O Jira Cloud integration.
 *
 * Implements the `Integration` port from `@dna-codes/dna-ingest`: bytes in,
 * bytes out. Composition with input/output adapters (Epic prose ↔ DNA ↔
 * Story prose) lives in `src/cli.ts` — see the README for the canonical
 * pattern.
 *
 * No webhook surface — Jira Cloud's native outbound webhooks are not
 * signed in a way external verifiers can safely validate. Use Jira
 * Automation with a signed HTTP action if you need inbound events.
 */
export { createClient } from './client';
export { extractText, fromMarkdown } from './adf';
export { runCli } from './cli';
export * from './types';
//# sourceMappingURL=index.d.ts.map