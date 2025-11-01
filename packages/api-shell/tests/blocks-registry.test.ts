// Block Registry Tests
// Validates block registration, lookup, and discovery

import { assertEquals } from "std/assert/mod.ts";
import { BlockRegistry } from "../core/blocks/block-registry.ts";
import { BlockDefinition, BlockHandler } from "../core/types.ts";

// Create test block definitions
const testDatabaseBlockDef: BlockDefinition = {
  id: "test-database",
  type: "database",
  description: "Test database block",
  config: {},
  inputs: [{ name: "table", type: "string", required: true }],
  outputs: [{ name: "rows", type: "array" }],
};

const testHttpBlockDef: BlockDefinition = {
  id: "test-http",
  type: "http",
  description: "Test HTTP block",
  config: {},
  inputs: [{ name: "method", type: "string", required: true }],
  outputs: [{ name: "data", type: "object" }],
};

// Create test handlers
const testDatabaseHandler: BlockHandler = () => {
  return Promise.resolve({ rows: [], success: true });
};

const testHttpHandler: BlockHandler = () => {
  return Promise.resolve({ data: {}, status: 200 });
};

Deno.test("Block Registry - Register and Retrieve Block", () => {
  const registry = new BlockRegistry();
  
  registry.register("database", testDatabaseBlockDef, testDatabaseHandler);
  const def = registry.getDefinition("database");
  const handler = registry.getHandler("database");

  assertEquals(def?.id, "test-database", "Should retrieve correct definition");
  assertEquals(handler !== undefined, true, "Should retrieve handler");

  console.log("✓ Block registration and retrieval works");
});

Deno.test("Block Registry - Multiple Block Types", () => {
  const registry = new BlockRegistry();
  
  registry.register("database", testDatabaseBlockDef, testDatabaseHandler);
  registry.register("http", testHttpBlockDef, testHttpHandler);

  assertEquals(registry.has("database"), true, "Should have database block");
  assertEquals(registry.has("http"), true, "Should have http block");
  assertEquals(registry.has("nonexistent"), false, "Should not have nonexistent block");

  console.log("✓ Multiple block types can be registered");
});

Deno.test("Block Registry - List All Blocks", () => {
  const registry = new BlockRegistry();
  
  registry.register("database", testDatabaseBlockDef, testDatabaseHandler);
  registry.register("http", testHttpBlockDef, testHttpHandler);

  const blocks = registry.listBlocks();
  
  assertEquals(blocks.length, 2, "Should list all registered blocks");
  assertEquals(
    blocks.includes("database"),
    true,
    "Should include database block"
  );
  assertEquals(
    blocks.includes("http"),
    true,
    "Should include http block"
  );

  console.log("✓ List all blocks works");
});

Deno.test("Block Registry - List Blocks by Type", () => {
  const registry = new BlockRegistry();
  
  registry.register("database", testDatabaseBlockDef, testDatabaseHandler);
  registry.register("http", testHttpBlockDef, testHttpHandler);

  const dbBlocks = registry.getByType("database");
  const httpBlocks = registry.getByType("http");

  assertEquals(dbBlocks.size, 1, "Should have 1 database block");
  assertEquals(httpBlocks.size, 1, "Should have 1 http block");

  console.log("✓ List blocks by type works");
});

Deno.test("Block Registry - Get Non-existent Block", () => {
  const registry = new BlockRegistry();
  
  const def = registry.getDefinition("nonexistent");
  const handler = registry.getHandler("nonexistent");

  assertEquals(def, undefined, "Should return undefined for nonexistent definition");
  assertEquals(handler, undefined, "Should return undefined for nonexistent handler");

  console.log("✓ Non-existent block returns undefined");
});

Deno.test("Block Registry - Override Block Registration", () => {
  const registry = new BlockRegistry();
  
  registry.register("database", testDatabaseBlockDef, testDatabaseHandler);
  
  const updatedDef: BlockDefinition = {
    ...testDatabaseBlockDef,
    description: "Updated database block",
  };
  
  registry.register("database", updatedDef, testDatabaseHandler);
  const retrieved = registry.getDefinition("database");

  assertEquals(retrieved?.description, "Updated database block", "Should have updated description");

  console.log("✓ Block registration can be overridden");
});

Deno.test("Block Registry - Empty Registry", () => {
  const registry = new BlockRegistry();
  
  const blocks = registry.listBlocks();
  assertEquals(blocks.length, 0, "Should have no blocks initially");
  assertEquals(registry.has("anything"), false, "Should not have any blocks");

  console.log("✓ Empty registry works correctly");
});

Deno.test("Block Registry - Handler Execution", async () => {
  const registry = new BlockRegistry();
  
  let handlerCalled = false;
  const testHandler: BlockHandler = (_ctx, _config) => {
    handlerCalled = true;
    return Promise.resolve({ result: "executed" });
  };
  
  registry.register("test", testDatabaseBlockDef, testHandler);
  const handler = registry.getHandler("test");

  if (handler) {
    await handler(
      {
        inputs: {},
        env: {},
        params: {},
        blockOutputs: {},
        blockId: "test",
        blockType: "test",
        chainId: "chain1",
        currentBlockIndex: 0,
        totalBlocks: 1,
        executedAt: new Date(),
      },
      {}
    );
  }

  assertEquals(handlerCalled, true, "Handler should be called");

  console.log("✓ Handler execution works");
});
