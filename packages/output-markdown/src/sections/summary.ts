import { DnaInput, Resource, OperationalDomain } from '../types'
import { hashes } from '../util'

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
    ['Positions', op.positions?.length ?? 0],
    ['Tasks', op.tasks?.length ?? 0],
    ['Processes', op.processes?.length ?? 0],
  ]
  const counts = rawCounts.filter(([, n]) => n > 0)

  const lines: string[] = [`${hashes(h)} Summary`, '']
  if (op.domain.path) lines.push(`**Domain:** \`${op.domain.path}\``, '')

  if (counts.length) {
    lines.push('**Primitive counts:**', '')
    for (const [label, n] of counts) lines.push(`- ${label}: ${n}`)
  }

  if (topLevel.length) {
    lines.push('', `**Top-level resources:** ${topLevel.map((r) => `\`${r}\``).join(', ')}`)
  }

  return lines.join('\n')
}

function collectResources(domain: OperationalDomain): Resource[] {
  const out = [...(domain.resources ?? [])]
  for (const sub of domain.domains ?? []) out.push(...collectResources(sub))
  return out
}
