import { DnaInput } from '../types'
import { collectNouns, repeat } from '../util'

/**
 * Render an indented outline of Nouns, their Attributes, and Verbs.
 * Returns null when the operational layer is missing or has no Nouns.
 */
export function renderDomainModel(dna: DnaInput, headingLevel: number): string | null {
  const op = dna.operational
  if (!op) return null

  const nouns = collectNouns(op.domain)
  if (!nouns.length) return null

  const lines: string[] = [`${repeat('#', headingLevel)} Domain model`, '']

  for (const noun of nouns) {
    lines.push(`- ${noun.name}`)
    for (const attr of noun.attributes ?? []) {
      const req = attr.required ? ' (required)' : ''
      lines.push(`  - ${attr.name}: ${attr.type}${req}`)
    }
    for (const verb of noun.verbs ?? []) {
      lines.push(`  - verb: ${verb.name}`)
    }
  }

  return lines.join('\n')
}
