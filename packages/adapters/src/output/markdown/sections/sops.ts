import { DnaInput, Task } from '../types'
import { hashes } from '../util'

export function renderSops(dna: DnaInput, h: number): string | null {
  const op = dna.operational
  if (!op?.processes?.length) return null

  const tasksByName = new Map<string, Task>((op.tasks ?? []).map((t) => [t.name, t]))

  const lines: string[] = [`${hashes(h)} SOPs`]

  for (const proc of op.processes) {
    lines.push('', `${hashes(h + 1)} ${proc.name}`)
    if (proc.description) lines.push('', proc.description)
    if (proc.operator) lines.push('', `**Operator:** \`${proc.operator}\``)

    const steps = proc.steps ?? []
    if (steps.length) {
      lines.push('')
      steps.forEach((step, i) => {
        const task = tasksByName.get(step.task)
        const actor = task?.actor ?? '—'
        const op = task?.operation ?? step.task
        const conds = step.conditions?.length
          ? ` (when: ${step.conditions.map((c) => `\`${c}\``).join(' AND ')})`
          : ''
        const elseClause = step.else ? ` (else: ${step.else})` : ''
        const deps = step.depends_on?.length
          ? ` — after: ${step.depends_on.map((d) => `\`${d}\``).join(', ')}`
          : ''
        lines.push(
          `${i + 1}. **${step.id}** — \`${actor}\` does \`${op}\`${conds}${elseClause}${deps}`,
        )
        if (task?.description) lines.push(`   ${task.description}`)
      })
    }
  }

  return lines.join('\n')
}
