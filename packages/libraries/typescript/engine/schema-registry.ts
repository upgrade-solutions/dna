import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

export interface SchemaMetadata {
  name: string;
  title?: string;
  description?: string;
  category: string;
}

/**
 * Registry for all available schemas across all categories
 */
export class SchemaRegistry {
  private schemasDir: string;
  private cache: Map<string, Record<string, unknown>> = new Map();

  constructor(schemasDir?: string) {
    this.schemasDir = schemasDir || join(import.meta.url.replace("file://", ""), "../../../../schemas");
  }

  /**
   * Get all available schema categories
   */
  async getCategories(): Promise<string[]> {
    const categories: string[] = [];

    try {
      for await (const entry of Deno.readDir(this.schemasDir)) {
        if (entry.isDirectory) {
          categories.push(entry.name);
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to read schemas directory: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }

    return categories.sort();
  }

  /**
   * Get all schema files in a category
   */
  async getSchemasByCategory(category: string): Promise<string[]> {
    const categoryPath = join(this.schemasDir, category);
    const schemas: string[] = [];

    try {
      for await (const entry of Deno.readDir(categoryPath)) {
        if (entry.isFile && entry.name.endsWith(".json")) {
          schemas.push(entry.name.replace(".json", ""));
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to read category "${category}": ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }

    return schemas.sort();
  }

  /**
   * Get all schemas across all categories
   */
  async getAllSchemas(): Promise<SchemaMetadata[]> {
    const schemas: SchemaMetadata[] = [];
    const categories = await this.getCategories();

    for (const category of categories) {
      const schemaNames = await this.getSchemasByCategory(category);
      for (const name of schemaNames) {
        const schema = await this.loadSchema(name, category);
        schemas.push({
          name,
          category,
          title: schema.title as string | undefined,
          description: schema.description as string | undefined,
        });
      }
    }

    return schemas;
  }

  /**
   * Load a schema by name and category
   */
  async loadSchema(
    name: string,
    category: string = "core",
  ): Promise<Record<string, unknown>> {
    const cacheKey = `${category}/${name}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const schemaPath = join(this.schemasDir, category, `${name}.json`);

    try {
      const content = await Deno.readTextFile(schemaPath);
      const schema = JSON.parse(content);
      this.cache.set(cacheKey, schema);
      return schema;
    } catch (error) {
      throw new Error(
        `Failed to load schema "${name}" from category "${category}": ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
