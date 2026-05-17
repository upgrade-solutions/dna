import type { OperationalDNA } from '../types/merge'
import type { Rule } from '../types/operational'

function list(dna: OperationalDNA): Rule[] {
  return (dna.rules ?? []) as Rule[]
}

export function getRules(dna: OperationalDNA): Rule[] {
  return list(dna)
}

export function getRule(dna: OperationalDNA, name: string): Rule | null {
  return list(dna).find(r => r.name === name) ?? null
}

export function getRulesForOperation(dna: OperationalDNA, opName: string): Rule[] {
  return list(dna).filter(r => r.operation === opName)
}
