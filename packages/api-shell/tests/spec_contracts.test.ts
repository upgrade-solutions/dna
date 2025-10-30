// Spec Contract Tests
// Validates that OpenAPI specs satisfy required contracts

import { assertEquals, assert } from "std/assert/mod.ts";
import {
  validateRegistrationContract,
  validateGeneralContract,
  validateHandlerConfigs,
  validateSpecContracts,
} from "../core/spec_contract.ts";
import {
  validRegistrationSpec,
  specMissingPaths,
  specMissingSchemas,
  invalidSpec,
} from "./fixtures/spec_fixtures.ts";

// Tests for General Contract Validation
Deno.test("Spec Contracts - Valid Registration Spec", () => {
  assertEquals(validRegistrationSpec.info.title, "Test Registration API");
  const result = validateSpecContracts(validRegistrationSpec);

  assertEquals(result.valid, true, "Valid spec should pass all contracts");
  assertEquals(result.general.valid, true, "Should pass general contract");
  assertEquals(result.registration.valid, true, "Should pass registration contract");
  assertEquals(result.handlers.valid, true, "Should pass handler contract");
  assertEquals(result.allErrors.length, 0, "Should have no errors");

  console.log("✓ Valid registration spec passes all contracts");
});

Deno.test("Spec Contracts - General Structure Validation", () => {
  const result = validateGeneralContract(validRegistrationSpec);

  assertEquals(result.valid, true, "Should validate general structure");
  assertEquals(result.errors.length, 0, "Should have no errors");

  console.log("✓ General structure validation passes");
});

Deno.test("Spec Contracts - Registration Contract Validation", () => {
  const result = validateRegistrationContract(validRegistrationSpec);

  assertEquals(result.valid, true, "Should satisfy registration contract");
  assertEquals(result.errors.length, 0, "Should have no errors");

  console.log("✓ Registration contract validation passes");
});

Deno.test("Spec Contracts - Handler Configuration Validation", () => {
  const result = validateHandlerConfigs(validRegistrationSpec);

  assertEquals(result.valid, true, "Should have valid handler configs");
  assertEquals(result.errors.length, 0, "Should have no errors");

  console.log("✓ Handler configuration validation passes");
});

// Tests for Invalid Specs
Deno.test("Spec Contracts - Spec Missing Paths", () => {
  const result = validateSpecContracts(specMissingPaths);

  assertEquals(result.valid, false, "Should fail validation");
  assertEquals(result.registration.valid, false, "Should fail registration contract");
  assert(
    result.registration.errors.some((e: string) => e.includes("/auth/register/step2")),
    "Should report missing step2"
  );
  assert(
    result.registration.errors.some((e: string) => e.includes("/auth/register/step3")),
    "Should report missing step3"
  );

  console.log("✓ Missing paths detection works");
  console.log(`  Errors: ${result.registration.errors.join(", ")}`);
});

Deno.test("Spec Contracts - Spec Missing Schemas", () => {
  const result = validateSpecContracts(specMissingSchemas);

  assertEquals(result.valid, false, "Should fail validation");
  assertEquals(result.registration.valid, false, "Should fail registration contract");
  assert(
    result.registration.errors.some((e: string) => e.includes("schema")),
    "Should report missing schema"
  );

  console.log("✓ Missing schemas detection works");
  console.log(`  Errors: ${result.registration.errors.join(", ")}`);
});

Deno.test("Spec Contracts - Invalid Spec Structure", () => {
  const result = validateGeneralContract(invalidSpec);

  assertEquals(result.valid, false, "Should fail validation");
  assert(result.errors.length > 0, "Should have multiple errors");

  console.log("✓ Invalid structure detection works");
  console.log(`  Errors: ${result.errors.join(", ")}`);
});

// Integration test: Simulate loading spec from source and validating
Deno.test("Spec Contracts - Full Validation Pipeline", () => {
  // Simulate loading a spec from a hypothetical source
  const loadedSpec = validRegistrationSpec;

  // Validate the loaded spec
  const validationResult = validateSpecContracts(loadedSpec);

  // Assert that it's valid before proceeding
  assert(validationResult.valid, `Spec validation failed: ${validationResult.allErrors.join(", ")}`);

  // If we reach here, spec is safe to use
  assertEquals(loadedSpec.info.title, "Test Registration API");
  assertEquals(loadedSpec.paths["/auth/register/step1"] !== undefined, true);

  console.log("✓ Full validation pipeline works");
  console.log("  Spec loaded and validated successfully");
  console.log("  Safe to register routes and use handlers");
});

// Test contract validation failure handling
Deno.test("Spec Contracts - Graceful Failure Reporting", () => {
  const specs = [
    { name: "Missing paths", spec: specMissingPaths },
    { name: "Missing schemas", spec: specMissingSchemas },
  ];

  for (const { name, spec } of specs) {
    const result = validateSpecContracts(spec);

    assertEquals(result.valid, false, `${name} should fail`);
    assert(result.allErrors.length > 0, `${name} should have errors`);

    // All errors should be categorized
    for (const error of result.allErrors) {
      assert(
        error.includes("[General]") || error.includes("[Registration]") || error.includes("[Handlers]"),
        `Error should have category: ${error}`
      );
    }
  }

  console.log("✓ All invalid specs fail with categorized errors");
});
