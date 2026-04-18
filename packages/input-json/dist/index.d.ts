import { ParseResult } from './types';
export interface ParseOptions {
    /** Name for the root noun. Required — input JSON doesn't name itself. */
    name: string;
    /** Domain name wrapping the inferred nouns. Defaults to options.name lowercased. */
    domain?: string;
    /** Map a property key to the noun name it references. Default: PascalCase, singularized. */
    nounNameFromKey?: (key: string) => string;
}
export declare function parse(data: unknown, options: ParseOptions): ParseResult;
export * from './types';
//# sourceMappingURL=index.d.ts.map