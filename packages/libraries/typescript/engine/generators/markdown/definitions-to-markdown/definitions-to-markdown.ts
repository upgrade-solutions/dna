import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { SchemaRegistry } from "../../../schema-registry.ts";
import type { MarkdownGenerator } from "../mod.ts";

export interface DefinitionsToMarkdownOptions {
  outputDir?: string;
  schemasDir?: string;
  includeExamples?: boolean;
}

/**
 * Generates markdown documentation from DNA schema definitions
 */
export class DefinitionsToMarkdown implements MarkdownGenerator {
  private registry: SchemaRegistry;
  private outputDir: string;
  private includeExamples: boolean;

  constructor(options: DefinitionsToMarkdownOptions = {}) {
    this.registry = new SchemaRegistry(options.schemasDir);
    this.outputDir = options.outputDir ||
      join(import.meta.url.replace("file://", ""), "../../../../../docs/schemas");
    this.includeExamples = options.includeExamples !== false;
  }

  /**
   * Generate markdown for a single schema
   */
  async generateSchemaMarkdown(
    schemaName: string,
    category: string = "core",
  ): Promise<string> {
    const schema = await this.registry.loadDefinition(schemaName, category);

    let md = "";

    // Title
    if (schema.title) {
      md += `# ${schema.title}\n\n`;
    }

    // Description
    if (schema.description) {
      md += `${schema.description}\n\n`;
    }

    // Properties table
    const properties = this.getProperties(schema);
    if (Object.keys(properties).length > 0) {
      md += "## Properties\n\n";
      md += "| Property | Type | Constraints | Required | Description |\n";
      md += "|----------|------|-------------|----------|-------------|\n";

      const required = this.getRequired(schema);

      for (const [prop, propSchema] of Object.entries(properties)) {
        const type = this.getType(propSchema);
        const constraints = this.getConstraints(propSchema);
        const isRequired = required.includes(prop) ? "✓" : "";
        const description = (propSchema.description as string) || "";

        md += `| \`${prop}\` | \`${type}\` | ${constraints} | ${isRequired} | ${description} |\n`;
      }

      md += "\n";
    }

    // Extract and display relationships as a table
    const relationships = this.extractAllRelationships(schema);
    if (relationships.length > 0) {
      md += "## Relationships\n\n";
      md += "| Field | References | Description |\n";
      md += "|-------|------------|-------------|\n";
      for (const rel of relationships) {
        md += `| \`${rel.field}\` | \`${rel.target}\` | ${rel.description || "-"} |\n`;
      }
      md += "\n";
    }

    // Examples
    if (
      this.includeExamples &&
      schema.examples &&
      Array.isArray(schema.examples) &&
      schema.examples.length > 0
    ) {
      md += "## Examples\n\n";

      for (let i = 0; i < schema.examples.length; i++) {
        const example = schema.examples[i] as Record<string, unknown>;
        const exampleName = (example.name as string) || `Example ${i + 1}`;

        md += `### ${exampleName}\n\n`;
        md += "```json\n";
        md += JSON.stringify(example, null, 2);
        md += "\n```\n\n";
      }
    }

    return md;
  }

  /**
   * Extract all relationships including allOf $ref and property $ref
   */
  private extractAllRelationships(
    schema: Record<string, unknown>,
  ): Array<{ field: string; target: string; description?: string }> {
    const relationships: Array<{ field: string; target: string; description?: string }> = [];

    // Extract from allOf (base schema references)
    const allOf = schema.allOf as Array<Record<string, unknown>> | undefined;
    if (allOf) {
      for (const item of allOf) {
        if (item.$ref) {
          const ref = item.$ref as string;
          const target = ref.split("/").pop()?.replace(".json", "") || "Unknown";
          const description = item.description as string | undefined;
          relationships.push({
            field: "inherits",
            target,
            description: description || `Inherits from ${target}`,
          });
        }
      }
    }

    // Extract from properties with $ref
    const properties = this.getProperties(schema);
    for (const [prop, propSchema] of Object.entries(properties)) {
      if (propSchema.$ref) {
        const ref = propSchema.$ref as string;
        const target = ref.split("/").pop()?.replace(".json", "") || "Unknown";
        const description = propSchema.description as string | undefined;
        relationships.push({
          field: prop,
          target,
          description,
        });
      }
    }

    return relationships;
  }

  /**
   * Extract relationships from allOf array with $ref
   */
  private extractRelationships(
    schema: Record<string, unknown>,
  ): Array<{ type: string; title: string; description?: string }> {
    const relationships: Array<{ type: string; title: string; description?: string }> = [];
    const allOf = schema.allOf as Array<Record<string, unknown>> | undefined;

    if (!allOf) return relationships;

    for (const item of allOf) {
      if (item.$ref) {
        const ref = item.$ref as string;
        const title = ref.split("/").pop()?.replace(".json", "") || "Unknown";
        const description = item.description as string | undefined;
        relationships.push({
          type: "references",
          title,
          description,
        });
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
   * Get constraint strings from property schema
   */
  private getConstraints(propSchema: Record<string, unknown>): string {
    const constraints: string[] = [];

    if (propSchema.enum) {
      const values = (propSchema.enum as unknown[]).map((v) => `\`${v}\``).join(", ");
      constraints.push(`enum: ${values}`);
    }

    if (propSchema.pattern) {
      constraints.push(`pattern: \`${propSchema.pattern as string}\``);
    }

    if (propSchema.minimum !== undefined) {
      constraints.push(`min: ${propSchema.minimum}`);
    }

    if (propSchema.maximum !== undefined) {
      constraints.push(`max: ${propSchema.maximum}`);
    }

    if (propSchema.minLength !== undefined) {
      constraints.push(`minLength: ${propSchema.minLength}`);
    }

    if (propSchema.maxLength !== undefined) {
      constraints.push(`maxLength: ${propSchema.maxLength}`);
    }

    if (propSchema.minItems !== undefined) {
      constraints.push(`minItems: ${propSchema.minItems}`);
    }

    return constraints.join("; ") || "-";
  }

  /**
   * Generate markdown files for all schemas in a category
   */
  async generateCategoryMarkdown(category: string): Promise<void> {
    const schemaNames = await this.registry.getSchemasByCategory(category);
    const categoryOutputDir = join(this.outputDir, category);

    // Create output directory
    await ensureDir(categoryOutputDir);

    // Sort schemas alphabetically
    const sortedSchemaNames = schemaNames.sort();

    for (const schemaName of sortedSchemaNames) {
      const markdown = await this.generateSchemaMarkdown(schemaName, category);
      const outputPath = join(categoryOutputDir, `${schemaName}.md`);

      await Deno.writeTextFile(outputPath, markdown);
      console.log(`Generated: ${outputPath}`);
    }
  }

  /**
   * Generate markdown for all schemas across all categories
   */
  async generateAllMarkdown(): Promise<void> {
    const categories = await this.registry.getCategories();

    for (const category of categories) {
      await this.generateCategoryMarkdown(category);
    }

    // Generate index
    await this.generateIndex();
  }

  /**
   * Generate a schema index markdown file
   */
  private async generateIndex(): Promise<void> {
    const schemas = await this.registry.getAllSchemas();
    let md = "# DNA Schema Definitions\n\n";
    md += "Auto-generated documentation for all DNA schema definitions.\n\n";

    // Group by category
    const byCategory: Record<string, typeof schemas> = {};
    for (const schema of schemas) {
      if (!byCategory[schema.category]) {
        byCategory[schema.category] = [];
      }
      byCategory[schema.category].push(schema);
    }

    // Write index for each category
    for (const [category, categorySchemas] of Object.entries(byCategory)) {
      md += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

      // Sort schemas alphabetically by title
      const sortedSchemas = categorySchemas.sort((a, b) => {
        const titleA = (a.title || a.name).toLowerCase();
        const titleB = (b.title || b.name).toLowerCase();
        return titleA.localeCompare(titleB);
      });

      for (const schema of sortedSchemas) {
        md += `- [${schema.title || schema.name}](./${category}/${schema.name}.md)`;
        if (schema.description) {
          md += ` - ${schema.description}`;
        }
        md += "\n";
      }

      md += "\n";
    }

    // Ensure output directory exists
    await ensureDir(this.outputDir);

    const indexPath = join(this.outputDir, "README.md");
    await Deno.writeTextFile(indexPath, md);
    console.log(`Generated index: ${indexPath}`);
  }
}
