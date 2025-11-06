# @dna/core

DNA Core Library - Runtime utilities for working with DNA schemas in TypeScript/Deno.

## Overview

`@dna/core` provides pre-loaded DNA schemas and validation utilities. It's built with Deno and can be used in any TypeScript/Deno project.

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

### Accessing Schemas

```typescript
import { schemas } from "@dna/core/schemas";

// Access pre-loaded schemas
const taskSchema = schemas.task;
const actionSchema = schemas.action;
const apiSchema = schemas.api;
```

### Validating Data

```typescript
import { validateSchema, assertValid } from "@dna/core/schemas";
import { schemas } from "@dna/core/schemas";

const data = { /* your data */ };

// Validate and get detailed errors
const result = validateSchema(data, schemas.task);
if (!result.valid) {
  console.error("Validation failed:", result.errors);
}

// Assert validation - throws on failure
try {
  assertValid(data, schemas.task, "task data");
} catch (error) {
  console.error(error.message);
}

// Validate against any schema (not just DNA schemas)
const customSchema = { type: "object", properties: { ... } };
validateSchema(data, customSchema);
```

## Module Structure

### `@dna/core`
Re-exports all functionality from the schemas module.

```typescript
import * from "@dna/core";
```

### `@dna/core/schemas`
Main schemas module with pre-loaded DNA schemas and validator.

```typescript
import {
  schemas,
  validateSchema,
  assertValid,
  type SchemaName,
} from "@dna/core/schemas";
```

**Exports:**
- `schemas` - Object containing all pre-loaded DNA schemas
- `SchemaName` - TypeScript type for schema names
- `validateSchema(value, schema)` - Validate and return detailed errors
- `assertValid(value, schema, context?)` - Validate and throw on failure

### `@dna/core/schemas/validator`
Schema validation utilities (also exported from main schemas module).

```typescript
import {
  validateSchema,
  assertValid,
} from "@dna/core/schemas/validator";

export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

## Available Schemas

Pre-loaded schemas organized by category:

**Core**
- `schemas.action` - Action definition
- `schemas.actor` - Actor definition
- `schemas.attribute` - Attribute definition
- `schemas.operation` - Operation definition
- `schemas.resource` - Resource definition
- `schemas.task` - Task definition

**Platform**
- `schemas.platform` - Platform definition
- `schemas.application` - Application definition
- `schemas.api` - API definition
- `schemas.endpoint` - API endpoint
- `schemas.payload` - API payload
- `schemas.authContext` - Authentication context
- `schemas.ui` - UI definition
- `schemas.component` - UI component
- `schemas.flow` - UI flow
- `schemas.layout` - UI layout
- `schemas.page` - UI page

**Value**
- `schemas.metric` - Metric definition
- `schemas.opportunity` - Opportunity definition
- `schemas.outcome` - Outcome definition

## Development

### Running with Deno

```bash
# Check TypeScript
deno check mod.ts

# Run in watch mode
deno run --watch --allow-read mod.ts
```

### Testing

```bash
deno task test
```

## Schema Files

Raw JSON schema definitions are located in:
- `./schemas/json/` - Pre-loaded schema files bundled with this library

## Related

- **API Shell**: [`packages/api-shell/`](../../api-shell/) - REST API framework using DNA schemas
