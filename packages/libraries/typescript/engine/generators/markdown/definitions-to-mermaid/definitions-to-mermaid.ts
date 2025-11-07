import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { SchemaRegistry } from "../../../schema-registry.ts";
import type { MarkdownGenerator } from "../mod.ts";

export interface DefinitionsToMermaidOptions {
  outputDir?: string;
  schemasDir?: string;
}

/**
 * Generates Mermaid diagrams from DNA schema definitions
 * Shows relationships between schemas through inheritance and composition
 */
export class DefinitionsToMermaid implements MarkdownGenerator {
  private registry: SchemaRegistry;
  private outputDir: string;

  constructor(options: DefinitionsToMermaidOptions = {}) {
    this.registry = new SchemaRegistry(options.schemasDir);
    this.outputDir = options.outputDir ||
      join(import.meta.url.replace("file://", ""), "../../../../../docs/schemas");
  }

  /**
   * Generate a Mermaid class diagram showing inheritance relationships
   */
  async generateSchemaMarkdown(
    schemaName: string,
    category: string = "core",
  ): Promise<string> {
    const schema = await this.registry.loadDefinition(schemaName, category);
    return this.schemaToMermaidDiagram(schemaName, schema);
  }

  /**
   * Generate Mermaid class diagram for a single schema with its relationships
   */
  private schemaToMermaidDiagram(schemaName: string, schema: Record<string, unknown>): string {
    let mermaid = "```mermaid\nclassDiagram\n";

    // Add the main class
    mermaid += `  class ${this.sanitizeClassName(schemaName)} {\n`;

    // Add properties as class members
    const properties = this.getProperties(schema);
    const required = this.getRequired(schema);

    for (const [prop, propSchema] of Object.entries(properties)) {
      const type = this.getType(propSchema);
      const isRequired = required.includes(prop) ? "*" : "";
      mermaid += `    ${isRequired}${prop}: ${type}\n`;
    }

    mermaid += "  }\n";

    // Add inheritance relationships (allOf)
    const inheritanceRelationships = this.extractInheritanceRelationships(schema);
    for (const rel of inheritanceRelationships) {
      mermaid += `  ${this.sanitizeClassName(rel.target)} <|-- ${this.sanitizeClassName(schemaName)}\n`;
    }

    // Add composition relationships (property references)
    const compositionRelationships = this.extractCompositionRelationships(schema);
    for (const rel of compositionRelationships) {
      mermaid += `  ${this.sanitizeClassName(schemaName)} --> ${this.sanitizeClassName(rel.target)} : ${rel.field}\n`;
    }

    mermaid += "```\n";

    return mermaid;
  }

  /**
   * Generate Mermaid diagram for entire category showing all relationships
   */
  async generateCategoryMarkdown(category: string): Promise<void> {
    const schemaNames = await this.registry.getSchemasByCategory(category);
    const categoryOutputDir = join(this.outputDir, category);

    // Create output directory
    await ensureDir(categoryOutputDir);

    // Generate individual schema diagrams
    for (const schemaName of schemaNames) {
      const markdown = await this.generateSchemaMarkdown(schemaName, category);
      const outputPath = join(categoryOutputDir, `${schemaName}.mermaid.md`);

      await Deno.writeTextFile(outputPath, markdown);
      console.log(`Generated: ${outputPath}`);
    }

    // Generate category overview diagram
    await this.generateCategoryOverviewDiagram(category, schemaNames, categoryOutputDir);
  }

  /**
   * Generate an overview diagram showing all schemas in a category and their relationships
   */
  private async generateCategoryOverviewDiagram(
    category: string,
    schemaNames: string[],
    categoryOutputDir: string,
  ): Promise<void> {
    let mermaid = "```mermaid\nclassDiagram\n";
    const addedClasses = new Set<string>();
    const addedRelationships = new Set<string>();

    // Add all classes
    for (const schemaName of schemaNames) {
      const schema = await this.registry.loadDefinition(schemaName, category);
      const sanitized = this.sanitizeClassName(schemaName);

      if (!addedClasses.has(sanitized)) {
        mermaid += `  class ${sanitized}\n`;
        addedClasses.add(sanitized);
      }

      // Add inheritance relationships
      const inheritanceRelationships = this.extractInheritanceRelationships(schema);
      for (const rel of inheritanceRelationships) {
        const relationship = `${this.sanitizeClassName(rel.target)}<|--${sanitized}`;
        if (!addedRelationships.has(relationship)) {
          mermaid += `  ${this.sanitizeClassName(rel.target)} <|-- ${sanitized}\n`;
          addedRelationships.add(relationship);
        }
      }

      // Add composition relationships
      const compositionRelationships = this.extractCompositionRelationships(schema);
      for (const rel of compositionRelationships) {
        const relationship = `${sanitized}-->${this.sanitizeClassName(rel.target)}`;
        if (!addedRelationships.has(relationship)) {
          mermaid += `  ${sanitized} --> ${this.sanitizeClassName(rel.target)} : ${rel.field}\n`;
          addedRelationships.add(relationship);
        }
      }
    }

    mermaid += "```\n";

    const outputPath = join(categoryOutputDir, "overview.mermaid.md");
    await Deno.writeTextFile(outputPath, mermaid);
    console.log(`Generated category overview: ${outputPath}`);
  }

  /**
   * Generate Mermaid diagrams for all categories
   */
  async generateAllMarkdown(): Promise<void> {
    const categories = await this.registry.getCategories();

    for (const category of categories) {
      await this.generateCategoryMarkdown(category);
    }

    // Generate master overview
    await this.generateMasterOverviewDiagram();
  }

  /**
   * Generate a master overview diagram showing all schemas across all categories
   */
  private async generateMasterOverviewDiagram(): Promise<void> {
    const schemas = await this.registry.getAllSchemas();
    let mermaid = "```mermaid\ngraph LR\n";

    const categoryNodes = new Map<string, string[]>();

    // Group schemas by category
    for (const schema of schemas) {
      if (!categoryNodes.has(schema.category)) {
        categoryNodes.set(schema.category, []);
      }
      categoryNodes.get(schema.category)!.push(schema.name);
    }

    // Create subgraphs for each category
    for (const [category, schemaNames] of categoryNodes.entries()) {
      const categoryId = this.sanitizeClassName(category);
      mermaid += `  subgraph ${categoryId}["${category}"]\n`;

      for (const schemaName of schemaNames) {
        const sanitized = this.sanitizeClassName(schemaName);
        mermaid += `    ${sanitized}["${schemaName}"]\n`;
      }

      mermaid += "  end\n";
    }

    // Add relationships across categories
    const addedRelationships = new Set<string>();
    for (const schema of schemas) {
      const sanitized = this.sanitizeClassName(schema.name);

      // Add inheritance relationships
      const inheritanceRelationships = this.extractInheritanceRelationships(
        await this.registry.loadDefinition(schema.name, schema.category),
      );
      for (const rel of inheritanceRelationships) {
        const relationship = `${this.sanitizeClassName(rel.target)}-->${sanitized}`;
        if (!addedRelationships.has(relationship)) {
          mermaid += `  ${this.sanitizeClassName(rel.target)} --> ${sanitized}\n`;
          addedRelationships.add(relationship);
        }
      }
    }

    mermaid += "```\n";

    await ensureDir(this.outputDir);
    const outputPath = join(this.outputDir, "definitions.mermaid.md");
    await Deno.writeTextFile(outputPath, mermaid);
    console.log(`Generated definitions diagram: ${outputPath}`);
  }

  /**
   * Extract inheritance relationships from allOf
   */
  private extractInheritanceRelationships(
    schema: Record<string, unknown>,
  ): Array<{ target: string }> {
    const relationships: Array<{ target: string }> = [];
    const allOf = schema.allOf as Array<Record<string, unknown>> | undefined;

    if (!allOf) return relationships;

    for (const item of allOf) {
      if (item.$ref) {
        const ref = item.$ref as string;
        const target = ref.split("/").pop()?.replace(".json", "") || "Unknown";
        relationships.push({ target });
      }
    }

    return relationships;
  }

  /**
   * Extract composition relationships from property $refs
   */
  private extractCompositionRelationships(
    schema: Record<string, unknown>,
  ): Array<{ field: string; target: string }> {
    const relationships: Array<{ field: string; target: string }> = [];
    const properties = this.getProperties(schema);

    for (const [prop, propSchema] of Object.entries(properties)) {
      if (propSchema.$ref) {
        const ref = propSchema.$ref as string;
        const target = ref.split("/").pop()?.replace(".json", "") || "Unknown";
        relationships.push({ field: prop, target });
      }
    }

    return relationships;
  }

  /**
   * Get all properties, including inherited from base
   */
  private getProperties(
    schema: Record<string, unknown>,
  ): Record<string, Record<string, unknown>> {
    let properties: Record<string, Record<string, unknown>> = {};

    // Get properties from allOf items
    const allOf = schema.allOf as Array<Record<string, unknown>> | undefined;
    if (allOf) {
      for (const item of allOf) {
        if (item.properties) {
          properties = {
            ...properties,
            ...(item.properties as Record<string, Record<string, unknown>>),
          };
        }
      }
    }

    // Get direct properties
    if (schema.properties) {
      properties = {
        ...properties,
        ...(schema.properties as Record<string, Record<string, unknown>>),
      };
    }

    return properties;
  }

  /**
   * Get required fields from schema, including allOf
   */
  private getRequired(schema: Record<string, unknown>): string[] {
    const required: string[] = [];

    // Get from allOf items
    const allOf = schema.allOf as Array<Record<string, unknown>> | undefined;
    if (allOf) {
      for (const item of allOf) {
        if (item.required) {
          required.push(...(item.required as string[]));
        }
      }
    }

    // Get from direct required
    if (schema.required) {
      required.push(...(schema.required as string[]));
    }

    return [...new Set(required)];
  }

  /**
   * Get type string from property schema
   */
  private getType(propSchema: Record<string, unknown>): string {
    // Handle $ref
    if (propSchema.$ref) {
      const ref = propSchema.$ref as string;
      return ref.split("/").pop()?.replace(".json", "") || "reference";
    }

    const type = propSchema.type as string;

    // Handle special types
    if (type === "object") {
      return "object";
    }
    if (type === "array") {
      const items = propSchema.items as Record<string, unknown> | undefined;
      if (items) {
        if (items.$ref) {
          const ref = items.$ref as string;
          const itemType = ref.split("/").pop()?.replace(".json", "") || "unknown";
          return `${itemType}[]`;
        }
        if (items.type) {
          return `${items.type}[]`;
        }
      }
      return "array";
    }

    if (propSchema.format) {
      return `${type} (${propSchema.format as string})`;
    }

    return type || "any";
  }

  /**
   * Sanitize class names for Mermaid (replace hyphens and special characters)
   */
  private sanitizeClassName(name: string): string {
    return name.replace(/[-_]/g, "");
  }
}
