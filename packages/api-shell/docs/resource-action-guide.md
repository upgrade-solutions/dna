# Resource-Action Architecture Guide

## Overview

This guide explains the dual-level `resource:action` architecture that's now integrated throughout your API. It provides:

- **Class-level identity**: "What capability is being exercised?" (e.g., `user:read`)
- **Instance-level identity**: "What specific resource is affected?" (e.g., user ID 123)
- **Unified endpoint semantics**: Every endpoint has a canonical `resource:action` identity

This dual-level design distinguishes between **capability/policy** and **concrete execution context**, enabling both fine-grained access control and precise audit trails.

## Architecture Components

### 1. Type System (`core/types.ts`)

#### ResourceActionContext Interface
Represents the dual-level structure of a resource:action:

```typescript
interface ResourceActionContext {
  // CLASS-LEVEL: Policy/capability checks
  resource: string;      // "user", "document", "report"
  action: string;        // "read", "update", "delete", "create"
  canonical: string;     // "user:read"

  // INSTANCE-LEVEL: Concrete target information
  targetId?: string;     // From route params (e.g., user ID)
  targetScope?: string;  // Optional scope (e.g., "department", "team", "field")

  // COMPUTED: Full qualified form for audit trails
  qualifiedForm(): string;
}
```

#### ResourceActionImpl Class
Concrete implementation providing the computed `qualifiedForm()`:

```typescript
// Examples of qualifiedForm() output:
new ResourceActionImpl("user", "read", "123").qualifiedForm()
// → "user:123:read"

new ResourceActionImpl("user", "read", "123", "department").qualifiedForm()
// → "user:123:department:read"

new ResourceActionImpl("user", "read").qualifiedForm()
// → "user:read"  (class-level, no instance)
```

#### Updated ExecutionContext
ExecutionContext now includes resource:action:

```typescript
interface ExecutionContext {
  request: Request;
  params: Record<string, string>;
  body: unknown;
  user?: unknown;
  env: Record<string, string>;
  resourceAction?: ResourceActionContext;  // NEW: Resource-action identity
  respond: (data: unknown, status?: number) => Response;
}
```

### 2. ResourceActionRegistry (`core/managers/resource-action-manager.ts`)

Central registry for managing resource:action mappings.

#### Key Methods

**Build from OpenAPI spec:**
```typescript
registry.buildFromSpec(spec);
// Scans all operations for x-resource-action annotations
// Creates mappings for each resource:action combination
```

**Query mappings:**
```typescript
// Get mapping by resource and action
registry.getByResourceAction("user", "read")

// Get all actions for a resource
registry.getActionsForResource("user")
// → ["read", "create", "update", "delete", "list"]

// Get all resources
registry.getAllResources()
// → ["auth", "user", "document", "report"]

// Validate existence
registry.exists("user", "delete")  // → true/false
```

**Create resource:action instances:**
```typescript
// Class-level only
const ra1 = registry.createResourceAction("user", "read");
// → user:read

// With instance ID
const ra2 = registry.createResourceAction("user", "read", "123");
// → user:123:read

// With instance ID and scope
const ra3 = registry.createResourceAction("user", "update", "123", "department");
// → user:123:department:update
```

**Debug information:**
```typescript
registry.getDebugInfo()
// Returns:
// {
//   totalMappings: 13,
//   resources: ["auth", "user"],
//   mappings: { ... }
// }
```

### 3. Router Integration (`core/router.ts`)

The router now extracts and injects resource:action into every request.

#### Workflow

1. **Extract resource:action from OpenAPI spec**
   - Via `x-resource-action` annotation (e.g., `"user:read"`)
   - Cached in ResourceActionRegistry

2. **Enrich with instance information**
   - Extract from route params (e.g., `{id}` → targetId)
   - Create ResourceActionImpl with class + instance levels

3. **Inject into ExecutionContext**
   - Available throughout request lifecycle
   - Used by handlers, middleware, and audit logging

#### Example: Route Handling

```typescript
// In router.registerRoute():
const resourceActionStr = this.getResourceActionString(route);  // "user:read"
if (resourceActionStr) {
  const [resource, action] = resourceActionStr.split(":");
  const targetId = executionCtx.params.id;  // From {id} path param
  
  executionCtx.resourceAction = this.resourceActionRegistry.createResourceAction(
    resource,
    action,
    targetId
  );
}
```

### 4. OpenAPI Spec Integration

All endpoints now have `x-resource-action` annotations:

```yaml
paths:
  /users/{id}:
    get:
      operationId: getUser
      x-resource-action: "user:read"      # Class-level
      x-access-control:
        $ref: '#/components/x-policies/user:read'

    put:
      operationId: updateUser
      x-resource-action: "user:update"
      x-access-control:
        $ref: '#/components/x-policies/user:update'

    delete:
      operationId: deleteUser
      x-resource-action: "user:delete"
      x-access-control:
        $ref: '#/components/x-policies/user:delete'

  /users:
    get:
      operationId: listUsers
      x-resource-action: "user:list"
      x-access-control:
        $ref: '#/components/x-policies/user:list'

    post:
      operationId: createUser
      x-resource-action: "user:create"
      x-access-control:
        $ref: '#/components/x-policies/user:create'
```

### 5. Access Control Policies

Policies are now organized by `resource:action`:

```yaml
components:
  x-policies:
    user:read:
      description: Can read user profile (own or admin access to any)
      roles: ["admin"]
      rules:
        - subject.id == resource.id

    user:create:
      description: Can create new user (public registration)
      roles: []
      rules: []

    user:update:
      description: Can update user profile (own or admin access to any)
      roles: ["admin"]
      rules:
        - subject.id == resource.id

    user:delete:
      description: Can delete user account (admin only)
      roles: ["admin"]
      rules: []

    user:list:
      description: Can list all users (admin only)
      roles: ["admin"]
      rules: []

    auth:register:
      description: Can initiate registration flow
      roles: []
      rules: []
```

## Usage Patterns

### In Route Handlers

Handlers can now access the resource:action identity:

```typescript
export const exampleHandler = async (ctx: ExecutionContext) => {
  const { resource, action, targetId } = ctx.resourceAction;
  
  // Route based on action
  if (action === "read") {
    return getUser(targetId);
  } else if (action === "update") {
    return updateUser(targetId, ctx.body);
  } else if (action === "delete") {
    return deleteUser(targetId);
  }
};
```

### In Middleware

Middleware can make decisions based on resource:action:

```typescript
export const auditLoggingMiddleware = async (
  ctx: ExecutionContext,
  next: () => Promise<void>
) => {
  const startTime = Date.now();

  await next();

  const logEntry = {
    userId: ctx.user?.id,
    resourceAction: ctx.resourceAction.qualifiedForm(),  // e.g., "user:123:read"
    classAction: ctx.resourceAction.canonical,           // e.g., "user:read"
    duration: Date.now() - startTime,
    statusCode: ctx.response.status,
    timestamp: new Date().toISOString(),
  };

  console.log("AUDIT", logEntry);
};
```

### In Feature Flags

Feature flags can target specific resource:actions:

```typescript
const isFeatureEnabled = (
  resourceAction: ResourceActionContext,
  user: User
): boolean => {
  const canonical = resourceAction.canonical;
  
  // Enable "advanced-reports" for certain resource:actions
  if (canonical === "report:analyze" && user.role === "admin") {
    return true;
  }
  
  return false;
};
```

### In Access Control

The ResourceActionRegistry helps build context for access control:

```typescript
// In access control evaluator:
const mapping = registry.getByResourceAction(resource, action);
if (!mapping) {
  throw new Error(`Unknown resource:action: ${resource}:${action}`);
}

const policy = mapping.accessControlPolicy;
const result = evaluator.evaluate(policy, context);
```

## Class vs Instance Examples

### Example 1: User Profile Read

**Request:** `GET /users/123`

```
resource:action: "user:read"
↓
ExecutionContext.resourceAction:
  resource: "user"
  action: "read"
  canonical: "user:read"
  targetId: "123"
  targetScope: undefined
  qualifiedForm() → "user:123:read"
```

**Access control:** 
- Check class-level policy `user:read`
- Policy allows: admins + users reading own profile
- Decision: YES if `subject.id == 123`

**Audit log:**
```json
{
  "user": "42",
  "resourceAction": "user:123:read",
  "classAction": "user:read",
  "timestamp": "2025-10-30T10:30:00Z"
}
```

### Example 2: User Profile Update (Department Field Only)

Future extension possibility:

```
resource:action: "user:update"
targetScope: "department"
↓
qualifiedForm() → "user:123:department:update"
```

This allows handlers to:
- Know they're updating ONLY the department field
- Apply different access rules (maybe managers can update department)
- Audit the specific scope of change

### Example 3: List Users

**Request:** `GET /users`

```
resource:action: "user:list"
↓
ExecutionContext.resourceAction:
  resource: "user"
  action: "list"
  canonical: "user:list"
  targetId: undefined
  targetScope: undefined
  qualifiedForm() → "user:list"
```

No instance ID because it's a collection operation.

## Integration Checklist

### For New Endpoints

1. Add `x-resource-action` to OpenAPI operation:
   ```yaml
   get:
     operationId: myOperation
     x-resource-action: "resource:action"
   ```

2. Ensure resource + action exist in registry (auto-discovered)

3. Create policy in `components.x-policies`:
   ```yaml
   resource:action:
     description: ...
     roles: [...]
     rules: [...]
   ```

4. Link policy in operation:
   ```yaml
   x-access-control:
     $ref: '#/components/x-policies/resource:action'
   ```

5. Handler can now use `ctx.resourceAction`:
   ```typescript
   const { resource, action, targetId } = ctx.resourceAction;
   ```

### For Handler Development

1. Extract resource:action information:
   ```typescript
   const { resource, action, canonical, targetId, qualifiedForm } = ctx.resourceAction;
   ```

2. Use class-level for logic decisions:
   ```typescript
   if (action === "read") { /* ... */ }
   ```

3. Use instance-level for targeted operations:
   ```typescript
   const data = fetchResource(resource, targetId);
   ```

4. Use qualified form for audit/logging:
   ```typescript
   logAudit(`User ${userId} executed ${qualifiedForm()}`);
   ```

### For Access Control

1. Policies are organized by `resource:action`
2. Access control evaluator uses class-level policies
3. ExecutionContext enriches with instance information
4. ABAC rules can reference `resource.id` from execution context

## Advanced Patterns

### Dynamic Scope Extraction

Currently, `targetScope` is optional. Future enhancement:

```typescript
// From path: /users/123/department
const targetScope = extractScopeFromPath(route.path, executionCtx.params);

executionCtx.resourceAction = registry.createResourceAction(
  resource,
  action,
  targetId,
  targetScope  // "department"
);
```

### Multi-level Resource Hierarchies

```typescript
// For nested resources: /organizations/1/teams/2/members/3
const resourceAction = registry.createResourceAction(
  "member",
  "read",
  "3",
  "team"  // scope indicates "member within team context"
);
// qualifiedForm() → "member:3:team:read"
```

### Batch Operations

For operations affecting multiple resources:

```typescript
// POST /users/batch-delete with ["user1", "user2", "user3"] in body
resourceAction = registry.createResourceAction(
  "user",
  "delete",
  "batch",  // Special indicator for batch operations
  undefined
);
// qualifiedForm() → "user:batch:delete"
```

## Querying the Registry

```typescript
// Get all resource:action combinations
const allMappings = registry.getAllMappings();

// Debug information
const debug = registry.getDebugInfo();
console.log(`Total endpoints: ${debug.totalMappings}`);
console.log(`Resources: ${debug.resources.join(", ")}`);

// List all actions for a resource
const userActions = registry.getActionsForResource("user");
// ["read", "create", "update", "delete", "list"]

// Find specific endpoint
const readMapping = registry.getByResourceAction("user", "read");
console.log(`Routes for user:read:`);
readMapping.routes.forEach(r => {
  console.log(`  ${r.method} ${r.path}`);
});
```

## Testing

### Test Resource Action Creation

```typescript
import { ResourceActionImpl } from "./core/types.ts";

Deno.test("ResourceActionImpl qualifiedForm", () => {
  const ra1 = new ResourceActionImpl("user", "read");
  assertEquals(ra1.qualifiedForm(), "user:read");

  const ra2 = new ResourceActionImpl("user", "read", "123");
  assertEquals(ra2.qualifiedForm(), "user:123:read");

  const ra3 = new ResourceActionImpl("user", "update", "123", "department");
  assertEquals(ra3.qualifiedForm(), "user:123:department:update");
});
```

### Test Registry Discovery

```typescript
import { createResourceActionRegistry } from "./core/managers/resource-action-manager.ts";

Deno.test("ResourceActionRegistry discovers from spec", async () => {
  const spec = /* your OpenAPI spec */;
  const registry = createResourceActionRegistry(spec);

  assertEquals(registry.exists("user", "read"), true);
  assertEquals(registry.exists("invalid", "action"), false);

  const userActions = registry.getActionsForResource("user");
  assertEquals(userActions.includes("read"), true);
});
```

## Troubleshooting

### Issue: Resource Action Not Found

**Symptom:** "Unknown resource:action: xyz:abc"

**Cause:** 
- Missing `x-resource-action` in OpenAPI spec
- Typo in resource or action name

**Solution:**
1. Check OpenAPI spec has `x-resource-action: "resource:action"` on operation
2. Verify spelling matches policy definition
3. Rebuild registry: `registry.buildFromSpec(spec)`

### Issue: Instance ID Not Populated

**Symptom:** `targetId` is always undefined

**Cause:**
- Route param not named `id`
- Param extraction failed

**Solution:**
```typescript
// Current: Extracts {id} from route params
// Future: Make param name configurable in x-resource-action
x-resource-action: "user:read:userId"  // Extract userId param instead
```

### Issue: Policy Not Applied

**Symptom:** Access control not enforced

**Cause:**
- Missing `x-access-control` referencing policy
- Policy name doesn't match operation's resource:action

**Solution:**
```yaml
# ❌ Missing reference
x-resource-action: "user:read"

# ✅ Correct: Reference matching policy
x-access-control:
  $ref: '#/components/x-policies/user:read'
```

## See Also

- `core/types.ts` - ResourceActionContext and ResourceActionImpl
- `core/managers/resource-action-manager.ts` - Registry implementation
- `core/router.ts` - Router integration
- `config/openapi.yaml` - OpenAPI spec with annotations
- `docs/x-access-control-guide.md` - Access control documentation

