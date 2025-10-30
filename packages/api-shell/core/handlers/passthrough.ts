// Passthrough handler for simple request/response operations

import { ExecutionContext, HandlerConfig } from "../types.ts";

interface PassthroughConfig extends HandlerConfig {
  [key: string]: unknown;
}

/**
 * Passthrough handler - passes the request body through with minimal processing
 * Useful for handlers that need business logic to be implemented elsewhere
 * or for endpoints that should echo back the request
 */
export function handlePassthrough(
  ctx: ExecutionContext,
  _config: PassthroughConfig
): Promise<unknown> {
  // Return the request body as-is, or an empty object if no body
  return Promise.resolve(ctx.body || {});
}
