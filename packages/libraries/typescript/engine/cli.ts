import { DefinitionsToMarkdown } from "./generators/markdown/definitions-to-markdown/mod.ts";
import { DefinitionsToMermaid } from "./generators/markdown/definitions-to-mermaid/mod.ts";

const command = Deno.args[0];

if (!command) {
  console.error("Usage: dna-engine <command>");
  console.error("Commands:");
  console.error("  generate-docs    Generate markdown documentation from schema definitions");
  console.error("  generate-diagrams Generate Mermaid diagrams from schema definitions");
  Deno.exit(1);
}

if (command === "generate-docs") {
  console.log("Generating markdown documentation from schema definitions...");
  const generator = new DefinitionsToMarkdown();
  await generator.generateAllMarkdown();
  console.log("Done!");
} else if (command === "generate-diagrams") {
  console.log("Generating Mermaid diagrams from schema definitions...");
  const generator = new DefinitionsToMermaid();
  await generator.generateAllMarkdown();
  console.log("Done!");
} else {
  console.error(`Unknown command: ${command}`);
  Deno.exit(1);
}
