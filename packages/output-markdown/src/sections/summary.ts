import { DnaInput, Resource, Person, Group, Role, OperationalDomain } from '../types'
import { hashes, label } from '../util'

interface SummaryOptions {
  rename?: Record<string, string>
}

export function renderSummary(dna: DnaInput, h: number, options: SummaryOptions = {}): string | null {
  const op = dna.operational
  if (!op) return null

  const { resources, persons, roles, groups } = collectNouns(op.domain)
  const topLevel = (op.domain.resources ?? []).map((r) => r.name)
  const lbl = (canonical: string) => label(canonical, options.rename)

  const rawCounts: [string, number][] = [
    [lbl('Resources'), resources.length],
    [lbl('Persons'), persons.length],
    [lbl('Groups'), groups.length],
    [lbl('Roles'), roles.length],
    [lbl('Memberships'), op.memberships?.length ?? 0],
    [lbl('Operations'), op.operations?.length ?? 0],
    [lbl('Triggers'), op.triggers?.length ?? 0],
    [lbl('Rules'), op.rules?.length ?? 0],
    [lbl('Relationships'), op.relationships?.length ?? 0],
    [lbl('Tasks'), op.tasks?.length ?? 0],
    [lbl('Processes'), op.processes?.length ?? 0],
  ]
  const counts = rawCounts.filter(([, n]) => n > 0)

  const lines: string[] = [`${hashes(h)} Summary`, '']
  if (op.domain.path) lines.push(`**Domain:** \`${op.domain.path}\``, '')

  if (counts.length) {
    lines.push('**Primitive counts:**', '')
    for (const [name, n] of counts) lines.push(`- ${name}: ${n}`)
  }

  if (topLevel.length) {
    lines.push('', `**Top-level ${lbl('Resources').toLowerCase()}:** ${topLevel.map((r) => `\`${r}\``).join(', ')}`)
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
