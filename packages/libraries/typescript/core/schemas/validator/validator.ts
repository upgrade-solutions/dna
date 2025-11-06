/**
 * JSON Schema validator for DNA schemas
 * Provides validation against loaded schemas
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
  const errors: ValidationError[] = [];

  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    const required = schema.required as string[];
    if (typeof value === "object" && value !== null) {
      const obj = value as Record<string, unknown>;
      for (const field of required) {
        if (!(field in obj)) {
          errors.push({
            path: field,
            message: `Required field "${field}" is missing`,
          });
        }
      }
    }
  }

  // Check type
  if (schema.type) {
    const actualType = Array.isArray(value)
      ? "array"
      : value === null
        ? "null"
        : typeof value;
    const expectedType = schema.type as string;

    if (actualType !== expectedType) {
      errors.push({
        path: "$",
        message: `Expected type "${expectedType}" but got "${actualType}"`,
        value,
      });
    }
  }

  // Check additionalProperties
  if (
    schema.additionalProperties === false &&
    typeof value === "object" &&
    value !== null
  ) {
    const properties = schema.properties as Record<string, unknown> || {};
    const obj = value as Record<string, unknown>;
    const allowedProps = Object.keys(properties);

    for (const prop of Object.keys(obj)) {
      if (!allowedProps.includes(prop)) {
        errors.push({
          path: prop,
          message: `Property "${prop}" is not allowed`,
          value: obj[prop],
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
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
