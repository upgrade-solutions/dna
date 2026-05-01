/**
 * Shared contract types consumed by `@dna-codes/dna-input-*` and
 * `@dna-codes/dna-output-*` adapters. They live here so that integrations and
 * other consumers can name them without depending on a specific adapter
 * package.
 */

/**
 * The shape any text-style input adapter resolves with. Each layer slot is
 * an opaque DNA fragment (the input adapter knows the schema; consumers
 * compose with `merge()` from `@dna-codes/dna-core`). `missingLayers` lists
 * the coarse layer families the parse was asked for but did not produce.
 */
export interface ParseResult {
  operational?: Record<string, unknown>
  product?: Record<string, unknown>
  technical?: Record<string, unknown>
  /** Layer families requested but not returned by the parser. Empty when complete. */
  missingLayers: Array<'operational' | 'product' | 'technical'>
  raw: string
}

/**
 * The DNA primitive kinds an output renderer can target as its top-level
 * unit. Renderers MAY render the whole DNA (no unit) or one document per
 * unit (e.g. one Story per `operation`).
 */
export type Unit = 'operation' | 'resource' | 'process'

/**
 * The text-shape vocabulary an output renderer applies per `Unit`.
 *
 *   - `user-story`  As a / I want / So that + acceptance
 *   - `gherkin`     Feature / Scenario / Given / When / Then
 *   - `product-dna` Actor / Resource / Action / Trigger / Pre-/Postconditions
 */
export type Style = 'user-story' | 'gherkin' | 'product-dna'

export type StyleMap = Partial<Record<Unit, Style>>

export const DEFAULT_STYLES: StyleMap = { operation: 'user-story' }
