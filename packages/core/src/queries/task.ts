import type { OperationalDNA } from '../types/merge'
import type { Task } from '../types/operational'

function list(dna: OperationalDNA): Task[] {
  return (dna.tasks ?? []) as Task[]
}

export function getTasks(dna: OperationalDNA): Task[] {
  return list(dna)
}

export function getTask(dna: OperationalDNA, name: string): Task | null {
  return list(dna).find(t => t.name === name) ?? null
}

export function getTasksForOperation(dna: OperationalDNA, opName: string): Task[] {
  return list(dna).filter(t => t.operation === opName)
}
