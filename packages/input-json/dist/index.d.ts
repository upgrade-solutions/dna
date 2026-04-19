import { ParseResult } from './types';
export interface ParseOptions {
    /** Name for the root Resource. Required — input JSON doesn't name itself. */
    name: string;
    /** Domain name wrapping the inferred Resources. Defaults to options.name lowercased. */
    domain?: string;
    /** Map a property key to the Resource name it references. Default: PascalCase, singularized. */
    resourceNameFromKey?: (key: string) => string;
}
export declare function parse(data: unknown, options: ParseOptions): ParseResult;
export * from './types';
//# sourceMappingURL=index.d.ts.map