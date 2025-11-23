// JWT Middleware Tests
// Tests for JWT authentication and token decoding
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { decodeJWT, createJWTMiddleware } from "../core/middleware/jwt.ts";

// ============================================================================
// JWT Decoder Tests
// ============================================================================

Deno.test("decodeJWT: Valid JWT token", () => {
  // This is a valid JWT with payload: {"id":"user123","role":"admin","email":"admin@example.com"}
  // Note: This is not signed, just base64url encoded for testing
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIn0.signature";
  
  const decoded = decodeJWT(token);
  
  assertEquals(decoded !== null, true);
  assertEquals(decoded?.id, "user123");
  assertEquals(decoded?.role, "admin");
  assertEquals(decoded?.email, "admin@example.com");
});

Deno.test("decodeJWT: Token with numeric fields", () => {
  // Payload: {"id":"user456","role":"user","iat":1700000000,"exp":1700086400}
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXI0NTYiLCJyb2xlIjoidXNlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ.signature";
  
  const decoded = decodeJWT(token);
  
  assertEquals(decoded !== null, true);
  assertEquals(decoded?.id, "user456");
  assertEquals(decoded?.role, "user");
  assertEquals(decoded?.iat, 1700000000);
  assertEquals(decoded?.exp, 1700086400);
});

Deno.test("decodeJWT: Invalid token format", () => {
  const token = "invalid.token";
  const decoded = decodeJWT(token);
  assertEquals(decoded, null);
});

Deno.test("decodeJWT: Empty token", () => {
  const token = "";
  const decoded = decodeJWT(token);
  assertEquals(decoded, null);
});

Deno.test("decodeJWT: Token with invalid base64", () => {
  const token = "header.!!!invalid!!!.signature";
  const decoded = decodeJWT(token);
  assertEquals(decoded, null);
});

// ============================================================================
// JWT Middleware Tests
// ============================================================================

Deno.test("JWT Middleware: Valid Bearer token", async () => {
  const middleware = createJWTMiddleware({ required: false });
  
  // Valid JWT token
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIn0.signature";
  
  // Mock context
  const ctx: {
    request: { headers: Map<string, string>; get: (name: string) => string | undefined };
    state: { user?: Record<string, unknown> };
    response: { status: number; body: unknown };
  } = {
    request: {
      headers: new Map([["authorization", `Bearer ${token}`]]),
      get(name: string) {
        return this.headers.get(name.toLowerCase());
      },
    },
    state: {},
    response: {
      status: 200,
      body: null,
    },
  };
  
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
    return Promise.resolve();
  };
  
  await middleware(ctx, next);
  
  assertEquals(nextCalled, true);
  assertEquals(ctx.state.user !== undefined, true);
  assertEquals(ctx.state.user?.id, "user123");
  assertEquals(ctx.state.user?.role, "admin");
  assertEquals(ctx.state.user?.email, "admin@example.com");
});

Deno.test("JWT Middleware: Missing Authorization header (not required)", async () => {
  const middleware = createJWTMiddleware({ required: false });
  
  const ctx: {
    request: { headers: Map<string, string>; get: (name: string) => string | undefined };
    state: { user?: Record<string, unknown> };
    response: { status: number; body: unknown };
  } = {
    request: {
      headers: new Map(),
      get(name: string) {
        return this.headers.get(name.toLowerCase());
      },
    },
    state: {},
    response: {
      status: 200,
      body: null,
    },
  };
  
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
    return Promise.resolve();
  };
  
  await middleware(ctx, next);
  
  assertEquals(nextCalled, true);
  assertEquals(ctx.state.user, undefined);
  assertEquals(ctx.response.status, 200);
});

Deno.test("JWT Middleware: Missing Authorization header (required)", async () => {
  const middleware = createJWTMiddleware({ required: true });
  
  const ctx: {
    request: { headers: Map<string, string>; get: (name: string) => string | undefined };
    state: { user?: Record<string, unknown> };
    response: { status: number; body: { error?: string; message?: string } | null };
  } = {
    request: {
      headers: new Map(),
      get(name: string) {
        return this.headers.get(name.toLowerCase());
      },
    },
    state: {},
    response: {
      status: 200,
      body: null,
    },
  };
  
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
    return Promise.resolve();
  };
  
  await middleware(ctx, next);
  
  assertEquals(nextCalled, false);
  assertEquals(ctx.response.status, 401);
  assertEquals((ctx.response.body as { error: string })?.error, "Unauthorized");
});

Deno.test("JWT Middleware: Invalid Bearer format", async () => {
  const middleware = createJWTMiddleware({ required: true });
  
  const ctx: {
    request: { headers: Map<string, string>; get: (name: string) => string | undefined };
    state: { user?: Record<string, unknown> };
    response: { status: number; body: unknown };
  } = {
    request: {
      headers: new Map([["authorization", "InvalidFormat token"]]),
      get(name: string) {
        return this.headers.get(name.toLowerCase());
      },
    },
    state: {},
    response: {
      status: 200,
      body: null,
    },
  };
  
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
    return Promise.resolve();
  };
  
  await middleware(ctx, next);
  
  assertEquals(nextCalled, false);
  assertEquals(ctx.response.status, 401);
});

Deno.test("JWT Middleware: Invalid JWT token", async () => {
  const middleware = createJWTMiddleware({ required: true });
  
  const ctx: {
    request: { headers: Map<string, string>; get: (name: string) => string | undefined };
    state: { user?: Record<string, unknown> };
    response: { status: number; body: unknown };
  } = {
    request: {
      headers: new Map([["authorization", "Bearer invalid.token"]]),
      get(name: string) {
        return this.headers.get(name.toLowerCase());
      },
    },
    state: {},
    response: {
      status: 200,
      body: null,
    },
  };
  
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
    return Promise.resolve();
  };
  
  await middleware(ctx, next);
  
  assertEquals(nextCalled, false);
  assertEquals(ctx.response.status, 401);
});

Deno.test("JWT Middleware: Case-insensitive Bearer", async () => {
  const middleware = createJWTMiddleware({ required: false });
  
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJyb2xlIjoiYWRtaW4ifQ.signature";
  
  const ctx: {
    request: { headers: Map<string, string>; get: (name: string) => string | undefined };
    state: { user?: Record<string, unknown> };
    response: { status: number; body: unknown };
  } = {
    request: {
      headers: new Map([["authorization", `bearer ${token}`]]),
      get(name: string) {
        return this.headers.get(name.toLowerCase());
      },
    },
    state: {},
    response: {
      status: 200,
      body: null,
    },
  };
  
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
    return Promise.resolve();
  };
  
  await middleware(ctx, next);
  
  assertEquals(nextCalled, true);
  assertEquals(ctx.state.user !== undefined, true);
  assertEquals(ctx.state.user?.id, "user123");
});

// ============================================================================
// Real-world Scenarios
// ============================================================================

Deno.test("Scenario: Admin user accessing protected endpoint", async () => {
  const middleware = createJWTMiddleware({ required: false });
  
  // Admin JWT
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluMSIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20ifQ.signature";
  
  const ctx: {
    request: { headers: Map<string, string>; get: (name: string) => string | undefined };
    state: { user?: Record<string, unknown> };
    response: { status: number; body: unknown };
  } = {
    request: {
      headers: new Map([["authorization", `Bearer ${token}`]]),
      get(name: string) {
        return this.headers.get(name.toLowerCase());
      },
    },
    state: {},
    response: {
      status: 200,
      body: null,
    },
  };
  
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
    return Promise.resolve();
  };
  
  await middleware(ctx, next);
  
  assertEquals(nextCalled, true);
  assertEquals(ctx.state.user?.role, "admin");
  
  // Simulate access control check
  const hasAdminRole = ctx.state.user?.role === "admin";
  assertEquals(hasAdminRole, true);
});

Deno.test("Scenario: Regular user accessing protected endpoint", async () => {
  const middleware = createJWTMiddleware({ required: false });
  
  // Regular user JWT
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJyb2xlIjoidXNlciIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSJ9.signature";
  
  const ctx: {
    request: { headers: Map<string, string>; get: (name: string) => string | undefined };
    state: { user?: Record<string, unknown> };
    response: { status: number; body: unknown };
  } = {
    request: {
      headers: new Map([["authorization", `Bearer ${token}`]]),
      get(name: string) {
        return this.headers.get(name.toLowerCase());
      },
    },
    state: {},
    response: {
      status: 200,
      body: null,
    },
  };
  
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
    return Promise.resolve();
  };
  
  await middleware(ctx, next);
  
  assertEquals(nextCalled, true);
  assertEquals(ctx.state.user?.role, "user");
  
  // Simulate access control check (should fail for admin-only endpoint)
  const hasAdminRole = ctx.state.user?.role === "admin";
  assertEquals(hasAdminRole, false);
});

Deno.test("Scenario: JWT with additional claims", async () => {
  const middleware = createJWTMiddleware({ required: false });
  
  // JWT with department and permissions
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJyb2xlIjoidXNlciIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImRlcGFydG1lbnQiOiJzYWxlcyIsInBlcm1pc3Npb25zIjpbInJlYWQiLCJ3cml0ZSJdfQ.signature";
  
  const ctx: {
    request: { headers: Map<string, string>; get: (name: string) => string | undefined };
    state: { user?: Record<string, unknown> };
    response: { status: number; body: unknown };
  } = {
    request: {
      headers: new Map([["authorization", `Bearer ${token}`]]),
      get(name: string) {
        return this.headers.get(name.toLowerCase());
      },
    },
    state: {},
    response: {
      status: 200,
      body: null,
    },
  };
  
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
    return Promise.resolve();
  };
  
  await middleware(ctx, next);
  
  assertEquals(nextCalled, true);
  assertEquals(ctx.state.user?.department, "sales");
  assertEquals(Array.isArray(ctx.state.user?.permissions), true);
  assertEquals((ctx.state.user?.permissions as string[]).length, 2);
  assertEquals((ctx.state.user?.permissions as string[]).includes("read"), true);
  assertEquals((ctx.state.user?.permissions as string[]).includes("write"), true);
});

// ============================================================================
// Helper to generate test JWTs
// ============================================================================

/**
 * Helper function to create a test JWT token
 * Note: This creates unsigned tokens for testing only
 */
function createTestJWT(payload: Record<string, unknown>): string {
  const header = { alg: "HS256", typ: "JWT" };
  
  const encodeBase64Url = (obj: unknown): string => {
    const json = JSON.stringify(obj);
    const base64 = btoa(json);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  };
  
  const headerEncoded = encodeBase64Url(header);
  const payloadEncoded = encodeBase64Url(payload);
  
  return `${headerEncoded}.${payloadEncoded}.signature`;
}

Deno.test("Helper: createTestJWT generates valid token", () => {
  const payload = {
    id: "test123",
    role: "admin",
    email: "test@example.com",
  };
  
  const token = createTestJWT(payload);
  const decoded = decodeJWT(token);
  
  assertEquals(decoded !== null, true);
  assertEquals(decoded?.id, "test123");
  assertEquals(decoded?.role, "admin");
  assertEquals(decoded?.email, "test@example.com");
});
