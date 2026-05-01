import { DnaInput, Task } from '../types'
import { code, escape, heading } from '../util'

export function renderSops(dna: DnaInput, h: number): string | null {
  const op = dna.operational
  if (!op?.processes?.length) return null

  const tasksByName = new Map<string, Task>()
  for (const t of op.tasks ?? []) tasksByName.set(t.name, t)

  const parts: string[] = [heading(h, 'SOPs')]

  for (const proc of op.processes) {
    const inner: string[] = [heading(h + 1, escape(proc.name))]
    if (proc.description) inner.push(`<p>${escape(proc.description)}</p>`)
    if (proc.operator) {
      inner.push(`<p><strong>Operator:</strong> ${code(proc.operator)}</p>`)
    }

    if (proc.steps?.length) {
      const items = proc.steps
        .map((step) => {
          const task = tasksByName.get(step.task)
          const actor = task?.actor ? code(task.actor) : '—'
          const operation = task?.operation ? code(task.operation) : code(step.task)
          const conds = step.conditions?.length
            ? ` (when: ${step.conditions.map(code).join(' AND ')})`
            : ''
          const elseClause = step.else ? ` (else: ${escape(step.else)})` : ''
          const deps = step.depends_on?.length ? ` — after: ${step.depends_on.map(code).join(', ')}` : ''
          const desc = task?.description ? `<br/>${escape(task.description)}` : ''
          return `<li><strong>${escape(step.id)}</strong> — ${actor} does ${operation}${conds}${elseClause}${deps}${desc}</li>`
        })
        .join('')
      inner.push(`<ol>${items}</ol>`)
    }

    parts.push(`<section>${inner.join('')}</section>`)
  }

  return `<section>${parts.join('')}</section>`
}
