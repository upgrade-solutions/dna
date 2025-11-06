import {
  assertEquals,
  assert,
  assertThrows,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  validateSchema,
  assertValid,
  type ValidationError,
  type ValidationResult,
} from "./validator.ts";

Deno.test("validator - validateSchema", async (t) => {
  await t.step("returns valid=true for valid data", () => {
    const schema = {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
      },
      additionalProperties: false,
    };

    const data = { name: "Test" };
    const result = validateSchema(data, schema);

    assertEquals(result.valid, true);
    assertEquals(result.errors.length, 0);
  });

  await t.step("detects missing required fields", () => {
    const schema = {
      type: "object",
      required: ["name", "email"],
      properties: {
        name: { type: "string" },
        email: { type: "string" },
      },
    };

    const data = { name: "Test" };
    const result = validateSchema(data, schema);

    assertEquals(result.valid, false);
    assertEquals(result.errors.length, 1);
    assertEquals(result.errors[0].path, "email");
    assert(result.errors[0].message.includes("Required field"));
  });

  await t.step("detects type mismatches", () => {
    const schema = {
      type: "object",
    };

    const data = "not an object";
    const result = validateSchema(data, schema);

    assertEquals(result.valid, false);
    assert(result.errors.some((e) => e.message.includes("Expected type")));
  });

  await t.step("detects additional properties when not allowed", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
      additionalProperties: false,
    };

    const data = { name: "Test", extra: "field" };
    const result = validateSchema(data, schema);

    assertEquals(result.valid, false);
    assert(
      result.errors.some((e) =>
        e.message.includes("not allowed") && e.path === "extra"
      ),
    );
  });

  await t.step("allows additional properties when not restricted", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    };

    const data = { name: "Test", extra: "field" };
    const result = validateSchema(data, schema);

    assertEquals(result.valid, true);
  });

  await t.step("handles arrays correctly", () => {
    const schema = {
      type: "array",
    };

    const data: unknown[] = [1, 2, 3];
    const result = validateSchema(data, schema);

    assertEquals(result.valid, true);
  });

  await t.step("detects null values correctly", () => {
    const schema = {
      type: "object",
    };

    const data = null;
    const result = validateSchema(data, schema);

    assertEquals(result.valid, false);
    assert(result.errors.some((e) => e.message.includes("Expected type")));
  });

  await t.step("returns ValidationResult interface", () => {
    const schema = { type: "object" };
    const data = { key: "value" };
    const result = validateSchema(data, schema);

    assertEquals("valid" in result, true);
    assertEquals("errors" in result, true);
    assertEquals(Array.isArray(result.errors), true);
  });
});

Deno.test("validator - assertValid", async (t) => {
  await t.step("does not throw for valid data", () => {
    const schema = {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
      },
    };

    const data = { name: "Test" };

    // Should not throw
    assertValid(data, schema);
  });

  await t.step("throws an error for invalid data", () => {
    const schema = {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
      },
    };

    const data = {};

    assertThrows(() => assertValid(data, schema), Error);
  });

  await t.step("includes context in error message", () => {
    const schema = {
      type: "object",
      required: ["name"],
    };

    const data = {};

    assertThrows(
      () => assertValid(data, schema, "user data"),
      Error,
      "in user data",
    );
  });

  await t.step("includes validation errors in error message", () => {
    const schema = {
      type: "object",
      required: ["name", "email"],
    };

    const data = {};

    assertThrows(() => assertValid(data, schema), Error, "Required field");
  });

  await t.step("works without context parameter", () => {
    const schema = {
      type: "object",
      required: ["id"],
    };

    const data = {};

    assertThrows(() => assertValid(data, schema), Error);
  });
});

Deno.test("validator - type definitions", async (t) => {
  await t.step("ValidationError has correct structure", () => {
    const schema = {
      type: "object",
      required: ["test"],
    };

    const result = validateSchema({}, schema);
    const error = result.errors[0] as ValidationError;

    assertEquals(typeof error.path, "string");
    assertEquals(typeof error.message, "string");
  });

  await t.step("ValidationResult has correct structure", () => {
    const schema = { type: "object" };
    const result = validateSchema({}, schema) as ValidationResult;

    assertEquals(typeof result.valid, "boolean");
    assertEquals(Array.isArray(result.errors), true);
  });
});
