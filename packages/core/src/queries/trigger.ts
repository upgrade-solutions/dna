import type { OperationalDNA } from '../types/merge'
import type { Trigger } from '../types/operational'

function list(dna: OperationalDNA): Trigger[] {
  return (dna.triggers ?? []) as Trigger[]
}

export function getTriggers(dna: OperationalDNA): Trigger[] {
  return list(dna)
}

export function getTriggersForOperation(dna: OperationalDNA, opName: string): Trigger[] {
  return list(dna).filter(t => t.operation === opName)
}
