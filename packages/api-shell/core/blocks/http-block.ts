// HTTP Block
// Composable block for making HTTP requests

import {
  BlockDefinition,
  BlockHandler,
  BlockExecutionContext,
} from "../types.ts";

/**
 * HTTP Block Definition
 */
export const httpBlockDefinition: BlockDefinition = {
  id: "http",
  type: "http",
  description: "Make HTTP requests (GET, POST, PUT, PATCH, DELETE)",
  config: {
    baseUrl: "",
    headers: {},
    timeout: 30000,
  },
  inputs: [
    {
      name: "method",
      type: "string",
      required: true,
      description: "HTTP method: GET, POST, PUT, PATCH, DELETE",
    },
    {
      name: "path",
      type: "string",
      required: true,
      description: "Request path (appended to baseUrl)",
    },
    {
      name: "headers",
      type: "object",
      description: "Additional headers",
    },
    {
      name: "data",
      type: "object",
      description: "Request body (for POST, PUT, PATCH)",
    },
    {
      name: "params",
      type: "object",
      description: "Query parameters",
    },
  ],
  outputs: [
    {
      name: "status",
      type: "number",
      description: "HTTP status code",
    },
    {
      name: "data",
      type: "object",
      description: "Response body",
    },
    {
      name: "headers",
      type: "object",
      description: "Response headers",
    },
    {
      name: "ok",
      type: "boolean",
      description: "Whether status is 2xx",
    },
  ],
  functions: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

/**
 * HTTP Block Handler
 */
export const httpBlockHandler: BlockHandler = (
  ctx: BlockExecutionContext,
  config: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  const { method, path, headers: requestHeaders, data, params: queryParams } =
    ctx.inputs as Record<string, unknown>;

  // Validate inputs
  if (!method) {
    return Promise.reject(new Error("HTTP block requires 'method' input"));
  }
  if (!path) {
    return Promise.reject(new Error("HTTP block requires 'path' input"));
  }

  const baseUrl = config.baseUrl as string;
  const configHeaders = config.headers as Record<string, string> | undefined;
  const timeout = (config.timeout as number) || 30000;

  // Build URL
  let url = baseUrl + String(path);

  if (queryParams && typeof queryParams === "object") {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams as Record<string, unknown>)) {
      searchParams.append(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Build headers
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...configHeaders,
    ...(requestHeaders as Record<string, string> || {}),
  };

  // Build request options
  const fetchOptions: RequestInit = {
    method: String(method).toUpperCase(),
    headers: finalHeaders,
  };

  if (data && ["POST", "PUT", "PATCH"].includes(String(method).toUpperCase())) {
    fetchOptions.body = JSON.stringify(data);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...fetchOptions,
    signal: controller.signal,
  })
    .then(async (response) => {
      clearTimeout(timeoutId);

      let responseData: unknown;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else if (contentType?.includes("text")) {
        responseData = await response.text();
      } else {
        responseData = await response.arrayBuffer();
      }

      return {
        status: response.status,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok,
      };
    })
    .catch((error) => {
      clearTimeout(timeoutId);

      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        return {
          status: 0,
          data: null,
          headers: {},
          ok: false,
          error: `HTTP request failed: ${error.message}`,
        };
      }

      if (error instanceof Error && error.name === "AbortError") {
        return {
          status: 0,
          data: null,
          headers: {},
          ok: false,
          error: `HTTP request timeout after ${timeout}ms`,
        };
      }

      // Handle DNS errors and other network errors gracefully
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        status: 0,
        data: null,
        headers: {},
        ok: false,
        error: errorMessage,
      };
    });
};

/**
 * Register HTTP block
 */
export function registerHttpBlock(registry: {
  register: (id: string, def: BlockDefinition, handler: BlockHandler) => void;
}): void {
  registry.register("http", httpBlockDefinition, httpBlockHandler);
}
