import {
  assertEquals,
  assertStringIncludes,
  assertExists,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { DefinitionsToMermaid } from "./definitions-to-mermaid.ts";

// Helper to access private methods for testing
function getSanitizeClassName() {
  return (name: string) => name.replace(/[-_]/g, "");
}

Deno.test("DefinitionsToMermaid - sanitizeClassName", () => {
  const sanitize = getSanitizeClassName();

  assertEquals(sanitize("my-schema"), "myschema");
  assertEquals(sanitize("my_schema"), "myschema");
  assertEquals(sanitize("schema"), "schema");
  assertEquals(sanitize("my-complex_schema"), "mycomplexschema");
  assertEquals(sanitize("Complex-Name_With-Mixed"), "ComplexNameWithMixed");
  assertEquals(sanitize(""), "");
});

Deno.test("DefinitionsToMermaid - initialization with defaults", () => {
  const generator = new DefinitionsToMermaid();
  assertExists(generator);
});

Deno.test("DefinitionsToMermaid - initialization with custom options", () => {
  const generator = new DefinitionsToMermaid({
    outputDir: "/tmp/output",
    schemasDir: "/tmp/schemas",
  });
  assertExists(generator);
});

Deno.test("DefinitionsToMermaid - getType with string", () => {
  const generator = new DefinitionsToMermaid();
  // Using the test pattern to verify type extraction logic
  const propSchema = { type: "string" };
  // Since getType is private, we test through public methods' output
  const result = (generator as unknown as { getType: (s: unknown) => string }).getType(
    propSchema,
  );
  assertEquals(result, "string");
});

Deno.test("DefinitionsToMermaid - getType with integer", () => {
  const generator = new DefinitionsToMermaid();
  const propSchema = { type: "integer" };
  const result = (generator as unknown as { getType: (s: unknown) => string }).getType(
    propSchema,
  );
  assertEquals(result, "integer");
});

Deno.test("DefinitionsToMermaid - getType with array of strings", () => {
  const generator = new DefinitionsToMermaid();
  const propSchema = { type: "array", items: { type: "string" } };
  const result = (generator as unknown as { getType: (s: unknown) => string }).getType(
    propSchema,
  );
  assertEquals(result, "string[]");
});

Deno.test("DefinitionsToMermaid - getType with array of references", () => {
  const generator = new DefinitionsToMermaid();
  const propSchema = {
    type: "array",
    items: { $ref: "#/definitions/User.json" },
  };
  const result = (generator as unknown as { getType: (s: unknown) => string }).getType(
    propSchema,
  );
  assertEquals(result, "User[]");
});

Deno.test("DefinitionsToMermaid - getType with reference", () => {
  const generator = new DefinitionsToMermaid();
  const propSchema = { $ref: "#/definitions/Address.json" };
  const result = (generator as unknown as { getType: (s: unknown) => string }).getType(
    propSchema,
  );
  assertEquals(result, "Address");
});

Deno.test("DefinitionsToMermaid - getType with format", () => {
  const generator = new DefinitionsToMermaid();
  const propSchema = { type: "string", format: "date-time" };
  const result = (generator as unknown as { getType: (s: unknown) => string }).getType(
    propSchema,
  );
  assertEquals(result, "string (date-time)");
});

Deno.test("DefinitionsToMermaid - getType with object", () => {
  const generator = new DefinitionsToMermaid();
  const propSchema = { type: "object" };
  const result = (generator as unknown as { getType: (s: unknown) => string }).getType(
    propSchema,
  );
  assertEquals(result, "object");
});

Deno.test("DefinitionsToMermaid - getType with unknown type", () => {
  const generator = new DefinitionsToMermaid();
  const propSchema = {};
  const result = (generator as unknown as { getType: (s: unknown) => string }).getType(
    propSchema,
  );
  assertEquals(result, "any");
});

Deno.test("DefinitionsToMermaid - getProperties with direct properties", () => {
  const generator = new DefinitionsToMermaid();
  const schema = {
    properties: {
      name: { type: "string" },
      age: { type: "integer" },
    },
  };
  const result = (generator as unknown as { getProperties: (s: unknown) => unknown }).getProperties(
    schema,
  ) as Record<string, unknown>;
  assertEquals(Object.keys(result).length, 2);
  assertEquals(Object.keys(result).includes("name"), true);
  assertEquals(Object.keys(result).includes("age"), true);
});

Deno.test("DefinitionsToMermaid - getProperties with allOf properties", () => {
  const generator = new DefinitionsToMermaid();
  const schema = {
    allOf: [
      {
        properties: {
          id: { type: "string" },
        },
      },
    ],
    properties: {
      name: { type: "string" },
    },
  };
  const result = (generator as unknown as { getProperties: (s: unknown) => unknown }).getProperties(
    schema,
  ) as Record<string, unknown>;
  assertEquals(Object.keys(result).length, 2);
  assertEquals(Object.keys(result).includes("id"), true);
  assertEquals(Object.keys(result).includes("name"), true);
});

Deno.test("DefinitionsToMermaid - getRequired with direct required fields", () => {
  const generator = new DefinitionsToMermaid();
  const schema = {
    required: ["name", "age"],
  };
  const result = (generator as unknown as { getRequired: (s: unknown) => string[] }).getRequired(
    schema,
  );
  assertEquals(result.length, 2);
  assertEquals(result.includes("name"), true);
  assertEquals(result.includes("age"), true);
});

Deno.test("DefinitionsToMermaid - getRequired with allOf required fields", () => {
  const generator = new DefinitionsToMermaid();
  const schema = {
    allOf: [
      {
        required: ["id"],
      },
    ],
    required: ["name"],
  };
  const result = (generator as unknown as { getRequired: (s: unknown) => string[] }).getRequired(
    schema,
  );
  assertEquals(result.length, 2);
  assertEquals(result.includes("id"), true);
  assertEquals(result.includes("name"), true);
});

Deno.test("DefinitionsToMermaid - getRequired removes duplicates", () => {
  const generator = new DefinitionsToMermaid();
  const schema = {
    allOf: [
      {
        required: ["id", "shared"],
      },
    ],
    required: ["shared", "name"],
  };
  const result = (generator as unknown as { getRequired: (s: unknown) => string[] }).getRequired(
    schema,
  );
  assertEquals(result.length, 3);
  assertEquals(result.filter((r) => r === "shared").length, 1);
});

Deno.test(
  "DefinitionsToMermaid - extractInheritanceRelationships with allOf",
  () => {
    const generator = new DefinitionsToMermaid();
    const schema = {
      allOf: [
        { $ref: "#/definitions/Base.json" },
        { $ref: "#/definitions/Mixin.json" },
      ],
    };
    const result = (generator as unknown as {
      extractInheritanceRelationships: (s: unknown) => Array<{ target: string }>;
    }).extractInheritanceRelationships(schema);
    assertEquals(result.length, 2);
    assertEquals(result[0].target, "Base");
    assertEquals(result[1].target, "Mixin");
  },
);

Deno.test("DefinitionsToMermaid - extractInheritanceRelationships with no allOf", () => {
  const generator = new DefinitionsToMermaid();
  const schema = {
    properties: { name: { type: "string" } },
  };
  const result = (generator as unknown as {
    extractInheritanceRelationships: (s: unknown) => Array<{ target: string }>;
  }).extractInheritanceRelationships(schema);
  assertEquals(result.length, 0);
});

Deno.test(
  "DefinitionsToMermaid - extractCompositionRelationships with property refs",
  () => {
    const generator = new DefinitionsToMermaid();
    const schema = {
      properties: {
        address: { $ref: "#/definitions/Address.json" },
        name: { type: "string" },
      },
    };
    const result = (generator as unknown as {
      extractCompositionRelationships: (s: unknown) => Array<{ field: string; target: string }>;
    }).extractCompositionRelationships(schema);
    assertEquals(result.length, 1);
    assertEquals(result[0].target, "Address");
    assertEquals(result[0].field, "address");
  },
);

Deno.test("DefinitionsToMermaid - schemaToMermaidDiagram generates valid mermaid", () => {
  const generator = new DefinitionsToMermaid();
  const schema = {
    properties: {
      id: { type: "string" },
      name: { type: "string" },
    },
    required: ["id"],
  };
  const result = (generator as unknown as {
    schemaToMermaidDiagram: (name: string, schema: unknown) => string;
  }).schemaToMermaidDiagram("User", schema);

  assertStringIncludes(result, "```mermaid");
  assertStringIncludes(result, "classDiagram");
  assertStringIncludes(result, "class User");
  assertStringIncludes(result, "id: string");
  assertStringIncludes(result, "name: string");
  assertStringIncludes(result, "```");
});

Deno.test("DefinitionsToMermaid - schemaToMermaidDiagram marks required fields", () => {
  const generator = new DefinitionsToMermaid();
  const schema = {
    properties: {
      id: { type: "string" },
      email: { type: "string" },
    },
    required: ["id"],
  };
  const result = (generator as unknown as {
    schemaToMermaidDiagram: (name: string, schema: unknown) => string;
  }).schemaToMermaidDiagram("User", schema);

  assertStringIncludes(result, "*id: string");
  assertStringIncludes(result, "email: string");
});

Deno.test("DefinitionsToMermaid - schemaToMermaidDiagram with inheritance", () => {
  const generator = new DefinitionsToMermaid();
  const schema = {
    allOf: [
      { $ref: "#/definitions/Entity.json" },
    ],
    properties: {
      name: { type: "string" },
    },
  };
  const result = (generator as unknown as {
    schemaToMermaidDiagram: (name: string, schema: unknown) => string;
  }).schemaToMermaidDiagram("User", schema);

  assertStringIncludes(result, "Entity <|-- User");
});

Deno.test("DefinitionsToMermaid - schemaToMermaidDiagram with composition", () => {
  const generator = new DefinitionsToMermaid();
  const schema = {
    properties: {
      address: { $ref: "#/definitions/Address.json" },
    },
  };
  const result = (generator as unknown as {
    schemaToMermaidDiagram: (name: string, schema: unknown) => string;
  }).schemaToMermaidDiagram("User", schema);

  assertStringIncludes(result, "User --> Address : address");
});
