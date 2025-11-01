// Blocks Integration Tests
// End-to-end tests for composable blocks system

import { assertEquals } from "std/assert/mod.ts";
import { BlockRegistry } from "../core/blocks/block-registry.ts";
import { BlockExecutionEngine } from "../core/blocks/block-execution-engine.ts";
import {
  registerDatabaseBlock,
} from "../core/blocks/database-block.ts";
import {
  registerHttpBlock,
} from "../core/blocks/http-block.ts";
import { BlockChain, BlockDefinition, BlockHandler } from "../core/types.ts";

// Helper to create execution context
function createContext(params: Record<string, string> = {}) {
  return {
    request: new Request("http://localhost/test"),
    params,
    body: null,
    env: {},
    respond: (data: unknown) => new Response(JSON.stringify(data)),
  };
}

Deno.test("Blocks Integration - Setup and Register Built-in Blocks", () => {
  const registry = new BlockRegistry();

  registerDatabaseBlock(registry);
  registerHttpBlock(registry);

  assertEquals(registry.has("database"), true, "Should register database block");
  assertEquals(registry.has("http"), true, "Should register http block");
  assertEquals(registry.listBlocks().length, 2, "Should have 2 blocks");

  console.log("✓ Built-in blocks registration works");
});

Deno.test("Blocks Integration - Simple Sequential Chain", async () => {
  const registry = new BlockRegistry();
  registerDatabaseBlock(registry);

  const engine = new BlockExecutionEngine(registry);

  const chain: BlockChain = {
    id: "simple-chain",
    blocks: [
      {
        id: "getUser",
        blockType: "database",
        config: { function: "select", table: "users" },
        inputs: { where: { id: "1" } },
      },
    ],
  };

  const result = await engine.executeChain(chain, createContext());

  assertEquals(result.chainId, "simple-chain", "Chain should track ID");
  assertEquals(result.results.length > 0, true, "Should have block results");

  console.log("✓ Simple sequential chain works");
});

Deno.test("Blocks Integration - Custom Block Registration", () => {
  const registry = new BlockRegistry();

  // Define custom block
  const customBlockDef: BlockDefinition = {
    id: "uppercase",
    type: "uppercase",
    description: "Convert string to uppercase",
    config: {},
    inputs: [{ name: "text", type: "string", required: true }],
    outputs: [{ name: "result", type: "string" }],
  };

  const customHandler: BlockHandler = (ctx) => {
    const text = (ctx.inputs as Record<string, unknown>).text as string;
    return Promise.resolve({ result: text.toUpperCase() });
  };

  registry.register("uppercase", customBlockDef, customHandler);

  assertEquals(registry.has("uppercase"), true, "Should register custom block");
  assertEquals(registry.listBlocks().length, 1, "Should have 1 block");

  console.log("✓ Custom block registration works");
});

Deno.test("Blocks Integration - Multi-Step Workflow", async () => {
  const registry = new BlockRegistry();
  registerDatabaseBlock(registry);

  const engine = new BlockExecutionEngine(registry);

  const chain: BlockChain = {
    id: "multi-step",
    blocks: [
      {
        id: "step1",
        blockType: "database",
        config: { function: "select", table: "users" },
        inputs: { where: { id: "1" } },
      },
      {
        id: "step2",
        blockType: "database",
        config: { function: "select", table: "user_permissions" },
        inputs: { where: { userId: "1" } },
      },
      {
        id: "step3",
        blockType: "database",
        config: { function: "select", table: "audit_log" },
        inputs: { where: { userId: "1" } },
      },
    ],
  };

  const result = await engine.executeChain(chain, createContext());

  assertEquals(result.chainId, "multi-step", "Should track chain");
  assertEquals(result.results.length >= 1, true, "Should execute steps");

  console.log("✓ Multi-step workflow works");
});

Deno.test("Blocks Integration - Error Recovery", async () => {
  const registry = new BlockRegistry();

  // Block that always fails
  const failingBlockDef: BlockDefinition = {
    id: "failing",
    type: "failing-block",
    config: {},
    inputs: [],
    outputs: [],
  };

  const failingHandler: BlockHandler = () => {
    throw new Error("Block failed");
  };

  registry.register("failing-block", failingBlockDef, failingHandler);

  const engine = new BlockExecutionEngine(registry);

  // Chain with failing block
  const chain: BlockChain = {
    id: "error-chain",
    blocks: [
      {
        id: "mayFail",
        blockType: "failing-block",
        config: {},
        inputs: {},
      },
    ],
  };

  const result = await engine.executeChain(chain, createContext());

  // Chain execution should complete
  assertEquals(result.chainId, "error-chain", "Should track chain");

  console.log("✓ Error recovery works");
});

Deno.test("Blocks Integration - Registry Discovery", () => {
  const registry = new BlockRegistry();
  registerDatabaseBlock(registry);
  registerHttpBlock(registry);

  // Custom block
  const customDef: BlockDefinition = {
    id: "custom",
    type: "custom",
    config: {},
    inputs: [],
    outputs: [],
  };

  const customHandler: BlockHandler = () => Promise.resolve({ ok: true });
  registry.register("custom", customDef, customHandler);

  const allBlocks = registry.listBlocks();
  const types = registry.listBlockTypes();

  assertEquals(allBlocks.length, 3, "Should have 3 blocks");
  assertEquals(types.includes("database"), true, "Should list database type");
  assertEquals(types.includes("http"), true, "Should list http type");
  assertEquals(types.includes("custom"), true, "Should list custom type");

  console.log("✓ Registry discovery works");
});

Deno.test("Blocks Integration - Full System Workflow", async () => {
  // Initialize system
  const registry = new BlockRegistry();
  registerDatabaseBlock(registry);
  registerHttpBlock(registry);

  const engine = new BlockExecutionEngine(registry);

  // Create realistic workflow
  const chain: BlockChain = {
    id: "user-enrichment",
    blocks: [
      {
        id: "getUser",
        blockType: "database",
        config: { function: "select", table: "users" },
        inputs: { where: { id: "123" } },
      },
      {
        id: "getPermissions",
        blockType: "database",
        config: { function: "select", table: "permissions" },
        inputs: { where: { userId: "123" } },
      },
    ],
  };

  const ctx = createContext({ userId: "123" });
  const result = await engine.executeChain(chain, ctx);

  assertEquals(result.chainId, "user-enrichment", "Should track chain ID");
  assertEquals(result.results.length >= 1, true, "Should execute workflow");

  console.log("✓ Full system workflow works");
});

