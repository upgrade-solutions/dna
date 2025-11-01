# Composable Blocks System - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Core Concepts](#core-concepts)
4. [Architecture](#architecture)
5. [Built-in Blocks](#built-in-blocks)
6. [Quick Start](#quick-start)
7. [Data Flow & Templates](#data-flow--templates)
8. [Sequential vs Parallel](#sequential-vs-parallel)
9. [Error Handling](#error-handling)
10. [Response Extraction](#response-extraction)
11. [Integration with DNA](#integration-with-dna)
12. [Creating Custom Blocks](#creating-custom-blocks)
13. [Complete Examples](#complete-examples)
14. [Testing](#testing)
15. [Best Practices](#best-practices)
16. [Troubleshooting](#troubleshooting)
17. [Future Enhancements](#future-enhancements)

---

## Overview

The Composable Blocks system transforms the API Shell into a visual-programming-like environment inspired by Superblocks. Instead of writing handlers, you compose reusable blocks (Database, HTTP, File, Transform, etc.) together to build complex API endpoints and workflows.

**Key Design Principle:** Blocks are the atoms of computation. They abstract external systems (databases, APIs, services) into composable, configurable functions that can be wired together both in OpenAPI specs and in DNA workflow steps.

---

## Design Philosophy

### Goals

1. **Composability** — Chain blocks together; output of one feeds into input of another
2. **Reusability** — Define blocks once, use everywhere
3. **Configuration-Driven** — No code changes to compose blocks; just config
4. **DNA Integration** — Blocks work as step implementations in workflows
5. **Type Safety** — Know block outputs in advance via schema contracts
6. **Testability** — Isolated block testing, mock-friendly
7. **Async/Concurrent** — Support parallel block execution

### Before vs After

**Traditional Handlers (Before):**
```typescript
export async function handleUserEnrichment(ctx: ExecutionContext) {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [ctx.params.id]);
  const permissions = await db.query('SELECT * FROM user_permissions WHERE user_id = ?', [user.id]);
  const auditLog = await fetch(`/audit/users/${user.id}`).then(r => r.json());
  return { ...user, permissions, auditLog };
}
```

**Composable Blocks (After):**
```yaml
x-handler:
  type: blocks
  chain:
    - id: getUser
      type: database
      config:
        function: select
        table: users
      inputs:
        where: { id: "${params.userId}" }
    
    - id: getPermissions
      type: database
      inputs:
        where: { userId: "${blocks.getUser.rows[0].id}" }
      parallel: true
    
    - id: getAuditLog
      type: http
      inputs:
        method: GET
        path: "/audit/users/${params.userId}"
      parallel: true
```

---

## Core Concepts

### 1. Block

A **Block** is a reusable, composable computational unit that:
- Has **inputs** (required parameters)
- Has **outputs** (data it produces)
- Has **configuration** (setup like credentials, connection strings)
- Can connect to external systems or transform data
- Executes within an **execution context**

**Examples:**
- Database block → `select()`, `insert()`, `update()`, `delete()`
- HTTP block → `get()`, `post()`, `put()`, `patch()`, `delete()`
- File block → `read()`, `write()`, `append()`
- Transform block → `map()`, `filter()`, `aggregate()`
- Condition block → `if()`, `switch()`

### 2. Block Chain

A **Block Chain** connects multiple blocks together in a data pipeline:

```
[HTTP GET User] 
    ↓ (outputs: user)
[Database Query Permissions]
    ↓ (outputs: permissions)
[Transform User + Permissions]
    ↓ (outputs: enriched_user)
[HTTP POST Webhook]
```

Data flows sequentially by default. Each block receives:
- Input parameters from config
- Output from previous blocks (via templates)
- Execution context (user, env, etc.)

### 3. Block Definition vs Instance

- **Block Definition** — Reusable blueprint with inputs/outputs schema
- **Block Instance** — Configured instance with ID and specific config

```yaml
# Definition (in components)
components:
  x-blocks:
    mainDb:
      type: database
      config:
        provider: postgres

# Instance (in chain)
blocks:
  - id: getUserData
    ref: '#/components/x-blocks/mainDb'
    config:
      function: select
      table: users
```

### 4. Block Execution Context

Each block receives context containing:

```typescript
{
  inputs: Record<string, unknown>;              // Inputs for this block
  env: Record<string, string>;                  // Environment variables
  user?: unknown;                               // Authenticated user
  params: Record<string, string>;               // URL parameters
  requestBody?: unknown;                        // Original request body
  blockOutputs: Record<string, Record<string, unknown>>; // Previous outputs
  blockId: string;                              // This block's ID
  chainId: string;                              // Parent chain ID
  currentBlockIndex: number;                    // Position in chain
  totalBlocks: number;                          // Chain length
  executedAt: Date;                             // Execution timestamp
}
```

---

## Architecture

### Type System (`core/types.ts`)

```typescript
interface BlockDefinition {
  id: string;                    // Unique identifier
  type: string;                  // "database", "http", etc.
  description?: string;
  config: BlockConfig;           // Provider-specific config
  inputs: BlockInput[];          // Expected inputs with types
  outputs: BlockOutput[];        // Produced outputs with types
  functions?: string[];          // Available functions
  timeout?: number;              // Execution timeout in ms
}

interface BlockInstance {
  id: string;                    // Instance ID (unique in chain)
  blockType: string;             // Type reference
  ref?: string;                  // Reference to definition
  config: Record<string, unknown>; // Instance configuration
  inputs: Record<string, unknown>; // Input mapping and values
  errorHandler?: "fail" | "skip" | "retry" | "fallback";
  parallel?: boolean;            // Run in parallel with others
  timeout?: number;              // Override timeout
  fallback?: unknown;            // Fallback value if fails
}

interface BlockChain {
  id: string;
  blocks: BlockInstance[];
  errorHandling?: { strategy: "fail-fast" | "continue" };
  timeout?: number;              // Total chain timeout
}
```

### Components

1. **Block Registry** (`core/blocks/block-registry.ts`)
   - Central repository for block definitions and handlers
   - Methods: `register()`, `getDefinition()`, `getHandler()`, `listBlocks()`

2. **Execution Engine** (`core/blocks/block-execution-engine.ts`)
   - Orchestrates block chain execution
   - Handles sequential and parallel execution
   - Manages data flow and template substitution
   - Implements error handling and retries

3. **Blocks Handler** (`core/handlers/blocks.ts`)
   - Integrates with existing handler system
   - `handleBlocks()` — Executes block chains
   - `createBlocksHandler()` — Factory for handler creation

---

## Built-in Blocks

### Database Block

Execute database operations: `select`, `insert`, `update`, `delete`, `query`

**Config:**
```yaml
type: database
config:
  provider: postgres  # postgres, mysql, sqlite, mongodb
  connectionString: ${DB_URL}
```

**Example:**
```yaml
blocks:
  - id: getUser
    type: database
    config:
      function: select
      table: users
    inputs:
      where: { id: "${params.userId}" }
      limit: 1
```

**Inputs:**
- `function` (string, required) — Operation: select, insert, update, delete, query
- `table` (string) — Table name
- `where` (object) — Query conditions
- `data` (object) — Data for insert/update
- `limit` (number) — Result limit (default: 100)
- `query` (string) — Raw SQL query
- `params` (array) — Query parameters

**Outputs:**
- `rows` (array) — Query results
- `count` (number) — Affected rows or result count
- `id` (string) — Inserted row ID (for insert)
- `success` (boolean) — Operation success

### HTTP Block

Make HTTP requests: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

**Config:**
```yaml
type: http
config:
  baseUrl: https://api.example.com
  headers:
    Authorization: "Bearer ${API_TOKEN}"
  timeout: 30000
```

**Example:**
```yaml
blocks:
  - id: callApi
    type: http
    config:
      method: post
      path: "/users"
    inputs:
      data:
        name: "${blocks.getUserInput.name}"
        email: "${blocks.getUserInput.email}"
```

**Inputs:**
- `method` (string, required) — HTTP method (GET, POST, PUT, PATCH, DELETE)
- `path` (string, required) — Request path (appended to baseUrl)
- `headers` (object) — Additional headers
- `data` (object) — Request body (for POST, PUT, PATCH)
- `params` (object) — Query parameters

**Outputs:**
- `status` (number) — HTTP status code
- `data` (object) — Response body
- `headers` (object) — Response headers
- `ok` (boolean) — Whether status is 2xx

---

## Quick Start

### 1. Simple Database Query
```yaml
x-handler:
  type: blocks
  chain:
    - id: fetchUser
      type: database
      config:
        function: select
        table: users
      inputs:
        where: { id: "${params.userId}" }
      timeout: 5000
```

### 2. Multi-Block Pipeline
```yaml
x-handler:
  type: blocks
  chain:
    # Step 1: Get user from database
    - id: getUser
      type: database
      config:
        function: select
        table: users
      inputs:
        where: { id: "${params.userId}" }

    # Step 2: Enrich with external API
    - id: enrichUser
      type: http
      config:
        baseUrl: https://enrichment-service
      inputs:
        method: POST
        path: /enrich
        data: "${blocks.getUser.rows[0]}"

  responseKey: blocks.enrichUser.data
```

### 3. Parallel Execution
```yaml
chain:
  - id: getUser
    type: database
    config:
      function: select
      table: users

  # Both run in parallel (after getUser completes)
  - id: getPermissions
    type: database
    parallel: true
    inputs:
      where: { userId: "${params.userId}" }

  - id: getAuditLog
    type: http
    parallel: true
```

---

## Data Flow & Templates

### Template Syntax

Blocks use template substitution to reference previous outputs and context:

```
${blocks.blockId.outputName}  — Output from another block
${params.name}                — URL parameter
${env.VAR_NAME}               — Environment variable
${body.field}                 — Request body field
${body.nested.deep}           — Nested path with dot notation
${blocks.blockId.rows[0]}     — Array index access
```

### Example Chain with Data Flow

```yaml
blocks:
  # Step 1: Get user from database
  - id: getUser
    type: database
    config:
      function: select
      table: users
    inputs:
      where: { id: "${params.userId}" }

  # Step 2: Get permissions (uses user ID from step 1)
  - id: getPermissions
    type: database
    config:
      function: select
      table: user_permissions
    inputs:
      where: { userId: "${blocks.getUser.rows[0].id}" }

  # Step 3: Call external API with data from steps 1-2
  - id: notifyUser
    type: http
    config:
      method: post
      path: "/notifications"
    inputs:
      data:
        userId: "${blocks.getUser.rows[0].id}"
        userEmail: "${blocks.getUser.rows[0].email}"
        permissions: "${blocks.getPermissions.rows}"
```

---

## Sequential vs Parallel

### Sequential Execution (Default)

Blocks run one after another. Later blocks can access outputs from earlier blocks:

```yaml
blocks:
  - id: step1
    type: database
    # Runs first

  - id: step2
    type: database
    inputs: { data: "${blocks.step1.rows[0]}" }
    # Runs second (can use step1's output)

  - id: step3
    type: http
    # Runs third
```

### Parallel Execution

Use `parallel: true` to run blocks concurrently:

```yaml
blocks:
  - id: getUser
    type: database
    # Runs first

  # Both run in parallel (after getUser completes)
  - id: getPermissions
    type: database
    parallel: true

  - id: getAuditLog
    type: http
    parallel: true

  # Waits for both parallel blocks to complete
  - id: enrichUser
    type: database
    inputs:
      data:
        user: "${blocks.getUser.rows[0]}"
        permissions: "${blocks.getPermissions.rows}"
        auditLog: "${blocks.getAuditLog.data}"
```

**Important:** Parallel blocks cannot depend on each other; only on blocks that ran before the parallel group.

---

## Error Handling

### Per-Block Error Handling

Control what happens when a block fails:

```yaml
blocks:
  - id: criticalStep
    type: database
    config: { ... }
    errorHandler: fail        # Stop chain on error (default)
    # OR
    errorHandler: skip        # Skip and continue
    # OR
    errorHandler: retry       # Retry failed operation
    # OR
    errorHandler: fallback    # Use fallback value
    fallback: []              # Return this if block fails
    timeout: 5000             # Max execution time
```

### Chain-Level Error Handling

```yaml
chain:
  errorHandling:
    strategy: fail-fast    # Stop on first error (default)
    # OR
    strategy: continue     # Continue despite errors
  timeout: 30000           # Total chain timeout
```

### Retry Policy

```yaml
blocks:
  - id: apiCall
    type: http
    config: { ... }
    retryPolicy:
      maxAttempts: 3
      backoff: exponential    # or "linear", "none"
      retryDelay: "PT1S"      # ISO 8601 duration
```

### Timeout Management

```yaml
blocks:
  # Per-block timeout
  - id: slowOperation
    type: database
    timeout: 5000  # 5 seconds

# Chain-level timeout
chain:
  timeout: 30000  # Total chain timeout
```

---

## Response Extraction

Use `responseKey` to extract specific data from block outputs:

```yaml
x-handler:
  type: blocks
  chain: [ ... ]
  responseKey: blocks.transformStep.result
```

**Without responseKey**, returns entire block outputs:

```json
{
  "blocks": {
    "blockId1": { "output1": "value" },
    "blockId2": { "output2": "value" }
  }
}
```

**With responseKey = "blocks.blockId1.output1"**, returns:

```json
"value"
```

---

## Integration with DNA

### Map Block Chains to Steps

A DNA **workflow step** can execute a **block chain** as its implementation:

```json
{
  "id": "step-fetch-user",
  "name": "Fetch and Enrich User",
  "actor": "system",
  "action": "enrich",
  "resource": "users",
  "automated": true,
  "implementation": {
    "type": "block-chain",
    "blocks": [
      {
        "id": "fetchUser",
        "type": "database",
        "config": { "function": "select", "table": "users" }
      },
      {
        "id": "fetchPermissions",
        "type": "database",
        "config": { "function": "select", "table": "permissions" }
      }
    ]
  },
  "inputs": [
    { "name": "userId", "type": "string", "required": true }
  ],
  "outputs": [
    { "name": "enrichedUser", "type": "object" }
  ]
}
```

### Multi-Step Workflow Example

```json
{
  "id": "user-onboarding",
  "name": "User Onboarding Workflow",
  "steps": [
    {
      "id": "step-1",
      "name": "Validate and Create User",
      "implementation": {
        "type": "block-chain",
        "blocks": [
          {
            "id": "insertUser",
            "type": "database",
            "config": { "function": "insert", "table": "users" }
          }
        ]
      }
    },
    {
      "id": "step-2",
      "name": "Send Welcome Email",
      "implementation": {
        "type": "block-chain",
        "blocks": [
          {
            "id": "sendEmail",
            "type": "http",
            "config": { "method": "post", "path": "/email/send" }
          }
        ]
      }
    }
  ]
}
```

---

## Creating Custom Blocks

### 1. Define Block Type

```typescript
import { BlockDefinition, BlockHandler } from "../types.ts";

export const customBlockDefinition: BlockDefinition = {
  id: "my-transform",
  type: "custom-transform",
  description: "Custom data transformation block",
  config: {},
  inputs: [
    { name: "data", type: "object", required: true },
    { name: "rules", type: "object", required: true },
  ],
  outputs: [
    { name: "result", type: "object" },
    { name: "applied", type: "number" },
  ],
};
```

### 2. Implement Handler

```typescript
export const customBlockHandler: BlockHandler = (ctx) => {
  const { data, rules } = ctx.inputs;

  // Transform data according to rules
  const result = Object.entries(rules as Record<string, unknown>)
    .reduce((acc, [key, value]) => {
      (acc as Record<string, unknown>)[key] = 
        (data as Record<string, unknown>)[String(value)];
      return acc;
    }, {});

  return Promise.resolve({
    result,
    applied: Object.keys(result).length,
  });
};
```

### 3. Register Block

```typescript
import { BlockRegistry } from "./block-registry.ts";

const registry = new BlockRegistry();
registry.register(
  "custom-transform",
  customBlockDefinition,
  customBlockHandler
);
```

---

## Complete Examples

### Example 1: User Profile Enrichment

```yaml
paths:
  /users/{userId}/profile:
    get:
      summary: Get enriched user profile
      x-handler:
        type: blocks
        chain:
          # Fetch user
          - id: getUser
            type: database
            config:
              function: select
              table: users
            inputs:
              where: { id: "${params.userId}" }
              limit: 1
            timeout: 5000

          # Fetch permissions (parallel)
          - id: getPermissions
            type: database
            config:
              function: select
              table: user_permissions
            inputs:
              where: { userId: "${params.userId}" }
            parallel: true
            errorHandler: fallback
            fallback: []

          # Fetch audit log (parallel)
          - id: getAuditLog
            type: http
            config:
              baseUrl: http://audit-service:3001
              timeout: 10000
            inputs:
              method: GET
              path: "/audit/users/${params.userId}"
            parallel: true
            errorHandler: fallback
            fallback: { events: [] }

          # Combine results
          - id: enrichProfile
            type: database
            config:
              function: query
            inputs:
              query: |
                SELECT u.*,
                  COALESCE(p.permissions, '[]'::json) as permissions,
                  NOW() as enriched_at
                FROM users u
                LEFT JOIN user_permissions p ON u.id = p.user_id
                WHERE u.id = $1
              params: ["${params.userId}"]

        responseKey: blocks.enrichProfile.rows[0]
```

### Example 2: User Creation with Onboarding

```yaml
paths:
  /users:
    post:
      summary: Create user and send welcome email
      x-handler:
        type: blocks
        chain:
          # Insert user
          - id: insertUser
            type: database
            config:
              function: insert
              table: users
            inputs:
              data:
                email: "${body.email}"
                name: "${body.name}"
                created_at: "${ new Date().toISOString() }"

          # Create permissions (parallel)
          - id: createPermissions
            type: database
            config:
              function: insert
              table: user_permissions
            inputs:
              data:
                userId: "${blocks.insertUser.id}"
                permissions: '["user:read"]'
            parallel: true
            errorHandler: skip

          # Send welcome email (parallel)
          - id: sendWelcomeEmail
            type: http
            config:
              baseUrl: http://mail-service:3002
              timeout: 10000
            inputs:
              method: POST
              path: /send
              data:
                to: "${body.email}"
                subject: "Welcome!"
                variables:
                  name: "${body.name}"
                  userId: "${blocks.insertUser.id}"
            parallel: true
            errorHandler: skip

          # Fetch and return created user
          - id: fetchCreatedUser
            type: database
            config:
              function: select
              table: users
            inputs:
              where: { id: "${blocks.insertUser.id}" }

        responseKey: blocks.fetchCreatedUser.rows[0]
```

---

## Testing

### Unit Test Example

```typescript
import { BlockExecutionContext } from "../types.ts";
import { databaseBlockHandler } from "../blocks/database-block.ts";

Deno.test("Database block - select", async () => {
  const ctx: BlockExecutionContext = {
    inputs: {
      function: "select",
      table: "users",
      where: { id: "123" },
      limit: 10,
    },
    env: {},
    params: {},
    requestBody: undefined,
    blockOutputs: {},
    blockId: "test-db",
    blockType: "database",
    chainId: "test-chain",
    currentBlockIndex: 0,
    totalBlocks: 1,
    executedAt: new Date(),
  };

  const result = await databaseBlockHandler(ctx, {});

  assertEquals(result.success, true);
  assertEquals(result.rows.length, 1);
});
```

### Integration Test Example

```typescript
import { BlockExecutionEngine, BlockRegistry } from "../blocks/mod.ts";
import { ExecutionContext } from "../types.ts";

Deno.test("Block chain - user enrichment", async () => {
  const registry = new BlockRegistry();
  const engine = new BlockExecutionEngine(registry);

  const ctx: ExecutionContext = {
    request: new Request("http://localhost/users/123"),
    params: { userId: "123" },
    body: undefined,
    env: Deno.env.toObject(),
    respond: (data) => new Response(JSON.stringify(data)),
  };

  const result = await engine.executeChain({
    id: "test-chain",
    blocks: [
      {
        id: "getUser",
        blockType: "database",
        config: { function: "select", table: "users" },
        inputs: { where: { id: "123" } },
      },
    ],
  }, ctx);

  assertEquals(result.success, true);
});
```

---

## Best Practices

1. **Keep Blocks Focused** — One block = one responsibility
2. **Use Meaningful IDs** — Clear block IDs make chains readable
3. **Add Error Handlers** — Always consider failure scenarios
4. **Test Blocks Independently** — Unit test each block
5. **Document Block Contracts** — Clear inputs and outputs
6. **Use Parallel Execution** — Where applicable for performance
7. **Extract Responses** — Use `responseKey` for clean API responses
8. **Set Timeouts** — Protect against hanging operations
9. **Monitor Block Chains** — Log execution for debugging
10. **Validate Inputs** — Use OpenAPI schemas for request validation

---

## Troubleshooting

### Block Not Found

```
Error: Block type 'database' not registered
```

**Solution:** Ensure block is registered in handler registry before execution.

### Template Variable Not Resolved

```yaml
inputs: { where: { id: "${blocks.getUser.id}" } }
# Returns literal string instead of value
```

**Solution:** Check block ID and output name match. Use correct format: `${blocks.blockId.outputName}`

### Timeout Exceeded

```
Error: Block execution timeout after 5000ms
```

**Solution:** Increase timeout or optimize block operation.

### Parallel Block Dependency

```yaml
blocks:
  - id: step1
    parallel: true
  - id: step2
    parallel: true
    inputs: { data: "${blocks.step1.result}" }  # ERROR: step1 is parallel
```

**Solution:** Remove `parallel: true` from dependent blocks, or reorder chain so step1 runs before parallel blocks.

### Chain Execution Order

```yaml
blocks:
  - id: step1
  - id: step2
  - id: step3
    parallel: true  # Runs after step1 and step2
    inputs: { data: "${blocks.step2.result}" }  # step3 depends on step2
```

**Solution:** Parallel blocks depend on all previous non-parallel blocks. If step3 needs step2's output, they must run sequentially.

---

## Future Enhancements

### Short Term
1. **File Block** — Read/write file operations
2. **Transform Block** — Data mapping and filtering
3. **Condition Block** — Conditional execution branching
4. **Loop Block** — Iteration over arrays
5. **Cache Block** — In-memory caching

### Medium Term
1. **Custom Block Creator** — Wizard for creating new blocks
2. **Block Marketplace** — Share and discover blocks
3. **Event Blocks** — Webhook and event-driven blocks
4. **ML/AI Blocks** — Integration with AI models
5. **GraphQL Block** — GraphQL query execution

### Long Term
1. **Visual DAG Editor** — Graph-based block visualization
2. **Real-time Collaboration** — Multi-user editing
3. **Version Control** — Track block chain changes
4. **Performance Profiler** — Identify bottlenecks
5. **Mobile SDK** — Run blocks on mobile devices

---

## Files Reference

| File | Purpose |
|------|---------|
| `core/types.ts` | Block types and interfaces |
| `core/blocks/block-registry.ts` | Block registration and lookup |
| `core/blocks/block-execution-engine.ts` | Execution orchestration |
| `core/blocks/database-block.ts` | Database block implementation |
| `core/blocks/http-block.ts` | HTTP block implementation |
| `core/blocks/mod.ts` | Block module exports |
| `core/handlers/blocks.ts` | Blocks handler integration |
| `core/blocks/INTEGRATION_GUIDE.ts` | How to integrate blocks |
| `config/openapi-blocks-example.yaml` | Real-world example API |

---

## Resources

- [API Shell README](../README.md)
- [Example OpenAPI Config](../config/openapi-blocks-example.yaml)
- [Integration Guide](../core/blocks/INTEGRATION_GUIDE.ts)

---

**Ready to build? Check the examples above or see `config/openapi-blocks-example.yaml` for a complete real-world API.**
