# `@dna-codes/output-example`

Template for building a DNA output renderer. Fork this to bootstrap a new `output-*` package that renders DNA into a format string (markdown, HTML, Mermaid, PDF bytes, plaintext, JSON-LD, GraphViz, …).

The demo renders DNA as markdown-lite outlines. Replace the sections with your target format.

Zero runtime dependencies.

## Install

```bash
npm install @dna-codes/output-example
```

## Usage

```ts
import { render } from '@dna-codes/output-example'

const markdown = render(dna)
// Or, opt into specific sections:
const summaryOnly = render(dna, { sections: ['summary'] })
```

## API

### `render(dna, options?)`

| Option | Type | Default | Notes |
|---|---|---|---|
| `sections` | `readonly Section[]` | `DEFAULT_SECTIONS` | Which sections to emit, in order |
| `title` | `string` | `operational.domain.path` (or `name`) | Document heading |
| `headingLevel` | `1 \| 2` | `1` | Starting heading depth |

### Available sections

- `summary` — counts of Resources / Capabilities / Relationships
- `domain-model` — outline of Resources with Attributes and Actions

## Section previews

### Summary

```
## Summary

Domain: acme.finance.lending

- Resources: 1
- Capabilities: 2
```

### Domain model

```
## Domain model

- Loan
  - amount: number (required)
  - status: string
  - action: Apply
  - action: Approve
```

## License

MIT.
