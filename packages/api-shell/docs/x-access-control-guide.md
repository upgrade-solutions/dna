# x-access-control Extension Guide

## Overview

The `x-access-control` extension enables declarative Role-Based (RBAC) and Attribute-Based (ABAC) access control directly in your OpenAPI specification. It's evaluated at runtime before request handlers execute, providing configuration-driven authorization without code changes.

## Features

✅ **RBAC** - Allow access based on user roles  
✅ **ABAC** - Allow access based on conditional expressions (subject, resource, environment)  
✅ **Policy Reuse** - Define common policies once in `components.x-policies`  
✅ **Policy References** - Reference policies using `$ref` for DRY configs  
✅ **Runtime Evaluation** - Fast, expression-based rule evaluation  
✅ **Composition** - Combine RBAC and ABAC in a single policy  

## Quick Start

### 1. Define Reusable Policies

In `config/openapi.yaml`, add a `components.x-policies` section:

```yaml
components:
  x-policies:
    public:
      description: Open endpoint - no access control required
      roles: []
      rules: []
    
    admin-only:
      description: Admin users only
      roles: ["admin"]
      rules: []
    
    self-service-or-admin:
      description: Users can access their own data or admins can access any data
      roles: ["admin"]
      rules:
        - subject.id == resource.id
```

### 2. Apply Policies to Operations

Reference policies using `$ref` or define inline:

```yaml
paths:
  /users:
    get:
      summary: List Users
      operationId: listUsers
      x-access-control:
        description: Only admins can list all users
        roles: ["admin"]
        rules: []
    
    post:
      summary: Create User
      operationId: createUser
      x-access-control:
        $ref: '#/components/x-policies/public'

  /users/{id}:
    get:
      summary: Get User
      operationId: getUser
      x-access-control:
        description: Users can view their own profile or admins can view any
        roles: ["admin"]
        rules:
          - subject.id == resource.id
    
    delete:
      summary: Delete User
      operationId: deleteUser
      x-access-control:
        $ref: '#/components/x-policies/admin-only'
```

## Extension Structure

### Policy Object

```typescript
{
  description?: string;     // Human-readable explanation
  roles?: string[];          // RBAC: List of allowed roles
  rules?: string[];          // ABAC: Conditional expressions
  $ref?: string;            // Reference to a component policy
}
```

### Evaluation Logic

The evaluator applies this decision tree:

1. **Empty policy** → Allow all (no restrictions)
2. **RBAC check** → If `subject.role` is in `roles`, allow
3. **ABAC rules** → If any `rule` evaluates to true, allow
4. **Default** → Deny

```
if roles.includes(subject.role) {
  ✅ Allow (RBAC match)
} else if rules.some(rule => evaluate(rule, context)) {
  ✅ Allow (ABAC match)
} else {
  ❌ Deny (no match)
}
```

## ABAC Rule Expressions

Rules are JavaScript expressions evaluated against a context object. Variables are replaced with actual values before evaluation.

### Supported Operators

- **Comparison**: `==`, `!=`, `>`, `<`, `>=`, `<=`
- **Logical**: `and`, `or` (case-insensitive)
- **Grouping**: `()` for precedence

### Context Variables

```typescript
subject: {
  id: string;           // Unique user identifier
  role: string;         // User's role (admin, manager, user, etc.)
  department?: string;  // Optional: user's department
  permissions?: string[]; // Optional: list of permissions
  [key: string]: unknown; // Additional custom fields
}

resource: {
  id: string;           // Resource being accessed
  ownerId?: string;     // Owner of the resource
  type?: string;        // Resource type
  [key: string]: unknown; // Additional custom fields
}

environment?: {
  ip?: string;          // Client IP address
  timeOfDay?: string;   // Time of day (e.g., "business_hours")
  timestamp?: number;   // Current Unix timestamp
  [key: string]: unknown; // Additional custom fields
}
```

### Example Rules

```yaml
# Simple role check
- subject.role == "admin"

# Owner can access their own resource
- subject.id == resource.ownerId

# Department-based access
- subject.department == resource.department

# Multi-condition AND
- subject.role == "manager" and subject.department == resource.department

# Multi-condition OR
- subject.role == "admin" or subject.id == resource.ownerId

# Complex expression with grouping
- (subject.role == "admin") or (subject.id == resource.ownerId and subject.department == resource.department)

# Negative check
- subject.role != "guest"

# Environment-based (e.g., during business hours)
- environment.timeOfDay == "business_hours"
```

## Real-World Examples

### Example 1: Multi-tier Access Control

```yaml
x-policies:
  public-read:
    roles: []
    rules:
      - resource.public == true

  owner-or-admin:
    roles: ["admin"]
    rules:
      - subject.id == resource.ownerId
      - subject.department == resource.department and subject.role == "manager"

  creator-only:
    roles: ["admin"]
    rules:
      - subject.id == resource.createdBy

paths:
  /documents/{id}:
    get:
      x-access-control:
        $ref: '#/components/x-policies/public-read'
    
    put:
      x-access-control:
        $ref: '#/components/x-policies/owner-or-admin'
    
    delete:
      x-access-control:
        $ref: '#/components/x-policies/creator-only'
```

### Example 2: Time-based Access

```yaml
x-policies:
  business-hours-only:
    roles: []
    rules:
      - environment.timeOfDay == "business_hours"
  
  anytime-admin:
    roles: ["admin"]

paths:
  /reports/sensitive:
    get:
      x-access-control:
        description: Accessible to regular users during business hours, admins anytime
        roles: ["admin"]
        rules:
          - environment.timeOfDay == "business_hours" and subject.role == "user"
```

### Example 3: Hierarchical Role Access

```yaml
x-policies:
  department-access:
    roles: ["admin"]
    rules:
      - subject.role == "manager" and subject.department == resource.department
      - subject.role == "supervisor" and resource.department in ["engineering", "operations"]

paths:
  /departments/{id}/budget:
    get:
      x-access-control:
        $ref: '#/components/x-policies/department-access'
```

## Implementation Details

### Architecture

```
Request
  ↓
[Auth Middleware]  ← Authenticate user
  ↓
[Access Control Middleware] ← Check x-access-control policy
  ├─ RBAC evaluation
  ├─ ABAC rule evaluation
  └─ Allow/Deny decision
  ↓
[Validation] ← Validate request body/params
  ↓
[Handler] ← Execute route handler
```

### Evaluation Engine

The access control module includes:

1. **RuleEvaluator** - Parses and evaluates ABAC expressions
   - Replaces variable references with context values
   - Supports comparison and logical operators
   - Safely evaluates using Function constructor (no eval)

2. **AccessControlEvaluator** - Manages policies and makes decisions
   - Caches resolved policies
   - Coordinates RBAC and ABAC evaluation
   - Supports policy references

3. **AccessControlMiddleware** - Integrates with routing
   - Builds context from requests
   - Enforces policies before handlers
   - Returns appropriate HTTP status codes

### Error Responses

| Status | Scenario |
|--------|----------|
| **401** | Could not determine access context (missing subject) |
| **403** | Access denied by policy (RBAC/ABAC check failed) |

Response body:
```json
{
  "error": "Forbidden",
  "message": "Access denied: [reason]"
}
```

## Testing

27 comprehensive tests validate:
- ✅ Basic equality/inequality checks
- ✅ Object property comparisons
- ✅ AND/OR logic
- ✅ Complex expressions with grouping
- ✅ Environment context
- ✅ Undefined property handling
- ✅ RBAC single/multiple role matching
- ✅ ABAC single/multiple rule evaluation
- ✅ Combined RBAC + ABAC
- ✅ Policy resolution with $ref
- ✅ Real-world scenarios (department managers, self-service access, etc.)

Run tests:
```bash
deno test tests/access-control.test.ts
```

## TypeScript Types

All types are defined in `core/types.ts`:

```typescript
export interface AccessControlPolicy {
  description?: string;
  roles?: string[];
  rules?: string[];
  $ref?: string;
}

export interface AccessControlContext {
  subject: {
    id: string;
    role: string;
    department?: string;
    permissions?: string[];
  };
  resource: {
    id: string;
    ownerId?: string;
    type?: string;
  };
  environment?: {
    ip?: string;
    timeOfDay?: string;
    timestamp?: number;
  };
}

export interface AccessControlResult {
  allowed: boolean;
  reason?: string;
  matchedRole?: string;
  matchedRule?: string;
}
```

## API Reference

### AccessControlEvaluator

```typescript
// Evaluate a policy against a context
evaluate(policy: AccessControlPolicy, context: AccessControlContext): AccessControlResult

// Resolve a policy reference (e.g., '#/components/x-policies/admin-only')
resolvePolicy(policyOrRef: AccessControlPolicy | string): AccessControlPolicy

// Get all defined policies
getPolicies(): Record<string, AccessControlPolicy>

// Clear policy cache
clearCache(): void

// Update OpenAPI spec (for hot reloading)
setOpenAPISpec(spec: OpenAPISpec): void
```

### RuleEvaluator

```typescript
// Evaluate a rule expression
evaluate(rule: string, context: AccessControlContext): boolean
```

### AccessControlMiddleware

```typescript
// Create middleware function
middleware(
  policy: AccessControlPolicy,
  contextBuilder: (ctx: ExecutionContext) => AccessControlContext | null
): (ctx: unknown, next: unknown) => Promise<void>

// Check access and return result
checkAccess(
  policy: AccessControlPolicy,
  context: AccessControlContext
): AccessControlResult

// Check access or throw error
checkAccessOrThrow(
  policy: AccessControlPolicy,
  context: AccessControlContext,
  errorMessage?: string
): AccessControlResult
```

## Best Practices

### 1. Define Common Policies

```yaml
x-policies:
  public:
    roles: []
    rules: []
  
  authenticated:
    roles: []
    rules: []
  
  admin-only:
    roles: ["admin"]
```

### 2. Use Policy References

```yaml
# ✅ Good: Reusable
x-access-control:
  $ref: '#/components/x-policies/admin-only'

# ❌ Avoid: Repeated
x-access-control:
  roles: ["admin"]
  rules: []
```

### 3. Be Specific with ABAC Rules

```yaml
# ✅ Clear and specific
- subject.id == resource.ownerId and subject.role == "user"

# ❌ Too broad
- subject.id == resource.ownerId or subject.role == "manager"
```

### 4. Document Complex Rules

```yaml
x-access-control:
  description: >
    Users can view/edit their own records, 
    Managers can view/edit their department's records, 
    Admins can view/edit all records
  roles: ["admin"]
  rules:
    - subject.id == resource.ownerId
    - subject.role == "manager" and subject.department == resource.department
```

### 5. Order Rules by Likelihood

```yaml
# ✅ Most likely first (faster)
rules:
  - subject.role == "admin"  # Most users are not admin
  - subject.id == resource.ownerId  # Evaluated next if RBAC fails
  - subject.department == resource.department

# ❌ Less likely first (slower)
rules:
  - subject.department == resource.department
  - subject.id == resource.ownerId
  - subject.role == "admin"
```

## Migration from x-auth

The `x-access-control` extension works alongside the legacy `x-auth` field. Both checks are performed:

1. **x-access-control** (new, faster) - RBAC/ABAC evaluation
2. **x-auth** (legacy) - Simple role check

```yaml
paths:
  /users:
    get:
      x-auth:
        role: admin  # Legacy check (still works)
      x-access-control:
        roles: ["admin"]  # New extension
```

For new projects, use `x-access-control`. For existing projects, gradually migrate from `x-auth` to `x-access-control`.

## Troubleshooting

### Issue: Access Always Denied

**Check:**
1. Is `subject.role` correctly populated?
2. Is the policy definition correct?
3. Are ABAC rules using correct variable names?

**Debug:**
```typescript
const result = evaluator.evaluate(policy, context);
console.log(result.reason);  // Shows why access was denied
```

### Issue: Rules Not Evaluating

**Common mistakes:**
- Missing quotes around string values: `subject.role == admin` → `subject.role == "admin"`
- Wrong variable names: `subject.department` (not `dept`)
- Typos in property names

### Issue: Performance

**Optimize:**
1. Order RBAC checks by frequency
2. Order ABAC rules by likelihood of match
3. Cache policies using `clearCache()` strategically
4. Avoid complex nested expressions

## See Also

- `core/managers/access-control-manager.ts` - Evaluator implementation
- `core/middleware/access-control.ts` - Middleware
- `tests/access-control.test.ts` - Test suite
- `core/types.ts` - TypeScript definitions
- `config/openapi.yaml` - Example policies
