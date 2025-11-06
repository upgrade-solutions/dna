# @dna/core

DNA Core Library - Runtime utilities for working with DNA schemas in TypeScript/Deno.

## Overview

`@dna/core` provides a modular interface for loading and validating DNA schemas. It's built with Deno and can be used in any TypeScript/Deno project.

## Installation

```bash
# Add to your deno.json
{
  "imports": {
    "@dna/core": "file://./path/to/packages/libraries/typescript/core/mod.ts"
  }
}
```

## Usage

### Loading Schemas

```typescript
import { loadSchema, loadSchemas } from "@dna/core/schemas/loader";

// Load a single schema
const taskSchema = await loadSchema("task");

// Load from a specific category
const taskSchema = await loadSchema("task", "core");

// Load multiple schemas at once
const schemas = await loadSchemas(["task", "actor", "operation"]);

// Get schema metadata
const { title, description } = await loadSchema("task");
```

### Validating Data

```typescript
import { validateSchema, assertValid } from "@dna/core/schemas/validator";
import { loadSchema } from "@dna/core/schemas/loader";

const schema = await loadSchema("task");
const data = { /* your data */ };

// Validate and get detailed errors
const result = validateSchema(data, schema);
if (!result.valid) {
  console.error("Validation failed:", result.errors);
}

// Assert validation - throws on failure
try {
  assertValid(data, schema, "task data");
} catch (error) {
  console.error(error.message);
}
```

## Module Structure

### `@dna/core`
Re-exports all functionality from the schemas module.

```typescript
import * from "@dna/core";
```

### `@dna/core/schemas`
Main schemas module. Re-exports loader and validator functions.

```typescript
import {
  loadSchema,
  loadSchemas,
  validateSchema,
  assertValid,
} from "@dna/core/schemas";
```

### `@dna/core/schemas/loader`
Schema loading utilities.

```typescript
import {
  loadSchema,
  loadSchemas,
  getSchemaMetadata,
} from "@dna/core/schemas/loader";
```

**Functions:**
- `loadSchema(schemaName, category?)` - Load a single schema
- `loadSchemas(schemaNames, category?)` - Load multiple schemas
- `getSchemaMetadata(schemaName, category?)` - Get title and description

### `@dna/core/schemas/validator`
Schema validation utilities.

```typescript
import {
  validateSchema,
  assertValid,
} from "@dna/core/schemas/validator";
```

**Functions:**
- `validateSchema(value, schema)` - Validate and return detailed errors
- `assertValid(value, schema, context?)` - Validate and throw on failure

**Types:**
- `ValidationError` - Individual validation error
- `ValidationResult` - Result of validation with errors array

## Schema Categories

By default, schemas are loaded from the `core` category:

```typescript
await loadSchema("task");           // loads core/task.json
await loadSchema("task", "core");   // explicit
```

Other available categories can be found in `/packages/schemas/`:
- `core` - Core DNA entities
- `platform` - Platform-specific schemas
- `product` - Product schemas
- `project` - Project schemas
- `value` - Value schemas

```typescript
await loadSchema("some-schema", "platform");
```

## Development

### Running with Deno

```bash
# Check TypeScript
deno check mod.ts

# Run in watch mode
deno run --watch --allow-read mod.ts
```

### Testing

Tests should be run from the root workspace.

## Related

- **Engine**: [`@dna/engine`](../engine/) - Build-time utilities for generating docs and types
- **Schemas**: [`/packages/schemas/`](/packages/schemas/) - Raw JSON schema definitions
