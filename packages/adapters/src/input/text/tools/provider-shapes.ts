import type { ToolDefinition } from './schema-to-tool'

export interface OpenAITool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface AnthropicTool {
  name: string
  description: string
  input_schema: Record<string, unknown>
}

export function toOpenAITools(tools: ToolDefinition[]): OpenAITool[] {
  return tools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters as Record<string, unknown>,
    },
  }))
}

export function toAnthropicTools(tools: ToolDefinition[]): AnthropicTool[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters as Record<string, unknown>,
  }))
}
