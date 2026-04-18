import { DnaInput, Noun, OperationalDomain } from '../types'
import { code, escape, groupBy, heading } from '../util'

export function renderDomainModel(dna: DnaInput, h: number): string | null {
  const op = dna.operational
  if (!op) return null

  const nouns = collectNouns(op.domain)
  if (!nouns.length) return null

  const relsByFrom = groupBy(op.relationships ?? [], (r) => r.from)
  const parts: string[] = [heading(h, 'Domain Model')]

  for (const noun of nouns) {
    const inner: string[] = [heading(h + 1, escape(noun.name))]
    if (noun.description) inner.push(`<p>${escape(noun.description)}</p>`)

    if (noun.attributes?.length) {
      const rows = noun.attributes
        .map(
          (a) =>
            `<tr><td>${code(a.name)}</td><td>${escape(a.type ?? '—')}</td><td>${a.required ? 'yes' : 'no'}</td><td>${escape(a.description ?? '')}</td></tr>`,
        )
        .join('')
      inner.push(
        `<table><thead><tr><th>Attribute</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>`,
      )
    }

    if (noun.verbs?.length) {
      const tags = noun.verbs.map((v) => code(v.name)).join(', ')
      inner.push(`<p><strong>Verbs:</strong> ${tags}</p>`)
    }

    const rels = relsByFrom.get(noun.name) ?? []
    if (rels.length) {
      const items = rels
        .map(
          (r) =>
            `<li>${code(r.name)} — ${escape(r.cardinality)} → ${code(r.to)} (via ${code(r.attribute)})</li>`,
        )
        .join('')
      inner.push(`<p><strong>Relationships:</strong></p><ul>${items}</ul>`)
    }

    parts.push(`<section>${inner.join('')}</section>`)
  }

  return `<section>${parts.join('')}</section>`
}

function collectNouns(domain: OperationalDomain): Noun[] {
  const out = [...(domain.nouns ?? [])]
  for (const sub of domain.domains ?? []) out.push(...collectNouns(sub))
  return out
}
