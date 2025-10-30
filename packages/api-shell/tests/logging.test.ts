// Logging Middleware Tests
/// <reference lib="deno.window" />

import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { LoggingMiddleware, createLoggingMiddleware } from "../core/middleware/logging.ts";

Deno.test("LoggingMiddleware - should create instance", () => {
  const logger = createLoggingMiddleware();
  assertExists(logger);
});

Deno.test("LoggingMiddleware - should generate unique request IDs", () => {
  const logger = new LoggingMiddleware();
  
  // Access private method through any type (for testing)
  // deno-lint-ignore no-explicit-any
  const id1 = (logger as any).generateRequestId();
  // deno-lint-ignore no-explicit-any
  const id2 = (logger as any).generateRequestId();
  
  assertEquals(id1.startsWith("req_"), true);
  assertEquals(id2.startsWith("req_"), true);
  assertEquals(id1 === id2, false);
});

Deno.test("LoggingMiddleware - should exclude paths correctly", () => {
  const logger = new LoggingMiddleware({
    excludePaths: ["/health", "/docs", "/api/*/admin"],
  });

  // deno-lint-ignore no-explicit-any
  const shouldExclude = (logger as any).shouldExclude.bind(logger);
  
  assertEquals(shouldExclude("/health"), true);
  assertEquals(shouldExclude("/docs"), true);
  assertEquals(shouldExclude("/api/v1/admin"), true);
  assertEquals(shouldExclude("/users"), false);
});

Deno.test("LoggingMiddleware - should update configuration", () => {
  const logger = createLoggingMiddleware({ level: "info" });
  
  assertEquals(logger.getConfig().level, "info");
  
  logger.updateConfig({ level: "debug" });
  assertEquals(logger.getConfig().level, "debug");
});

Deno.test("LoggingMiddleware - middleware should be callable", () => {
  const logger = createLoggingMiddleware();
  const middleware = logger.middleware();
  
  assertExists(middleware);
  assertEquals(typeof middleware, "function");
});

Deno.test("LoggingMiddleware - should handle middleware execution", async () => {
  const logger = createLoggingMiddleware({
    enabled: true,
    level: "debug",
  });

  const middleware = logger.middleware();
  
  let nextCalled = false;
  // deno-lint-ignore no-explicit-any
  const mockCtx: any = {
    request: {
      method: "GET",
      url: new URL("http://localhost/api/users"),
      headers: new Map([["content-type", "application/json"]]),
      body: () => Promise.resolve(null),
    },
    response: {
      status: 200,
      body: { users: [] },
      headers: new Map(),
    },
  };

  const next = () => {
    nextCalled = true;
  };

  await middleware(mockCtx, next);
  assertEquals(nextCalled, true);
});

Deno.test("LoggingMiddleware - should skip excluded paths", async () => {
  const logger = createLoggingMiddleware({
    enabled: true,
    excludePaths: ["/health"],
  });

  const middleware = logger.middleware();
  
  let nextCalled = false;
  // deno-lint-ignore no-explicit-any
  const mockCtx: any = {
    request: {
      method: "GET",
      url: new URL("http://localhost/health"),
      headers: new Map(),
      body: () => Promise.resolve(null),
    },
    response: {
      status: 200,
      body: { status: "ok" },
      headers: new Map(),
    },
  };

  const next = () => {
    nextCalled = true;
  };

  await middleware(mockCtx, next);
  assertEquals(nextCalled, true);
});

Deno.test("LoggingMiddleware - should extract headers excluding sensitive ones", () => {
  const logger = new LoggingMiddleware({
    includeHeaders: true,
  });

  // deno-lint-ignore no-explicit-any
  const ctx: any = {
    request: {
      headers: new Map([
        ["content-type", "application/json"],
        ["authorization", "Bearer token"],
        ["x-request-id", "123"],
      ]),
    },
  };

  // deno-lint-ignore no-explicit-any
  const headers = (logger as any).extractHeaders(ctx, true);

  assertEquals(headers["content-type"], "application/json");
  assertEquals(headers["x-request-id"], "123");
  assertEquals(headers["authorization"], undefined);
});

Deno.test("LoggingMiddleware - should handle disabled logging", async () => {
  const logger = createLoggingMiddleware({ enabled: false });
  const middleware = logger.middleware();

  let nextCalled = false;
  // deno-lint-ignore no-explicit-any
  const mockCtx: any = {
    request: {
      method: "GET",
      url: new URL("http://localhost/api/users"),
      headers: new Map(),
      body: () => Promise.resolve(null),
    },
    response: {
      status: 200,
      body: [],
      headers: new Map(),
    },
  };

  const next = () => {
    nextCalled = true;
  };

  await middleware(mockCtx, next);
  assertEquals(nextCalled, true);
});
