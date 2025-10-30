// Test Fixtures for OpenAPI Specs
// Fixtures are loaded from YAML files in this directory:
//   - openapi.valid.yaml
//   - openapi.missing-paths.yaml
//   - openapi.missing-schemas.yaml

import { parse as parseYaml } from "https://deno.land/std@0.208.0/yaml/mod.ts";
import { OpenAPISpec } from "../../core/types.ts";

/**
 * Load fixture spec from YAML file synchronously
 * Uses Deno.readTextFileSync for immediate access in test modules
 */
function loadFixtureSpecSync(fixtureName: string): OpenAPISpec {
  const filePath = new URL(`./openapi.${fixtureName}.yaml`, import.meta.url);
  const content = Deno.readTextFileSync(filePath);
  return parseYaml(content) as OpenAPISpec;
}

/**
 * Valid registration spec (complete and proper)
 * Loaded from openapi.valid.yaml
 */
export const validRegistrationSpec = loadFixtureSpecSync('valid');

/**
 * Spec missing required registration paths
 * Loaded from openapi.missing-paths.yaml
 */
export const specMissingPaths = loadFixtureSpecSync('missing-paths');

/**
 * Spec missing required schemas
 * Loaded from openapi.missing-schemas.yaml
 */
export const specMissingSchemas = loadFixtureSpecSync('missing-schemas');

/**
 * Invalid spec missing basic OpenAPI structure
 */
export const invalidSpec = {
  title: "Not an OpenAPI spec",
  // Missing openapi version, info section structure is wrong
} as unknown as OpenAPISpec;
