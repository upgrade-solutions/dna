import { DnaInput, Task } from '../types'
import { labelEscape, mermaidId } from '../util'

export type FlowchartDirection = 'TD' | 'LR' | 'BT' | 'RL'

export function renderFlowchart(dna: DnaInput, direction: FlowchartDirection = 'TD'): string | null {
  const op = dna.operational
  if (!op?.processes?.length) return null

  const tasksByName = new Map<string, Task>()
  for (const t of op.tasks ?? []) tasksByName.set(t.name, t)

  const blocks: string[] = []

  for (const proc of op.processes) {
    if (!proc.steps?.length) continue
    const lines: string[] = [`flowchart ${direction}`]
    const subgraph = mermaidId(proc.name)
    lines.push(`    subgraph ${subgraph}["${labelEscape(proc.name)}"]`)

    for (const step of proc.steps) {
      const id = mermaidId(step.id)
      const task = tasksByName.get(step.task)
      const label = labelEscape(task?.capability ?? step.task)
      lines.push(`        ${id}["${label}"]`)
    }

    for (const step of proc.steps) {
      const to = mermaidId(step.id)
      for (const depId of step.depends_on ?? []) {
        const from = mermaidId(depId)
        const branch = step.branch?.when
          ? `-- "${labelEscape(step.branch.when)}" -->`
          : step.branch?.else
            ? '-- "else" -->'
            : '-->'
        lines.push(`        ${from} ${branch} ${to}`)
      }
    }

    lines.push('    end')
    blocks.push(lines.join('\n'))
  }

  return blocks.length ? blocks.join('\n\n') : null
}
