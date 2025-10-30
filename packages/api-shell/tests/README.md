# Registration Flow Test Suite

This test suite validates the complete user registration progression through all 4 steps defined in the API Shell, with comprehensive contract testing for dynamic OpenAPI specs.

## Overview

The test suite covers:

### Unit Tests
1. **Step 1: Email Verification** - Verify email and create registration session
2. **Step 2: Profile Information** - Collect user profile data
3. **Step 3: Credentials & Security** - Set password and MFA settings
4. **Step 4: Account Confirmation** - Confirm registration and create account

### Contract Tests (NEW - For Dynamic Specs)
1. **General Contract Validation** - Ensures OpenAPI spec has required structure
2. **Registration Contract Validation** - Ensures all registration paths and schemas exist
3. **Handler Configuration Validation** - Ensures all operations have handler configs
4. **Full Validation Pipeline** - End-to-end validation when loading specs

## Running Tests

```bash
# Run all tests
deno task test

# Run with coverage
deno test --coverage=cov/ --allow-net --allow-read --allow-env tests/

# Run specific test file
deno test --allow-net --allow-read --allow-env tests/registration_flow.test.ts

# Run specific test
deno test --allow-net --allow-read --allow-env --filter "Step 1" tests/registration_flow.test.ts
```

## Test Coverage

### Sequential Flow Tests (tests/registration_flow.test.ts)
- **Step 1-4 Tests** - Tests each registration step in sequence with assertions
- **Password Validation** - Tests password strength requirements
- **Error Handling** - Tests 5 different error scenarios
- **Complete E2E** - Full registration journey with validation at each step

### Spec Contract Tests (tests/spec_contracts.test.ts)
- **Valid Spec** - Validates a complete and correct registration spec
- **Missing Paths** - Detects when required registration paths are missing
- **Missing Schemas** - Detects when required request/response schemas are missing
- **Invalid Structure** - Detects malformed OpenAPI specs
- **Full Pipeline** - Tests the complete validation flow
- **Error Categorization** - Ensures errors are properly categorized

## Dynamic Spec Testing Strategy

For production systems where OpenAPI specs are loaded dynamically from databases, this implementation uses a **hybrid approach**:

### 1. Unit Tests (Registration Flow)
- Test handlers in isolation with mock/fixture specs
- **File:** `tests/registration_flow.test.ts`
- **When:** On each code change
- **Speed:** Fast (< 50ms)
- **Purpose:** Validate business logic independent of spec source

### 2. Contract Tests (Spec Validation) ⭐ NEW
- Validate specs satisfy required contracts when loaded from **any source**
- **File:** `tests/spec_contracts.test.ts`  
- **When:** Spec loaded from DB/file, on server startup
- **Speed:** Fast (< 100ms)
- **Purpose:** Prevents invalid specs from registering routes

### 3. Optional: Integration Tests
- Load specs from test database
- Test full request/response cycle
- Runs pre-deployment, nightly

### 4. Optional: Snapshot Tests
- Document expected routes and schemas
- Catch unintended spec changes
- Run whenever spec changes

## Architecture: Pluggable Configuration Sources

The `ConfigLoader` now supports multiple configuration sources through the `ConfigSource` interface:

```typescript
// File-based (default - current)
const loader = new ConfigLoader("./config/openapi.yaml");

// Memory-based (testing)
import { MemoryConfigSource } from "../core/loader.ts";
const testSpec = { openapi: "3.1.1", ... };
const loader = new ConfigLoader(new MemoryConfigSource(testSpec));

// Future: Database source
export class DatabaseConfigSource implements ConfigSource {
  constructor(private db: Database) {}
  async load(): Promise<unknown> {
    return this.db.query("SELECT spec FROM api_specs WHERE id = 1");
  }
}
const loader = new ConfigLoader(new DatabaseConfigSource(dbConnection));
```

**Key advantage:** Same validation runs regardless of source

## Server Startup Validation

The server now validates all specs on startup:

```
🧬 API Shell - Configuration-Driven API Server
📂 Loading configuration from: ./config/openapi.yaml
✅ Registered handlers: crud, query, proxy, script, formula
✅ Configuration loaded: Test API v1.0.0
📍 Routes: 4
📄 OpenAPI spec version: 3.1.1
🔍 Validating spec contracts...
✅ Spec contracts validated successfully
🎉 API Shell starting...
```

If a spec fails validation, the server exits with clear error details:

```
❌ Spec validation failed:
   - [Registration] Missing required path: /auth/register/step2
   - [Registration] Missing required schema: register_profile
   - [General] No paths defined
```

## What Gets Validated

### General Contracts
- ✅ OpenAPI version specified
- ✅ Info section with title and version
- ✅ Paths section exists with operations
- ✅ Components section with schemas

### Registration-Specific Contracts
- ✅ All 4 registration steps exist (`/auth/register/step1-4`)
- ✅ All required schemas exist (`register_email`, `register_profile`, `register_credentials`, `register_confirm`)
- ✅ Each operation has handler configuration

### Errors Are Categorized
Each error includes a category for easy debugging:
- `[General]` - OpenAPI structure issues
- `[Registration]` - Missing registration paths/schemas
- `[Handlers]` - Missing handler configurations

## Test Fixtures

Located in `tests/fixtures/spec_fixtures.ts`:

- **validRegistrationSpec** - Complete, valid registration spec
- **specMissingPaths** - Spec missing required registration paths
- **specMissingSchemas** - Spec missing required schemas
- **invalidSpec** - Malformed spec without OpenAPI structure

Use these fixtures for testing without database:

```typescript
import { validRegistrationSpec } from "./fixtures/spec_fixtures.ts";

const loader = new ConfigLoader(new MemoryConfigSource(validRegistrationSpec));
const config = await loader.load();
```

## Expected Test Output

```
ok | 19 passed | 0 failed (30ms)
```

Tests include:
- 10 registration flow tests (unit)
- 9 spec contract tests (contract)

## Test Data

### Registration Test User
```typescript
{
  email: "testuser@example.com",
  firstName: "Test",
  lastName: "User",
  organization: "Test Corp",
  role: "developer",
  password: "SecurePass123!",
  enableMfa: true,
  confirmCode: "123456"
}
```

### Required Registration Paths
- `/auth/register/step1` - Email verification
- `/auth/register/step2` - Profile information
- `/auth/register/step3` - Credentials
- `/auth/register/step4` - Confirmation

### Required Schemas
- `register_email` - Email verification request
- `register_profile` - Profile information request
- `register_credentials` - Credentials request
- `register_confirm` - Confirmation request

## Extending Tests

### Adding New Unit Tests

```typescript
Deno.test("Registration - Custom Scenario", () => {
  const customUser = { ...testUser, email: "custom@example.com" };
  // Test logic here
});
```

### Adding New Contract Validations

```typescript
// core/spec_contract.ts
export function validateCustomContract(spec: OpenAPISpec) {
  const errors: string[] = [];
  // Add custom validation logic
  return { valid: errors.length === 0, errors };
}

// Update validateSpecContracts to call it
```

### Testing Database-Loaded Specs

```typescript
// tests/integration/database_specs.test.ts
import { DatabaseConfigSource } from "../core/loader.ts";

Deno.test("Database Spec Loading", async () => {
  const dbSource = new DatabaseConfigSource(testDb);
  const loader = new ConfigLoader(dbSource);
  const config = await loader.load();
  
  // Validate database spec
  const spec = loader.getOpenAPISpec();
  const validation = validateSpecContracts(spec);
  assertEquals(validation.valid, true);
});
```

## Test Dependencies

- Deno standard library: `std/assert/mod.ts`
- No external dependencies required

## Permissions Required

The test runner requires:
- `--allow-net` - For potential API calls
- `--allow-read` - For reading test files
- `--allow-env` - For environment variable access

These are included in the `deno task test` command.

## Future Enhancements

### Integration Tests (Optional)
When you add database support, create integration tests:

```typescript
// tests/integration/database_specs.test.ts
import { DatabaseConfigSource } from "../core/loader.ts";

Deno.test("Database Spec Loading", async () => {
  const dbSource = new DatabaseConfigSource(testDb);
  const loader = new ConfigLoader(dbSource);
  const config = await loader.load();
  
  const spec = loader.getOpenAPISpec();
  const validation = validateSpecContracts(spec);
  assertEquals(validation.valid, true);
});
```

### Snapshot Tests (Optional)
Document expected spec structure to catch unintended changes:

```typescript
// tests/__snapshots__/openapi.snap.json
{
  "paths": ["/auth/register/step1", ...],
  "schemas": ["register_email", ...]
}
```

### Property-Based Tests (Optional)
Test invariants that should always hold:

```typescript
// All routes have handlers, paths start with /, etc.
for (const route of config.routes) {
  assert(route.path.startsWith("/"));
  assert(handlerRegistry.has(route.handler.type));
}
```

## Related Documentation

- See main [README.md](../README.md) for server documentation
