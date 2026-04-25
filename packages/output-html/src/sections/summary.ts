import { DnaInput, Resource, Person, Group, Role, OperationalDomain } from '../types'
import { code, escape, heading, label } from '../util'

interface SummaryOptions {
  rename?: Record<string, string>
}

export function renderSummary(dna: DnaInput, h: number, options: SummaryOptions = {}): string | null {
  const op = dna.operational
  if (!op) return null

  const { resources, persons, groups, roles } = collectNouns(op.domain)
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
    [lbl('Outcomes'), op.outcomes?.length ?? 0],
    [lbl('Relationships'), op.relationships?.length ?? 0],
    [lbl('Tasks'), op.tasks?.length ?? 0],
    [lbl('Processes'), op.processes?.length ?? 0],
  ]
  const counts = rawCounts.filter(([, n]) => n > 0)

  const parts: string[] = [heading(h, 'Summary')]

  if (op.domain.path) {
    parts.push(`<p><strong>Domain:</strong> ${code(op.domain.path)}</p>`)
  }

  if (counts.length) {
    const items = counts.map(([name, n]) => `<li>${escape(name)}: ${n}</li>`).join('')
    parts.push(`<p><strong>Primitive counts:</strong></p><ul>${items}</ul>`)
  }

  if (topLevel.length) {
    const tags = topLevel.map((n) => code(n)).join(', ')
    parts.push(`<p><strong>Top-level ${escape(lbl('Resources').toLowerCase())}:</strong> ${tags}</p>`)
  }

  return `<section>${parts.join('')}</section>`
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
