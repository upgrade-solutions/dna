import { buildSystemPrompt, buildUserPrompt } from './prompt'
import { defaultModel, dispatch } from './providers'
import { Layer, ParseOptions, ParseResult } from './types'

const DEFAULT_LAYERS: Layer[] = ['operational', 'product', 'technical']

export async function parse(text: string, options: ParseOptions): Promise<ParseResult> {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('input-text.parse: text must be a non-empty string.')
  }
  if (!options.apiKey) {
    throw new Error('input-text.parse: options.apiKey is required.')
  }

  const layers = options.layers ?? DEFAULT_LAYERS
  const raw = await dispatch({
    provider: options.provider,
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
    model: options.model ?? defaultModel(options.provider),
    system: buildSystemPrompt(layers, options.instructions),
    user: buildUserPrompt(text, layers),
    temperature: options.temperature ?? 0,
    fetchImpl: options.fetchImpl ?? fetch,
  })

  const parsed = parseJson(raw)
  return {
    ...(parsed.operational ? { operational: parsed.operational } : {}),
    ...(parsed.product ? { product: parsed.product } : {}),
    ...(parsed.technical ? { technical: parsed.technical } : {}),
    raw,
  }
}

function parseJson(raw: string): Record<string, Record<string, unknown>> {
  const stripped = stripFences(raw.trim())
  try {
    const value = JSON.parse(stripped)
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('expected top-level object')
    }
    return value as Record<string, Record<string, unknown>>
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`input-text.parse: model did not return valid JSON (${message}). Raw:\n${raw}`)
  }
}

function stripFences(s: string): string {
  const match = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return match ? match[1] : s
}

export * from './types'
