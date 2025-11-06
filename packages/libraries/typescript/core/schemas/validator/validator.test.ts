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
    assert(result.errors.length > 0);
    assert(
      result.errors.some((e) =>
        e.message.toLowerCase().includes("email")
      ),
    );
  });

  await t.step("detects type mismatches", () => {
    const schema = {
      type: "object",
    };

    const data = "not an object";
    const result = validateSchema(data, schema);

    assertEquals(result.valid, false);
    assert(result.errors.some((e) => e.message.toLowerCase().includes("type")));
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
        e.message.toLowerCase().includes("not allowed") ||
        e.message.toLowerCase().includes("additional")
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
    assert(result.errors.some((e) => e.message.toLowerCase().includes("type")));
  });

  await t.step("returns ValidationResult interface", () => {
    const schema = { type: "object" };
    const data = { key: "value" };
    const result = validateSchema(data, schema);

    assertEquals("valid" in result, true);
    assertEquals("errors" in result, true);
    assertEquals(Array.isArray(result.errors), true);
  });

  await t.step("validates enum constraints", () => {
    const schema = {
      type: "object",
      properties: {
        status: { enum: ["active", "inactive", "pending"] },
      },
    };

    const result = validateSchema({ status: "invalid" }, schema);
    assertEquals(result.valid, false);
  });

  await t.step("validates string pattern constraints", () => {
    const schema = {
      type: "object",
      properties: {
        email: { type: "string", pattern: "^[^@]+@[^@]+$" },
      },
    };

    const result = validateSchema({ email: "not-an-email" }, schema);
    assertEquals(result.valid, false);
  });

  await t.step("validates minLength/maxLength constraints", () => {
    const schema = {
      type: "object",
      properties: {
        code: { type: "string", minLength: 3, maxLength: 5 },
      },
    };

    let result = validateSchema({ code: "ab" }, schema);
    assertEquals(result.valid, false);

    result = validateSchema({ code: "abcdef" }, schema);
    assertEquals(result.valid, false);

    result = validateSchema({ code: "abc" }, schema);
    assertEquals(result.valid, true);
  });

  await t.step("validates numeric constraints", () => {
    const schema = {
      type: "object",
      properties: {
        age: { type: "number", minimum: 0, maximum: 120 },
      },
    };

    let result = validateSchema({ age: -1 }, schema);
    assertEquals(result.valid, false);

    result = validateSchema({ age: 150 }, schema);
    assertEquals(result.valid, false);

    result = validateSchema({ age: 25 }, schema);
    assertEquals(result.valid, true);
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

    assertThrows(() => assertValid(data, schema), Error);
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

Deno.test("validator - nested object validation", async (t) => {
  await t.step("validates nested objects", () => {
    const schema = {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name"],
        },
      },
    };

    let result = validateSchema({ user: { name: "John", age: 30 } }, schema);
    assertEquals(result.valid, true);

    result = validateSchema({ user: { age: 30 } }, schema);
    assertEquals(result.valid, false);
  });
});

Deno.test("validator - array validation", async (t) => {
  await t.step("validates array items", () => {
    const schema = {
      type: "array",
      items: { type: "string" },
    };

    let result = validateSchema(["a", "b", "c"], schema);
    assertEquals(result.valid, true);

    result = validateSchema(["a", 123, "c"], schema);
    assertEquals(result.valid, false);
  });
});
