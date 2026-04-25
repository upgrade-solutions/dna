import { DnaInput } from '../types'
import { escape, heading } from '../util'

export function renderProcessFlow(dna: DnaInput, h: number): string | null {
  const op = dna.operational
  if (!op?.processes?.length) return null

  const parts: string[] = [heading(h, 'Process Flows')]

  for (const proc of op.processes) {
    const inner: string[] = [heading(h + 1, escape(proc.name))]
    const lines: string[] = []

    const steps = proc.steps ?? []
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const taskName = step.task
      const conds = step.conditions?.length ? ` [when: ${step.conditions.join(' AND ')}]` : ''
      const elseClause = step.else ? ` [else: ${step.else}]` : ''
      const deps = step.depends_on?.length ? ` ← ${step.depends_on.join(', ')}` : ''
      const prefix = i === steps.length - 1 ? '└── ' : '├── '
      lines.push(escape(`${prefix}${step.id}: ${taskName}${conds}${elseClause}${deps}`))
    }

    inner.push(`<pre><code>${lines.join('\n')}</code></pre>`)
    parts.push(`<section>${inner.join('')}</section>`)
  }

  return `<section>${parts.join('')}</section>`
}
