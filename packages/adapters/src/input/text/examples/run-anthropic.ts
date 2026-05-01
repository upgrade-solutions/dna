/**
 * Scratch: run @dna-codes/dna-input-text against Anthropic with your own key.
 *
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   npx ts-node packages/input-text/examples/run-anthropic.ts "We run a lending business..."
 *
 * Omit the arg to read from stdin:
 *   cat description.txt | npx ts-node packages/input-text/examples/run-anthropic.ts
 */
import { parse } from '..'

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Set ANTHROPIC_API_KEY in your environment.')
    process.exit(1)
  }

  const text = process.argv[2] ?? (await readStdin())
  if (!text.trim()) {
    console.error('Pass text as argv[2] or pipe it via stdin.')
    process.exit(1)
  }

  const result = await parse(text, {
    provider: 'anthropic',
    apiKey,
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5',
    layers: ['operational'],
  })

  console.log(JSON.stringify({ operational: result.operational }, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
