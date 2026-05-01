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

import { createHmac, timingSafeEqual } from 'crypto'
import type { IncomingMessage, ServerResponse } from 'http'

import { WebhookEvent, WebhookOptions } from './types'

const DEFAULT_SIGNATURE_HEADER = 'x-example-signature'

/**
 * Compare a signature header against the expected HMAC-SHA256 of the raw body.
 * Constant-time to prevent timing attacks.
 */
export function verifySignature(rawBody: string, header: string | undefined, secret: string): boolean {
  if (!header) return false
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  const received = header.replace(/^sha256=/, '')
  if (expected.length !== received.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  } catch {
    return false
  }
}

export class WebhookError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'WebhookError'
  }
}

/**
 * Verify the signature and parse the JSON body into a typed WebhookEvent.
 * Throws `WebhookError` with an HTTP status that the caller should propagate.
 */
export function parseWebhook(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>,
  options: WebhookOptions,
): WebhookEvent {
  if (!options.secret) throw new WebhookError('missing webhook secret', 500)

  const headerName = (options.signatureHeader ?? DEFAULT_SIGNATURE_HEADER).toLowerCase()
  const raw = headers[headerName]
  const signature = Array.isArray(raw) ? raw[0] : raw

  if (!verifySignature(rawBody, signature, options.secret)) {
    throw new WebhookError('invalid webhook signature', 401)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    throw new WebhookError('webhook body is not valid JSON', 400)
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new WebhookError('webhook body must be an object', 400)
  }

  const event = parsed as Partial<WebhookEvent>
  if (!event.type || !event.item) {
    throw new WebhookError('webhook body missing `type` or `item`', 400)
  }
  return event as WebhookEvent
}

/**
 * Minimal Node `http` handler that reads the body, verifies the signature,
 * and forwards the parsed event to a handler. Good enough for demos and
 * `integration-example serve`. Replace with your framework's native primitives
 * for production.
 */
export function createNodeHandler(
  options: WebhookOptions,
  onEvent: (event: WebhookEvent) => void | Promise<void>,
) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end('method not allowed')
      return
    }

    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(chunk as Buffer)
    const rawBody = Buffer.concat(chunks).toString('utf-8')

    try {
      const event = parseWebhook(rawBody, req.headers, options)
      await onEvent(event)
      res.statusCode = 200
      res.end('ok')
    } catch (err) {
      const status = err instanceof WebhookError ? err.status : 500
      const message = err instanceof Error ? err.message : 'internal error'
      res.statusCode = status
      res.end(message)
    }
  }
}
