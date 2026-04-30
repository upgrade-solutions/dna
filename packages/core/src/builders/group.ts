import type { OperationalDNA } from '../types/merge'
import type { Group } from '../types/operational'
import { composeInto, type BuilderOptions, type BuilderResult } from './shared'

/**
 * Add a Group template to the DNA's `domain.groups`. Same-name composes via
 * merge rules.
 */
export function addGroup(
  dna: OperationalDNA,
  group: Group,
  opts?: BuilderOptions,
): BuilderResult {
  return composeInto(dna, group, 'groups', 'operational/group', opts)
}
