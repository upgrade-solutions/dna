import type { OperationalDNA } from '../types/merge'
import type { Operation } from '../types/operational'

function list(dna: OperationalDNA): Operation[] {
  return (dna.operations ?? []) as Operation[]
}

export function getOperations(dna: OperationalDNA): Operation[] {
  return list(dna)
}

export function getOperation(dna: OperationalDNA, name: string): Operation | null {
  return list(dna).find(o => o.name === name) ?? null
}

export function getOperationsForResource(dna: OperationalDNA, resourceName: string): Operation[] {
  return list(dna).filter(o => o.target === resourceName)
}
