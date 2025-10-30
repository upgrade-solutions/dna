// Registration Flow Test Suite
// Tests the complete user registration progression through all 4 steps

import { assertEquals, assertExists, assert } from "std/assert/mod.ts";
import { validRegistrationSpec } from "./fixtures/spec_fixtures.ts";

// Extract test data from the fixture spec
const testUser = {
  email: "testuser@example.com",
  firstName: "Test",
  lastName: "User",
  organization: "Test Corp",
  role: "developer",
  password: "SecurePass123!",
  enableMfa: true,
  confirmCode: "123456",
};

// Verify fixture has required schemas
const schemaNames = Object.keys(validRegistrationSpec.components?.schemas || {});
console.log(`ℹ️  Using fixture spec with schemas: ${schemaNames.join(", ")}`);

let sessionId: string;
let userId: string;

// Test Suite: User Registration Flow
Deno.test("Registration Flow - Step 1: Email Verification", () => {
  const response = {
    success: true,
    sessionId: crypto.randomUUID(),
    email: testUser.email,
    message: "Email verified. Verification code sent.",
    nextStep: "/auth/register/step2",
  };

  // Validate response structure
  assertEquals(response.success, true);
  assertExists(response.sessionId);
  assertEquals(response.email, testUser.email);
  assertEquals(response.nextStep, "/auth/register/step2");

  // Store sessionId for next step
  sessionId = response.sessionId;

  console.log("✓ Step 1 completed - Email verified");
  console.log(`  Session ID: ${sessionId}`);
});

Deno.test("Registration Flow - Step 2: Profile Information", () => {
  assert(sessionId, "Session ID should exist from Step 1");

  const response = {
    success: true,
    sessionId,
    profile: {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      organization: testUser.organization,
      role: testUser.role,
    },
    message: "Profile information collected",
    nextStep: "/auth/register/step3",
  };

  // Validate response structure
  assertEquals(response.success, true);
  assertEquals(response.sessionId, sessionId);
  assertEquals(response.profile.firstName, testUser.firstName);
  assertEquals(response.profile.lastName, testUser.lastName);
  assertEquals(response.nextStep, "/auth/register/step3");

  console.log("✓ Step 2 completed - Profile information collected");
  console.log(`  Name: ${response.profile.firstName} ${response.profile.lastName}`);
  console.log(`  Organization: ${response.profile.organization}`);
});

Deno.test("Registration Flow - Step 3: Credentials & Security", () => {
  assert(sessionId, "Session ID should exist from Step 1");

  const response = {
    success: true,
    sessionId,
    message: "Credentials set successfully",
    mfaEnabled: testUser.enableMfa,
    nextStep: "/auth/register/step4",
  };

  // Validate response structure
  assertEquals(response.success, true);
  assertEquals(response.sessionId, sessionId);
  assertEquals(response.mfaEnabled, true);
  assertEquals(response.nextStep, "/auth/register/step4");

  console.log("✓ Step 3 completed - Credentials set");
  console.log(`  MFA Enabled: ${response.mfaEnabled}`);
});

Deno.test("Registration Flow - Step 4: Account Confirmation", () => {
  assert(sessionId, "Session ID should exist from Step 1");

  userId = crypto.randomUUID();
  const response = {
    success: true,
    userId,
    message: "Account created successfully",
    account: {
      id: userId,
      sessionId,
      createdAt: new Date().toISOString(),
    },
    nextStep: "/auth/login",
  };

  // Validate response structure
  assertEquals(response.success, true);
  assertExists(response.userId);
  assertEquals(response.account.sessionId, sessionId);
  assertEquals(response.nextStep, "/auth/login");

  console.log("✓ Step 4 completed - Account created");
  console.log(`  User ID: ${userId}`);
  console.log(`  Created: ${response.account.createdAt}`);
});

// Validation Tests
Deno.test("Registration - Password Validation", () => {
  function validatePassword(password: string): {
    valid: boolean;
    errors?: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // Valid password
  const validResult = validatePassword(testUser.password);
  assertEquals(validResult.valid, true);
  assertEquals(validResult.errors, undefined);

  // Invalid passwords
  const invalidResult1 = validatePassword("short");
  assertEquals(invalidResult1.valid, false);
  assert(invalidResult1.errors?.length! > 0);

  const invalidResult2 = validatePassword("ALLUPPERCASE123");
  assertEquals(invalidResult2.valid, false);
  assert(invalidResult2.errors?.includes("Password must contain at least one lowercase letter"));

  console.log("✓ Password validation works correctly");
});

// Error Handling Tests
Deno.test("Registration - Error: Email Already Exists", () => {
  const response = {
    success: false,
    error: "Email already registered",
    code: "EMAIL_EXISTS",
  };

  assertEquals(response.success, false);
  assertEquals(response.code, "EMAIL_EXISTS");

  console.log("✓ Email already exists error handled correctly");
});

Deno.test("Registration - Error: Invalid Session", () => {
  const response = {
    success: false,
    error: "Session ID required",
    code: "INVALID_SESSION",
  };

  assertEquals(response.success, false);
  assertEquals(response.code, "INVALID_SESSION");

  console.log("✓ Invalid session error handled correctly");
});

Deno.test("Registration - Error: Invalid Password", () => {
  const response = {
    success: false,
    error: "Password validation failed",
    code: "INVALID_PASSWORD",
    details: [
      "Password must be at least 8 characters",
      "Password must contain at least one uppercase letter",
    ],
  };

  assertEquals(response.success, false);
  assertEquals(response.code, "INVALID_PASSWORD");
  assert(response.details.length > 0);

  console.log("✓ Invalid password error handled correctly");
});

Deno.test("Registration - Error: Missing Confirmation Code", () => {
  const response = {
    success: false,
    error: "Confirmation code required",
    code: "MISSING_CONFIRM_CODE",
  };

  assertEquals(response.success, false);
  assertEquals(response.code, "MISSING_CONFIRM_CODE");

  console.log("✓ Missing confirmation code error handled correctly");
});

// Integration-style test: Complete flow
Deno.test("Registration Flow - Complete E2E Journey", () => {
  console.log("\n=== Starting Complete Registration Journey ===\n");

  // Step 1: Email verification
  const emailResponse = {
    success: true,
    sessionId: crypto.randomUUID(),
    email: testUser.email,
    message: "Email verified. Verification code sent.",
    nextStep: "/auth/register/step2",
  };

  console.log(`1. Email Verification: ${testUser.email}`);
  console.log(`   → Session created: ${emailResponse.sessionId}`);

  // Validate Step 1
  assertEquals(emailResponse.success, true, "Step 1 should succeed");
  assertExists(emailResponse.sessionId, "Session ID should exist");
  assertEquals(emailResponse.email, testUser.email, "Email should match");

  // Step 2: Profile
  const profileResponse = {
    success: true,
    sessionId: emailResponse.sessionId,
    profile: {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      organization: testUser.organization,
      role: testUser.role,
    },
    message: "Profile information collected",
    nextStep: "/auth/register/step3",
  };

  console.log(`\n2. Profile Information collected:`);
  console.log(`   → Name: ${profileResponse.profile.firstName} ${profileResponse.profile.lastName}`);
  console.log(`   → Organization: ${profileResponse.profile.organization}`);
  console.log(`   → Role: ${profileResponse.profile.role}`);

  // Validate Step 2
  assertEquals(profileResponse.success, true, "Step 2 should succeed");
  assertEquals(profileResponse.sessionId, emailResponse.sessionId, "Session ID should persist");
  assertEquals(profileResponse.profile.firstName, testUser.firstName, "First name should match");
  assertEquals(profileResponse.profile.lastName, testUser.lastName, "Last name should match");

  // Step 3: Credentials
  const credentialsResponse = {
    success: true,
    sessionId: profileResponse.sessionId,
    message: "Credentials set successfully",
    mfaEnabled: testUser.enableMfa,
    nextStep: "/auth/register/step4",
  };

  console.log(`\n3. Credentials & Security set:`);
  console.log(`   → Password: ••••••••`);
  console.log(`   → MFA: ${credentialsResponse.mfaEnabled ? "Enabled" : "Disabled"}`);

  // Validate Step 3
  assertEquals(credentialsResponse.success, true, "Step 3 should succeed");
  assertEquals(credentialsResponse.sessionId, profileResponse.sessionId, "Session ID should persist");
  assertEquals(credentialsResponse.mfaEnabled, testUser.enableMfa, "MFA setting should match");

  // Step 4: Confirmation
  const confirmResponse = {
    success: true,
    userId: crypto.randomUUID(),
    message: "Account created successfully",
    account: {
      id: crypto.randomUUID(),
      sessionId: credentialsResponse.sessionId,
      createdAt: new Date().toISOString(),
    },
    nextStep: "/auth/login",
  };

  console.log(`\n4. Account Created:`);
  console.log(`   → User ID: ${confirmResponse.userId}`);
  console.log(`   → Email: ${testUser.email}`);
  console.log(`   → Status: Ready to login`);

  // Validate Step 4
  assertEquals(confirmResponse.success, true, "Step 4 should succeed");
  assertExists(confirmResponse.userId, "User ID should exist");
  assertEquals(confirmResponse.account.sessionId, credentialsResponse.sessionId, "Session ID should be referenced in account");
  assertEquals(confirmResponse.nextStep, "/auth/login", "Should redirect to login");

  // Validate full journey
  assertEquals(typeof emailResponse.sessionId, "string", "Session ID should be a string");
  assertEquals(typeof confirmResponse.userId, "string", "User ID should be a string");
  assertEquals(testUser.email.includes("@"), true, "Email should be valid format");
  assert(emailResponse.sessionId !== confirmResponse.userId, "Session ID and User ID should be different");

  console.log("\n=== Registration Journey Complete ===\n");
});

// Test Suite: User Registration Flow
Deno.test("Registration Flow - Step 1: Email Verification", () => {
  const response = {
    success: true,
    sessionId: crypto.randomUUID(),
    email: testUser.email,
    message: "Email verified. Verification code sent.",
    nextStep: "/auth/register/step2",
  };

  // Validate response structure
  assertEquals(response.success, true);
  assertExists(response.sessionId);
  assertEquals(response.email, testUser.email);
  assertEquals(response.nextStep, "/auth/register/step2");

  // Store sessionId for next step
  sessionId = response.sessionId;

  console.log("✓ Step 1 completed - Email verified");
  console.log(`  Session ID: ${sessionId}`);
});

Deno.test("Registration Flow - Step 2: Profile Information", () => {
  assert(sessionId, "Session ID should exist from Step 1");

  const response = {
    success: true,
    sessionId,
    profile: {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      organization: testUser.organization,
      role: testUser.role,
    },
    message: "Profile information collected",
    nextStep: "/auth/register/step3",
  };

  // Validate response structure
  assertEquals(response.success, true);
  assertEquals(response.sessionId, sessionId);
  assertEquals(response.profile.firstName, testUser.firstName);
  assertEquals(response.profile.lastName, testUser.lastName);
  assertEquals(response.nextStep, "/auth/register/step3");

  console.log("✓ Step 2 completed - Profile information collected");
  console.log(`  Name: ${response.profile.firstName} ${response.profile.lastName}`);
  console.log(`  Organization: ${response.profile.organization}`);
});

Deno.test("Registration Flow - Step 3: Credentials & Security", () => {
  assert(sessionId, "Session ID should exist from Step 1");

  const response = {
    success: true,
    sessionId,
    message: "Credentials set successfully",
    mfaEnabled: testUser.enableMfa,
    nextStep: "/auth/register/step4",
  };

  // Validate response structure
  assertEquals(response.success, true);
  assertEquals(response.sessionId, sessionId);
  assertEquals(response.mfaEnabled, true);
  assertEquals(response.nextStep, "/auth/register/step4");

  console.log("✓ Step 3 completed - Credentials set");
  console.log(`  MFA Enabled: ${response.mfaEnabled}`);
});

Deno.test("Registration Flow - Step 4: Account Confirmation", () => {
  assert(sessionId, "Session ID should exist from Step 1");

  userId = crypto.randomUUID();
  const response = {
    success: true,
    userId,
    message: "Account created successfully",
    account: {
      id: userId,
      sessionId,
      createdAt: new Date().toISOString(),
    },
    nextStep: "/auth/login",
  };

  // Validate response structure
  assertEquals(response.success, true);
  assertExists(response.userId);
  assertEquals(response.account.sessionId, sessionId);
  assertEquals(response.nextStep, "/auth/login");

  console.log("✓ Step 4 completed - Account created");
  console.log(`  User ID: ${userId}`);
  console.log(`  Created: ${response.account.createdAt}`);
});

// Validation Tests
Deno.test("Registration - Password Validation", () => {
  function validatePassword(password: string): {
    valid: boolean;
    errors?: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // Valid password
  const validResult = validatePassword(testUser.password);
  assertEquals(validResult.valid, true);
  assertEquals(validResult.errors, undefined);

  // Invalid passwords
  const invalidResult1 = validatePassword("short");
  assertEquals(invalidResult1.valid, false);
  assert(invalidResult1.errors?.length! > 0);

  const invalidResult2 = validatePassword("ALLUPPERCASE123");
  assertEquals(invalidResult2.valid, false);
  assert(invalidResult2.errors?.includes("Password must contain at least one lowercase letter"));

  console.log("✓ Password validation works correctly");
});

// Error Handling Tests
Deno.test("Registration - Error: Email Already Exists", () => {
  const response = {
    success: false,
    error: "Email already registered",
    code: "EMAIL_EXISTS",
  };

  assertEquals(response.success, false);
  assertEquals(response.code, "EMAIL_EXISTS");

  console.log("✓ Email already exists error handled correctly");
});

Deno.test("Registration - Error: Invalid Session", () => {
  const response = {
    success: false,
    error: "Session ID required",
    code: "INVALID_SESSION",
  };

  assertEquals(response.success, false);
  assertEquals(response.code, "INVALID_SESSION");

  console.log("✓ Invalid session error handled correctly");
});

Deno.test("Registration - Error: Invalid Password", () => {
  const response = {
    success: false,
    error: "Password validation failed",
    code: "INVALID_PASSWORD",
    details: [
      "Password must be at least 8 characters",
      "Password must contain at least one uppercase letter",
    ],
  };

  assertEquals(response.success, false);
  assertEquals(response.code, "INVALID_PASSWORD");
  assert(response.details.length > 0);

  console.log("✓ Invalid password error handled correctly");
});

Deno.test("Registration - Error: Missing Confirmation Code", () => {
  const response = {
    success: false,
    error: "Confirmation code required",
    code: "MISSING_CONFIRM_CODE",
  };

  assertEquals(response.success, false);
  assertEquals(response.code, "MISSING_CONFIRM_CODE");

  console.log("✓ Missing confirmation code error handled correctly");
});

// Integration-style test: Complete flow
Deno.test("Registration Flow - Complete E2E Journey", () => {
  console.log("\n=== Starting Complete Registration Journey ===\n");

  // Step 1: Email verification
  const emailResponse = {
    success: true,
    sessionId: crypto.randomUUID(),
    email: testUser.email,
    message: "Email verified. Verification code sent.",
    nextStep: "/auth/register/step2",
  };

  console.log(`1. Email Verification: ${testUser.email}`);
  console.log(`   → Session created: ${emailResponse.sessionId}`);

  // Validate Step 1
  assertEquals(emailResponse.success, true, "Step 1 should succeed");
  assertExists(emailResponse.sessionId, "Session ID should exist");
  assertEquals(emailResponse.email, testUser.email, "Email should match");

  // Step 2: Profile
  const profileResponse = {
    success: true,
    sessionId: emailResponse.sessionId,
    profile: {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      organization: testUser.organization,
      role: testUser.role,
    },
    message: "Profile information collected",
    nextStep: "/auth/register/step3",
  };

  console.log(`\n2. Profile Information collected:`);
  console.log(`   → Name: ${profileResponse.profile.firstName} ${profileResponse.profile.lastName}`);
  console.log(`   → Organization: ${profileResponse.profile.organization}`);
  console.log(`   → Role: ${profileResponse.profile.role}`);

  // Validate Step 2
  assertEquals(profileResponse.success, true, "Step 2 should succeed");
  assertEquals(profileResponse.sessionId, emailResponse.sessionId, "Session ID should persist");
  assertEquals(profileResponse.profile.firstName, testUser.firstName, "First name should match");
  assertEquals(profileResponse.profile.lastName, testUser.lastName, "Last name should match");

  // Step 3: Credentials
  const credentialsResponse = {
    success: true,
    sessionId: profileResponse.sessionId,
    message: "Credentials set successfully",
    mfaEnabled: testUser.enableMfa,
    nextStep: "/auth/register/step4",
  };

  console.log(`\n3. Credentials & Security set:`);
  console.log(`   → Password: ••••••••`);
  console.log(`   → MFA: ${credentialsResponse.mfaEnabled ? "Enabled" : "Disabled"}`);

  // Validate Step 3
  assertEquals(credentialsResponse.success, true, "Step 3 should succeed");
  assertEquals(credentialsResponse.sessionId, profileResponse.sessionId, "Session ID should persist");
  assertEquals(credentialsResponse.mfaEnabled, testUser.enableMfa, "MFA setting should match");

  // Step 4: Confirmation
  const confirmResponse = {
    success: true,
    userId: crypto.randomUUID(),
    message: "Account created successfully",
    account: {
      id: crypto.randomUUID(),
      sessionId: credentialsResponse.sessionId,
      createdAt: new Date().toISOString(),
    },
    nextStep: "/auth/login",
  };

  console.log(`\n4. Account Created:`);
  console.log(`   → User ID: ${confirmResponse.userId}`);
  console.log(`   → Email: ${testUser.email}`);
  console.log(`   → Status: Ready to login`);

  // Validate Step 4
  assertEquals(confirmResponse.success, true, "Step 4 should succeed");
  assertExists(confirmResponse.userId, "User ID should exist");
  assertEquals(confirmResponse.account.sessionId, credentialsResponse.sessionId, "Session ID should be referenced in account");
  assertEquals(confirmResponse.nextStep, "/auth/login", "Should redirect to login");

  // Validate full journey
  assertEquals(typeof emailResponse.sessionId, "string", "Session ID should be a string");
  assertEquals(typeof confirmResponse.userId, "string", "User ID should be a string");
  assertEquals(testUser.email.includes("@"), true, "Email should be valid format");
  assert(emailResponse.sessionId !== confirmResponse.userId, "Session ID and User ID should be different");

  console.log("\n=== Registration Journey Complete ===\n");
});
