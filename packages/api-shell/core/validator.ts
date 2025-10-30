// Validation module using built-in JSON schema validation
/// <reference lib="deno.window" />

import { ValidationSchema, OpenAPISchema } from "./types.ts";
import { ConfigLoader } from "./loader.ts";

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Simple JSON Schema validator (subset support)
 * Validates required fields, types, and basic constraints
 * Supports both JSON Schema and OpenAPI schema formats
 */
export class SchemaValidator {
  private configLoader?: ConfigLoader;
  private schemaCache: Map<string, ValidationSchema> = new Map();

  constructor(configLoader?: ConfigLoader) {
    this.configLoader = configLoader;
  }

  validate(
    data: unknown,
    schema: ValidationSchema | OpenAPISchema
  ): ValidationResult {
    if (!schema) {
      return { valid: true };
    }

    const errors: string[] = [];

    // Check required fields
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (
          !data ||
          typeof data !== "object" ||
          !(field in data) ||
          (data as Record<string, unknown>)[field] === undefined
        ) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check property types (basic type checking)
    if (
      schema.properties &&
      data &&
      typeof data === "object"
    ) {
      for (const [field, fieldSchema] of Object.entries(
        schema.properties
      )) {
        const value = (data as Record<string, unknown>)[field];

        if (value === undefined || value === null) {
          continue; // Skip if not provided (required check handles this)
        }

        const fieldDef = fieldSchema as Record<string, unknown>;

        if (fieldDef.type) {
          const expectedType = fieldDef.type as string;
          const actualType = Array.isArray(value)
            ? "array"
            : typeof value;

          if (
            expectedType === "integer"
              ? !Number.isInteger(value)
              : expectedType === "number"
                ? typeof value !== "number"
                : expectedType !== actualType
          ) {
            errors.push(
              `Field '${field}' should be of type '${expectedType}' but got '${actualType}'`
            );
          }
        }

        // Check string patterns/minLength/maxLength
        if (typeof value === "string") {
          if (
            fieldDef.minLength &&
            value.length < (fieldDef.minLength as number)
          ) {
            errors.push(
              `Field '${field}' is too short (min: ${fieldDef.minLength})`
            );
          }
          if (
            fieldDef.maxLength &&
            value.length > (fieldDef.maxLength as number)
          ) {
            errors.push(
              `Field '${field}' is too long (max: ${fieldDef.maxLength})`
            );
          }

          // Email validation
          if (fieldDef.format === "email" && !this.isValidEmail(value)) {
            errors.push(`Field '${field}' is not a valid email`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validate against a schema reference from OpenAPI components
   * Supports both component references (#/components/schemas/User)
   * and file paths (./schemas/user.json)
   */
  async validateWithRef(
    data: unknown,
    schemaRef: string
  ): Promise<ValidationResult> {
    try {
      const schema = await this.resolveSchema(schemaRef);
      return this.validate(data, schema);
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to resolve schema: ${error}`],
      };
    }
  }

  /**
   * Resolve a schema reference to actual schema object
   * Handles both component references and file paths
   */
  private async resolveSchema(schemaRef: string): Promise<ValidationSchema> {
    // Check cache first
    if (this.schemaCache.has(schemaRef)) {
      return this.schemaCache.get(schemaRef)!;
    }

    let schema: ValidationSchema;

    if (schemaRef.startsWith("#/components/schemas/")) {
      // OpenAPI component reference - use ConfigLoader
      if (!this.configLoader) {
        throw new Error("ConfigLoader not available for resolving component schemas");
      }
      const componentSchema = this.configLoader.getComponentSchema(schemaRef);
      if (!componentSchema) {
        throw new Error(`Component schema not found: ${schemaRef}`);
      }
      schema = componentSchema as ValidationSchema;
    } else {
      // File path reference
      if (!this.configLoader) {
        const content = await Deno.readTextFile(schemaRef);
        schema = JSON.parse(content);
      } else {
        schema = await this.configLoader.loadSchema(schemaRef);
      }
    }

    // Cache the resolved schema
    this.schemaCache.set(schemaRef, schema);
    return schema;
  }

  /**
   * Get all component schemas from ConfigLoader
   */
  getComponentSchemas(): Record<string, ValidationSchema> {
    if (!this.configLoader) {
      return {};
    }
    return this.configLoader.getComponentSchemas() as Record<string, ValidationSchema>;
  }

  /**
   * Clear the schema cache
   */
  clearCache(): void {
    this.schemaCache.clear();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async loadSchema(schemaPath: string): Promise<ValidationSchema> {
    try {
      if (this.configLoader) {
        return await this.configLoader.loadSchema(schemaPath) as ValidationSchema;
      }
      const content = await Deno.readTextFile(schemaPath);
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load schema from ${schemaPath}: ${error}`);
    }
  }
}

export function createValidator(configLoader?: ConfigLoader): SchemaValidator {
  return new SchemaValidator(configLoader);
}
