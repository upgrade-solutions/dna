# `@dna-codes/input-example`

Template for building a DNA input adapter. Demonstrates **both** input modes in one package so you can see the full shape before committing to a direction:

- **Deterministic** (`parse`) — pure, synchronous, zero I/O. Use for structured formats like JSON, YAML, CSV, DDL, protobuf, OpenAPI.
- **Probabilistic** (`parseText`) — async, LLM-backed, requires an API key. Use for freeform prose, transcripts, images.

When you fork this package, **keep one mode and delete the other** (see `AGENTS.md`).

Zero runtime dependencies. Probabilistic mode uses global `fetch` (Node 18+).

## Install

```bash
npm install @dna-codes/input-example
```

## Usage — deterministic

```ts
import { parse } from '@dna-codes/input-example'

const { operational } = parse(
  {
    entities: [
      { name: 'loan', fields: [{ name: 'amount', type: 'number', required: true }] },
      { name: 'borrower', fields: [{ name: 'email', type: 'string' }] },
    ],
    actions: [{ entity: 'loan', verb: 'Apply' }],
  },
  { domain: 'acme.finance.lending' },
)
```

## Usage — probabilistic

```ts
import { parseText } from '@dna-codes/input-example'

const { operational, raw } = await parseText(
  'Acme runs a lending desk. Borrowers apply for loans; underwriters approve them.',
  { provider: 'openai', apiKey: process.env.OPENAI_API_KEY! },
)
```

## API

### `parse(data, options)` — deterministic

| Option | Type | Default | Notes |
|---|---|---|---|
| `domain` | `string` | — (required) | Dot-separated domain path, e.g. `acme.finance.lending` |
| `nounNameFromEntity` | `(s: string) => string` | PascalCase | Override how entity names map to Noun names |

### `parseText(text, options)` — probabilistic

| Option | Type | Default | Notes |
|---|---|---|---|
| `provider` | `'openai' \| 'openrouter' \| 'anthropic'` | — (required) | Which LLM to dispatch to |
| `apiKey` | `string` | — (required) | Provider API key |
| `model` | `string` | Per-provider default | Override the model ID |
| `baseUrl` | `string` | Per-provider default | For self-hosted / proxy deployments |
| `instructions` | `string` | — | Extra guidance appended to the system prompt |
| `temperature` | `number` | `0` | Sampling temperature |
| `fetchImpl` | `typeof fetch` | global `fetch` | For tests or custom transports |

## Example scripts

```bash
export OPENAI_API_KEY=sk-...
npx ts-node packages/input-example/examples/run-openai.ts "We run a lending business..."

export ANTHROPIC_API_KEY=sk-ant-...
npx ts-node packages/input-example/examples/run-anthropic.ts "We run a lending business..."
```

## Validating the output

Pass the result to `@dna-codes/core`'s `DnaValidator` to catch structural issues before downstream use.

## License

MIT.
