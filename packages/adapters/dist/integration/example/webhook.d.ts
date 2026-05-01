/**
 * Inbound webhook handling.
 *
 * Two entry points:
 *   verifySignature(body, header, secret)  — pure HMAC-SHA256 check
 *   parseWebhook(rawBody, headers, options) — verify + parse + return event
 *
 * A consumer framework (Express, Fastify, Cloudflare Workers, Next.js) wraps
 * these in an HTTP handler. `createNodeHandler` at the bottom is a minimal
 * `http.IncomingMessage` adapter — delete or replace if your target framework
 * provides its own request abstraction.
 */
import type { IncomingMessage, ServerResponse } from 'http';
import { WebhookEvent, WebhookOptions } from './types';
/**
 * Compare a signature header against the expected HMAC-SHA256 of the raw body.
 * Constant-time to prevent timing attacks.
 */
export declare function verifySignature(rawBody: string, header: string | undefined, secret: string): boolean;
export declare class WebhookError extends Error {
    readonly status: number;
    constructor(message: string, status: number);
}
/**
 * Verify the signature and parse the JSON body into a typed WebhookEvent.
 * Throws `WebhookError` with an HTTP status that the caller should propagate.
 */
export declare function parseWebhook(rawBody: string, headers: Record<string, string | string[] | undefined>, options: WebhookOptions): WebhookEvent;
/**
 * Minimal Node `http` handler that reads the body, verifies the signature,
 * and forwards the parsed event to a handler. Good enough for demos and
 * `integration-example serve`. Replace with your framework's native primitives
 * for production.
 */
export declare function createNodeHandler(options: WebhookOptions, onEvent: (event: WebhookEvent) => void | Promise<void>): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
//# sourceMappingURL=webhook.d.ts.map