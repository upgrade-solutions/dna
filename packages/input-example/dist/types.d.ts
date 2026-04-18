/**
 * Public types for the template input adapter.
 *
 * Convention across all `input-*` packages:
 * - `ParseOptions` is the single-argument options object to `parse()`.
 *   Mark truly required fields as non-optional; everything else is optional
 *   with a documented default.
 * - `ParseResult` is always an object keyed by DNA layer name
 *   (`operational`, `productCore`, `productApi`, `productUi`, `technical`).
 *   A package may emit one layer or many, but never returns a bare array
 *   or a single primitive — always a layered object.
 *
 * Keep the DNA types here loose (structural subsets, optional fields).
 * The authoritative shapes live in `@dna-codes/core` / `@dna-codes/schemas`
 * and are enforced by the cross-layer validator, not at the adapter boundary.
 */
/** The shape this example adapter expects as input. Replace with your own. */
export interface EntityListInput {
    entities: EntityInput[];
    actions?: ActionInput[];
}
export interface EntityInput {
    name: string;
    fields?: FieldInput[];
}
export interface FieldInput {
    name: string;
    type: string;
    required?: boolean;
}
export interface ActionInput {
    /** Name of the entity this action applies to. */
    entity: string;
    /** Verb to perform (e.g. "Create", "Approve", "Ship"). */
    verb: string;
}
export interface ParseOptions {
    /** Domain name wrapping the inferred nouns (e.g. "acme.finance.lending"). */
    domain: string;
    /**
     * Optional remap of an input entity name to a DNA Noun name.
     * Defaults to PascalCase of the entity name.
     */
    nounNameFromEntity?: (entity: string) => string;
}
export interface ParseResult {
    operational: ParsedOperational;
}
export interface ParsedOperational {
    domain: {
        name: string;
        path: string;
        nouns: ParsedNoun[];
    };
    capabilities?: ParsedCapability[];
}
export interface ParsedNoun {
    name: string;
    attributes: ParsedAttribute[];
    verbs?: ParsedVerb[];
}
export interface ParsedAttribute {
    name: string;
    type: string;
    required?: boolean;
}
export interface ParsedVerb {
    name: string;
}
export interface ParsedCapability {
    noun: string;
    verb: string;
    name: string;
}
export type Provider = 'openai' | 'openrouter' | 'anthropic';
export interface TextParseOptions {
    /** LLM provider to dispatch to. */
    provider: Provider;
    /** API key for the chosen provider. */
    apiKey: string;
    /** Model ID (defaults per-provider; see providers.ts). */
    model?: string;
    /** Override the provider base URL (e.g. an OpenAI-compatible proxy). */
    baseUrl?: string;
    /** Extra guidance appended to the system prompt. */
    instructions?: string;
    /** Sampling temperature. Default: 0. */
    temperature?: number;
    /** Inject a fetch implementation — mainly for tests. Defaults to global fetch. */
    fetchImpl?: typeof fetch;
}
export interface TextParseResult {
    operational?: ParsedOperational;
    /** Always populated with the raw model response, for debugging. */
    raw: string;
}
//# sourceMappingURL=types.d.ts.map