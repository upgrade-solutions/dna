import { OpenApiSpec, ParseResult } from './types';
export interface ParseOptions {
    /** Override the derived namespace name (default: PascalCase of info.title). */
    namespaceName?: string;
    /** Override the derived namespace path (default: path of servers[0].url, or '/'). */
    namespacePath?: string;
}
export declare function parse(spec: OpenApiSpec, options?: ParseOptions): ParseResult;
export * from './types';
//# sourceMappingURL=index.d.ts.map