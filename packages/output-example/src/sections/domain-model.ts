import { DnaInput } from '../types'
import { collectResources, repeat } from '../util'

/**
 * Render an indented outline of Resources, their Attributes, and Actions.
 * Returns null when the operational layer is missing or has no Resources.
 */
export function renderDomainModel(dna: DnaInput, headingLevel: number): string | null {
  const op = dna.operational
  if (!op) return null

  const resources = collectResources(op.domain)
  if (!resources.length) return null

  const lines: string[] = [`${repeat('#', headingLevel)} Domain model`, '']

  for (const resource of resources) {
    lines.push(`- ${resource.name}`)
    for (const attr of resource.attributes ?? []) {
      const req = attr.required ? ' (required)' : ''
      lines.push(`  - ${attr.name}: ${attr.type}${req}`)
    }
    for (const action of resource.actions ?? []) {
      lines.push(`  - action: ${action.name}`)
    }
  }

  return lines.join('\n')
}
