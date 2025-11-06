import Ajv, { type SchemaObject, type ErrorObject } from "ajv";

/**
 * JSON Schema validator for DNA schemas
 * Uses AJV for robust JSON Schema validation
 */

export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Create a single AJV instance
const ajv = new Ajv({
  strict: false,
  verbose: true,
});

/**
 * Validate a value against a JSON schema
 * @param value - The value to validate
 * @param schema - The JSON schema to validate against
 * @returns Validation result with errors if invalid
 */
export function validateSchema(
  value: unknown,
  schema: Record<string, unknown>,
): ValidationResult {
  try {
    const validate = ajv.compile(schema as SchemaObject);
    const isValid = validate(value);

    if (isValid) {
      return {
        valid: true,
        errors: [],
      };
    }

    // Convert AJV errors to our ValidationError format
    const errors: ValidationError[] = (validate.errors || []).map(
      (error: ErrorObject) => {
        const path = error.instancePath || error.schemaPath || "$";
        const message = formatAjvError(error);

        return {
          path,
          message,
          value: error.data,
        };
      },
    );

    return {
      valid: false,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: "$",
          message: `Schema compilation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

/**
 * Format an AJV error message
 */
function formatAjvError(error: ErrorObject): string {
  switch (error.keyword) {
    case "required":
      return `Missing required property "${(error.params as { missingProperty?: string }).missingProperty}"`;
    case "type":
      return `Must be of type "${(error.params as { type?: string }).type}"`;
    case "enum":
      return `Must be one of: ${((error.params as { allowedValues?: unknown[] }).allowedValues || []).join(", ")}`;
    case "additionalProperties":
      return `Property "${error.instancePath.split("/").pop()}" is not allowed`;
    case "pattern":
      return `Must match pattern "${(error.params as { pattern?: string }).pattern}"`;
    case "minimum":
      return `Must be >= ${(error.params as { limit?: number }).limit}`;
    case "maximum":
      return `Must be <= ${(error.params as { limit?: number }).limit}`;
    case "minLength":
      return `Must be at least ${(error.params as { limit?: number }).limit} characters`;
    case "maxLength":
      return `Must be at most ${(error.params as { limit?: number }).limit} characters`;
    default:
      return error.message || `Validation error at ${error.instancePath}`;
  }
}

/**
 * Assert that a value is valid according to a schema
 * Throws an error if validation fails
 * @param value - The value to validate
 * @param schema - The JSON schema to validate against
 * @param context - Optional context for error message
 */
export function assertValid(
  value: unknown,
  schema: Record<string, unknown>,
  context?: string,
): asserts value {
  const result = validateSchema(value, schema);

  if (!result.valid) {
    const errorMessages = result.errors
      .map((e) => `${e.path}: ${e.message}`)
      .join("; ");
    const contextStr = context ? ` in ${context}` : "";
    throw new Error(`Validation failed${contextStr}: ${errorMessages}`);
  }
}
