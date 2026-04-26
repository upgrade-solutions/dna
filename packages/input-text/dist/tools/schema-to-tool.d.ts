import { type JsonSchema } from '@dna-codes/core';
export type PrimitiveKind = 'resource' | 'person' | 'role' | 'group' | 'membership' | 'operation' | 'task' | 'process' | 'trigger' | 'rule';
export declare const PRIMITIVE_KINDS: PrimitiveKind[];
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: JsonSchema;
}
export interface EnumPools {
    resources?: string[];
    persons?: string[];
    roles?: string[];
    groups?: string[];
    operations?: string[];
    tasks?: string[];
    processes?: string[];
    rules?: string[];
}
export declare function inlineSchema(schema: JsonSchema): JsonSchema;
export declare function buildPrimitiveTool(kind: PrimitiveKind): ToolDefinition;
export declare const FINALIZE_TOOL: ToolDefinition;
export declare function buildLayeredTools(): ToolDefinition[];
/**
 * Returns a copy of `tools` with cross-primitive string fields narrowed to enum
 * lists drawn from the in-progress draft. Use this between tool-call rounds when
 * a provider supports per-round tool re-registration; otherwise the runtime
 * `LayeredConstructor.handle()` enforces the same checks via structured errors.
 */
export declare function injectEnums(tools: ToolDefinition[], pools: EnumPools): ToolDefinition[];
//# sourceMappingURL=schema-to-tool.d.ts.map