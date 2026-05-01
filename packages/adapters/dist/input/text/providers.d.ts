import type { OpenAITool, AnthropicTool } from './tools/provider-shapes';
import { Provider } from './types';
export interface DispatchArgs {
    provider: Provider;
    apiKey: string;
    baseUrl?: string;
    model: string;
    system: string;
    user: string;
    temperature: number;
    fetchImpl: typeof fetch;
}
export interface ToolCallDispatchArgs {
    provider: Provider;
    apiKey: string;
    baseUrl?: string;
    model: string;
    system: string;
    messages: ProviderMessage[];
    tools: OpenAITool[] | AnthropicTool[];
    temperature: number;
    fetchImpl: typeof fetch;
}
export type ProviderMessage = {
    role: 'user';
    content: string;
} | {
    role: 'assistant';
    content: string;
} | {
    role: 'assistant';
    toolCalls: {
        id: string;
        name: string;
        arguments: string;
    }[];
} | {
    role: 'tool';
    toolCallId: string;
    toolName: string;
    content: string;
};
export type DispatchResult = {
    type: 'tool_call';
    id: string;
    name: string;
    args: Record<string, unknown>;
} | {
    type: 'final';
    content: string;
};
export declare function defaultModel(provider: Provider): string;
export declare function dispatch(args: DispatchArgs): Promise<string>;
export declare function dispatchToolCall(args: ToolCallDispatchArgs): Promise<DispatchResult>;
/** Append a tool result to a message history in the provider-neutral format. */
export declare function appendToolResult(messages: ProviderMessage[], toolCallId: string, toolName: string, result: unknown): ProviderMessage[];
//# sourceMappingURL=providers.d.ts.map