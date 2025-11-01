// Block Execution Engine Tests
// Validates block chain execution, data flow, and error handling

import { assertEquals } from "std/assert/mod.ts";
import {
  BlockExecutionEngine,
} from "../core/blocks/block-execution-engine.ts";
import { BlockRegistry } from "../core/blocks/block-registry.ts";
import { BlockDefinition, BlockHandler, BlockChain } from "../core/types.ts";

// Helper to create test execution context
function createTestContext(
  params: Record<string, string> = {},
  env: Record<string, string> = {}
) {
  return {
    request: new Request("http://localhost/test"),
    params,
    body: null,
    env,
    respond: (data: unknown) => new Response(JSON.stringify(data)),
  };
}

// Helper to create test registry with mock blocks
function createTestRegistry(): BlockRegistry {
  const registry = new BlockRegistry();

  // Mock database block
  const dbBlockDef: BlockDefinition = {
    id: "test-db",
    type: "database",
    config: {},
    inputs: [],
    outputs: [{ name: "rows", type: "array" }],
  };

  const dbHandler: BlockHandler = (_ctx, config) => {
    const fnc = (config as Record<string, unknown>).function;
    if (fnc === "select") {
      return Promise.resolve({
        rows: [{ id: "1", name: "John" }],
        success: true,
      });
    }
    return Promise.resolve({ rows: [], success: true });
  };

  // Mock HTTP block
  const httpBlockDef: BlockDefinition = {
    id: "test-http",
    type: "http",
    config: {},
    inputs: [],
    outputs: [{ name: "data", type: "object" }],
  };

  const httpHandler: BlockHandler = () => {
    return Promise.resolve({
      status: 200,
      data: { message: "ok" },
    });
  };

  // Mock transform block
  const transformBlockDef: BlockDefinition = {
    id: "test-transform",
    type: "transform",
    config: {},
    inputs: [],
    outputs: [{ name: "result", type: "object" }],
  };

  const transformHandler: BlockHandler = (_ctx) => {
    return Promise.resolve({
      result: { transformed: true },
    });
  };

  registry.register("database", dbBlockDef, dbHandler);
  registry.register("http", httpBlockDef, httpHandler);
  registry.register("transform", transformBlockDef, transformHandler);

  return registry;
}

Deno.test("Execution Engine - Simple Block Execution", async () => {
  const registry = createTestRegistry();
  const engine = new BlockExecutionEngine(registry);

  const chain: BlockChain = {
    id: "test-chain",
    blocks: [
      {
        id: "getUser",
        blockType: "database",
        config: { function: "select" },
        inputs: {},
      },
    ],
  };

  const ctx = {
    request: new Request("http://localhost/test"),
    params: {},
    body: null,
    env: {},
    respond: (data: unknown) => new Response(JSON.stringify(data)),
  };

  const result = await engine.executeChain(chain, ctx);

  assertEquals(result.success, true, "Chain should execute successfully");
  assertEquals(result.results.length, 1, "Should have one result");
  assertEquals(result.results[0].success, true, "Block should succeed");

  console.log("✓ Simple block execution works");
});

Deno.test("Execution Engine - Sequential Block Chain", async () => {
  const registry = createTestRegistry();
  const engine = new BlockExecutionEngine(registry);

  const chain: BlockChain = {
    id: "test-chain",
    blocks: [
      {
        id: "step1",
        blockType: "database",
        config: { function: "select" },
        inputs: {},
      },
      {
        id: "step2",
        blockType: "transform",
        config: {},
        inputs: {},
      },
    ],
  };

  const ctx = {
    request: new Request("http://localhost/test"),
    params: {},
    body: null,
    env: {},
    respond: (data: unknown) => new Response(JSON.stringify(data)),
  };

  const result = await engine.executeChain(chain, ctx);

  assertEquals(result.success, true, "Chain should complete");
  assertEquals(result.results.length, 2, "Should have two results");
  assertEquals(result.results[0].success, true, "Step 1 should succeed");
  assertEquals(result.results[1].success, true, "Step 2 should succeed");

  console.log("✓ Sequential block chain works");
});

Deno.test("Execution Engine - Execution Order", async () => {
  const _registry = createTestRegistry();
  const executionOrder: string[] = [];

  // Create custom registry with tracking
  const trackingRegistry = new BlockRegistry();

  const trackedDbHandler: BlockHandler = (_ctx, config) => {
    executionOrder.push("db");
    const fnc = (config as Record<string, unknown>).function;
    if (fnc === "select") {
      return Promise.resolve({
        rows: [{ id: "1" }],
        success: true,
      });
    }
    return Promise.resolve({ rows: [], success: true });
  };

  const trackedHttpHandler: BlockHandler = () => {
    executionOrder.push("http");
    return Promise.resolve({ status: 200, data: {} });
  };

  const dbBlockDef: BlockDefinition = {
    id: "test-db",
    type: "database",
    config: {},
    inputs: [],
    outputs: [],
  };

  const httpBlockDef: BlockDefinition = {
    id: "test-http",
    type: "http",
    config: {},
    inputs: [],
    outputs: [],
  };

  trackingRegistry.register("database", dbBlockDef, trackedDbHandler);
  trackingRegistry.register("http", httpBlockDef, trackedHttpHandler);

  const trackedEngine = new BlockExecutionEngine(trackingRegistry);

  const chain: BlockChain = {
    id: "test-chain",
    blocks: [
      { id: "db", blockType: "database", config: { function: "select" }, inputs: {} },
      { id: "http", blockType: "http", config: {}, inputs: {} },
    ],
  };

  const ctx = {
    request: new Request("http://localhost/test"),
    params: {},
    body: null,
    env: {},
    respond: (data: unknown) => new Response(JSON.stringify(data)),
  };

  await trackedEngine.executeChain(chain, ctx);

  assertEquals(
    executionOrder.join(","),
    "db,http",
    "Blocks should execute in order"
  );

  console.log("✓ Execution order is correct");
});

Deno.test("Execution Engine - Timeout Management", async () => {
  const registry = new BlockRegistry();

  let pendingTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const slowHandler: BlockHandler = () => {
    return new Promise((_resolve) => {
      // Never resolves to simulate timeout
      pendingTimeoutId = setTimeout(() => {}, 10000);
    });
  };

  const blockDef: BlockDefinition = {
    id: "slow",
    type: "slow-block",
    config: {},
    inputs: [],
    outputs: [],
  };

  registry.register("slow-block", blockDef, slowHandler);
  const engine = new BlockExecutionEngine(registry);

  const chain: BlockChain = {
    id: "test-chain",
    blocks: [
      {
        id: "slow",
        blockType: "slow-block",
        config: {},
        inputs: {},
        timeout: 100, // 100ms timeout
      },
    ],
  };

  const ctx = createTestContext();
  const result = await engine.executeChain(chain, ctx);

  assertEquals(result.success, false, "Chain should fail on timeout");
  assertEquals(result.error !== undefined, true, "Should have error");

  // Clean up pending timeout
  if (pendingTimeoutId !== null) {
    clearTimeout(pendingTimeoutId);
  }

  console.log("✓ Timeout management works");
});

Deno.test("Execution Engine - Empty Chain", async () => {
  const registry = createTestRegistry();
  const engine = new BlockExecutionEngine(registry);

  const chain: BlockChain = {
    id: "empty-chain",
    blocks: [],
  };

  const ctx = createTestContext();
  const result = await engine.executeChain(chain, ctx);

  assertEquals(result.success, true, "Empty chain should succeed");
  assertEquals(result.results.length, 0, "No blocks executed");

  console.log("✓ Empty chain handling works");
});

Deno.test("Execution Engine - Unknown Block Type", async () => {
  const registry = createTestRegistry();
  const engine = new BlockExecutionEngine(registry);

  const chain: BlockChain = {
    id: "test-chain",
    blocks: [
      {
        id: "unknown",
        blockType: "nonexistent-block",
        config: {},
        inputs: {},
      },
    ],
  };

  const ctx = createTestContext();
  const result = await engine.executeChain(chain, ctx);

  assertEquals(result.success, false, "Should fail for unknown block type");

  console.log("✓ Unknown block type handling works");
});

Deno.test("Execution Engine - Block Context Data", async () => {
  const registry = new BlockRegistry();

  let capturedContext: unknown = null;

  const contextCaptureHandler: BlockHandler = (ctx, _config) => {
    capturedContext = ctx;
    return Promise.resolve({ success: true });
  };

  const blockDef: BlockDefinition = {
    id: "context-test",
    type: "context-block",
    config: {},
    inputs: [],
    outputs: [],
  };

  registry.register("context-block", blockDef, contextCaptureHandler);
  const engine = new BlockExecutionEngine(registry);

  const chain: BlockChain = {
    id: "test-chain",
    blocks: [
      {
        id: "test",
        blockType: "context-block",
        config: {},
        inputs: {},
      },
    ],
  };

  const ctx = createTestContext(
    { userId: "123" },
    { API_KEY: "secret" }
  );
  await engine.executeChain(chain, ctx);

  assertEquals(capturedContext !== null, true, "Context should be captured");
  const capturedCtx = capturedContext as Record<string, unknown>;
  assertEquals(
    (capturedCtx.params as Record<string, unknown>).userId,
    "123",
    "Should have params"
  );
  assertEquals(
    (capturedCtx.env as Record<string, unknown>).API_KEY,
    "secret",
    "Should have env"
  );

  console.log("✓ Block context data is correct");
});
