export type Provider = 'openai' | 'openrouter' | 'anthropic'

export type Layer = 'operational' | 'product' | 'technical'

export interface ParseOptions {
  /** LLM provider to dispatch to. */
  provider: Provider
  /** API key for the chosen provider. */
  apiKey: string
  /** Model ID (defaults per-provider: gpt-4o-mini, anthropic/claude-sonnet-4-5, claude-sonnet-4-5). */
  model?: string
  /** Override the provider base URL (e.g. an OpenAI-compatible proxy). */
  baseUrl?: string
  /** Which DNA layers to request. Default: all three. */
  layers?: Layer[]
  /** Extra guidance appended to the system prompt (e.g. domain hints, naming conventions). */
  instructions?: string
  /** Sampling temperature. Default: 0. */
  temperature?: number
  /** Inject a fetch implementation — mainly for tests. Defaults to global fetch. */
  fetchImpl?: typeof fetch
  /**
   * How to behave when the model returns fewer layers than were requested.
   *   - 'warn' (default) — log a `console.warn` listing the missing layers.
   *   - 'throw'          — throw an Error instead.
   *   - 'silent'         — no signal beyond the populated `missingLayers` field on the result.
   *
   * This only fires when layers are genuinely absent from the response.
   * The model is still allowed to legitimately omit a layer that the text
   * doesn't describe (e.g. no technical details in a prose SOP).
   */
  onMissingLayers?: 'warn' | 'throw' | 'silent'
  /**
   * Construction mode. Default 'one-shot' asks the model for a single JSON document
   * (existing behavior). 'layered' drives the model through tool calls — one primitive
   * at a time — with per-call schema and reference-integrity checks. Layered mode
   * trades more tokens for higher reliability and works on smaller models.
   *
   * Layered mode currently supports the operational layer only.
   */
  mode?: 'one-shot' | 'layered'
  /**
   * Layered-mode only: maximum tool calls before the constructor stops the loop.
   * Default 50.
   */
  maxToolCalls?: number
}

/**
 * Parsed DNA is returned as plain objects matching the shapes in @dna-codes/schemas.
 * Types here are intentionally loose — validate with @dna-codes/core if you need
 * strict conformance; the raw model output is always included for debugging.
 */
export interface ParseResult {
  operational?: Record<string, unknown>
  product?: Record<string, unknown>
  technical?: Record<string, unknown>
  /** Layers that were requested but not returned by the model. Empty when complete. */
  missingLayers: Layer[]
  raw: string
}
