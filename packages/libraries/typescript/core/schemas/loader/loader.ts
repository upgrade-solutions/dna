import { dirname, resolve } from "https://deno.land/std@0.208.0/path/mod.ts";

/**
 * Loads a JSON schema by name from the shared schemas directory
 * @param schemaName - The name of the schema file (without .json extension)
 * @param category - The category/folder name (default: 'core')
 * @returns The parsed JSON schema object
 */
export async function loadSchema(
  schemaName: string,
  category: string = "core",
): Promise<Record<string, unknown>> {
  const currentDir = dirname(import.meta.url.replace("file://", ""));
  const schemasDir = resolve(currentDir, "../../../../../schemas");
  const schemaPath = resolve(schemasDir, category, `${schemaName}.json`);

  try {
    const content = await Deno.readTextFile(schemaPath);
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to load schema "${schemaName}" from category "${category}": ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Loads multiple schemas at once
 * @param schemaNames - Array of schema names to load
 * @param category - The category/folder name (default: 'core')
 * @returns Object mapping schema names to their loaded content
 */
export async function loadSchemas(
  schemaNames: string[],
  category: string = "core",
): Promise<Record<string, Record<string, unknown>>> {
  const schemas: Record<string, Record<string, unknown>> = {};

  for (const name of schemaNames) {
    schemas[name] = await loadSchema(name, category);
  }

  return schemas;
}

/**
 * Get the description of a schema
 * @param schemaName - The name of the schema file
 * @param category - The category/folder name (default: 'core')
 * @returns The schema title and description
 */
export async function getSchemaMetadata(
  schemaName: string,
  category: string = "core",
): Promise<{ title?: string; description?: string }> {
  const schema = await loadSchema(schemaName, category);
  return {
    title: schema.title as string | undefined,
    description: schema.description as string | undefined,
  };
}
