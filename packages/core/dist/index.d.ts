export declare const SCHEMA_ROOT: string;
export type JsonSchema = {
    $id?: string;
    $schema?: string;
    title?: string;
    description?: string;
    type?: string | string[];
    [key: string]: unknown;
};
export type Layer = 'operational' | 'product.core' | 'product.api' | 'product.ui' | 'technical';
export declare const schemas: {
    readonly operational: {
        readonly attribute: JsonSchema;
        readonly capability: JsonSchema;
        readonly cause: JsonSchema;
        readonly domain: JsonSchema;
        readonly equation: JsonSchema;
        readonly noun: JsonSchema;
        readonly outcome: JsonSchema;
        readonly person: JsonSchema;
        readonly position: JsonSchema;
        readonly process: JsonSchema;
        readonly relationship: JsonSchema;
        readonly rule: JsonSchema;
        readonly signal: JsonSchema;
        readonly task: JsonSchema;
        readonly verb: JsonSchema;
    };
    readonly product: {
        readonly core: {
            readonly action: JsonSchema;
            readonly field: JsonSchema;
            readonly operation: JsonSchema;
            readonly resource: JsonSchema;
            readonly role: JsonSchema;
        };
        readonly api: {
            readonly endpoint: JsonSchema;
            readonly namespace: JsonSchema;
            readonly param: JsonSchema;
            readonly schema: JsonSchema;
        };
        readonly web: {
            readonly block: JsonSchema;
            readonly layout: JsonSchema;
            readonly page: JsonSchema;
            readonly route: JsonSchema;
        };
    };
    readonly technical: {
        readonly cell: JsonSchema;
        readonly connection: JsonSchema;
        readonly construct: JsonSchema;
        readonly environment: JsonSchema;
        readonly node: JsonSchema;
        readonly output: JsonSchema;
        readonly provider: JsonSchema;
        readonly script: JsonSchema;
        readonly variable: JsonSchema;
        readonly view: JsonSchema;
        readonly zone: JsonSchema;
    };
};
export declare const documents: {
    readonly operational: JsonSchema;
    readonly productCore: JsonSchema;
    readonly productApi: JsonSchema;
    readonly productUi: JsonSchema;
    readonly technical: JsonSchema;
};
export declare const layerDirs: Record<'operational' | 'product' | 'technical', string>;
export declare function resolveSchemaFile(family: 'operational' | 'product' | 'technical', name: string): string | null;
export declare function allSchemas(): JsonSchema[];
export { DnaValidator } from './validator';
export type { ValidationResult, CrossLayerResult, CrossLayerError } from './validator';
//# sourceMappingURL=index.d.ts.map