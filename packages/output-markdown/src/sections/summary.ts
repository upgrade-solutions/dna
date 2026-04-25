import { DnaInput, Resource, Person, Group, Role, OperationalDomain } from '../types'
import { hashes } from '../util'

export function renderSummary(dna: DnaInput, h: number): string | null {
  const op = dna.operational
  if (!op) return null

  const { resources, persons, roles, groups } = collectNouns(op.domain)
  const topLevel = (op.domain.resources ?? []).map((r) => r.name)

  const rawCounts: [string, number][] = [
    ['Resources', resources.length],
    ['Persons', persons.length],
    ['Groups', groups.length],
    ['Roles', roles.length],
    ['Memberships', op.memberships?.length ?? 0],
    ['Operations', op.operations?.length ?? 0],
    ['Triggers', op.triggers?.length ?? 0],
    ['Rules', op.rules?.length ?? 0],
    ['Outcomes', op.outcomes?.length ?? 0],
    ['Signals', op.signals?.length ?? 0],
    ['Equations', op.equations?.length ?? 0],
    ['Relationships', op.relationships?.length ?? 0],
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

interface NounCollections {
  resources: Resource[]
  persons: Person[]
  groups: Group[]
  roles: Role[]
}

function collectNouns(domain: OperationalDomain): NounCollections {
  const out: NounCollections = { resources: [], persons: [], groups: [], roles: [] }
  const walk = (d: OperationalDomain) => {
    for (const r of d.resources ?? []) out.resources.push(r)
    for (const p of d.persons ?? []) out.persons.push(p)
    for (const g of d.groups ?? []) out.groups.push(g)
    for (const r of d.roles ?? []) out.roles.push(r)
    for (const sub of d.domains ?? []) walk(sub)
  }
  walk(domain)
  return out
}
