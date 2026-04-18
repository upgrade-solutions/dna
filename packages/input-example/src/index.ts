/**
 * @dna-codes/input-example — template input adapter.
 *
 * This package demonstrates the two input modes with matching entry points:
 *
 *   parse(data, options)                  — deterministic (sync, pure)
 *   parseText(text, options)              — probabilistic (async, LLM-backed)
 *
 * When forking, KEEP ONE mode and delete the other along with its files
 * (`providers.ts` + `prompt.ts` for the probabilistic side). Both are kept
 * here so agents can see either pattern without hunting across packages.
 *
 * Contract (shared across input-*):
 *   - Throw on structural errors the caller should fix; let the
 *     `@dna-codes/core` validator handle downstream DNA validation.
 *   - Return an object keyed by DNA layer (operational, productCore, ...).
 *     Never return a bare array or scalar.
 *   - Zero runtime dependencies. Use global `fetch` for probabilistic mode.
 */

import { buildSystemPrompt, buildUserPrompt } from './prompt'
import { defaultModel, dispatch } from './providers'
import {
  ActionInput,
  EntityInput,
  EntityListInput,
  ParseOptions,
  ParseResult,
  ParsedCapability,
  ParsedNoun,
  TextParseOptions,
  TextParseResult,
} from './types'

// ---------------------------------------------------------------------------
// Deterministic mode — synchronous, pure, no I/O.
// ---------------------------------------------------------------------------

export function parse(data: EntityListInput, options: ParseOptions): ParseResult {
  if (!data || typeof data !== 'object' || !Array.isArray(data.entities)) {
    throw new Error('input-example.parse: data must be an object with an `entities` array.')
  }
  if (!options.domain) {
    throw new Error('input-example.parse: options.domain is required.')
  }

  const nounName = options.nounNameFromEntity ?? defaultNounName
  const nouns: ParsedNoun[] = data.entities.map((entity) => toNoun(entity, nounName))
  const capabilities = (data.actions ?? []).map((action) => toCapability(action, nounName))

  attachVerbs(nouns, capabilities)

  return {
    operational: {
      domain: {
        name: domainLeaf(options.domain),
        path: options.domain,
        nouns,
      },
      ...(capabilities.length ? { capabilities } : {}),
    },
  }
}

function toNoun(entity: EntityInput, nounName: (s: string) => string): ParsedNoun {
  return {
    name: nounName(entity.name),
    attributes: (entity.fields ?? []).map((f) => ({
      name: f.name,
      type: f.type,
      ...(f.required ? { required: true } : {}),
    })),
  }
}

function toCapability(action: ActionInput, nounName: (s: string) => string): ParsedCapability {
  const noun = nounName(action.entity)
  const verb = toPascalCase(action.verb)
  return { noun, verb, name: `${noun}.${verb}` }
}

function attachVerbs(nouns: ParsedNoun[], capabilities: ParsedCapability[]): void {
  for (const cap of capabilities) {
    const noun = nouns.find((n) => n.name === cap.noun)
    if (!noun) continue
    noun.verbs ??= []
    if (!noun.verbs.some((v) => v.name === cap.verb)) noun.verbs.push({ name: cap.verb })
  }
}

function defaultNounName(entity: string): string {
  return toPascalCase(entity)
}

function toPascalCase(s: string): string {
  return s
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}

function domainLeaf(path: string): string {
  const parts = path.split('.')
  return parts[parts.length - 1]
}

// ---------------------------------------------------------------------------
// Probabilistic mode — async, LLM-backed. Delete this half if not needed.
// ---------------------------------------------------------------------------

export async function parseText(text: string, options: TextParseOptions): Promise<TextParseResult> {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('input-example.parseText: text must be a non-empty string.')
  }
  if (!options.apiKey) {
    throw new Error('input-example.parseText: options.apiKey is required.')
  }

  const raw = await dispatch({
    provider: options.provider,
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
    model: options.model ?? defaultModel(options.provider),
    system: buildSystemPrompt(options.instructions),
    user: buildUserPrompt(text),
    temperature: options.temperature ?? 0,
    fetchImpl: options.fetchImpl ?? fetch,
  })

  const parsed = parseJsonObject(raw)
  return {
    ...(parsed.operational ? { operational: parsed.operational as ParseResult['operational'] } : {}),
    raw,
  }
}

function parseJsonObject(raw: string): Record<string, unknown> {
  const stripped = stripFences(raw.trim())
  try {
    const value = JSON.parse(stripped)
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('expected top-level object')
    }
    return value as Record<string, unknown>
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`input-example.parseText: model did not return valid JSON (${message}). Raw:\n${raw}`)
  }
}

function stripFences(s: string): string {
  const match = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return match ? match[1] : s
}

export * from './types'
