import { LayeredConstructor, type ToolCallResult } from './layered/constructor'
import { buildLayeredSystemPrompt, buildLayeredUserPrompt } from './layered/prompt'
import { buildSystemPrompt, buildUserPrompt } from './prompt'
import {
  appendToolResult,
  defaultModel,
  dispatch,
  dispatchToolCall,
  type ProviderMessage,
} from './providers'
import { toAnthropicTools, toOpenAITools } from './tools/provider-shapes'
import { Layer, ParseOptions, ParseResult } from './types'

const DEFAULT_LAYERS: Layer[] = ['operational', 'product', 'technical']

export async function parse(text: string, options: ParseOptions): Promise<ParseResult> {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('input-text.parse: text must be a non-empty string.')
  }
  if (!options.apiKey) {
    throw new Error('input-text.parse: options.apiKey is required.')
  }

  if (options.mode === 'layered') return parseLayered(text, options)
  return parseOneShot(text, options)
}

async function parseOneShot(text: string, options: ParseOptions): Promise<ParseResult> {
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
  const missingLayers = layers.filter((l) => !parsed[l])

  if (missingLayers.length) {
    handleMissing(missingLayers, layers, options.onMissingLayers ?? 'warn')
  }

  return {
    ...(parsed.operational ? { operational: parsed.operational } : {}),
    ...(parsed.product ? { product: parsed.product } : {}),
    ...(parsed.technical ? { technical: parsed.technical } : {}),
    missingLayers,
    raw,
  }
}

async function parseLayered(text: string, options: ParseOptions): Promise<ParseResult> {
  const layers = (options.layers ?? ['operational']).filter((l) => l === 'operational') as Layer[]
  if (layers.length === 0) {
    throw new Error('input-text.parse: layered mode currently supports the operational layer only.')
  }
  const ctor = new LayeredConstructor({ maxToolCalls: options.maxToolCalls })
  const tools = ctor.tools()
  const providerTools =
    options.provider === 'anthropic' ? toAnthropicTools(tools) : toOpenAITools(tools)
  const fetchImpl = options.fetchImpl ?? fetch
  const system = buildLayeredSystemPrompt(options.instructions)
  const user = buildLayeredUserPrompt(text)

  let messages: ProviderMessage[] = [{ role: 'user', content: user }]
  const transcript: { name: string; args: Record<string, unknown>; result: ToolCallResult }[] = []
  const maxToolCalls = options.maxToolCalls ?? 50
  let calls = 0

  while (calls < maxToolCalls + 5) {
    const dispatchResult = await dispatchToolCall({
      provider: options.provider,
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      model: options.model ?? defaultModel(options.provider),
      system,
      messages,
      tools: providerTools,
      temperature: options.temperature ?? 0,
      fetchImpl,
    })

    if (dispatchResult.type === 'final') {
      // Model emitted a final message without calling finalize — treat as terminal.
      messages = [...messages, { role: 'assistant', content: dispatchResult.content }]
      break
    }

    calls += 1
    const toolResult = ctor.handle({ name: dispatchResult.name, args: dispatchResult.args })
    transcript.push({ name: dispatchResult.name, args: dispatchResult.args, result: toolResult })

    messages = [
      ...messages,
      {
        role: 'assistant',
        toolCalls: [{ id: dispatchResult.id, name: dispatchResult.name, arguments: JSON.stringify(dispatchResult.args) }],
      },
    ]
    messages = appendToolResult(messages, dispatchResult.id, dispatchResult.name, toolResult)

    if (toolResult.ok && 'finalized' in toolResult && toolResult.finalized) break
  }

  const operational = ctor.hasFinalized() ? (ctor.result() as Record<string, unknown>) : undefined
  const missingLayers: Layer[] = operational ? [] : ['operational']
  if (missingLayers.length) {
    handleMissing(missingLayers, layers, options.onMissingLayers ?? 'warn')
  }

  return {
    ...(operational ? { operational } : {}),
    missingLayers,
    raw: JSON.stringify(transcript, null, 2),
  }
}

function handleMissing(missingLayers: Layer[], requested: Layer[], mode: 'warn' | 'throw' | 'silent'): void {
  const message = `input-text.parse: model returned ${requested.length - missingLayers.length}/${requested.length} requested layers. Missing: ${missingLayers.join(', ')}.`
  if (mode === 'throw') throw new Error(message)
  if (mode === 'warn') console.warn(message)
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
export { LayeredConstructor } from './layered/constructor'
export type { ToolCallRequest, ToolCallResult, LayeredConstructorOptions } from './layered/constructor'
export { buildLayeredTools, buildPrimitiveTool, injectEnums, FINALIZE_TOOL, PRIMITIVE_KINDS } from './tools/schema-to-tool'
export type { ToolDefinition, EnumPools, PrimitiveKind } from './tools/schema-to-tool'
export { toOpenAITools, toAnthropicTools } from './tools/provider-shapes'
export type { OpenAITool, AnthropicTool } from './tools/provider-shapes'
