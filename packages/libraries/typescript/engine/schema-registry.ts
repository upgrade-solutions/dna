/**
 * SchemaRegistry - Load and validate schema definitions
 */

import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

export interface SchemaMetadata {
  name: string;
  title?: string;
  description?: string;
  category: string;
}

export type SchemaDefinition = Record<string, unknown>;
export type Instance = Record<string, unknown>;

export class SchemaRegistry {
  private schemasDir: string;
  private definitionCache: Map<string, SchemaDefinition> = new Map();
  private categoriesCache: string[] | null = null;
  private schemasByCategory: Map<string, string[]> = new Map();

  constructor(schemasDir?: string) {
    // Default to core schemas location if not specified
    if (schemasDir) {
      this.schemasDir = schemasDir;
    } else {
      const importMetaUrl = new URL(import.meta.url);
      const engineDir = importMetaUrl.pathname.replace(/\/engine\/.*$/, "");
      this.schemasDir = join(engineDir, "core", "schemas", "definitions");
    }
  }

  async loadDefinition(
    name: string,
    category: string = "core",
  ): Promise<SchemaDefinition> {
    const cacheKey = `${category}/${name}`;
    
    if (this.definitionCache.has(cacheKey)) {
      return this.definitionCache.get(cacheKey)!;
    }

    try {
      const filePath = join(this.schemasDir, category, `${name}.json`);
      const content = await Deno.readTextFile(filePath);
      const definition = JSON.parse(content) as SchemaDefinition;
      this.definitionCache.set(cacheKey, definition);
      return definition;
    } catch {
      throw new Error(`Failed to load definition: ${category}/${name}`);
    }
  }

  loadInstance(_name: string, _category: string): Promise<Instance> {
    // TODO: Implement instance loading
    return Promise.reject(new Error("Instance loading not yet implemented"));
  }

  validateInstanceAgainstDefinition(
    _instance: Instance,
    _definition: SchemaDefinition,
  ): boolean {
    throw new Error("Not implemented");
  }

  async getCategories(): Promise<string[]> {
    if (this.categoriesCache) {
      return this.categoriesCache;
    }

    try {
      const categories: string[] = [];
      const definitionsPath = this.schemasDir;

      for await (const entry of Deno.readDir(definitionsPath)) {
        if (entry.isDirectory && entry.name !== ".") {
          categories.push(entry.name);
        }
      }

      this.categoriesCache = categories;
      return categories;
    } catch {
      return [];
    }
  }

  async getSchemasByCategory(category: string): Promise<string[]> {
    if (this.schemasByCategory.has(category)) {
      return this.schemasByCategory.get(category) || [];
    }

    try {
      const schemas: string[] = [];
      const categoryPath = join(this.schemasDir, category);

      for await (const entry of Deno.readDir(categoryPath)) {
        if (entry.isFile && entry.name.endsWith(".json")) {
          schemas.push(entry.name.replace(/\.json$/, ""));
        }
      }

      this.schemasByCategory.set(category, schemas);
      return schemas;
    } catch {
      return [];
    }
  }

  async getAllSchemas(): Promise<SchemaMetadata[]> {
    const schemas: SchemaMetadata[] = [];
    const categories = await this.getCategories();

    for (const category of categories) {
      const schemaNames = await this.getSchemasByCategory(category);
      for (const name of schemaNames) {
        const definition = await this.loadDefinition(name, category);
        schemas.push({
          name,
          title: (definition.title as string) || name,
          description: (definition.description as string),
          category,
        });
      }
    }

    return schemas;
  }

  clearCache(): void {
    this.definitionCache.clear();
    this.categoriesCache = null;
    this.schemasByCategory.clear();
  }
}
