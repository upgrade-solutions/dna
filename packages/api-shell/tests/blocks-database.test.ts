// Database Block Tests
// Validates database block operations

import { assertEquals } from "std/assert/mod.ts";
import { databaseBlockDefinition, databaseBlockHandler } from "../core/blocks/database-block.ts";
import { BlockConfig } from "../core/types.ts";

Deno.test("Database Block - Definition", () => {
  assertEquals(databaseBlockDefinition.type, "database", "Should have database type");
  assertEquals(
    databaseBlockDefinition.functions?.includes("select"),
    true,
    "Should support select"
  );
  assertEquals(
    databaseBlockDefinition.functions?.includes("insert"),
    true,
    "Should support insert"
  );
  assertEquals(
    databaseBlockDefinition.functions?.includes("update"),
    true,
    "Should support update"
  );
  assertEquals(
    databaseBlockDefinition.functions?.includes("delete"),
    true,
    "Should support delete"
  );

  console.log("✓ Database block definition is correct");
});

Deno.test("Database Block - Select Operation", async () => {
  const config: BlockConfig = {
    function: "select",
    table: "users",
  };

  const result = await databaseBlockHandler(
    {
      inputs: { where: { id: "1" } },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "db1",
      blockType: "database",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(result.success, true, "Select should succeed");
  assertEquals(Array.isArray(result.rows), true, "Should return rows array");

  console.log("✓ Select operation works");
});

Deno.test("Database Block - Insert Operation", async () => {
  const config: BlockConfig = {
    function: "insert",
    table: "users",
  };

  const result = await databaseBlockHandler(
    {
      inputs: { data: { name: "John", email: "john@example.com" } },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "db1",
      blockType: "database",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(result.success, true, "Insert should succeed");
  assertEquals(result.id !== undefined, true, "Should return inserted ID");

  console.log("✓ Insert operation works");
});

Deno.test("Database Block - Update Operation", async () => {
  const config: BlockConfig = {
    function: "update",
    table: "users",
  };

  const result = await databaseBlockHandler(
    {
      inputs: { where: { id: "1" }, data: { name: "Jane" } },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "db1",
      blockType: "database",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(result.success, true, "Update should succeed");
  assertEquals(typeof result.count, "number", "Should return count");

  console.log("✓ Update operation works");
});

Deno.test("Database Block - Delete Operation", async () => {
  const config: BlockConfig = {
    function: "delete",
    table: "users",
  };

  const result = await databaseBlockHandler(
    {
      inputs: { where: { id: "1" } },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "db1",
      blockType: "database",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(result.success, true, "Delete should succeed");
  assertEquals(typeof result.count, "number", "Should return count");

  console.log("✓ Delete operation works");
});

Deno.test("Database Block - Query Operation", async () => {
  const config: BlockConfig = {
    function: "query",
    query: "SELECT * FROM users WHERE id = $1",
  };

  const result = await databaseBlockHandler(
    {
      inputs: { params: ["1"] },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "db1",
      blockType: "database",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(result.success, true, "Query should succeed");
  assertEquals(Array.isArray(result.rows), true, "Should return rows array");

  console.log("✓ Query operation works");
});
