/**
 * @dna-codes/integration-example — template integration package.
 *
 * An `integration-*` connects an external system to DNA bidirectionally.
 * It owns three surfaces:
 *
 *   1. Outbound API calls   — createClient()  (client.ts)
 *   2. Inbound webhooks     — parseWebhook()  (webhook.ts)
 *   3. A CLI                — runCli()        (cli.ts, bin/)
 *
 * Unlike input-* and output-*, an integration may depend on @dna-codes/core
 * at runtime — e.g. for validation before pushing. This template stays
 * zero-dep so fork it as-is, then add runtime deps deliberately.
 */
export { createClient } from './client';
export { createNodeHandler, parseWebhook, verifySignature, WebhookError } from './webhook';
export { dnaToItems, itemsToDna, itemToResource } from './mapping';
export { runCli } from './cli';
export * from './types';
//# sourceMappingURL=index.d.ts.map