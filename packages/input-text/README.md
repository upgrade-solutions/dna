# `@dna-codes/input-text`

Turn freeform prose about a business system into DNA by dispatching the text to an LLM. Supports **OpenAI**, **OpenRouter**, and **Anthropic**.

> **Requires an API key.** Unlike the other `input-*` adapters, this one hits the network. It's still format-first (text in, DNA out) — it just needs a provider to do the interpretation.

Lightweight: only depends on `@dna-codes/core` (for the validator used by layered mode) and `@dna-codes/schemas`. Uses global `fetch` (Node 18+).

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
| `mode` | `'one-shot'` | `'one-shot'` asks for one giant JSON document (existing behavior). `'layered'` drives the model through tool calls — one primitive at a time — with per-call schema and reference-integrity checks. Layered mode currently supports the operational layer only. |
| `maxToolCalls` | `50` | Layered mode: cap on tool calls per `parse()` invocation. The loop throws if exceeded. |

Returns `Promise<{ operational?, product?, technical?, missingLayers, raw }>`. Each layer is only present when the model emitted it. `missingLayers` lists requested layers that weren't returned (empty on a complete response). `raw` is the unparsed model response — or, in layered mode, a structured tool-call transcript (`[{ name, args, result }]`) handy for debugging the conversation.

## Layered construction

One-shot mode produces a full JSON document in a single LLM call. That works well for small inputs and frontier models, but fails on larger transcripts and smaller local models — a single mistake (a missing wrapper, an invented operator, a malformed `Process.steps`) throws away the whole document.

Layered mode trades tokens for reliability. The model assembles the document one primitive at a time through tool calls (`add_resource`, `add_role`, `add_membership`, `add_operation`, ...). The runtime validates each call against the per-primitive JSON Schema and checks that any cross-primitive reference (e.g. `Membership.role`) points to something already declared. A bad call returns a structured error the model can recover from; a `finalize` call runs full schema validation and either succeeds or feeds errors back for correction.

```ts
import { parse } from '@dna-codes/input-text'

const { operational, raw } = await parse(transcript, {
  provider: 'openai',
  apiKey: 'ollama',
  baseUrl: 'http://localhost:11434/v1',
  model: 'qwen2.5:14b',
  layers: ['operational'],
  mode: 'layered',
})
// `raw` is a JSON-stringified transcript: [{ name, args, result }, ...]
```

**Tradeoffs:** layered mode uses more tokens and more wall-clock time than one-shot. It buys reliability and works on local models that struggle with one-shot JSON. Default stays one-shot for backward compatibility.

**Requires:** a model that supports tool/function calling. Most hosted models and recent local models (qwen2.5, llama3.1+) do.

### Drive it from your own agent (or no agent at all)

`LayeredConstructor` is a public, transport-free class. You can drive it directly without `parse()` — useful for embedding in an external agent (Claude Code, MCP server, custom Anthropic SDK loop) or for hand-building documents in tests/migrations with no LLM at all.

```ts
import { LayeredConstructor, toOpenAITools, toAnthropicTools } from '@dna-codes/input-text'

const ctor = new LayeredConstructor({ domain: { name: 'lending', path: 'acme.lending' } })

// Direct, no LLM:
ctor.handle({ name: 'add_resource', args: { name: 'Loan' } })
ctor.handle({ name: 'add_person', args: { name: 'Borrower' } })
const result = ctor.handle({ name: 'finalize', args: {} })
if (result.ok && 'document' in result) {
  console.log(result.document) // schema-valid Operational DNA
}

// External agent:
const openaiTools = toOpenAITools(ctor.tools())     // for OpenAI/Ollama
const anthropicTools = toAnthropicTools(ctor.tools()) // for Anthropic
// ... feed tools to your agent loop, route tool calls back to ctor.handle({ name, args })
```

`ctor.tools()` returns provider-neutral tool definitions; the helpers render them to OpenAI or Anthropic shapes. `ctor.handle()` is synchronous and returns either a success record (`{ ok: true, primitive, name }`) or a structured error (`{ ok: false, error: 'unknown_role', message, available }`). Callers loop until `ctor.handle({ name: 'finalize', args: {} })` returns `{ ok: true, finalized: true, document }`.

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

Smaller local models may struggle with strict JSON; see `examples/run-ollama.ts`. For larger transcripts or smaller models, use **layered mode** (below) which assembles the document via tool calls — see `examples/run-ollama-layered.ts`.

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
