/**
 * Example runner for the probabilistic mode.
 *
 *   export OPENAI_API_KEY=sk-...
 *   npx ts-node packages/input-example/examples/run-openai.ts "We run a lending business..."
 *
 * Or pipe from stdin:
 *   cat description.txt | npx ts-node packages/input-example/examples/run-openai.ts
 */

import { parseText } from '../src'

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return ''
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf-8')
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('Set OPENAI_API_KEY in your environment.')
    process.exit(1)
  }

  const text = process.argv[2] ?? (await readStdin())
  if (!text.trim()) {
    console.error('Pass text as argv[2] or pipe it via stdin.')
    process.exit(1)
  }

  const result = await parseText(text, {
    provider: 'openai',
    apiKey,
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  })

  console.log(JSON.stringify({ operational: result.operational }, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
