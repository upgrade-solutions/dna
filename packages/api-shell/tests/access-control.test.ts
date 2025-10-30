// Access Control Tests
// Tests for RBAC and ABAC evaluation
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  AccessControlEvaluator,
  RuleEvaluator,
  createAccessControlEvaluator,
} from "../core/managers/access-control-manager.ts";
import type {
  AccessControlPolicy,
  AccessControlContext,
  OpenAPISpec,
} from "../core/types.ts";

// ============================================================================
// RuleEvaluator Tests
// ============================================================================

Deno.test("RuleEvaluator: Simple equality check", () => {
  const evaluator = new RuleEvaluator();
  const context = {
    subject: { id: "user1", role: "admin" },
    resource: { id: "res1", ownerId: "user1" },
  } as AccessControlContext;

  const result = evaluator.evaluate('subject.role == "admin"', context);
  assertEquals(result, true);
});

Deno.test("RuleEvaluator: Inequality check", () => {
  const evaluator = new RuleEvaluator();
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1", ownerId: "user1" },
  } as AccessControlContext;

  const result = evaluator.evaluate('subject.role != "admin"', context);
  assertEquals(result, true);
});

Deno.test("RuleEvaluator: Object property comparison", () => {
  const evaluator = new RuleEvaluator();
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1", ownerId: "user1" },
  } as AccessControlContext;

  const result = evaluator.evaluate("subject.id == resource.ownerId", context);
  assertEquals(result, true);
});

Deno.test("RuleEvaluator: AND logic", () => {
  const evaluator = new RuleEvaluator();
  const context = {
    subject: { id: "user1", role: "user", department: "sales" },
    resource: { id: "res1", ownerId: "user1", department: "sales" },
  } as AccessControlContext;

  const result = evaluator.evaluate(
    'subject.role == "user" and subject.id == resource.ownerId',
    context
  );
  assertEquals(result, true);
});

Deno.test("RuleEvaluator: AND logic fails when one condition false", () => {
  const evaluator = new RuleEvaluator();
  const context = {
    subject: { id: "user1", role: "admin", department: "sales" },
    resource: { id: "res1", ownerId: "user1", department: "finance" },
  } as AccessControlContext;

  const result = evaluator.evaluate(
    'subject.role == "user" and subject.department == resource.department',
    context
  );
  assertEquals(result, false);
});

Deno.test("RuleEvaluator: OR logic", () => {
  const evaluator = new RuleEvaluator();
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1", ownerId: "user2" },
  } as AccessControlContext;

  const result = evaluator.evaluate(
    'subject.role == "admin" or subject.id == resource.ownerId',
    context
  );
  assertEquals(result, false);
});

Deno.test("RuleEvaluator: OR logic - one condition true", () => {
  const evaluator = new RuleEvaluator();
  const context = {
    subject: { id: "user1", role: "admin" },
    resource: { id: "res1", ownerId: "user2" },
  } as AccessControlContext;

  const result = evaluator.evaluate(
    'subject.role == "admin" or subject.id == resource.ownerId',
    context
  );
  assertEquals(result, true);
});

Deno.test("RuleEvaluator: Complex expression with AND/OR", () => {
  const evaluator = new RuleEvaluator();
  const context = {
    subject: { id: "user1", role: "user", department: "sales" },
    resource: { id: "res1", ownerId: "user1", department: "sales" },
  } as AccessControlContext;

  const result = evaluator.evaluate(
    '(subject.role == "admin") or (subject.id == resource.ownerId and subject.department == resource.department)',
    context
  );
  assertEquals(result, true);
});

Deno.test("RuleEvaluator: Environment context", () => {
  const evaluator = new RuleEvaluator();
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1", ownerId: "user1" },
    environment: { ip: "192.168.1.1", timeOfDay: "business_hours" },
  } as AccessControlContext;

  const result = evaluator.evaluate(
    'environment.timeOfDay == "business_hours"',
    context
  );
  assertEquals(result, true);
});

Deno.test("RuleEvaluator: Handles undefined properties gracefully", () => {
  const evaluator = new RuleEvaluator();
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1" }, // ownerId is undefined
  } as AccessControlContext;

  const result = evaluator.evaluate(
    'subject.id == resource.ownerId',
    context
  );
  assertEquals(result, false);
});

// ============================================================================
// AccessControlEvaluator Tests - RBAC
// ============================================================================

Deno.test("AccessControlEvaluator: RBAC - Single role match", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: ["admin", "manager"],
    rules: [],
  };
  const context = {
    subject: { id: "user1", role: "admin" },
    resource: { id: "res1" },
  } as AccessControlContext;

  const result = evaluator.evaluate(policy, context);
  assertEquals(result.allowed, true);
  assertEquals(result.matchedRole, "admin");
});

Deno.test("AccessControlEvaluator: RBAC - Role not in list", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: ["admin", "manager"],
    rules: [],
  };
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1" },
  } as AccessControlContext;

  const result = evaluator.evaluate(policy, context);
  assertEquals(result.allowed, false);
});

// ============================================================================
// AccessControlEvaluator Tests - ABAC
// ============================================================================

Deno.test("AccessControlEvaluator: ABAC - Rule matches", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: [],
    rules: ["subject.id == resource.ownerId"],
  };
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1", ownerId: "user1" },
  } as AccessControlContext;

  const result = evaluator.evaluate(policy, context);
  assertEquals(result.allowed, true);
  assertEquals(result.matchedRule, "subject.id == resource.ownerId");
});

Deno.test("AccessControlEvaluator: ABAC - No rule matches", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: [],
    rules: ["subject.id == resource.ownerId"],
  };
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1", ownerId: "user2" },
  } as AccessControlContext;

  const result = evaluator.evaluate(policy, context);
  assertEquals(result.allowed, false);
});

Deno.test("AccessControlEvaluator: ABAC - Multiple rules, first matches", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: [],
    rules: [
      'subject.role == "admin"',
      "subject.id == resource.ownerId",
    ],
  };
  const context = {
    subject: { id: "user1", role: "admin" },
    resource: { id: "res1", ownerId: "user2" },
  } as AccessControlContext;

  const result = evaluator.evaluate(policy, context);
  assertEquals(result.allowed, true);
  assertEquals(result.matchedRule, 'subject.role == "admin"');
});

Deno.test("AccessControlEvaluator: ABAC - Multiple rules, second matches", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: [],
    rules: [
      'subject.role == "admin"',
      "subject.id == resource.ownerId",
    ],
  };
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1", ownerId: "user1" },
  } as AccessControlContext;

  const result = evaluator.evaluate(policy, context);
  assertEquals(result.allowed, true);
  assertEquals(result.matchedRule, "subject.id == resource.ownerId");
});

// ============================================================================
// AccessControlEvaluator Tests - Combined RBAC + ABAC
// ============================================================================

Deno.test("AccessControlEvaluator: RBAC + ABAC - RBAC matches first", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: ["admin"],
    rules: ["subject.id == resource.ownerId"],
  };
  const context = {
    subject: { id: "user1", role: "admin" },
    resource: { id: "res1", ownerId: "user2" },
  } as AccessControlContext;

  const result = evaluator.evaluate(policy, context);
  assertEquals(result.allowed, true);
  assertEquals(result.matchedRole, "admin");
});

Deno.test("AccessControlEvaluator: RBAC + ABAC - ABAC matches when RBAC fails", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: ["admin"],
    rules: ["subject.id == resource.ownerId"],
  };
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1", ownerId: "user1" },
  } as AccessControlContext;

  const result = evaluator.evaluate(policy, context);
  assertEquals(result.allowed, true);
  assertEquals(result.matchedRule, "subject.id == resource.ownerId");
});

Deno.test("AccessControlEvaluator: Empty policy allows all", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: [],
    rules: [],
  };
  const context = {
    subject: { id: "user1", role: "user" },
    resource: { id: "res1", ownerId: "user2" },
  } as AccessControlContext;

  const result = evaluator.evaluate(policy, context);
  assertEquals(result.allowed, true);
});

// ============================================================================
// AccessControlEvaluator Tests - Policy Resolution
// ============================================================================

Deno.test("AccessControlEvaluator: Resolve policy with $ref", () => {
  const openApiSpec: OpenAPISpec = {
    openapi: "3.1.1",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
    components: {
      "x-policies": {
        "admin-only": {
          description: "Admin only",
          roles: ["admin"],
          rules: [],
        },
      },
    },
  };

  const evaluator = new AccessControlEvaluator(openApiSpec);
  const policy = evaluator.resolvePolicy({ $ref: "#/components/x-policies/admin-only" });

  assertEquals(policy.roles, ["admin"]);
  assertEquals(policy.description, "Admin only");
});

Deno.test("AccessControlEvaluator: Resolve policy with string reference", () => {
  const openApiSpec: OpenAPISpec = {
    openapi: "3.1.1",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
    components: {
      "x-policies": {
        "owner-only": {
          roles: [],
          rules: ["subject.id == resource.ownerId"],
        },
      },
    },
  };

  const evaluator = new AccessControlEvaluator(openApiSpec);
  const policy = evaluator.resolvePolicy("#/components/x-policies/owner-only");

  assertEquals(policy.rules, ["subject.id == resource.ownerId"]);
});

Deno.test("AccessControlEvaluator: Get all policies", () => {
  const openApiSpec: OpenAPISpec = {
    openapi: "3.1.1",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
    components: {
      "x-policies": {
        public: { roles: [], rules: [] },
        "admin-only": { roles: ["admin"], rules: [] },
      },
    },
  };

  const evaluator = new AccessControlEvaluator(openApiSpec);
  const policies = evaluator.getPolicies();

  assertEquals(Object.keys(policies).length, 2);
  assertEquals(Object.keys(policies).includes("public"), true);
  assertEquals(Object.keys(policies).includes("admin-only"), true);
});

// ============================================================================
// Helper Function Tests
// ============================================================================

Deno.test("createAccessControlEvaluator: Creates evaluator instance", () => {
  const evaluator = createAccessControlEvaluator();
  assertEquals(evaluator !== undefined, true);
  assertEquals(evaluator instanceof AccessControlEvaluator, true);
});

Deno.test("createAccessControlEvaluator: Creates evaluator with OpenAPI spec", () => {
  const openApiSpec: OpenAPISpec = {
    openapi: "3.1.1",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
  };

  const evaluator = createAccessControlEvaluator(openApiSpec);
  const policies = evaluator.getPolicies();
  assertEquals(Object.keys(policies).length, 0);
});

// ============================================================================
// Real-world Scenarios
// ============================================================================

Deno.test("Scenario: Admins can list all users", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    description: "Only administrators can list all users",
    roles: ["admin"],
    rules: [],
  };
  const context = {
    subject: { id: "admin1", role: "admin" },
    resource: { id: "users_collection" },
  } as AccessControlContext;

  const result = evaluator.evaluate(policy, context);
  assertEquals(result.allowed, true);
});

Deno.test("Scenario: Users can view their own profile or admins can view any profile", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: ["admin"],
    rules: ["subject.id == resource.id"],
  };

  // Admin can view any profile
  const adminContext = {
    subject: { id: "admin1", role: "admin" },
    resource: { id: "user123" },
  } as AccessControlContext;
  const adminResult = evaluator.evaluate(policy, adminContext);
  assertEquals(adminResult.allowed, true);

  // User can view their own profile
  const userContext = {
    subject: { id: "user123", role: "user" },
    resource: { id: "user123" },
  } as AccessControlContext;
  const userResult = evaluator.evaluate(policy, userContext);
  assertEquals(userResult.allowed, true);

  // User cannot view another user's profile
  const deniedContext = {
    subject: { id: "user123", role: "user" },
    resource: { id: "user456" },
  } as AccessControlContext;
  const deniedResult = evaluator.evaluate(policy, deniedContext);
  assertEquals(deniedResult.allowed, false);
});

Deno.test("Scenario: Department managers can review their department's documents", () => {
  const evaluator = new AccessControlEvaluator();
  const policy: AccessControlPolicy = {
    roles: ["admin"],
    rules: [
      'subject.role == "manager" and subject.department == resource.department',
    ],
  };

  // Manager can review their department's document
  const allowedContext = {
    subject: { id: "manager1", role: "manager", department: "sales" },
    resource: { id: "doc1", department: "sales" },
  } as AccessControlContext;
  const allowedResult = evaluator.evaluate(policy, allowedContext);
  assertEquals(allowedResult.allowed, true);

  // Manager cannot review other department's document
  const deniedContext = {
    subject: { id: "manager1", role: "manager", department: "sales" },
    resource: { id: "doc2", department: "finance" },
  } as AccessControlContext;
  const deniedResult = evaluator.evaluate(policy, deniedContext);
  assertEquals(deniedResult.allowed, false);
});
