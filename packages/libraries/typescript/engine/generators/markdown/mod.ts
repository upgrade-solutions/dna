/**
 * Base interface and types for markdown generators
 */

export interface MarkdownGenerator {
  generateSchemaMarkdown(schemaName: string, category: string): Promise<string>;
  generateCategoryMarkdown(category: string): Promise<void>;
  generateAllMarkdown(): Promise<void>;
}
