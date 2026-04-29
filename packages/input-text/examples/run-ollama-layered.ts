/**
 * Scratch: run @dna-codes/dna-input-text against a local Ollama server using
 * LAYERED construction (the model issues one tool call per primitive, with
 * per-call schema + reference-integrity checks). Slower and more tokens than
 * one-shot mode, but recovers from per-primitive errors and works on smaller
 * models.
 *
 *   ollama pull qwen2.5:14b   # any model with tool-calling support
 *   ollama serve              # if not already running
 *
 *   npx ts-node packages/input-text/examples/run-ollama-layered.ts "We run a lending business..."
 *
 * Environment overrides:
 *   OLLAMA_BASE_URL  (default: http://localhost:11434/v1)
 *   OLLAMA_MODEL     (default: qwen2.5:14b)
 */
import { parse } from '../src'

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

async function main() {
  const text = process.argv[2] ?? (await readStdin())
  if (!text.trim()) {
    console.error('Pass text as argv[2] or pipe it via stdin.')
    process.exit(1)
  }

  const result = await parse(text, {
    provider: 'openai',
    apiKey: 'ollama',
    baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
    model: process.env.OLLAMA_MODEL ?? 'qwen2.5:14b',
    layers: ['operational'],
    mode: 'layered',
  })

  if (!result.operational) {
    console.error('No operational layer parsed. Tool-call transcript:')
    console.error(result.raw)
    process.exit(1)
  }
  console.log(JSON.stringify({ operational: result.operational }, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
