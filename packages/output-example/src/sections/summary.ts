import { DnaInput } from '../types'
import { collectResources, repeat } from '../util'

/**
 * Render a brief, counts-only summary of the DNA. Returns null when there's
 * nothing to summarize so the top-level `render()` can skip empty sections.
 */
export function renderSummary(dna: DnaInput, headingLevel: number): string | null {
  const op = dna.operational
  if (!op) return null

  const resources = collectResources(op.domain)
  const raw: [string, number][] = [
    ['Resources', resources.length],
    ['Capabilities', op.capabilities?.length ?? 0],
    ['Relationships', op.relationships?.length ?? 0],
  ]
  const counts = raw.filter(([, n]) => n > 0)

  if (!counts.length) return null

  const lines: string[] = [`${repeat('#', headingLevel)} Summary`, '']
  if (op.domain.path) lines.push(`Domain: ${op.domain.path}`, '')
  for (const [label, n] of counts) lines.push(`- ${label}: ${n}`)
  return lines.join('\n')
}
