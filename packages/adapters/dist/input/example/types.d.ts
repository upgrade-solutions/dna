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
 * The authoritative shapes live in `@dna-codes/dna-core` / `@dna-codes/dna-schemas`
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
    /** Name of the entity (Resource) this action applies to. */
    entity: string;
    /** Action to perform (e.g. "Create", "Approve", "Ship"). */
    action: string;
}
export interface ParseOptions {
    /** Domain name wrapping the inferred Resources (e.g. "acme.finance.lending"). */
    domain: string;
    /**
     * Optional remap of an input entity name to a DNA Resource name.
     * Defaults to PascalCase of the entity name.
     */
    resourceNameFromEntity?: (entity: string) => string;
}
export interface ParseResult {
    operational: ParsedOperational;
}
export interface ParsedOperational {
    domain: {
        name: string;
        path: string;
        resources: ParsedResource[];
    };
    capabilities?: ParsedCapability[];
}
export interface ParsedResource {
    name: string;
    attributes: ParsedAttribute[];
    actions?: ParsedAction[];
}
export interface ParsedAttribute {
    name: string;
    type: string;
    required?: boolean;
}
export interface ParsedAction {
    name: string;
}
export interface ParsedCapability {
    resource: string;
    action: string;
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