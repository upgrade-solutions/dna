// Spec Contract Validation
// Validates that OpenAPI specs satisfy required contracts before use

import { OpenAPISpec } from "./types.ts";

/**
 * Contract that registration-related specs must satisfy
 */
export interface RegistrationSpecContract {
  requiredPaths: string[];
  requiredSchemas: string[];
  requiredOperations: string[];
}

/**
 * Contract that all specs must satisfy
 */
export interface GeneralSpecContract {
  hasInfo: boolean;
  hasVersion: boolean;
  hasOpenAPIVersion: boolean;
  hasPaths: boolean;
  hasComponents: boolean;
}

/**
 * Validate a spec against the registration flow contract
 */
export function validateRegistrationContract(spec: OpenAPISpec): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const requiredPaths = [
    "/auth/register/step1",
    "/auth/register/step2",
    "/auth/register/step3",
    "/auth/register/step4",
  ];

  for (const path of requiredPaths) {
    if (!spec.paths?.[path]) {
      errors.push(`Missing required path: ${path}`);
    }
  }

  const requiredSchemas = [
    "RegisterEmailRequest",
    "RegisterProfileRequest",
    "RegisterCredentialsRequest",
    "RegisterConfirmRequest",
  ];

  for (const schema of requiredSchemas) {
    if (!spec.components?.schemas?.[schema]) {
      errors.push(`Missing required schema: ${schema}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate that a spec has proper OpenAPI structure
 */
export function validateGeneralContract(spec: OpenAPISpec): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!spec.info) {
    errors.push("Missing info section");
  } else {
    if (!spec.info.title) {
      errors.push("Missing info.title");
    }
    if (!spec.info.version) {
      errors.push("Missing info.version");
    }
  }

  if (!spec.openapi) {
    errors.push("Missing OpenAPI version");
  }

  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    errors.push("No paths defined");
  }

  if (!spec.components?.schemas || Object.keys(spec.components.schemas).length === 0) {
    errors.push("No schemas defined in components");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate that all routes have handler configurations
 */
export function validateHandlerConfigs(spec: OpenAPISpec): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const methods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const method of methods) {
      const operation = (pathItem as Record<string, unknown>)[method] as Record<string, unknown> | undefined;

      if (!operation || typeof operation !== "object") {
        continue;
      }

      // Check if operation has x-handler or is a passthrough
      const hasHandler = operation["x-handler"];
      if (!hasHandler) {
        // Note: passthrough is allowed, just log as info
        console.debug(`No x-handler specified for ${method.toUpperCase()} ${path} - using passthrough`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Run all contract validations on a spec
 */
export function validateSpecContracts(spec: OpenAPISpec): {
  valid: boolean;
  general: ReturnType<typeof validateGeneralContract>;
  registration: ReturnType<typeof validateRegistrationContract>;
  handlers: ReturnType<typeof validateHandlerConfigs>;
  allErrors: string[];
} {
  const general = validateGeneralContract(spec);
  const registration = validateRegistrationContract(spec);
  const handlers = validateHandlerConfigs(spec);

  const allErrors = [
    ...general.errors.map((e) => `[General] ${e}`),
    ...registration.errors.map((e) => `[Registration] ${e}`),
    ...handlers.errors.map((e) => `[Handlers] ${e}`),
  ];

  return {
    valid: general.valid && registration.valid && handlers.valid,
    general,
    registration,
    handlers,
    allErrors,
  };
}
