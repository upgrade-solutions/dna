import { DnaInput, Noun, OperationalDomain } from '../types'
import { code, escape, heading } from '../util'

export function renderSummary(dna: DnaInput, h: number): string | null {
  const op = dna.operational
  if (!op) return null

  const allNouns = collectNouns(op.domain)
  const topLevel = (op.domain.nouns ?? []).map((n) => n.name)

  const rawCounts: [string, number][] = [
    ['Nouns', allNouns.length],
    ['Capabilities', op.capabilities?.length ?? 0],
    ['Rules', op.rules?.length ?? 0],
    ['Outcomes', op.outcomes?.length ?? 0],
    ['Signals', op.signals?.length ?? 0],
    ['Equations', op.equations?.length ?? 0],
    ['Relationships', op.relationships?.length ?? 0],
    ['Positions', op.positions?.length ?? 0],
    ['Tasks', op.tasks?.length ?? 0],
    ['Processes', op.processes?.length ?? 0],
  ]
  const counts = rawCounts.filter(([, n]) => n > 0)

  const parts: string[] = [heading(h, 'Summary')]

  if (op.domain.path) {
    parts.push(`<p><strong>Domain:</strong> ${code(op.domain.path)}</p>`)
  }

  if (counts.length) {
    const items = counts.map(([label, n]) => `<li>${escape(label)}: ${n}</li>`).join('')
    parts.push(`<p><strong>Primitive counts:</strong></p><ul>${items}</ul>`)
  }

  if (topLevel.length) {
    const tags = topLevel.map((n) => code(n)).join(', ')
    parts.push(`<p><strong>Top-level nouns:</strong> ${tags}</p>`)
  }

  return `<section>${parts.join('')}</section>`
}

function collectNouns(domain: OperationalDomain): Noun[] {
  const out = [...(domain.nouns ?? [])]
  for (const sub of domain.domains ?? []) out.push(...collectNouns(sub))
  return out
}
