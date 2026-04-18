/**
 * @dna-codes/output-example — template output renderer.
 *
 * Public contract (shared across output-*):
 *
 *   render(dna: DnaInput, options?: RenderOptions): string
 *
 * - Sync, pure, zero I/O.
 * - Never throws on malformed / partial DNA — returns `''` when there's
 *   nothing to render.
 * - Never returns null. If a section produces nothing, it's dropped.
 * - Zero runtime dependencies. `@dna-codes/core` is a dev dep (for types)
 *   at most; don't import it at runtime.
 *
 * The demo renders DNA as plain-text markdown-lite. Fork the sections
 * and rewrite for your target format (HTML, Mermaid, PDF bytes, etc.).
 */

import { renderDomainModel } from './sections/domain-model'
import { renderSummary } from './sections/summary'
import { DnaInput } from './types'
import { repeat } from './util'

export type Section = 'summary' | 'domain-model'

export const DEFAULT_SECTIONS: readonly Section[] = ['summary', 'domain-model']

export interface RenderOptions {
  /** Which sections to emit, in the given order. */
  sections?: readonly Section[]
  /** Document title. Defaults to the operational domain's `path` or `name`. */
  title?: string
  /** Starting heading level. Defaults to 1. */
  headingLevel?: 1 | 2
}

export function render(dna: DnaInput, options: RenderOptions = {}): string {
  const sections = options.sections ?? DEFAULT_SECTIONS
  const level = options.headingLevel ?? 1
  const title = options.title ?? inferTitle(dna)

  const parts: string[] = []
  if (title) parts.push(`${repeat('#', level)} ${title}`)

  const intro = dna.operational?.domain.description
  if (intro) parts.push(intro)

  for (const section of sections) {
    const rendered = renderSection(section, dna, level + 1)
    if (rendered) parts.push(rendered)
  }

  return parts.length ? parts.join('\n\n') + '\n' : ''
}

function renderSection(section: Section, dna: DnaInput, h: number): string | null {
  switch (section) {
    case 'summary':
      return renderSummary(dna, h)
    case 'domain-model':
      return renderDomainModel(dna, h)
  }
}

function inferTitle(dna: DnaInput): string | undefined {
  const d = dna.operational?.domain
  return d?.path ?? d?.name
}

export * from './types'
