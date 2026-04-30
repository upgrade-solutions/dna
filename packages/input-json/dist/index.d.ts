import { ParseResult } from './types';
export interface ParseOptions {
    /** Name for the root Resource. Required — input JSON doesn't name itself. */
    name: string;
    /** Domain name wrapping the inferred Resources. Defaults to options.name lowercased. */
    domain?: string;
    /** Map a property key to the Resource name it references. Default: PascalCase, singularized. */
    resourceNameFromKey?: (key: string) => string;
}
/**
 * Walk a JSON sample and infer DNA Resources + Relationships from it.
 *
 * The walker no longer maintains its own `Map<name, Resource>` or per-attribute
 * `seen` set — it composes a single OperationalDNA via the `addResource` /
 * `addRelationship` builders from `@dna-codes/dna-core`. Same-named primitives
 * compose by name; same-keyed attributes within a Resource union via the
 * builder's underlying merge rules. The walker's only correctness concern is
 * deciding whether each JSON key becomes a scalar Attribute, a reference
 * Attribute + child Resource recursion, or is dropped (arrays of scalars).
 */
export declare function parse(data: unknown, options: ParseOptions): ParseResult;
export * from './types';
//# sourceMappingURL=index.d.ts.map