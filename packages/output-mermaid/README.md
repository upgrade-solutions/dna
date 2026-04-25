# `@dna-codes/output-mermaid`

Render DNA documents as [Mermaid](https://mermaid.js.org/) diagrams — ERDs from Resources + Relationships, flowcharts from Processes. Zero runtime dependencies.

## Install

```bash
npm install @dna-codes/output-mermaid
```

## Usage

```ts
import { render } from '@dna-codes/output-mermaid'
import operational from './dna/acme/operational.json'

const mermaid = render({ operational })
// → 'erDiagram\n    Loan {\n        number amount\n    }\n…\n\nflowchart TD\n    subgraph …'
```

Pick specific diagrams:

```ts
render({ operational }, { diagrams: ['erd'] })
render({ operational }, { diagrams: ['flowchart'], flowchartDirection: 'LR' })
```

Wrap blocks in markdown fences (caller's job):

```ts
import { render } from '@dna-codes/output-mermaid'
const md = '```mermaid\n' + render({ operational }) + '```\n'
```

## API

### `render(dna, options?)`

Returns a string of concatenated Mermaid source blocks (or `''` if nothing applies).

**`RenderOptions`**:

| Option | Default | Meaning |
|--------|---------|---------|
| `diagrams` | `DEFAULT_DIAGRAMS` | Ordered list of diagrams to emit |
| `flowchartDirection` | `'TD'` | `'TD'`, `'LR'`, `'BT'`, or `'RL'` — direction for flowchart diagrams |

**`Diagram`** values:

| Diagram | What it renders |
|---------|-----------------|
| `erd` | One `erDiagram` block with every Resource as an entity (attributes inside) and every Relationship as an edge (cardinality preserved) |
| `flowchart` | One `flowchart` block per Process — steps as nodes (labeled with each Task's Capability), `depends_on` as arrows, `branch.when` / `branch.else` as edge labels |

The default set is `['erd', 'flowchart']`, exported as `DEFAULT_DIAGRAMS`.

## Cardinality mapping

DNA cardinality strings map to Mermaid ERD notation:

| DNA | Mermaid |
|-----|---------|
| `one-to-one` | `\|\|--\|\|` |
| `one-to-many` | `\|\|--o{` |
| `many-to-one` | `}o--\|\|` |
| `many-to-many` | `}o--o{` |

Unknown cardinalities fall back to `one-to-one`.

## Roadmap

Planned diagrams, not yet shipped:

- `class` — UML class diagram (Resources + Actions as methods, Attributes as fields)
- `sequence` — Trigger → Operation → Outcome → next-Trigger choreography
- `state` — state machines for Resources whose Outcomes change a single status Attribute

## License

MIT.
