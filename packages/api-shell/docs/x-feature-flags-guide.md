# x-feature-flags Extension Guide

## Overview

The `x-feature-flags` extension enables declarative feature flag management directly in your OpenAPI specification. It provides configuration-driven feature toggling without code changes, supporting role-based, user-based, environment-based, and percentage-based rollouts.

## Features

✅ **Simple Flags** - Enable/disable features globally  
✅ **Role-Based Flags** - Enable features for specific roles  
✅ **User-Based Flags** - Enable features for specific users  
✅ **Environment-Based** - Different flags per environment  
✅ **Percentage Rollouts** - Gradual rollouts with percentage-based access  
✅ **Flag Reuse** - Define common flags once in `components.x-flags`  
✅ **Flag References** - Reference flags using `$ref` for DRY configs  
✅ **Runtime Evaluation** - Fast flag evaluation  
✅ **Composition** - Combine multiple flag types  

## Quick Start

### 1. Define Reusable Flags

In `config/openapi.yaml`, add a `components.x-flags` section:

```yaml
components:
  x-flags:
    beta-ui:
      description: Beta user interface
      enabled: false
      allowedRoles: []
      allowedUsers: []
      environments: ["staging", "development"]
      rolloutPercentage: 0
    
    advanced-analytics:
      description: Advanced analytics dashboard
      enabled: true
      allowedRoles: ["admin", "analyst"]
      allowedUsers: []
      environments: ["production", "staging"]
      rolloutPercentage: 100
    
    new-export-feature:
      description: New export functionality (10% rollout)
      enabled: true
      allowedRoles: []
      allowedUsers: []
      environments: ["production"]
      rolloutPercentage: 10
    
    early-access-api:
      description: Early access API endpoints
      enabled: true
      allowedRoles: []
      allowedUsers: ["user123", "user456"]
      environments: ["staging", "development"]
      rolloutPercentage: 100
```

### 2. Apply Flags to Operations

Reference flags using `$ref` or define inline:

```yaml
paths:
  /dashboard:
    get:
      summary: Get Dashboard
      operationId: getDashboard
      x-feature-flags:
        - $ref: '#/components/x-flags/beta-ui'

  /analytics/advanced:
    get:
      summary: Get Advanced Analytics
      operationId: getAdvancedAnalytics
      x-feature-flags:
        - $ref: '#/components/x-flags/advanced-analytics'

  /export/pdf:
    post:
      summary: Export to PDF
      operationId: exportPDF
      x-feature-flags:
        - description: PDF export with gradual rollout
          enabled: true
          allowedRoles: []
          allowedUsers: []
          environments: ["production"]
          rolloutPercentage: 10

  /api/v2/preview:
    get:
      summary: Preview V2 API
      operationId: previewV2API
      x-feature-flags:
        - $ref: '#/components/x-flags/early-access-api'
```

## Extension Structure

### Feature Flag Object

```typescript
{
  description?: string;      // Human-readable explanation
  enabled: boolean;          // Global on/off switch
  allowedRoles?: string[];   // Roles that can access this feature
  allowedUsers?: string[];   // Specific users that can access
  environments?: string[];   // Environments where feature is available
  rolloutPercentage?: number; // Percentage-based rollout (0-100)
  $ref?: string;            // Reference to a component flag
  [key: string]: unknown;   // Additional custom fields
}
```

### Evaluation Logic

The evaluator applies this decision tree:

1. **Global disable** → If `enabled: false`, deny
2. **Environment check** → If `environments` defined, must match current environment
3. **Role-based check** → If `allowedRoles` defined and not empty, user role must match
4. **User-based check** → If `allowedUsers` defined and not empty, user ID must match
5. **Percentage rollout** → If `rolloutPercentage < 100`, check if user qualifies (hash-based)
6. **Default** → Allow (all checks passed)

```
if !enabled {
  ❌ Deny (feature disabled)
} else if environments && !environments.includes(environment) {
  ❌ Deny (feature not available in this environment)
} else if allowedRoles && !allowedRoles.includes(subject.role) {
  ❌ Deny (user role not allowed)
} else if allowedUsers && !allowedUsers.includes(subject.id) {
  ❌ Deny (user not in allowed list)
} else if rolloutPercentage < 100 {
  // Hash user ID and check if within percentage
  if hashPercentage(subject.id) >= rolloutPercentage {
    ❌ Deny (user not selected for rollout)
  }
}
✅ Allow (all checks passed)
```

## Flag Properties

### enabled

```yaml
enabled: true  # Feature is available
enabled: false # Feature is completely disabled
```

### allowedRoles

```yaml
allowedRoles: []           # No role restrictions
allowedRoles: ["admin"]    # Only admins
allowedRoles: ["admin", "manager"]  # Multiple roles
```

### allowedUsers

```yaml
allowedUsers: []           # No user restrictions
allowedUsers: ["user123"]  # Specific user
allowedUsers: ["user123", "user456", "user789"]  # Multiple users
```

### environments

```yaml
environments: []  # Available in all environments
environments: ["production"]  # Only in production
environments: ["staging", "development"]  # Multiple environments
```

### rolloutPercentage

```yaml
rolloutPercentage: 0    # 0% - No users get the feature
rolloutPercentage: 10   # 10% - 1 in 10 users
rolloutPercentage: 50   # 50% - 50% of users
rolloutPercentage: 100  # 100% - All users
```

## Context Variables

```typescript
subject: {
  id: string;           // Unique user identifier (used for rollout hash)
  role: string;         // User's role
  [key: string]: unknown; // Additional custom fields
}

environment: {
  name: string;         // Current environment (production, staging, etc.)
  [key: string]: unknown; // Additional custom fields
}
```

## Real-World Examples

### Example 1: Gradual Feature Rollout

```yaml
x-flags:
  new-checkout:
    description: New checkout process - starting with 5% rollout
    enabled: true
    allowedRoles: []
    allowedUsers: []
    environments: ["production"]
    rolloutPercentage: 5

  # Later, increase to 25%
  # new-checkout:
  #   rolloutPercentage: 25

  # Eventually, 100%
  # new-checkout:
  #   rolloutPercentage: 100
```

### Example 2: Beta Feature for Early Adopters

```yaml
x-flags:
  ai-recommendations:
    description: AI-powered product recommendations (beta)
    enabled: true
    allowedRoles: []
    allowedUsers: ["user_beta_001", "user_beta_002", "user_beta_003"]
    environments: ["production", "staging"]
    rolloutPercentage: 100
```

### Example 3: Admin-Only Preview

```yaml
x-flags:
  admin-dashboard-v2:
    description: New admin dashboard (admin preview)
    enabled: true
    allowedRoles: ["admin"]
    allowedUsers: []
    environments: ["staging", "development"]
    rolloutPercentage: 100
```

### Example 4: Multi-Environment Feature Control

```yaml
x-flags:
  dark-mode:
    description: Dark mode support (dev/staging only)
    enabled: true
    allowedRoles: []
    allowedUsers: []
    environments: ["development", "staging"]
    rolloutPercentage: 100
  
  # Production flag name (different state per environment)
  # dark-mode-prod:
  #   description: Dark mode support (production)
  #   enabled: false
  #   environments: ["production"]
  #   rolloutPercentage: 0
```

### Example 5: Combined Role + Percentage Rollout

```yaml
x-flags:
  premium-analytics:
    description: Premium analytics - rolling out to managers first
    enabled: true
    allowedRoles: ["admin", "manager"]
    allowedUsers: []
    environments: ["production"]
    rolloutPercentage: 50  # 50% of managers get it
```

## Implementation Details

### Architecture

```
Request
  ↓
[Auth Middleware]  ← Authenticate user
  ↓
[Feature Flags Middleware] ← Check x-feature-flags
  ├─ Global enable check
  ├─ Environment check
  ├─ Role-based check
  ├─ User-based check
  ├─ Percentage rollout check
  └─ Allow/Deny decision
  ↓
[Validation] ← Validate request body/params
  ↓
[Handler] ← Execute route handler
```

### Rollout Algorithm

Feature flags use consistent hashing for percentage-based rollouts:

```typescript
// Deterministic hash-based rollout
// Same user always gets same treatment
function isUserInRollout(userId: string, percentage: number): boolean {
  if (percentage >= 100) return true;
  if (percentage <= 0) return false;
  
  const hash = hashString(userId);
  const hashPercentage = (hash % 100);
  return hashPercentage < percentage;
}
```

This ensures:
- **Consistency**: Same user always sees same variant
- **Deterministic**: No randomness across requests
- **Scalable**: Works across distributed systems

### Feature Flags Manager

The feature flags module includes:

1. **FeatureFlagEvaluator** - Evaluates flags against context
   - Resolves flag references
   - Caches resolved flags
   - Performs rollout calculations
   - Supports policy references

2. **FeatureFlagMiddleware** - Integrates with routing
   - Checks multiple flags
   - Builds context from requests
   - Enforces flags before handlers
   - Returns appropriate HTTP status codes

### Error Responses

| Status | Scenario |
|--------|----------|
| **401** | Could not determine feature flag context (missing subject) |
| **403** | Feature not available (flag check failed) |

Response body:
```json
{
  "error": "Forbidden",
  "message": "Feature not available: [reason]"
}
```

## TypeScript Types

```typescript
export interface FeatureFlag {
  description?: string;
  enabled: boolean;
  allowedRoles?: string[];
  allowedUsers?: string[];
  environments?: string[];
  rolloutPercentage?: number;
  $ref?: string;
  [key: string]: unknown;
}

export interface FeatureFlagContext {
  subject: {
    id: string;
    role: string;
    [key: string]: unknown;
  };
  environment: {
    name: string;
    [key: string]: unknown;
  };
}

export interface FeatureFlagResult {
  enabled: boolean;
  reason?: string;
  matchedRule?: string;
}
```

## API Reference

### FeatureFlagEvaluator

```typescript
// Evaluate a flag against a context
evaluate(flag: FeatureFlag, context: FeatureFlagContext): FeatureFlagResult

// Evaluate multiple flags (all must pass)
evaluateAll(flags: FeatureFlag[], context: FeatureFlagContext): FeatureFlagResult

// Evaluate multiple flags (any can pass)
evaluateAny(flags: FeatureFlag[], context: FeatureFlagContext): FeatureFlagResult

// Resolve a flag reference (e.g., '#/components/x-flags/beta-ui')
resolveFlag(flagOrRef: FeatureFlag | string): FeatureFlag

// Get all defined flags
getFlags(): Record<string, FeatureFlag>

// Clear flag cache
clearCache(): void

// Update OpenAPI spec (for hot reloading)
setOpenAPISpec(spec: OpenAPISpec): void
```

### FeatureFlagMiddleware

```typescript
// Create middleware function
middleware(
  flags: FeatureFlag[] | undefined,
  contextBuilder: (ctx: ExecutionContext) => FeatureFlagContext | null
): (ctx: unknown, next: unknown) => Promise<void>

// Check if feature is enabled
checkFeature(
  flags: FeatureFlag[] | undefined,
  context: FeatureFlagContext
): FeatureFlagResult

// Check if feature is enabled or throw error
checkFeatureOrThrow(
  flags: FeatureFlag[] | undefined,
  context: FeatureFlagContext,
  errorMessage?: string
): FeatureFlagResult
```

### FeatureFlagEvaluator (Utility Functions)

```typescript
// Calculate rollout percentage for a user (deterministic)
calculateUserRolloutPercentage(userId: string): number

// Check if user qualifies for rollout
isUserInRollout(userId: string, percentage: number): boolean

// Get detailed evaluation reason
getEvaluationDetails(flag: FeatureFlag, context: FeatureFlagContext): string
```

## Best Practices

### 1. Name Flags Clearly

```yaml
# ✅ Good: Descriptive names
new-checkout-flow
ai-powered-search
mobile-app-v2

# ❌ Avoid: Vague names
feature1
new-stuff
experiment
```

### 2. Use Environments Appropriately

```yaml
# ✅ Good: Environment-specific
enabled: true
environments: ["development", "staging"]

# ❌ Avoid: Inconsistent naming
environments: ["dev", "test", "prod"]
```

### 3. Define Gradual Rollouts

```yaml
# ✅ Good: Gradual rollout strategy
week1: rolloutPercentage: 5
week2: rolloutPercentage: 10
week3: rolloutPercentage: 25
week4: rolloutPercentage: 100

# ❌ Avoid: Sudden rollouts
rolloutPercentage: 0
# then jump to 100
```

### 4. Document Complex Flags

```yaml
x-flags:
  complex-feature:
    description: >
      Feature available in production for 10% of users,
      for all users in staging/dev.
      Available to all admins and analysts regardless of percentage.
    enabled: true
    allowedRoles: ["admin", "analyst"]
    allowedUsers: []
    environments: ["production", "staging", "development"]
    rolloutPercentage: 10
```

### 5. Clean Up Old Flags

```yaml
# ✅ Good: Remove flags after full rollout
# old-flag removed, feature now permanent

# ❌ Avoid: Leaving 100% rollout flags
old-feature:
  enabled: true
  rolloutPercentage: 100  # Clean this up!
```

## Testing

Create test cases for:
- ✅ Feature enabled/disabled
- ✅ Role-based access
- ✅ User-based access
- ✅ Environment filtering
- ✅ Percentage rollout calculations
- ✅ Combined flag conditions
- ✅ Flag reference resolution
- ✅ Consistent hashing for rollouts

## See Also

- `core/managers/feature-flags-manager.ts` - Evaluator implementation
- `core/middleware/feature-flags.ts` - Middleware
- `tests/feature-flags.test.ts` - Test suite
- `core/types.ts` - TypeScript definitions
- `config/openapi.yaml` - Example flags
