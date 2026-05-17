import type { OperationalDNA } from '../types/merge'
import type { Membership } from '../types/operational'

function list(dna: OperationalDNA): Membership[] {
  return (dna.memberships ?? []) as Membership[]
}

export function getMembershipsForRole(dna: OperationalDNA, roleName: string): Membership[] {
  return list(dna).filter(m => m.role === roleName)
}

export function getMembershipsForPerson(dna: OperationalDNA, personName: string): Membership[] {
  return list(dna).filter(m => m.person === personName)
}
