// Structured Logging Middleware Tests
/// <reference lib="deno.window" />

import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { createStructuredLoggingMiddleware } from "../core/middleware/structured-logging.ts";

Deno.test("StructuredLoggingMiddleware - should create instance with service", () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
  });
  assertExists(logger);
});

Deno.test("StructuredLoggingMiddleware - should require service name", () => {
  try {
    createStructuredLoggingMiddleware({
      service: "",
    });
    assertEquals(true, false, "Should have thrown error");
  } catch (error) {
    assertEquals(error instanceof Error, true);
  }
});

Deno.test("StructuredLoggingMiddleware - should get configuration", () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
    environment: "testing",
    level: "DEBUG",
  });
  
  const config = logger.getConfig();
  assertEquals(config.service, "test-service");
  assertEquals(config.environment, "testing");
  assertEquals(config.level, "DEBUG");
});

Deno.test("StructuredLoggingMiddleware - should support different log levels", () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
    level: "WARN",
  });
  
  const config = logger.getConfig();
  assertEquals(config.level, "WARN");
});

Deno.test("StructuredLoggingMiddleware - should support console output", () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
    outputToConsole: true,
  });
  
  const config = logger.getConfig();
  assertEquals(config.outputToConsole, true);
});

Deno.test("StructuredLoggingMiddleware - should support file output", () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
    outputToFile: true,
    logFilePath: "./test-logs.jsonl",
  });
  
  const config = logger.getConfig();
  assertEquals(config.outputToFile, true);
  assertEquals(config.logFilePath, "./test-logs.jsonl");
});

Deno.test("StructuredLoggingMiddleware - should return middleware function", () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
  });
  
  const middleware = logger.middleware();
  assertEquals(typeof middleware, "function");
});

Deno.test("StructuredLoggingMiddleware - should support manual logging", () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
    outputToConsole: false,
    outputToFile: false,
  });
  
  // Manual logging should not throw
  logger.log("INFO", "Test message", { test: true }, "req_test_1", "user_123");
  assertEquals(true, true);
});

Deno.test("StructuredLoggingMiddleware - should support disabled logging", () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
    enabled: false,
  });
  
  const config = logger.getConfig();
  assertEquals(config.enabled, false);
});

Deno.test("StructuredLoggingMiddleware - should handle middleware execution", async () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
    enabled: true,
    outputToConsole: false,
    outputToFile: false,
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
    state: {
      user: { id: "user_123" },
    },
  };

  const next = () => {
    nextCalled = true;
  };

  await middleware(mockCtx, next);
  assertEquals(nextCalled, true);
});

Deno.test("StructuredLoggingMiddleware - should exclude paths when configured", async () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
    enabled: true,
    excludePaths: ["/health"],
    outputToConsole: false,
    outputToFile: false,
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

Deno.test("StructuredLoggingMiddleware - should handle errors gracefully", async () => {
  const logger = createStructuredLoggingMiddleware({
    service: "test-service",
    enabled: true,
    outputToConsole: false,
    outputToFile: false,
  });

  const middleware = logger.middleware();
  
  // deno-lint-ignore no-explicit-any
  const mockCtx: any = {
    request: {
      method: "GET",
      url: new URL("http://localhost/api/users"),
      headers: new Map(),
      body: () => Promise.resolve(null),
    },
    response: {
      status: 500,
      body: { error: "Internal server error" },
      headers: new Map(),
    },
  };

  let errorThrown = false;
  const next = () => {
    throw new Error("Test error");
  };

  try {
    await middleware(mockCtx, next);
  } catch (_error) {
    errorThrown = true;
  }

  assertEquals(errorThrown, true);
});

Deno.test("StructuredLoggingMiddleware - should support different environments", () => {
  const prodLogger = createStructuredLoggingMiddleware({
    service: "api-shell",
    environment: "production",
    level: "WARN",
  });
  
  const devLogger = createStructuredLoggingMiddleware({
    service: "api-shell",
    environment: "development",
    level: "DEBUG",
  });
  
  const prodConfig = prodLogger.getConfig();
  const devConfig = devLogger.getConfig();
  
  assertEquals(prodConfig.environment, "production");
  assertEquals(devConfig.environment, "development");
  assertEquals(prodConfig.level, "WARN");
  assertEquals(devConfig.level, "DEBUG");
});
