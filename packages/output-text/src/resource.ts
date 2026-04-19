/**
 * Render a single Resource. Resources only render in `product-dna` style — the
 * other styles are action-shaped and don't fit an entity.
 */

import { Resource, OperationalDna, Relationship } from './types'
import { pascalToWords } from './util'

export function resourceTitle(r: Resource): string {
  return pascalToWords(r.name)
}

export function renderResource(r: Resource, op: OperationalDna): string {
  const parts: string[] = []

  if (r.description) parts.push(r.description)

  parts.push(`**Resource:** \`${r.name}\``)

  if (r.attributes?.length) {
    const lines = ['**Fields:**']
    for (const a of r.attributes) {
      const type = a.type ? `: ${a.type}` : ''
      const req = a.required ? ' (required)' : ''
      const desc = a.description ? ` — ${a.description}` : ''
      lines.push(`- \`${a.name}\`${type}${req}${desc}`)
    }
    parts.push(lines.join('\n'))
  }

  if (r.actions?.length) {
    const lines = ['**Actions:**']
    for (const a of r.actions) {
      const desc = a.description ? ` — ${a.description}` : ''
      lines.push(`- \`${a.name}\`${desc}`)
    }
    parts.push(lines.join('\n'))
  }

  const related = (op.relationships ?? []).filter((rel) => rel.from === r.name || rel.to === r.name)
  if (related.length) {
    const lines = ['**Relationships:**']
    for (const rel of related) lines.push(`- ${renderRelationship(rel)}`)
    parts.push(lines.join('\n'))
  }

  return parts.join('\n\n')
}

function renderRelationship(r: Relationship): string {
  const desc = r.description ? ` — ${r.description}` : ''
  return `\`${r.from}\` ${r.cardinality} \`${r.to}\` via \`${r.attribute}\`${desc}`
}
