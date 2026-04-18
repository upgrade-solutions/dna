import { DnaInput } from '../types'
import { collectNouns, mermaidId } from '../util'

export function renderErd(dna: DnaInput): string | null {
  const op = dna.operational
  if (!op) return null

  const nouns = collectNouns(op.domain)
  if (!nouns.length) return null

  const lines: string[] = ['erDiagram']

  for (const noun of nouns) {
    const id = mermaidId(noun.name)
    if (!noun.attributes?.length) {
      lines.push(`    ${id} {`)
      lines.push(`    }`)
      continue
    }
    lines.push(`    ${id} {`)
    for (const attr of noun.attributes) {
      const type = mermaidId(attr.type ?? 'string')
      lines.push(`        ${type} ${mermaidId(attr.name)}`)
    }
    lines.push(`    }`)
  }

  for (const rel of op.relationships ?? []) {
    const from = mermaidId(rel.from)
    const to = mermaidId(rel.to)
    lines.push(`    ${from} ${cardinality(rel.cardinality)} ${to} : "${rel.name.replace(/"/g, '\\"')}"`)
  }

  return lines.join('\n')
}

function cardinality(c: string): string {
  switch (c) {
    case 'one-to-one':
      return '||--||'
    case 'one-to-many':
      return '||--o{'
    case 'many-to-one':
      return '}o--||'
    case 'many-to-many':
      return '}o--o{'
    default:
      return '||--||'
  }
}
