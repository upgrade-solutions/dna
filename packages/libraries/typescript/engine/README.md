# @dna/engine

Engine utilities for working with DNA schema definitions and instances in TypeScript/Deno.

## Overview

- **SchemaRegistry** — Load and validate schema definitions
- **MarkdownGenerator** — Generate documentation from schemas

## Project Structure

```
engine/
├── schema-registry.ts                                # Core registry
├── cli.ts                                            # CLI commands
├── mod.ts                                            # Public exports
├── generators/
│   └── markdown/
│       ├── mod.ts                                    # MarkdownGenerator export
│       └── definitions-to-markdown/                  # Definitions-to-markdown implementation
└── README.md
```

## Development

```bash
deno task check     # Check types
deno task test      # Run tests
```
