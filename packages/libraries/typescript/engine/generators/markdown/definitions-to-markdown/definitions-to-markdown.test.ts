import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { DefinitionsToMarkdown } from "./definitions-to-markdown.ts";
import type { DefinitionsToMarkdownOptions } from "./definitions-to-markdown.ts";
import type { SchemaDefinition } from "../../../schema-registry.ts";

// Helper function to mock registry loadDefinition
function mockRegistryLoadDefinition(
  generator: DefinitionsToMarkdown,
  schema: SchemaDefinition,
): void {
  const generatorAsRecord = generator as unknown as Record<string, unknown>;
  const registryAsRecord = generatorAsRecord.registry as Record<string, unknown>;
  registryAsRecord.loadDefinition = () => Promise.resolve(schema);
}

// Test fixtures
const mockSchema: SchemaDefinition = {
  title: "User",
  description: "A user in the system",
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Unique user identifier",
    },
    name: {
      type: "string",
      description: "User's full name",
      minLength: 1,
      maxLength: 255,
    },
    email: {
      type: "string",
      format: "email",
      description: "User's email address",
    },
    age: {
      type: "integer",
      description: "User's age",
      minimum: 0,
      maximum: 150,
    },
    tags: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Tags associated with user",
      minItems: 0,
    },
    role: {
      type: "string",
      enum: ["admin", "user", "guest"],
      description: "User's role",
    },
    profile: {
      $ref: "profile.json",
      description: "User's profile information",
    },
  },
  required: ["id", "email"],
  examples: [
    {
      name: "Standard User",
      id: "user-123",
      userName: "John Doe",
      email: "john@example.com",
      age: 30,
      role: "user",
    },
  ],
};

const mockSchemaWithAllOf = {
  title: "Admin",
  description: "An admin user",
  allOf: [
    {
      $ref: "user.json",
      description: "Extends User",
    },
    {
      type: "object",
      properties: {
        permissions: {
          type: "array",
          items: { type: "string" },
          description: "Admin permissions",
        },
      },
    },
  ],
};

const mockSchemaWithRelationships = {
  title: "Post",
  description: "A blog post",
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    author: {
      $ref: "user.json",
      description: "Post author",
    },
    comments: {
      type: "array",
      items: { $ref: "comment.json" },
      description: "Post comments",
    },
  },
};

Deno.test("DefinitionsToMarkdown - generates markdown with title", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchema);

  const markdown = await generator.generateSchemaMarkdown("user", "core");

  assertStringIncludes(markdown, "# User");
  assertStringIncludes(markdown, "A user in the system");
});

Deno.test("DefinitionsToMarkdown - generates properties table", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchema);

  const markdown = await generator.generateSchemaMarkdown("user", "core");

  assertStringIncludes(markdown, "## Properties");
  assertStringIncludes(markdown, "| Property | Type | Constraints | Required | Description |");
  assertStringIncludes(markdown, "`id`");
  assertStringIncludes(markdown, "`email`");
  assertStringIncludes(markdown, "`name`");
});

Deno.test("DefinitionsToMarkdown - marks required fields", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchema);

  const markdown = await generator.generateSchemaMarkdown("user", "core");

  // Required fields should have ✓
  const lines = markdown.split("\n");
  const emailLine = lines.find((l) => l.includes("`email`"));
  const idLine = lines.find((l) => l.includes("`id`"));

  assertEquals(emailLine?.includes("✓"), true);
  assertEquals(idLine?.includes("✓"), true);
});

Deno.test("DefinitionsToMarkdown - displays property constraints", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchema);

  const markdown = await generator.generateSchemaMarkdown("user", "core");

  assertStringIncludes(markdown, "minLength: 1");
  assertStringIncludes(markdown, "maxLength: 255");
  assertStringIncludes(markdown, "min: 0");
  assertStringIncludes(markdown, "max: 150");
  assertStringIncludes(markdown, "enum: `admin`, `user`, `guest`");
});

Deno.test("DefinitionsToMarkdown - displays enum values", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchema);

  const markdown = await generator.generateSchemaMarkdown("user", "core");

  assertStringIncludes(markdown, "enum: `admin`, `user`, `guest`");
});

Deno.test("DefinitionsToMarkdown - displays type formats", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchema);

  const markdown = await generator.generateSchemaMarkdown("user", "core");

  assertStringIncludes(markdown, "string (email)");
});

Deno.test("DefinitionsToMarkdown - handles array types", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchema);

  const markdown = await generator.generateSchemaMarkdown("user", "core");

  assertStringIncludes(markdown, "string[]");
});

Deno.test("DefinitionsToMarkdown - extracts and displays relationships", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchemaWithRelationships);

  const markdown = await generator.generateSchemaMarkdown("post", "core");

  assertStringIncludes(markdown, "## Relationships");
  assertStringIncludes(markdown, "`author`");
  assertStringIncludes(markdown, "`user`");
  // Note: comments array items reference is not extracted to relationships,
  // but the type is displayed in the properties table as comment[]
  assertStringIncludes(markdown, "comment[]");
});

Deno.test("DefinitionsToMarkdown - includes examples when enabled", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: true,
  });

  mockRegistryLoadDefinition(generator, mockSchema);

  const markdown = await generator.generateSchemaMarkdown("user", "core");

  assertStringIncludes(markdown, "## Examples");
  assertStringIncludes(markdown, "Standard User");
  assertStringIncludes(markdown, "john@example.com");
});

Deno.test("DefinitionsToMarkdown - excludes examples when disabled", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchema);

  const markdown = await generator.generateSchemaMarkdown("user", "core");

  assertEquals(markdown.includes("## Examples"), false);
  assertEquals(markdown.includes("Standard User"), false);
});

Deno.test("DefinitionsToMarkdown - handles allOf inheritance", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchemaWithAllOf);

  const markdown = await generator.generateSchemaMarkdown("admin", "core");

  assertStringIncludes(markdown, "# Admin");
  assertStringIncludes(markdown, "## Relationships");
  assertStringIncludes(markdown, "inherits");
  assertStringIncludes(markdown, "`user`");
});

Deno.test("DefinitionsToMarkdown - handles schemas without properties", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  const simpleSchema: SchemaDefinition = {
    title: "SimpleType",
    description: "A simple type",
    type: "string",
  };

  mockRegistryLoadDefinition(generator, simpleSchema);

  const markdown = await generator.generateSchemaMarkdown("simple", "core");

  assertStringIncludes(markdown, "# SimpleType");
  assertStringIncludes(markdown, "A simple type");
  assertEquals(markdown.includes("## Properties"), false);
});

Deno.test("DefinitionsToMarkdown - handles schemas without description", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  const schemaNoDesc: SchemaDefinition = {
    title: "NoDescription",
    type: "object",
    properties: {
      field: { type: "string" },
    },
  };

  mockRegistryLoadDefinition(generator, schemaNoDesc);

  const markdown = await generator.generateSchemaMarkdown("nodesc", "core");

  assertStringIncludes(markdown, "# NoDescription");
  assertEquals(markdown.includes("undefined"), false);
});

Deno.test("DefinitionsToMarkdown - formats reference types from $ref", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchema);

  const markdown = await generator.generateSchemaMarkdown("user", "core");

  assertStringIncludes(markdown, "`profile`");
  assertStringIncludes(markdown, "profile");
});

Deno.test("DefinitionsToMarkdown - handles array of referenced types", async () => {
  const generator = new DefinitionsToMarkdown({
    includeExamples: false,
  });

  mockRegistryLoadDefinition(generator, mockSchemaWithRelationships);

  const markdown = await generator.generateSchemaMarkdown("post", "core");

  assertStringIncludes(markdown, "`comments`");
  assertStringIncludes(markdown, "## Relationships");
});

Deno.test("DefinitionsToMarkdown - constructor accepts options", () => {
  const options: DefinitionsToMarkdownOptions = {
    outputDir: "/custom/output",
    schemasDir: "/custom/schemas",
    includeExamples: false,
  };

  const generator = new DefinitionsToMarkdown(options);
  assertEquals(generator !== null, true);
});

Deno.test("DefinitionsToMarkdown - default options work", () => {
  const generator = new DefinitionsToMarkdown();
  assertEquals(generator !== null, true);
});
