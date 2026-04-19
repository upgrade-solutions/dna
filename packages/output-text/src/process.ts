/**
 * Render a single Process. Processes render in `product-dna` vocabulary
 * (Operation / Role / Steps) — the action-shaped styles don't fit a DAG.
 */

import { OperationalDna, Process, Task } from './types'

export function processTitle(p: Process): string {
  return p.name
}

export function renderProcess(p: Process, op: OperationalDna): string {
  const parts: string[] = []

  if (p.description) parts.push(p.description)

  parts.push(`**Operation:** \`${p.name}\``)
  if (p.operator) parts.push(`**Role:** \`${p.operator}\``)

  const tasksByName = new Map<string, Task>()
  for (const t of op.tasks ?? []) tasksByName.set(t.name, t)

  if (p.steps?.length) {
    const lines = ['**Steps:**']
    for (const step of p.steps) {
      const task = tasksByName.get(step.task)
      const title = task
        ? `${task.name} — \`${task.role}\` performs \`${task.capability}\``
        : step.task
      const deps = step.depends_on?.length ? ` (after: ${step.depends_on.join(', ')})` : ''
      lines.push(`- \`${step.id}\` ${title}${deps}`)
    }
    parts.push(lines.join('\n'))
  }

  return parts.join('\n\n')
}
