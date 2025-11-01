// HTTP Block Tests
// Validates HTTP block operations

import { assertEquals } from "std/assert/mod.ts";
import { httpBlockDefinition, httpBlockHandler } from "../core/blocks/http-block.ts";
import { BlockConfig } from "../core/types.ts";

Deno.test("HTTP Block - Definition", () => {
  assertEquals(httpBlockDefinition.type, "http", "Should have http type");
  assertEquals(
    httpBlockDefinition.functions?.includes("GET"),
    true,
    "Should support GET"
  );
  assertEquals(
    httpBlockDefinition.functions?.includes("POST"),
    true,
    "Should support POST"
  );
  assertEquals(
    httpBlockDefinition.functions?.includes("PUT"),
    true,
    "Should support PUT"
  );
  assertEquals(
    httpBlockDefinition.functions?.includes("PATCH"),
    true,
    "Should support PATCH"
  );
  assertEquals(
    httpBlockDefinition.functions?.includes("DELETE"),
    true,
    "Should support DELETE"
  );

  console.log("✓ HTTP block definition is correct");
});

Deno.test("HTTP Block - GET Request", async () => {
  const config: BlockConfig = {
    method: "GET",
    baseUrl: "https://jsonplaceholder.typicode.com",
  };

  const result = await httpBlockHandler(
    {
      inputs: { method: "GET", path: "/posts/1" },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "http1",
      blockType: "http",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(result.ok, true, "GET should succeed");
  assertEquals(typeof result.status, "number", "Should return status code");
  assertEquals(result.data !== undefined, true, "Should return data");

  console.log("✓ GET request works");
});

Deno.test("HTTP Block - POST Request", async () => {
  const config: BlockConfig = {
    method: "POST",
    baseUrl: "https://jsonplaceholder.typicode.com",
  };

  const result = await httpBlockHandler(
    {
      inputs: {
        method: "POST",
        path: "/posts",
        data: { title: "Test", body: "Test body", userId: 1 },
      },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "http1",
      blockType: "http",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(result.ok, true, "POST should succeed");
  assertEquals(typeof result.status, "number", "Should return status code");

  console.log("✓ POST request works");
});

Deno.test("HTTP Block - Request with Headers", async () => {
  const config: BlockConfig = {
    method: "GET",
    baseUrl: "https://httpbin.org",
    headers: {
      "X-Custom-Header": "test-value",
    },
  };

  const result = await httpBlockHandler(
    {
      inputs: {
        method: "GET",
        path: "/headers",
        headers: { "X-Another-Header": "another-value" },
      },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "http1",
      blockType: "http",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(result.ok, true, "Request with headers should succeed");

  console.log("✓ Request with headers works");
});

Deno.test("HTTP Block - Request with Query Parameters", async () => {
  const config: BlockConfig = {
    method: "GET",
    baseUrl: "https://httpbin.org",
  };

  const result = await httpBlockHandler(
    {
      inputs: {
        method: "GET",
        path: "/get",
        params: { foo: "bar", test: "value" },
      },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "http1",
      blockType: "http",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(result.ok, true, "Request with params should succeed");

  console.log("✓ Request with query parameters works");
});

Deno.test("HTTP Block - Invalid URL Handling", async () => {
  const config: BlockConfig = {
    method: "GET",
    baseUrl: "http://invalid.hostname.test.local",
  };

  const result = await httpBlockHandler(
    {
      inputs: { method: "GET", path: "/test" },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "http1",
      blockType: "http",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(result.ok, false, "Should handle invalid URL gracefully");
  assertEquals(result.error !== undefined, true, "Should include error");

  console.log("✓ Invalid URL handling works");
});

Deno.test("HTTP Block - Response Extraction", async () => {
  const config: BlockConfig = {
    method: "GET",
    baseUrl: "https://jsonplaceholder.typicode.com",
  };

  const result = await httpBlockHandler(
    {
      inputs: { method: "GET", path: "/posts/1" },
      env: {},
      params: {},
      blockOutputs: {},
      blockId: "http1",
      blockType: "http",
      chainId: "chain1",
      currentBlockIndex: 0,
      totalBlocks: 1,
      executedAt: new Date(),
    },
    config
  );

  assertEquals(
    typeof (result.status as number) === "number" && (result.status as number) >= 200 && (result.status as number) < 300,
    true,
    "Should have 2xx status"
  );
  assertEquals(
    typeof result.data === "object",
    true,
    "Should parse JSON response"
  );
  assertEquals(
    typeof result.headers === "object",
    true,
    "Should include headers"
  );

  console.log("✓ Response extraction works");
});
