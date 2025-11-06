import { assertEquals, assertRejects } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  loadSchema,
  loadSchemas,
  getSchemaMetadata,
} from "./loader.ts";

Deno.test("loader - loadSchema", async (t) => {
  await t.step("loads a schema from the default 'core' category", async () => {
    const schema = await loadSchema("task");
    assertEquals(typeof schema, "object");
    assertEquals(schema !== null, true);
  });

  await t.step("loads a schema from a specific category", async () => {
    const schema = await loadSchema("task", "core");
    assertEquals(typeof schema, "object");
    assertEquals(schema !== null, true);
  });

  await t.step("throws an error when schema is not found", async () => {
    await assertRejects(
      async () => await loadSchema("nonexistent-schema-12345"),
      Error,
      'Failed to load schema "nonexistent-schema-12345"',
    );
  });

  await t.step("throws an error when category does not exist", async () => {
    await assertRejects(
      async () => await loadSchema("task", "nonexistent-category-xyz"),
      Error,
      'Failed to load schema "task" from category "nonexistent-category-xyz"',
    );
  });
});

Deno.test("loader - loadSchemas", async (t) => {
  await t.step("loads multiple schemas at once", async () => {
    const schemas = await loadSchemas(["task", "actor"]);
    assertEquals(typeof schemas, "object");
    assertEquals(typeof schemas.task, "object");
    assertEquals(typeof schemas.actor, "object");
  });

  await t.step("loads multiple schemas from a specific category", async () => {
    const schemas = await loadSchemas(["task", "actor"], "core");
    assertEquals(typeof schemas, "object");
    assertEquals(typeof schemas.task, "object");
    assertEquals(typeof schemas.actor, "object");
  });

  await t.step("returns an empty object when no schemas are provided", async () => {
    const schemas = await loadSchemas([]);
    assertEquals(schemas, {});
  });

  await t.step("throws when any schema in the batch is not found", async () => {
    await assertRejects(
      async () =>
        await loadSchemas(["task", "nonexistent-schema-xyz"]),
      Error,
    );
  });
});

Deno.test("loader - getSchemaMetadata", async (t) => {
  await t.step("retrieves schema title and description", async () => {
    const metadata = await getSchemaMetadata("task");
    assertEquals(typeof metadata, "object");
    assertEquals("title" in metadata || "description" in metadata, true);
  });

  await t.step(
    "returns an object with title and description properties",
    async () => {
      const metadata = await getSchemaMetadata("task");
      assertEquals(typeof metadata.title, metadata.title ? "string" : "undefined");
      assertEquals(
        typeof metadata.description,
        metadata.description ? "string" : "undefined",
      );
    },
  );

  await t.step("throws an error when schema does not exist", async () => {
    await assertRejects(
      async () => await getSchemaMetadata("nonexistent-xyz"),
      Error,
    );
  });
});
