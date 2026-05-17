import type { OperationalDNA } from '../types/merge'
import type { Membership } from '../types/operational'

function list(dna: OperationalDNA): Membership[] {
  return (dna.memberships ?? []) as Membership[]
}

export function getMemberships(dna: OperationalDNA): Membership[] {
  return list(dna)
}

export function getMembership(dna: OperationalDNA, name: string): Membership | null {
  return list(dna).find(m => m.name === name) ?? null
}
