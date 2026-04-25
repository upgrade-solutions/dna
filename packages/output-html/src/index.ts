import { DnaInput } from './types'
import { renderSummary } from './sections/summary'
import { renderDomainModel } from './sections/domain-model'
import { renderOperations } from './sections/operations'
import { renderSops } from './sections/sops'
import { renderProcessFlow } from './sections/process-flow'
import { escape, heading } from './util'

export type Section =
  | 'summary'
  | 'domain-model'
  | 'operations'
  | 'sops'
  | 'process-flow'

export const DEFAULT_SECTIONS: readonly Section[] = [
  'summary',
  'domain-model',
  'operations',
  'sops',
  'process-flow',
]

export interface RenderOptions {
  /** Which sections to include, in the given order. Defaults to DEFAULT_SECTIONS. */
  sections?: readonly Section[]
  /** Document title. Defaults to the operational domain's `path` or `name`. */
  title?: string
  /** Starting heading level for the document title (1 or 2). Section headings nest below. */
  headingLevel?: 1 | 2
  /** Wrap output in <!DOCTYPE html><html>…</html>. Defaults to false (fragment). */
  standalone?: boolean
  /**
   * Rename canonical primitive labels (typically the plural collection name) for
   * company-friendly output. The DNA schema vocabulary stays canonical
   * (Resource/Person/Role/Group/Process) — only the rendered text changes.
   *
   * @example { Persons: 'Individuals', Roles: 'Positions' }
   */
  rename?: Record<string, string>
}

export function render(dna: DnaInput, options: RenderOptions = {}): string {
  const sections = options.sections ?? DEFAULT_SECTIONS
  const level = options.headingLevel ?? 1
  const title = options.title ?? inferTitle(dna)

  const parts: string[] = []
  if (title) parts.push(heading(level, escape(title)))

  const intro = dna.operational?.domain.description
  if (intro) parts.push(`<p>${escape(intro)}</p>`)

  for (const section of sections) {
    const rendered = renderSection(section, dna, level + 1, options)
    if (rendered) parts.push(rendered)
  }

  const body = parts.join('')
  if (!body) return ''

  if (options.standalone) {
    const pageTitle = title ?? 'DNA'
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escape(pageTitle)}</title></head><body>${body}</body></html>`
  }
  return body
}

function renderSection(
  section: Section,
  dna: DnaInput,
  h: number,
  options: RenderOptions,
): string | null {
  switch (section) {
    case 'summary':
      return renderSummary(dna, h, options)
    case 'domain-model':
      return renderDomainModel(dna, h)
    case 'operations':
      return renderOperations(dna, h)
    case 'sops':
      return renderSops(dna, h)
    case 'process-flow':
      return renderProcessFlow(dna, h)
  }
}

function inferTitle(dna: DnaInput): string | undefined {
  const op = dna.operational
  if (!op) return undefined
  return op.domain.path ?? op.domain.name
}

export * from './types'
