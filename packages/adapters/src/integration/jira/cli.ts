/**
 * CLI for @dna-codes/dna-integration-jira.
 *
 * Three commands:
 *   pull  --epic ENG-123 --out dna.json       Epic → input-text → DNA JSON
 *   push  --epic ENG-123 --in  dna.json       DNA → output-text → Jira Stories
 *   sync  --epic ENG-123                      pull then push in a single run
 *
 * THIS FILE is the canonical composition example for the Jira integration:
 * it is the only place in the package where `@dna-codes/dna-input-text`,
 * `@dna-codes/dna-output-text`, and the integration's pure-I/O client are
 * imported together. The library code itself imports zero adapters.
 *
 * Credentials come from env vars — never flags — so they don't land in shell
 * history. LLM provider is likewise env-driven.
 *
 * `serve` is intentionally absent: Jira Cloud's native webhooks don't ship
 * signed bodies that an external verifier can validate safely. Consumers
 * who need inbound events should use Jira Automation with an outbound
 * webhook that signs the payload, or Forge.
 */

import { readFileSync, writeFileSync } from 'fs'

import { parse as parseText } from '@dna-codes/dna-adapters/input/text'
import type { Provider } from '@dna-codes/dna-adapters/input/text'
import { renderMany } from '@dna-codes/dna-adapters/output/text'
import type { Style } from '@dna-codes/dna-core'

import { createClient } from './client'
import type { Client, ClientOptions } from './types'

const VALID_STYLES: Style[] = ['user-story', 'gherkin', 'product-dna']

interface PullLlmOptions {
  provider: Provider
  apiKey: string
  model?: string
  baseUrl?: string
  instructions?: string
}

function parseStyle(flag: string | boolean | undefined): Style | undefined {
  if (typeof flag !== 'string') return undefined
  if ((VALID_STYLES as string[]).includes(flag)) return flag as Style
  throw new Error(`--style must be one of: ${VALID_STYLES.join(', ')}`)
}

type ArgMap = { positional: string[]; flags: Record<string, string | boolean> }

export async function runCli(
  argv: string[],
  env: NodeJS.ProcessEnv = process.env,
): Promise<number> {
  const [command, ...rest] = argv
  if (!command || command === 'help' || command === '--help') {
    printUsage()
    return 0
  }

  const args = parseArgs(rest)

  try {
    if (command === 'pull') return await pullCommand(args, env)
    if (command === 'push') return await pushCommand(args, env)
    if (command === 'update') return await updateCommand(args, env)
    if (command === 'sync') return await syncCommand(args, env)
    console.error(`Unknown command: ${command}\n`)
    printUsage()
    return 64
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err))
    return 1
  }
}

async function pullCommand(args: ArgMap, env: NodeJS.ProcessEnv): Promise<number> {
  const epic = requireFlag(args, 'epic')
  const out = requireFlag(args, 'out')
  if (!epic || !out) return 64

  const dumpTextPath = typeof args.flags['dump-text'] === 'string'
    ? (args.flags['dump-text'] as string)
    : args.flags['dump-text'] === true
      ? out.replace(/\.json$/, '') + '.epic.txt'
      : null

  const client = createClient(clientOptionsFromEnv(env))
  const dna = await pullDna(client, epic, pullOptionsFromEnv(env), dumpTextPath)
  writeFileSync(out, JSON.stringify(dna, null, 2))
  console.log(`wrote ${out}`)
  return 0
}

async function pullDna(
  client: Client,
  epic: string,
  llm: PullLlmOptions,
  dumpTextPath: string | null,
): Promise<Record<string, unknown>> {
  const fetched = await client.fetch(`jira://${epic}`)
  const text = typeof fetched.contents === 'string'
    ? fetched.contents
    : fetched.contents.toString('utf-8')
  if (!text) throw new Error(`integration-jira: epic ${epic} has no summary or description to parse.`)
  if (dumpTextPath) {
    writeFileSync(dumpTextPath, text)
    console.log(`wrote ${dumpTextPath} (${text.length} chars)`)
  }
  const { raw, missingLayers, ...dna } = await parseText(text, {
    provider: llm.provider,
    apiKey: llm.apiKey,
    ...(llm.model ? { model: llm.model } : {}),
    ...(llm.baseUrl ? { baseUrl: llm.baseUrl } : {}),
    ...(llm.instructions ? { instructions: llm.instructions } : {}),
  })
  void raw
  void missingLayers
  return dna
}

async function pushCommand(args: ArgMap, env: NodeJS.ProcessEnv): Promise<number> {
  const epic = requireFlag(args, 'epic')
  const input = requireFlag(args, 'in')
  if (!epic || !input) return 64

  const dryRun = Boolean(args.flags['dry-run'])
  const labelsFlag = args.flags.labels
  const extraLabels = typeof labelsFlag === 'string'
    ? labelsFlag.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const style = parseStyle(args.flags.style)

  const client = createClient(clientOptionsFromEnv(env))
  const dna = JSON.parse(readFileSync(input, 'utf-8'))
  const docs = renderMany(dna, { styles: { operation: style ?? 'user-story' } })

  if (dryRun) {
    console.log(`[dry-run] would create ${docs.length} stor(ies) under ${epic}`)
    for (const doc of docs) console.log(`- ${doc.title}`)
    return 0
  }

  const created: Array<{ key: string; summary: string }> = []
  for (const doc of docs) {
    const target = buildWriteUri('child', epic, doc.title, doc.id, extraLabels)
    const result = await client.write(target, { contents: doc.body, mimeType: 'text/markdown' })
    const key = result.target.replace(/^jira:\/\//, '')
    created.push({ key, summary: doc.title })
  }
  console.log(`created ${created.length} stor(ies) under ${epic}`)
  for (const c of created) console.log(`- ${c.key} — ${c.summary}`)
  return 0
}

async function updateCommand(args: ArgMap, env: NodeJS.ProcessEnv): Promise<number> {
  const epic = requireFlag(args, 'epic')
  const input = requireFlag(args, 'in')
  if (!epic || !input) return 64
  const style = parseStyle(args.flags.style)

  const client = createClient(clientOptionsFromEnv(env))
  const dna = JSON.parse(readFileSync(input, 'utf-8'))
  const docs = renderMany(dna, { styles: { operation: style ?? 'user-story' } })
  const byLabel = await client.searchChildrenByDnaLabel(epic)

  const updated: Array<{ key: string; summary: string }> = []
  const skipped: Array<{ id: string; reason: string }> = []
  for (const doc of docs) {
    const issueKey = byLabel.get(doc.id)
    if (!issueKey) {
      skipped.push({ id: doc.id, reason: 'no child issue with matching dna label' })
      continue
    }
    const target = buildWriteUri('issue', issueKey, doc.title, doc.id, [])
    await client.write(target, { contents: doc.body, mimeType: 'text/markdown' })
    updated.push({ key: issueKey, summary: doc.title })
  }
  console.log(`updated ${updated.length} stor(ies) under ${epic}`)
  for (const u of updated) console.log(`- ${u.key} — ${u.summary}`)
  if (skipped.length) {
    console.log(`\nskipped ${skipped.length}:`)
    for (const s of skipped) console.log(`- ${s.id} (${s.reason})`)
  }
  return 0
}

async function syncCommand(args: ArgMap, env: NodeJS.ProcessEnv): Promise<number> {
  const epic = requireFlag(args, 'epic')
  if (!epic) return 64

  const client = createClient(clientOptionsFromEnv(env))
  const dna = await pullDna(client, epic, pullOptionsFromEnv(env), null)
  const docs = renderMany(dna, { styles: { operation: 'user-story' } })
  const created: Array<{ key: string; summary: string }> = []
  for (const doc of docs) {
    const target = buildWriteUri('child', epic, doc.title, doc.id, [])
    const result = await client.write(target, { contents: doc.body, mimeType: 'text/markdown' })
    const key = result.target.replace(/^jira:\/\//, '')
    created.push({ key, summary: doc.title })
  }
  console.log(`synced ${created.length} stor(ies) from ${epic}`)
  for (const c of created) console.log(`- ${c.key} — ${c.summary}`)
  return 0
}

function buildWriteUri(
  mode: 'child' | 'issue',
  key: string,
  summary: string,
  label: string,
  extraLabels: string[],
): string {
  const params = new URLSearchParams()
  params.set('summary', summary)
  params.set('label', label)
  for (const l of extraLabels) params.append('extra-label', l)
  const scheme = mode === 'child' ? 'jira:child' : 'jira'
  return `${scheme}://${encodeURIComponent(key)}?${params.toString()}`
}

function clientOptionsFromEnv(env: NodeJS.ProcessEnv): ClientOptions {
  const baseUrl = env.JIRA_BASE_URL
  const email = env.JIRA_EMAIL
  const apiToken = env.JIRA_API_TOKEN
  const projectKey = env.JIRA_PROJECT_KEY
  if (!baseUrl || !email || !apiToken || !projectKey) {
    throw new Error(
      'Set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_PROJECT_KEY in your environment.',
    )
  }
  const storyIssueType = env.JIRA_STORY_ISSUE_TYPE
  return {
    baseUrl,
    email,
    apiToken,
    projectKey,
    ...(storyIssueType ? { storyIssueType } : {}),
  }
}

function pullOptionsFromEnv(env: NodeJS.ProcessEnv): PullLlmOptions {
  const provider = (env.DNA_LLM_PROVIDER ?? 'anthropic') as Provider
  const apiKey = env.DNA_LLM_API_KEY ?? env.ANTHROPIC_API_KEY ?? env.OPENAI_API_KEY ?? env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(
      'Set DNA_LLM_API_KEY (or a provider-specific key: ANTHROPIC_API_KEY / OPENAI_API_KEY / OPENROUTER_API_KEY).',
    )
  }
  return {
    provider,
    apiKey,
    ...(env.DNA_LLM_MODEL ? { model: env.DNA_LLM_MODEL } : {}),
    ...(env.DNA_LLM_BASE_URL ? { baseUrl: env.DNA_LLM_BASE_URL } : {}),
    ...(env.DNA_LLM_INSTRUCTIONS ? { instructions: env.DNA_LLM_INSTRUCTIONS } : {}),
  }
}

function requireFlag(args: ArgMap, name: string): string | null {
  const value = args.flags[name]
  if (typeof value !== 'string') {
    console.error(`--${name} <value> is required`)
    return null
  }
  return value
}

export function parseArgs(argv: string[]): ArgMap {
  const flags: Record<string, string | boolean> = {}
  const positional: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i]
    if (tok.startsWith('--')) {
      const key = tok.slice(2)
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        flags[key] = next
        i++
      } else {
        flags[key] = true
      }
    } else {
      positional.push(tok)
    }
  }
  return { positional, flags }
}

function printUsage(): void {
  console.log(`integration-jira — Jira Epic ⇄ DNA ⇄ Jira Stories

Usage:
  integration-jira pull   --epic <KEY> --out <dna.json> [--dump-text [<path>]]
  integration-jira push   --epic <KEY> --in  <dna.json> [--dry-run] [--labels a,b,c] [--style STYLE]
  integration-jira update --epic <KEY> --in  <dna.json> [--style STYLE]
  integration-jira sync   --epic <KEY>

  --style STYLE   Body template for each Operation Story. One of:
                    user-story  (default) As a / I want / So that + acceptance
                    gherkin     Feature / Scenario / Given / When / Then
                    product-dna Actor / Resource / Action / Trigger / Pre- / Postconditions

  update: find existing dna-labeled child Stories under <KEY> and PUT
  refreshed summary + description to each. Use after re-rendering to
  refresh formatting without creating duplicates.

  --dump-text writes the extracted Epic prose (what gets fed to input-text) to
  <path>, or to <out>.epic.txt when no path is given. Useful for debugging LLM
  output — lets you see exactly what the model was asked to parse.

Composition: this CLI is the canonical example for wiring the
integration with @dna-codes/dna-input-text and @dna-codes/dna-output-text.
The integration's library API is pure I/O — see src/cli.ts.

Environment (Jira):
  JIRA_BASE_URL             https://<site>.atlassian.net
  JIRA_EMAIL                Atlassian account email
  JIRA_API_TOKEN            Atlassian API token (not a password)
  JIRA_PROJECT_KEY          Project key (e.g. ENG)
  JIRA_STORY_ISSUE_TYPE     Issue type for generated children (default: Story)

Environment (LLM for pull):
  DNA_LLM_PROVIDER          anthropic | openai | openrouter (default: anthropic)
  DNA_LLM_API_KEY           Provider API key (or ANTHROPIC_API_KEY / OPENAI_API_KEY / OPENROUTER_API_KEY)
  DNA_LLM_MODEL             Override the provider default model
  DNA_LLM_BASE_URL          Override the provider base URL
  DNA_LLM_INSTRUCTIONS      Extra guidance appended to the input-text system prompt
`)
}
