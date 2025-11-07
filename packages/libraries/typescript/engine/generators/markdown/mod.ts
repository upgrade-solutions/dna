/**
 * Base interface and types for markdown generators
 */

export interface MarkdownGenerator {
  generateSchemaMarkdown(schemaName: string, category: string): Promise<string>;
  generateCategoryMarkdown(category: string): Promise<void>;
  generateAllMarkdown(): Promise<void>;
}

// Export all generator implementations
export { DefinitionsToMarkdown } from "./definitions-to-markdown/mod.ts";
export type { DefinitionsToMarkdownOptions } from "./definitions-to-markdown/mod.ts";
export { DefinitionsToMermaid } from "./definitions-to-mermaid/mod.ts";
export type { DefinitionsToMermaidOptions } from "./definitions-to-mermaid/mod.ts";
