import type { ToolDefinition } from './schema-to-tool';
export interface OpenAITool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}
export interface AnthropicTool {
    name: string;
    description: string;
    input_schema: Record<string, unknown>;
}
export declare function toOpenAITools(tools: ToolDefinition[]): OpenAITool[];
export declare function toAnthropicTools(tools: ToolDefinition[]): AnthropicTool[];
//# sourceMappingURL=provider-shapes.d.ts.map