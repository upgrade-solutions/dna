// Proxy handler for forwarding requests to other APIs

import { ExecutionContext, HandlerConfig } from "../types.ts";

interface ProxyConfig extends HandlerConfig {
  target: string; // Target URL template
  method?: string;
  headers?: Record<string, string>;
  timeout?: number;
  [key: string]: unknown;
}

/**
 * Proxies requests to external APIs
 */
export async function handleProxy(
  ctx: ExecutionContext,
  config: ProxyConfig
): Promise<unknown> {
  const { target, method = "GET", headers = {}, timeout = 30000 } = config;

  // Replace path parameters in target URL
  let targetUrl = target;
  for (const [key, value] of Object.entries(ctx.params)) {
    targetUrl = targetUrl.replace(`:${key}`, String(value));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: ctx.body ? JSON.stringify(ctx.body) : undefined,
      signal: controller.signal,
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Proxy request timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
