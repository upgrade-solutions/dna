import type { OperationalDNA } from '../types/merge'
import type { Relationship } from '../types/operational'
import { composeInto, type BuilderOptions, type BuilderResult } from './shared'

/**
 * Add a Relationship to the DNA's top-level `relationships`. Identity is by
 * `name`. Used by `input-json`'s walker to emit relationship records
 * without rolling its own dedup.
 */
export function addRelationship(
  dna: OperationalDNA,
  relationship: Relationship,
  opts?: BuilderOptions,
): BuilderResult {
  return composeInto(dna, relationship, 'relationships', 'operational/relationship', opts)
}
