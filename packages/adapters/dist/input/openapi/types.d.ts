/** Minimal OpenAPI 3.x input shape — only fields the adapter consumes. */
export interface OpenApiSpec {
    openapi?: string;
    info: {
        title: string;
        description?: string;
        version?: string;
    };
    servers?: {
        url: string;
        description?: string;
    }[];
    paths?: Record<string, Record<string, OpenApiOperation>>;
    components?: {
        schemas?: Record<string, OpenApiSchema>;
    };
}
export interface OpenApiOperation {
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: OpenApiParam[];
    requestBody?: {
        content?: Record<string, {
            schema?: OpenApiSchema;
        }>;
    };
    responses?: Record<string, {
        content?: Record<string, {
            schema?: OpenApiSchema;
        }>;
    }>;
}
export interface OpenApiParam {
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    required?: boolean;
    description?: string;
    schema?: OpenApiSchema;
}
export interface OpenApiSchema {
    type?: string;
    format?: string;
    properties?: Record<string, OpenApiSchema>;
    required?: string[];
    items?: OpenApiSchema;
    enum?: unknown[];
    $ref?: string;
    description?: string;
}
/** DNA output shapes (subset). */
export interface ParsedNamespace {
    name: string;
    path: string;
    description?: string;
}
export interface ParsedParam {
    name: string;
    in: 'path' | 'query' | 'header';
    type: string;
    required?: boolean;
    description?: string;
}
export interface ParsedField {
    name: string;
    type: string;
    required?: boolean;
    description?: string;
}
export interface ParsedEndpoint {
    method: string;
    path: string;
    operation: string;
    description?: string;
    params?: ParsedParam[];
}
export interface ParsedSchema {
    name: string;
    description?: string;
    fields: ParsedField[];
}
export interface ParsedProductApi {
    namespace: ParsedNamespace;
    endpoints: ParsedEndpoint[];
    schemas?: ParsedSchema[];
}
export interface ParseResult {
    productApi: ParsedProductApi;
}
//# sourceMappingURL=types.d.ts.map