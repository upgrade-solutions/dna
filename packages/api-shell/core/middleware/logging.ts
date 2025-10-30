// Logging Middleware
// Provides comprehensive request/response logging for all endpoints
/// <reference lib="deno.window" />

import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";

export interface LogLevel {
  level: "debug" | "info" | "warn" | "error";
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  status?: number;
  duration?: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface LogConfig {
  enabled?: boolean;
  level?: "debug" | "info" | "warn" | "error";
  includeHeaders?: boolean;
  includeBody?: boolean;
  includeResponse?: boolean;
  excludePaths?: string[];
  maxBodySize?: number;
}

/**
 * Logging Middleware Factory
 * Creates middleware that logs all requests and responses
 */
export class LoggingMiddleware {
  private config: Required<LogConfig>;
  private requestIdCounter: number = 0;

  constructor(config: LogConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      level: config.level ?? "info",
      includeHeaders: config.includeHeaders ?? false,
      includeBody: config.includeBody ?? false,
      includeResponse: config.includeResponse ?? true,
      excludePaths: config.excludePaths ?? ["/health", "/docs", "/openapi.json", "/openapi.yaml"],
      maxBodySize: config.maxBodySize ?? 1024, // 1KB by default
    };
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    const timestamp = Date.now();
    const counter = ++this.requestIdCounter;
    return `req_${timestamp}_${counter}`;
  }

  /**
   * Check if path should be excluded from logging
   */
  private shouldExclude(path: string): boolean {
    return this.config.excludePaths.some((excludePath) => {
      // Support exact matches and wildcard patterns
      if (excludePath === path) return true;
      if (excludePath.includes("*")) {
        const regex = new RegExp(`^${excludePath.replace(/\*/g, ".*")}$`);
        return regex.test(path);
      }
      return false;
    });
  }

  /**
   * Safely extract and truncate body content
   */
  private async extractBody(
    ctx: Context,
    isRequest: boolean
  ): Promise<string | undefined> {
    if (!this.config.includeBody) return undefined;

    try {
      if (isRequest) {
        let bodyContent: unknown;
        try {
          bodyContent = await ctx.request.body({ type: "json" }).value;
        } catch {
          try {
            bodyContent = await ctx.request.body({ type: "text" }).value;
          } catch {
            return undefined;
          }
        }

        if (!bodyContent) return undefined;

        let content: string;
        if (typeof bodyContent === "string") {
          content = bodyContent;
        } else {
          content = JSON.stringify(bodyContent);
        }

        if (content.length > this.config.maxBodySize) {
          return `${content.substring(0, this.config.maxBodySize)}... [truncated]`;
        }
        return content;
      } else {
        // Response body
        const body = ctx.response.body;
        if (!body) return undefined;

        let content: string;
        if (typeof body === "string") {
          content = body;
        } else {
          content = JSON.stringify(body);
        }

        if (content.length > this.config.maxBodySize) {
          return `${content.substring(0, this.config.maxBodySize)}... [truncated]`;
        }
        return content;
      }
    } catch (_error) {
      // Safely ignore body extraction errors
      return "[error reading body]";
    }
  }

  /**
   * Extract headers safely
   */
  private extractHeaders(ctx: Context, isRequest: boolean): Record<string, string> {
    if (!this.config.includeHeaders) return {};

    const headers: Record<string, string> = {};
    const headerList = isRequest ? ctx.request.headers : ctx.response.headers;

    headerList.forEach((value: string, key: string) => {
      // Skip sensitive headers
      if (!["authorization", "cookie", "x-api-key", "x-auth-token"].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    return headers;
  }

  /**
   * Log a message
   */
  private log(entry: LogLevel): void {
    if (!this.config.enabled) return;

    const levelMap = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevelValue = levelMap[this.config.level];
    const entryLevelValue = levelMap[entry.level];

    // Only log if entry level is >= configured level
    if (entryLevelValue < configLevelValue) return;

    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.requestId}]`;
    const message = `${prefix} ${entry.method} ${entry.path}`;

    let output = message;
    if (entry.status) {
      output += ` - ${entry.status}`;
    }
    if (entry.duration) {
      output += ` (${entry.duration}ms)`;
    }
    output += ` - ${entry.message}`;

    // Use appropriate console method
    switch (entry.level) {
      case "error":
        console.error(output, entry.details || "");
        break;
      case "warn":
        console.warn(output, entry.details || "");
        break;
      case "debug":
        console.debug(output, entry.details || "");
        break;
      case "info":
      default:
        console.log(output, entry.details || "");
    }
  }

  /**
   * Oak middleware function
   * Logs request and response for each endpoint
   */
  middleware() {
    // deno-lint-ignore no-explicit-any
    return async (ctx: Context, next: any): Promise<void> => {
      if (!this.config.enabled) {
        await next();
        return;
      }

      const requestId = this.generateRequestId();
      const path = ctx.request.url.pathname;
      const method = ctx.request.method;
      const shouldExclude = this.shouldExclude(path);

      if (!shouldExclude) {
        // Log incoming request
        const requestBody = await this.extractBody(ctx, true);
        const requestHeaders = this.extractHeaders(ctx, true);

        const requestDetails: Record<string, unknown> = {};
        if (requestBody) {
          requestDetails.body = requestBody;
        }
        if (Object.keys(requestHeaders).length > 0) {
          requestDetails.headers = requestHeaders;
        }
        requestDetails.query = Object.fromEntries(
          ctx.request.url.searchParams.entries()
        );

        this.log({
          level: "debug",
          timestamp: new Date().toISOString(),
          requestId,
          method,
          path,
          message: "Incoming request",
          details: requestDetails,
        });
      }

      const startTime = performance.now();

      try {
        // Call next middleware
        await next();

        if (!shouldExclude) {
          const duration = Math.round(performance.now() - startTime);
          const responseBody = this.config.includeResponse
            ? await this.extractBody(ctx, false)
            : undefined;
          const responseHeaders = this.extractHeaders(ctx, false);

          const responseDetails: Record<string, unknown> = {};
          if (responseBody) {
            responseDetails.body = responseBody;
          }
          if (Object.keys(responseHeaders).length > 0) {
            responseDetails.headers = responseHeaders;
          }

          // Determine log level based on status code
          let logLevel: "debug" | "info" | "warn" | "error" = "info";
          if (ctx.response.status >= 500) {
            logLevel = "error";
          } else if (ctx.response.status >= 400) {
            logLevel = "warn";
          }

          this.log({
            level: logLevel,
            timestamp: new Date().toISOString(),
            requestId,
            method,
            path,
            status: ctx.response.status,
            duration,
            message: `${method} ${path} completed`,
            details: responseDetails,
          });
        }
      } catch (error) {
        if (!shouldExclude) {
          const duration = Math.round(performance.now() - startTime);

          this.log({
            level: "error",
            timestamp: new Date().toISOString(),
            requestId,
            method,
            path,
            duration,
            message: `Request failed with error`,
            details: {
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            },
          });
        }

        // Re-throw error for global error handler
        throw error;
      }
    };
  }

  /**
   * Per-endpoint logging decorator
   * Can be used to log specific endpoint metrics
   */
  async logEndpoint(
    requestId: string,
    method: string,
    path: string,
    fn: () => Promise<unknown>
  ): Promise<unknown> {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = Math.round(performance.now() - startTime);

      this.log({
        level: "info",
        timestamp: new Date().toISOString(),
        requestId,
        method,
        path,
        duration,
        message: "Endpoint execution completed",
      });

      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);

      this.log({
        level: "error",
        timestamp: new Date().toISOString(),
        requestId,
        method,
        path,
        duration,
        message: "Endpoint execution failed",
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LogConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): LogConfig {
    return { ...this.config };
  }
}

/**
 * Helper function to create logging middleware
 */
export function createLoggingMiddleware(config?: LogConfig): LoggingMiddleware {
  return new LoggingMiddleware(config);
}

/**
 * Export a pre-configured instance for convenience
 */
export const defaultLogger = createLoggingMiddleware({
  level: "info",
  includeBody: false,
  includeHeaders: false,
  includeResponse: true,
});

/**
 * Example usage:
 *
 * // Create logger with custom config
 * const logger = createLoggingMiddleware({
 *   level: "debug",
 *   includeBody: true,
 *   includeHeaders: true,
 *   includeResponse: true,
 *   excludePaths: ["/health", "/docs"],
 *   maxBodySize: 2048
 * });
 *
 * // Add to Oak app
 * app.use(logger.middleware());
 *
 * // Or use default logger
 * app.use(defaultLogger.middleware());
 */
