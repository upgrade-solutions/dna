import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { SchemaRegistry } from "../../../schema-registry.ts";

export interface MarkdownGeneratorOptions {
  outputDir?: string;
  schemasDir?: string;
  includeExamples?: boolean;
}

/**
 * Generates markdown documentation from JSON schemas (definitions)
 */
export class MarkdownGenerator {
  private registry: SchemaRegistry;
  private outputDir: string;
  private includeExamples: boolean;

  constructor(options: MarkdownGeneratorOptions = {}) {
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
    if (schema.properties) {
      md += "## Properties\n\n";
      md += "| Property | Type | Required | Description |\n";
      md += "|----------|------|----------|-------------|\n";

      const required = (schema.required as string[]) || [];
      const properties = schema.properties as Record<string, Record<string, unknown>>;

      for (const [prop, propSchema] of Object.entries(properties)) {
        const type = (propSchema.type as string) || "any";
        const isRequired = required.includes(prop) ? "✓" : "";
        const description = (propSchema.description as string) || "";

        md += `| \`${prop}\` | \`${type}\` | ${isRequired} | ${description} |\n`;
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
   * Generate markdown files for all schemas in a category
   */
  async generateCategoryMarkdown(category: string): Promise<void> {
    const schemaNames = await this.registry.getSchemasByCategory(category);
    const categoryOutputDir = join(this.outputDir, category);

    // Create output directory
    await ensureDir(categoryOutputDir);

    for (const schemaName of schemaNames) {
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
    let md = "# DNA Schemas\n\n";
    md += "Auto-generated documentation for all DNA schemas.\n\n";

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

      for (const schema of categorySchemas) {
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
