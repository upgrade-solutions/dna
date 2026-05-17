import type { OperationalDNA } from '../types/merge'
import type { Role } from '../types/operational'

function list(dna: OperationalDNA): Role[] {
  return (dna.domain.roles ?? []) as Role[]
}

export function getRoles(dna: OperationalDNA): Role[] {
  return list(dna)
}

export function getRole(dna: OperationalDNA, name: string): Role | null {
  return list(dna).find(r => r.name === name) ?? null
}
