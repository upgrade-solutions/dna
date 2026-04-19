import { DnaInput, Resource, OperationalDomain } from '../types'
import { code, escape, heading } from '../util'

export function renderSummary(dna: DnaInput, h: number): string | null {
  const op = dna.operational
  if (!op) return null

  const allResources = collectResources(op.domain)
  const topLevel = (op.domain.resources ?? []).map((r) => r.name)

  const rawCounts: [string, number][] = [
    ['Resources', allResources.length],
    ['Capabilities', op.capabilities?.length ?? 0],
    ['Rules', op.rules?.length ?? 0],
    ['Outcomes', op.outcomes?.length ?? 0],
    ['Signals', op.signals?.length ?? 0],
    ['Equations', op.equations?.length ?? 0],
    ['Relationships', op.relationships?.length ?? 0],
    ['Roles', op.roles?.length ?? 0],
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
    parts.push(`<p><strong>Top-level resources:</strong> ${tags}</p>`)
  }

  return `<section>${parts.join('')}</section>`
}

function collectResources(domain: OperationalDomain): Resource[] {
  const out = [...(domain.resources ?? [])]
  for (const sub of domain.domains ?? []) out.push(...collectResources(sub))
  return out
}
