/**
 * @dna-codes/dna-integration-jira — bidirectional Jira Cloud integration.
 *
 *   Jira Epic ──▶ input-text ──▶ DNA ──▶ output-text ──▶ Jira Stories
 *
 * One Capability in the DNA becomes one child Story under the Epic.
 * The Epic's description is fed into @dna-codes/dna-input-text (LLM-backed);
 * each Capability is rendered by @dna-codes/dna-output-text.renderMany.
 *
 * No webhook surface — Jira Cloud's native outbound webhooks are not
 * signed in a way external verifiers can safely validate. Use Jira
 * Automation with a signed HTTP action if you need inbound events.
 */

export { createClient } from './client'
export { dnaToStoryFields } from './mapping'
export { extractText, fromMarkdown } from './adf'
export { runCli } from './cli'
export * from './types'
