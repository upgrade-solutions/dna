import { DnaInput, Rule, RuleAllow } from '../types'
import { code, escape, groupBy, heading } from '../util'

export function renderCapabilities(dna: DnaInput, h: number): string | null {
  const op = dna.operational
  if (!op?.capabilities?.length) return null

  const causesByCap = groupBy(op.causes ?? [], (c) => c.capability)
  const rulesByCap = groupBy(op.rules ?? [], (r) => r.capability)
  const outcomesByCap = groupBy(op.outcomes ?? [], (o) => o.capability)
  const signalsByCap = groupBy(op.signals ?? [], (s) => s.capability)

  const parts: string[] = [heading(h, 'Capabilities')]

  for (const cap of op.capabilities) {
    const inner: string[] = [heading(h + 1, escape(cap.name))]
    if (cap.description) inner.push(`<p>${escape(cap.description)}</p>`)

    const causes = causesByCap.get(cap.name) ?? []
    if (causes.length) {
      const items = causes
        .map((c) => {
          const signal = c.signal ? ` — signal ${code(c.signal)}` : ''
          const desc = c.description ? ` (${escape(c.description)})` : ''
          return `<li>${escape(c.source)}${signal}${desc}</li>`
        })
        .join('')
      inner.push(`<p><strong>Triggered by:</strong></p><ul>${items}</ul>`)
    }

    const rules = rulesByCap.get(cap.name) ?? []
    if (rules.length) {
      const items = rules.map((r) => `<li>${renderRule(r)}</li>`).join('')
      inner.push(`<p><strong>Rules:</strong></p><ul>${items}</ul>`)
    }

    const outcomes = outcomesByCap.get(cap.name) ?? []
    if (outcomes.length) {
      const lines: string[] = []
      for (const o of outcomes) {
        if (o.description) lines.push(`<li>${escape(o.description)}</li>`)
        for (const c of o.changes ?? []) {
          const set = c.set === undefined ? '' : ` → ${code(JSON.stringify(c.set))}`
          lines.push(`<li>Sets ${code(c.attribute)}${set}</li>`)
        }
        for (const next of o.initiate ?? []) lines.push(`<li>Initiates ${code(next)}</li>`)
        for (const sig of o.emits ?? []) lines.push(`<li>Emits ${code(sig)}</li>`)
      }
      inner.push(`<p><strong>Outcomes:</strong></p><ul>${lines.join('')}</ul>`)
    }

    const signals = signalsByCap.get(cap.name) ?? []
    if (signals.length) {
      const items: string[] = []
      for (const s of signals) {
        const desc = s.description ? ` — ${escape(s.description)}` : ''
        let line = `<li>${code(s.name)}${desc}`
        if (s.payload?.length) {
          const fields = s.payload
            .map((f) => {
              const req = f.required ? ' (required)' : ''
              return `<li>${code(f.name)}: ${escape(f.type)}${req}</li>`
            })
            .join('')
          line += `<ul>${fields}</ul>`
        }
        line += '</li>'
        items.push(line)
      }
      inner.push(`<p><strong>Signals published:</strong></p><ul>${items.join('')}</ul>`)
    }

    parts.push(`<section>${inner.join('')}</section>`)
  }

  return `<section>${parts.join('')}</section>`
}

function renderRule(r: Rule): string {
  if (r.type === 'access') return `<em>Access:</em> ${renderAllow(r.allow ?? [])}`
  if (r.type === 'condition') return `<em>Condition:</em> ${escape(r.condition ?? r.description ?? '—')}`
  return escape(r.description ?? r.name ?? '—')
}

function renderAllow(allow: RuleAllow[]): string {
  if (!allow.length) return '—'
  return allow
    .map((a) => {
      const parts: string[] = []
      if (a.role) parts.push(`role ${code(a.role)}`)
      if (a.ownership) parts.push(`ownership ${code(a.ownership)}`)
      if (a.flags?.length) parts.push(`flags ${code(`[${a.flags.join(', ')}]`)}`)
      return parts.join(' + ') || '—'
    })
    .join(' OR ')
}
