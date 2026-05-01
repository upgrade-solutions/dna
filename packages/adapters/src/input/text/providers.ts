import type { OpenAITool, AnthropicTool } from './tools/provider-shapes'
import { Provider } from './types'

export interface DispatchArgs {
  provider: Provider
  apiKey: string
  baseUrl?: string
  model: string
  system: string
  user: string
  temperature: number
  fetchImpl: typeof fetch
}

export interface ToolCallDispatchArgs {
  provider: Provider
  apiKey: string
  baseUrl?: string
  model: string
  system: string
  messages: ProviderMessage[]
  tools: OpenAITool[] | AnthropicTool[]
  temperature: number
  fetchImpl: typeof fetch
}

export type ProviderMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | { role: 'assistant'; toolCalls: { id: string; name: string; arguments: string }[] }
  | { role: 'tool'; toolCallId: string; toolName: string; content: string }

export type DispatchResult =
  | { type: 'tool_call'; id: string; name: string; args: Record<string, unknown> }
  | { type: 'final'; content: string }

const DEFAULT_MODEL: Record<Provider, string> = {
  openai: 'gpt-4o-mini',
  openrouter: 'anthropic/claude-sonnet-4-5',
  anthropic: 'claude-sonnet-4-5',
}

const DEFAULT_BASE_URL: Record<Provider, string> = {
  openai: 'https://api.openai.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  anthropic: 'https://api.anthropic.com/v1',
}

export function defaultModel(provider: Provider): string {
  return DEFAULT_MODEL[provider]
}

export async function dispatch(args: DispatchArgs): Promise<string> {
  const base = args.baseUrl ?? DEFAULT_BASE_URL[args.provider]
  if (args.provider === 'anthropic') return callAnthropic(base, args)
  return callOpenAICompatible(base, args)
}

export async function dispatchToolCall(args: ToolCallDispatchArgs): Promise<DispatchResult> {
  const base = args.baseUrl ?? DEFAULT_BASE_URL[args.provider]
  if (args.provider === 'anthropic') return callAnthropicToolCall(base, args)
  return callOpenAICompatibleToolCall(base, args)
}

/** Append a tool result to a message history in the provider-neutral format. */
export function appendToolResult(
  messages: ProviderMessage[],
  toolCallId: string,
  toolName: string,
  result: unknown,
): ProviderMessage[] {
  return [
    ...messages,
    {
      role: 'tool',
      toolCallId,
      toolName,
      content: typeof result === 'string' ? result : JSON.stringify(result),
    },
  ]
}

async function callOpenAICompatible(base: string, args: DispatchArgs): Promise<string> {
  const res = await args.fetchImpl(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      temperature: args.temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: args.system },
        { role: 'user', content: args.user },
      ],
    }),
  })
  if (!res.ok) throw new Error(`${args.provider} ${res.status}: ${await res.text()}`)
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = body.choices?.[0]?.message?.content
  if (!content) throw new Error(`${args.provider}: empty response`)
  return content
}

async function callAnthropic(base: string, args: DispatchArgs): Promise<string> {
  const res = await args.fetchImpl(`${base}/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': args.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: args.model,
      max_tokens: 4096,
      temperature: args.temperature,
      system: args.system,
      messages: [{ role: 'user', content: args.user }],
    }),
  })
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`)
  const body = (await res.json()) as { content?: { type: string; text?: string }[] }
  const text = body.content?.find((b) => b.type === 'text')?.text
  if (!text) throw new Error('anthropic: empty response')
  return text
}

async function callOpenAICompatibleToolCall(
  base: string,
  args: ToolCallDispatchArgs,
): Promise<DispatchResult> {
  const messages: unknown[] = [{ role: 'system', content: args.system }]
  for (const m of args.messages) messages.push(toOpenAIMessage(m))

  const res = await args.fetchImpl(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      temperature: args.temperature,
      messages,
      tools: args.tools,
      tool_choice: 'auto',
    }),
  })
  if (!res.ok) throw new Error(`${args.provider} ${res.status}: ${await res.text()}`)
  const body = (await res.json()) as {
    choices?: {
      message?: {
        content?: string | null
        tool_calls?: { id: string; function: { name: string; arguments: string } }[]
      }
    }[]
  }
  const message = body.choices?.[0]?.message
  if (!message) throw new Error(`${args.provider}: empty response`)
  const toolCall = message.tool_calls?.[0]
  if (toolCall) {
    let parsed: Record<string, unknown> = {}
    try {
      parsed = toolCall.function.arguments ? (JSON.parse(toolCall.function.arguments) as Record<string, unknown>) : {}
    } catch {
      parsed = {}
    }
    return { type: 'tool_call', id: toolCall.id, name: toolCall.function.name, args: parsed }
  }
  if (typeof message.content === 'string') {
    return { type: 'final', content: message.content }
  }
  // Some local models return an empty assistant message — treat as a final empty turn so the loop terminates.
  return { type: 'final', content: '' }
}

async function callAnthropicToolCall(base: string, args: ToolCallDispatchArgs): Promise<DispatchResult> {
  const messages: unknown[] = []
  for (const m of args.messages) messages.push(toAnthropicMessage(m))

  const res = await args.fetchImpl(`${base}/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': args.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: args.model,
      max_tokens: 4096,
      temperature: args.temperature,
      system: args.system,
      tools: args.tools,
      messages,
    }),
  })
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`)
  const body = (await res.json()) as {
    content?: ({ type: 'text'; text: string } | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> })[]
    stop_reason?: string
  }
  const blocks = body.content ?? []
  const toolUse = blocks.find((b): b is { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> } => b.type === 'tool_use')
  if (toolUse) {
    return { type: 'tool_call', id: toolUse.id, name: toolUse.name, args: toolUse.input ?? {} }
  }
  const textBlock = blocks.find((b): b is { type: 'text'; text: string } => b.type === 'text')
  if (textBlock) {
    return { type: 'final', content: textBlock.text }
  }
  throw new Error('anthropic: response has neither tool_use nor text')
}

function toOpenAIMessage(m: ProviderMessage): unknown {
  if (m.role === 'user') return { role: 'user', content: m.content }
  if (m.role === 'tool') {
    return { role: 'tool', tool_call_id: m.toolCallId, content: m.content }
  }
  if ('toolCalls' in m) {
    return {
      role: 'assistant',
      content: null,
      tool_calls: m.toolCalls.map((c) => ({
        id: c.id,
        type: 'function',
        function: { name: c.name, arguments: c.arguments },
      })),
    }
  }
  return { role: 'assistant', content: m.content }
}

function toAnthropicMessage(m: ProviderMessage): unknown {
  if (m.role === 'user') return { role: 'user', content: m.content }
  if (m.role === 'tool') {
    return {
      role: 'user',
      content: [{ type: 'tool_result', tool_use_id: m.toolCallId, content: m.content }],
    }
  }
  if ('toolCalls' in m) {
    return {
      role: 'assistant',
      content: m.toolCalls.map((c) => ({
        type: 'tool_use',
        id: c.id,
        name: c.name,
        input: tryParseJson(c.arguments),
      })),
    }
  }
  return { role: 'assistant', content: m.content }
}

function tryParseJson(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    return {}
  }
}
