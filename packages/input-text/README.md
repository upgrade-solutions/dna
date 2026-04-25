# `@dna-codes/input-text`

Turn freeform prose about a business system into DNA by dispatching the text to an LLM. Supports **OpenAI**, **OpenRouter**, and **Anthropic**.

> **Requires an API key.** Unlike the other `input-*` adapters, this one hits the network. It's still format-first (text in, DNA out) — it just needs a provider to do the interpretation.

Zero runtime dependencies (uses global `fetch`, Node 18+).

## Install

```bash
npm install @dna-codes/input-text
```

## Usage

```ts
import { parse } from '@dna-codes/input-text'

const { operational, product, technical, raw } = await parse(
  `We run a small lending business. Borrowers apply for loans. Underwriters
   approve or reject pending applications. Only active loans accrue interest.`,
  {
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY!,
    layers: ['operational'],
  },
)
```

## API

### `parse(text, options)`

| Option | Default | Meaning |
|--------|---------|---------|
| `provider` (required) | — | `'openai' \| 'openrouter' \| 'anthropic'` |
| `apiKey` (required) | — | Credential for the chosen provider |
| `model` | per-provider default | Override the model ID |
| `baseUrl` | provider default | Point at an OpenAI-compatible proxy |
| `layers` | all three | Which DNA layers to request (`operational`, `product`, `technical`) |
| `instructions` | — | Extra guidance appended to the system prompt |
| `temperature` | `0` | Sampling temperature |
| `fetchImpl` | global `fetch` | Inject a fetch for testing |
| `onMissingLayers` | `'warn'` | What to do when the model returns fewer layers than requested: `'warn'` logs to `console.warn`, `'throw'` raises, `'silent'` does nothing (the `missingLayers` field on the result is always populated). |

Returns `Promise<{ operational?, product?, technical?, missingLayers, raw }>`. Each layer is only present when the model emitted it. `missingLayers` lists requested layers that weren't returned (empty on a complete response). `raw` is the unparsed model response — handy for debugging.

## Provider defaults

| Provider | Base URL | Default model |
|----------|----------|---------------|
| `openai` | `https://api.openai.com/v1` | `gpt-4o-mini` |
| `openrouter` | `https://openrouter.ai/api/v1` | `anthropic/claude-sonnet-4-5` |
| `anthropic` | `https://api.anthropic.com/v1` | `claude-sonnet-4-5` |

### Local models (Ollama, LM Studio, vLLM)

Any OpenAI-compatible endpoint works — pass `provider: 'openai'` with a custom `baseUrl`:

```ts
await parse(text, {
  provider: 'openai',
  apiKey: 'ollama',
  baseUrl: 'http://localhost:11434/v1',
  model: 'llama3.1',
  layers: ['operational'],
})
```

Smaller local models may struggle with strict JSON; see `examples/run-ollama.ts`.

## Validating the output

`parse` returns loose `Record<string, unknown>` shapes — LLMs are not strictly typed. If you want schema conformance, validate with `@dna-codes/core`:

```ts
import { DnaValidator } from '@dna-codes/core'

const { operational } = await parse(text, { provider: 'openai', apiKey })
const result = new DnaValidator().validateOperational(operational)
if (!result.valid) console.error(result.errors)
```

## Not inferred

- Domain paths beyond what the text explicitly names
- Technical layer primitives unless the text describes deployment
- Consistency across multiple `parse` calls — each call is independent

## License

MIT.
