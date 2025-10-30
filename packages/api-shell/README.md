# Configuration-Driven API Shell

A runtime-configurable API server built with **Deno** and **TypeScript** that enables teams to define, modify, and deploy APIs without rebuilding code — only by changing **OpenAPI 3.1.1 specification** files.

## Features

- **OpenAPI 3.1.1 Native** — Define all API routes, schemas, and metadata using OpenAPI specification
- **Dynamic Route Registration** — Routes automatically generated from OpenAPI paths
- **Authorization Layer** — RBAC and ABAC rule support via OpenAPI x-auth extensions
- **Access Control (x-access-control)** — Declarative role-based and attribute-based access control with policy reuse
- **Request Validation** — JSON Schema-based validation using OpenAPI component schemas
- **Extensible Handlers** — CRUD, Query, Proxy, Script, Formula handlers defined via x-handler extensions
- **Multi-step Workflows** — Built-in multi-step registration example
- **Hot Reloading** — File watcher for configuration changes
- **Structured Logging** — Request/response tracking
- **API Discovery** — Built-in `/openapi.json` endpoint for client discovery
- **Feature Flags** — *(Planned)* Control feature availability without code changes
- **Telemetry** — *(Planned)* Built-in observability and metrics collection
- **Fast** — Deno's zero-config TypeScript runtime

## Architecture

### High-Level Components

| Component | Responsibility |
|-----------|-----------------|
| **Server Shell** | Core Deno application that loads OpenAPI spec and registers routes dynamically |
| **Config Loader** | Loads OpenAPI 3.1.1 spec and normalizes into internal route configuration |
| **Router Engine** | Parses OpenAPI paths and operations, registers handlers |
| **Handler Registry** | Provides built-in handlers (CRUD, proxy, script, formula, etc.) |
| **Schema Validator** | Validates incoming requests using OpenAPI component schemas |
| **Authorization Manager** | Supports RBAC and ABAC using declarative rules |
| **Execution Context** | Provides runtime context to handlers |

### Project Structure

```
/api-shell
  ├─ mod.ts                      # Entry point
  ├─ deno.json                   # Deno configuration and tasks
  ├─ core/
  │   ├─ types.ts                # Type definitions (including OpenAPI types)
  │   ├─ loader.ts               # OpenAPI spec loader & normalizer
  │   ├─ router.ts               # Dynamic router with access control integration
  │   ├─ validator.ts            # JSON schema validator (OpenAPI aware)
  │   ├─ auth.ts                 # RBAC/ABAC authorization
  │   ├─ access-control.ts       # x-access-control evaluator (RBAC/ABAC)
  │   ├─ handler-registry.ts     # Handler registry
  │   ├─ middleware/
  │   │   └─ access-control.ts  # Access control middleware
  │   ├─ handlers/
  │   │   ├─ crud.ts             # CRUD operations
  │   │   ├─ query.ts            # Data queries
  │   │   ├─ proxy.ts            # API proxying
  │   │   ├─ script.ts           # TypeScript/JS execution
  │   │   └─ formula.ts          # Expression evaluation
  │   └─ schemas/                # Schema definitions
  ├─ config/
  │   └─ openapi.yaml            # OpenAPI 3.1.1 specification (source of truth)
  ├─ docs/
  │   └─ x-access-control-guide.md  # Detailed access control documentation
  ├─ tests/
  │   ├─ README.md               # Testing guide
  │   ├─ access-control.test.ts  # Access control tests (27 tests)
  │   ├─ registration_flow.test.ts  # Registration flow tests
  │   └─ fixtures/               # Test fixtures and data
  ├─ IMPLEMENTATION_SUMMARY.md   # x-access-control implementation details
  ├─ INTEGRATION_GUIDE.md        # Integration guide and overview
  └─ README.md                   # This file
```

## Getting Started

### Prerequisites

- **Deno** 1.30+ ([Install](https://docs.deno.com/runtime/manual/getting_started/installation))

### Installation

```bash
cd packages/api-shell
```

### Run the Server

**Start development server with hot reload:**

```bash
deno task dev
```

**Start production server:**

```bash
deno task start
```

Or with environment variables:

```bash
CONFIG_PATH=./config/openapi.yaml WATCH_CONFIG=true deno run --allow-all mod.ts
```

### Permissions

The server requires these Deno permissions:

- `--allow-net` — HTTP server and API calls
- `--allow-read` — Read OpenAPI spec and handler files
- `--allow-env` — Access environment variables
- `--allow-hrtime` — High-resolution timing (optional, for performance)

### Check Configuration

```bash
deno task check
```

### Testing

Run the registration flow test suite:

```bash
deno task test
```

For detailed testing documentation, see [tests/README.md](./tests/README.md).

### Format & Lint

```bash
deno task fmt
deno task lint
```

## Configuration Format: OpenAPI 3.1.1

All API configuration is defined in a single OpenAPI 3.1.1 specification file. The spec serves as the source of truth for routes, handlers, and schemas.

### Basic Structure

```yaml
openapi: 3.1.1
info:
  title: My API
  version: 1.0.0

paths:
  /endpoint:
    post:
      summary: Endpoint description
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RequestSchema'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResponseSchema'
      x-handler:                # Handler configuration (custom extension)
        type: crud
        resource: resource_name
      x-auth:                   # Authorization rules (custom extension)
        role: admin

components:
  schemas:
    RequestSchema:
      type: object
      properties:
        email:
          type: string
          format: email
      required:
        - email
```

### Custom Extensions

The API Shell uses OpenAPI custom extensions (x-prefixed fields) to specify handlers and authorization:

#### x-handler

Defines which handler to use and its configuration:

```yaml
x-handler:
  type: crud|query|proxy|script|formula
  # ... handler-specific config
```

#### x-auth

Defines authorization rules for the endpoint:

```yaml
x-auth:
  role: admin              # Single role
  # OR
  role: [admin, manager]   # Multiple roles
  # OR
  permission: write:users  # Permission
```

## Handler Types

All handlers are defined using the `x-handler` extension in the OpenAPI spec:

### 1. **CRUD** — Create/Read/Update/Delete Operations

```yaml
x-handler:
  type: crud
  resource: users
  operation: create|read|update|delete
```

### 2. **Query** — Database or Data Source Queries

```yaml
x-handler:
  type: query
  source: db          # "db", "api", or "file"
  resource: users
  select:
    - id
    - name
    - email
  limit: 100
```

### 3. **Proxy** — Forward to External APIs

```yaml
x-handler:
  type: proxy
  target: https://api.example.com/resource/:id
  method: GET
  timeout: 30000
```

### 4. **Script** — Execute TypeScript/JavaScript Modules

```yaml
x-handler:
  type: script
  file: ./scripts/my_script.ts

# Script must export a default async function:
# export default async function(ctx: ExecutionContext): Promise<unknown> { ... }
```

### 5. **Formula** — Evaluate Expressions

```yaml
x-handler:
  type: formula
  expression: "body.basePrice * (1 - body.discountPercent / 100)"
```

## Authorization

### Role-Based Access Control (RBAC)

```yaml
x-auth:
  role: admin              # Single role
  # OR
  role: [admin, manager]   # Multiple roles
```

### Permission-Based Access Control (PBAC)

```yaml
x-auth:
  permission: write:users
  # OR
  permission: [read:users, write:users]
```

### Attribute-Based Access Control (ABAC)

```yaml
x-auth:
  condition: "has_role:admin"    # Custom conditions
```

## Access Control (x-access-control)

A declarative RBAC and ABAC system that runs before route handlers, enabling configuration-driven authorization policies.

### Features

- **Policy Reuse** — Define policies once in `components.x-policies`, reference everywhere
- **Role-Based (RBAC)** — Fast path for role matching
- **Attribute-Based (ABAC)** — Flexible expression evaluation against context
- **Combined Policies** — Mix RBAC and ABAC in a single policy
- **Policy References** — Use `$ref` for DRY configurations
- **Runtime Evaluation** — No code changes needed to update policies

### Quick Example

Define reusable policies:

```yaml
components:
  x-policies:
    admin-only:
      roles: ["admin"]
    
    self-service-or-admin:
      roles: ["admin"]
      rules:
        - subject.id == resource.id
```

Apply to operations:

```yaml
paths:
  /users/{id}:
    get:
      x-access-control:
        $ref: '#/components/x-policies/self-service-or-admin'
    
    delete:
      x-access-control:
        $ref: '#/components/x-policies/admin-only'
```

### ABAC Rule Expressions

```yaml
# Simple role check
- subject.role == "admin"

# Owner can access their own resource
- subject.id == resource.ownerId

# Department-based access
- subject.department == resource.department

# Multi-condition
- subject.role == "manager" and subject.department == resource.department

# Complex
- (subject.role == "admin") or (subject.id == resource.ownerId)
```

### Evaluation Context

```typescript
{
  subject: {
    id: string;           // User ID
    role: string;         // User role
    department?: string;  // Optional department
    permissions?: string[]; // Optional permissions
  },
  resource: {
    id: string;           // Resource ID
    ownerId?: string;     // Resource owner
    type?: string;       // Resource type
  },
  environment?: {
    ip?: string;         // Client IP
    timeOfDay?: string;  // Time period
    timestamp?: number;  // Current time
  }
}
```

For detailed documentation, see [docs/x-access-control-guide.md](./docs/x-access-control-guide.md).

### Status Codes

- **401** — Could not determine access context
- **403** — Access denied by policy

## Validation

Request body schemas are defined in `components/schemas` and referenced in the OpenAPI spec:

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/UserCreateRequest'

components:
  schemas:
    UserCreateRequest:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
      required:
        - name
        - email
        - password
```

The validator automatically uses these schemas to validate incoming requests.

## Execution Context

All handlers receive an `ExecutionContext` with:

```typescript
interface ExecutionContext {
  request: Request;           // Raw HTTP request
  params: Record<string, string>;  // URL parameters
  body: unknown;              // Request body
  user?: unknown;             // Authenticated user
  env: Record<string, string>;     // Environment variables
  respond: (data: unknown, status?: number) => Response;  // Send response
}
```

## Multi-Step Registration Example

The project includes a complete 4-step user registration workflow defined in the OpenAPI spec:

1. **Step 1: Email Verification** — `POST /auth/register/step1`
2. **Step 2: Profile Information** — `POST /auth/register/step2`
3. **Step 3: Credentials & Security** — `POST /auth/register/step3`
4. **Step 4: Confirmation** — `POST /auth/register/step4`
5. **Status Check** — `GET /auth/register/status/{sessionId}`

### Testing the Registration Flow

```bash
# Step 1: Verify email
curl -X POST http://localhost:3000/auth/register/step1 \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Response:
# {
#   "success": true,
#   "sessionId": "abc-123",
#   "message": "Email verified. Verification code sent.",
#   "nextStep": "/auth/register/step2"
# }
```

## API Discovery

### Health Check

```
GET http://localhost:3000/health
```

### OpenAPI Specification (JSON)

```
GET http://localhost:3000/openapi.json
```

Returns the complete OpenAPI 3.1.1 specification as JSON, allowing clients to discover the API structure dynamically.

### OpenAPI Specification (YAML)

```
GET http://localhost:3000/openapi.yaml
```

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- **`docs/x-access-control-guide.md`** - Complete guide to RBAC/ABAC access control policies, rule expressions, examples, and API reference
- Additional documentation files for other features as they are added

## Environment Variables

```bash
# Configuration file path (now OpenAPI spec)
CONFIG_PATH=./config/openapi.yaml

# Server binding
HOSTNAME=127.0.0.1
PORT=3000

# Enable configuration file watching
WATCH_CONFIG=true
```

## Extending the API

### Adding New Routes

Edit `config/openapi.yaml` and add new path entries:

```yaml
paths:
  /new-endpoint:
    post:
      summary: New endpoint
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewRequest'
      responses:
        '200':
          description: Success
      x-handler:
        type: crud
        resource: new_resource
```

### Adding New Schemas

Add schemas to the `components/schemas` section:

```yaml
components:
  schemas:
    NewRequest:
      type: object
      properties:
        field:
          type: string
      required:
        - field
```

### Registering Custom Handlers

Register custom handlers in `mod.ts`:

```typescript
import { HandlerRegistry } from "./core/handler-registry.ts";

const handlerRegistry = new HandlerRegistry();

handlerRegistry.register("custom", async (ctx, config) => {
  return { custom: true, data: ctx.body };
});
```

Then use in the OpenAPI spec:

```yaml
x-handler:
  type: custom
  customOption: value
```

## Error Handling

### Validation Errors

```json
{
  "error": "Validation Error",
  "messages": ["Missing required field: email"]
}
```

### Authorization Errors

```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

### Server Errors

```json
{
  "error": "Internal Server Error",
  "message": "Detailed error message"
}
```

## Performance Considerations

- **Schema Caching** — Loaded schemas are cached in memory
- **Handler Registry** — O(1) handler lookup
- **Type Safety** — TypeScript compilation ensures correctness
- **Deno Performance** — V8 runtime, no JIT overhead

## Security Best Practices

- Always validate inputs using JSON Schema
- Implement proper authorization checks
- Use HTTPS in production
- Store secrets in environment variables
- Sanitize error messages in production

## Troubleshooting

### Config File Not Found

```
Failed to load config from ./config/openapi.yaml
```

Ensure the `CONFIG_PATH` environment variable points to a valid OpenAPI specification file.

### OpenAPI Parse Error

```
Failed to load config: YAMLException...
```

Ensure your OpenAPI YAML is valid. Use `openapi-generator` or similar tools to validate.

### Permission Denied

```
error: Requires net access to "127.0.0.1:3000"
```

Use `deno run --allow-net --allow-read --allow-env mod.ts`

### Handler Not Found

```
Handler type 'myhandler' not registered
```

Ensure the handler is registered in `mod.ts` and the `x-handler.type` matches.

## Advanced Features

- **OpenAPI Validation** — Automatic request/response validation against OpenAPI schemas
- **Component Schema References** — Reusable schemas via `$ref` to `#/components/schemas`
- **Execution Tracing** — Log execution steps for observability
- **Hot Reload** — Watch config file for changes and reload routes dynamically
- **API Discovery** — Clients can query `/openapi.json` for API structure

## Feature Flags

*Planned* — Control feature availability at runtime without code changes.

### Planned Features

- **Flag Definition** — Define feature flags in OpenAPI spec or configuration
- **Conditional Routing** — Enable/disable endpoints based on flags
- **Gradual Rollout** — Use flags for A/B testing and canary deployments
- **User Targeting** — Target flags to specific user segments

```yaml
# Planned structure
x-features:
  new-endpoint:
    enabled: true
    rollout: 50  # 50% of traffic
    targets:
      - role: admin
      - department: engineering
```

## Telemetry

*Planned* — Built-in observability and metrics collection.

### Planned Features

- **Metrics Collection** — Track request latency, throughput, errors
- **Structured Logging** — JSON-formatted logs with correlation IDs
- **Distributed Tracing** — Support for tracing across services
- **Health Metrics** — CPU, memory, and handler performance metrics
- **Custom Instrumentation** — Expose metrics from handlers

```yaml
# Planned structure
x-telemetry:
  metrics:
    enabled: true
    sampling: 1.0  # 100% sampling
  logging:
    level: info
    format: json
  tracing:
    enabled: true
    exporter: jaeger
```

## Contributing

To extend the API Shell:

1. Add new OpenAPI paths in `config/openapi.yaml`
2. Add schemas to `components/schemas`
3. Register handler in `mod.ts` if needed
4. Update this README with new handler documentation

## License

MIT

## Resources

- [Deno Documentation](https://docs.deno.com)
- [OpenAPI 3.1.1 Specification](https://spec.openapis.org/oas/v3.1.1)
- [JSON Schema](https://json-schema.org)
- [Oak Framework](https://oak.land)
- [TypeScript](https://www.typescriptlang.org)

---

**Built with care using Deno + TypeScript + OpenAPI 3.1.1**
