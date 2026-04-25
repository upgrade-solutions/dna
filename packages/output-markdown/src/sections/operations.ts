import { DnaInput, Rule, RuleAllow } from '../types'
import { hashes } from '../util'

export function renderOperations(dna: DnaInput, h: number): string | null {
  const op = dna.operational
  if (!op?.operations?.length) return null

  const triggersByOp = groupBy(op.triggers ?? [], (t) => t.operation ?? '')
  const rulesByOp = groupBy(op.rules ?? [], (r) => r.operation)
  const outcomesByOp = groupBy(op.outcomes ?? [], (o) => o.operation)
  const signalsByOp = groupBy(op.signals ?? [], (s) => s.operation)

  const lines: string[] = [`${hashes(h)} Operations`]

  for (const operation of op.operations) {
    lines.push('', `${hashes(h + 1)} ${operation.name}`)
    if (operation.description) lines.push('', operation.description)

    const triggers = triggersByOp.get(operation.name) ?? []
    if (triggers.length) {
      lines.push('', '**Triggered by:**')
      for (const t of triggers) {
        const signal = t.signal ? ` — signal \`${t.signal}\`` : ''
        const desc = t.description ? ` (${t.description})` : ''
        lines.push(`- ${t.source}${signal}${desc}`)
      }
    }

    const rules = rulesByOp.get(operation.name) ?? []
    if (rules.length) {
      lines.push('', '**Rules:**')
      for (const r of rules) lines.push(`- ${renderRule(r)}`)
    }

    const outcomes = outcomesByOp.get(operation.name) ?? []
    if (outcomes.length) {
      lines.push('', '**Outcomes:**')
      for (const o of outcomes) {
        if (o.description) lines.push(`- ${o.description}`)
        for (const c of o.changes ?? []) {
          const set = c.set === undefined ? '' : ` → \`${JSON.stringify(c.set)}\``
          lines.push(`- Sets \`${c.attribute}\`${set}`)
        }
        for (const next of o.initiates ?? []) lines.push(`- Initiates \`${next}\``)
        for (const sig of o.emits ?? []) lines.push(`- Emits \`${sig}\``)
      }
    }

    const signals = signalsByOp.get(operation.name) ?? []
    if (signals.length) {
      lines.push('', '**Signals published:**')
      for (const s of signals) {
        lines.push(`- \`${s.name}\`${s.description ? ` — ${s.description}` : ''}`)
        if (s.payload?.length) {
          for (const field of s.payload) {
            const req = field.required ? ' (required)' : ''
            lines.push(`  - \`${field.name}\`: ${field.type}${req}`)
          }
        }
      }
    }
  }

  return lines.join('\n')
}

function renderRule(r: Rule): string {
  if (r.type === 'access') return `*Access:* ${renderAllow(r.allow ?? [])}`
  if (r.type === 'condition') {
    const parts = (r.conditions ?? []).map((c) => {
      const v = c.value === undefined ? '' : ` ${JSON.stringify(c.value)}`
      return `\`${c.attribute}\` ${c.operator}${v}`
    })
    const expr = parts.length ? parts.join(' AND ') : (r.description ?? '—')
    return `*Condition:* ${expr}`
  }
  return r.description ?? r.name ?? '—'
}

function renderAllow(allow: RuleAllow[]): string {
  if (!allow.length) return '—'
  return allow
    .map((a) => {
      const parts: string[] = []
      if (a.role) parts.push(`role \`${a.role}\``)
      if (a.ownership) parts.push(`ownership`)
      if (a.flags?.length) parts.push(`flags \`[${a.flags.join(', ')}]\``)
      return parts.join(' + ') || '—'
    })
    .join(' OR ')
}

function groupBy<T>(arr: T[], key: (x: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>()
  for (const x of arr) {
    const k = key(x)
    if (!out.has(k)) out.set(k, [])
    out.get(k)!.push(x)
  }
  return out
}
