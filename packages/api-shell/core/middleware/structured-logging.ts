// Structured JSON Logging Middleware
// Provides JSON-formatted logs for better parsing and integration with logging services
/// <reference lib="deno.window" />

import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";

export interface StructuredLogEntry {
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  requestId: string;
  method: string;
  path: string;
  status?: number;
  duration?: number;
  message: string;
  service: string;
  environment?: string;
  userId?: string;
  details?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface StructuredLoggingConfig {
  enabled?: boolean;
  level?: "DEBUG" | "INFO" | "WARN" | "ERROR";
  service: string;
  environment?: string;
  includeDetails?: boolean;
  excludePaths?: string[];
  maxBodySize?: number;
  outputToConsole?: boolean;
  outputToFile?: boolean;
  logFilePath?: string;
}

/**
 * Structured JSON Logging Middleware
 * Outputs logs in JSON format for easy parsing by logging services
 */
export class StructuredLoggingMiddleware {
  private config: Required<StructuredLoggingConfig>;
  private requestIdCounter: number = 0;
  private logFile?: Deno.FsFile;

  constructor(config: StructuredLoggingConfig) {
    if (!config.service) {
      throw new Error("service name is required for StructuredLoggingMiddleware");
    }

    this.config = {
      enabled: config.enabled ?? true,
      level: config.level ?? "INFO",
      service: config.service,
      environment: config.environment ?? Deno.env.get("ENVIRONMENT") ?? "development",
      includeDetails: config.includeDetails ?? false,
      excludePaths: config.excludePaths ?? ["/health", "/docs", "/openapi.json", "/openapi.yaml"],
      maxBodySize: config.maxBodySize ?? 1024,
      outputToConsole: config.outputToConsole ?? true,
      outputToFile: config.outputToFile ?? false,
      logFilePath: config.logFilePath ?? "./logs/app.jsonl",
    };

    // Open log file if configured
    if (this.config.outputToFile) {
      this.initializeLogFile();
    }
  }

  private async initializeLogFile(): Promise<void> {
    try {
      // Ensure logs directory exists
      const logsDir = this.config.logFilePath!.substring(0, this.config.logFilePath!.lastIndexOf("/"));
      try {
        await Deno.mkdir(logsDir, { recursive: true });
      } catch (_error) {
        // Directory may already exist
      }

      // Open file in append mode
      this.logFile = await Deno.open(this.config.logFilePath!, {
        create: true,
        append: true,
      });
    } catch (error) {
      console.error(`Failed to initialize log file: ${error}`);
    }
  }

  private generateRequestId(): string {
    const timestamp = Date.now();
    const counter = ++this.requestIdCounter;
    return `req_${timestamp}_${counter}`;
  }

  private shouldExclude(path: string): boolean {
    return this.config.excludePaths.some((excludePath) => {
      if (excludePath === path) return true;
      if (excludePath.includes("*")) {
        const regex = new RegExp(`^${excludePath.replace(/\*/g, ".*")}$`);
        return regex.test(path);
      }
      return false;
    });
  }

  private getLevelPriority(level: string): number {
    const levels: Record<string, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    return levels[level] ?? 1;
  }

  private async extractBody(ctx: Context): Promise<string | undefined> {
    if (!this.config.includeDetails) return undefined;

    try {
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
    } catch (_error) {
      return "[error reading body]";
    }
  }

  private extractUserId(ctx: Context): string | undefined {
    // Try to extract user ID from context
    try {
      // deno-lint-ignore no-explicit-any
      const state = (ctx as any).state as Record<string, unknown>;
      const user = state?.user as Record<string, unknown>;
      return user?.id as string | undefined;
    } catch {
      return undefined;
    }
  }

  private writeLog(entry: StructuredLogEntry): void {
    if (!this.config.enabled) return;

    // Check if log level should be output
    if (this.getLevelPriority(entry.level) < this.getLevelPriority(this.config.level)) {
      return;
    }

    const json = JSON.stringify(entry);

    if (this.config.outputToConsole) {
      // Color code console output
      const colorMap: Record<string, string> = {
        DEBUG: "\x1b[36m", // Cyan
        INFO: "\x1b[32m",  // Green
        WARN: "\x1b[33m",  // Yellow
        ERROR: "\x1b[31m", // Red
      };
      const reset = "\x1b[0m";
      const color = colorMap[entry.level] || "";
      console.log(`${color}${json}${reset}`);
    }

    if (this.config.outputToFile && this.logFile) {
      // Write to file in JSONL format (one JSON per line)
      try {
        const encoder = new TextEncoder();
        this.logFile.writeSync(encoder.encode(`${json}\n`));
      } catch (error) {
        console.error(`Failed to write to log file: ${error}`);
      }
    }
  }

  /**
   * Oak middleware function
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
      const userId = this.extractUserId(ctx);

      if (!shouldExclude) {
        // Log incoming request
        const requestBody = await this.extractBody(ctx);
        const requestDetails: Record<string, unknown> = {};

        if (requestBody) {
          requestDetails.body = requestBody;
        }
        requestDetails.query = Object.fromEntries(
          ctx.request.url.searchParams.entries()
        );

        this.writeLog({
          timestamp: new Date().toISOString(),
          level: "DEBUG",
          requestId,
          method,
          path,
          message: "Request received",
          service: this.config.service,
          environment: this.config.environment,
          userId,
          details: this.config.includeDetails ? requestDetails : undefined,
        });
      }

      const startTime = performance.now();

      try {
        await next();

        if (!shouldExclude) {
          const duration = Math.round(performance.now() - startTime);
          const responseBody = this.config.includeDetails
            ? JSON.stringify(ctx.response.body)?.substring(0, this.config.maxBodySize)
            : undefined;

          // Determine log level based on status code
          let logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR" = "INFO";
          if (ctx.response.status >= 500) {
            logLevel = "ERROR";
          } else if (ctx.response.status >= 400) {
            logLevel = "WARN";
          }

          const responseDetails: Record<string, unknown> = {};
          if (responseBody) {
            responseDetails.body = responseBody;
          }

          this.writeLog({
            timestamp: new Date().toISOString(),
            level: logLevel,
            requestId,
            method,
            path,
            status: ctx.response.status,
            duration,
            message: `${method} ${path} - ${ctx.response.status}`,
            service: this.config.service,
            environment: this.config.environment,
            userId,
            details: this.config.includeDetails ? responseDetails : undefined,
          });
        }
      } catch (error) {
        if (!shouldExclude) {
          const duration = Math.round(performance.now() - startTime);

          this.writeLog({
            timestamp: new Date().toISOString(),
            level: "ERROR",
            requestId,
            method,
            path,
            duration,
            message: "Request processing failed",
            service: this.config.service,
            environment: this.config.environment,
            userId,
            error: {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            },
          });
        }

        throw error;
      }
    };
  }

  /**
   * Manually log an event
   */
  log(
    level: "DEBUG" | "INFO" | "WARN" | "ERROR",
    message: string,
    details?: Record<string, unknown>,
    requestId?: string,
    userId?: string
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level,
      requestId: requestId || `manual_${Date.now()}`,
      method: "N/A",
      path: "N/A",
      message,
      service: this.config.service,
      environment: this.config.environment,
      userId,
      details,
    });
  }

  /**
   * Close log file
   */
  close(): void {
    if (this.logFile) {
      try {
        this.logFile.close();
      } catch (error) {
        console.error(`Failed to close log file: ${error}`);
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): StructuredLoggingConfig {
    return { ...this.config };
  }
}

/**
 * Helper function to create structured logging middleware
 */
export function createStructuredLoggingMiddleware(
  config: StructuredLoggingConfig
): StructuredLoggingMiddleware {
  return new StructuredLoggingMiddleware(config);
}

/**
 * Example usage:
 *
 * const jsonLogger = createStructuredLoggingMiddleware({
 *   service: "api-shell",
 *   environment: "production",
 *   level: "INFO",
 *   includeDetails: true,
 *   outputToConsole: true,
 *   outputToFile: true,
 *   logFilePath: "./logs/app.jsonl",
 * });
 *
 * app.use(jsonLogger.middleware());
 *
 * // Manual logging
 * jsonLogger.log("INFO", "User created", {
 *   userId: user.id,
 *   email: user.email,
 * }, requestId, user.id);
 */
