/**
 * DNA Core Schemas module
 * Provides access to pre-loaded DNA schemas and validation utilities
 */

// Pre-loaded DNA schemas
export { schemas, type SchemaName } from "./definitions.ts";

// Schema validator
export { validateSchema, assertValid } from "./validator/mod.ts";
export type { ValidationError, ValidationResult } from "./validator/mod.ts";
