import type { OperationalDNA } from '../types/merge'
import type { Rule } from '../types/operational'
import { composeInto, type BuilderOptions, type BuilderResult } from './shared'

/**
 * Add a Rule to the DNA's top-level `rules`. Identity is by `name` when
 * present, otherwise by `(operation, type)`.
 */
export function addRule(
  dna: OperationalDNA,
  rule: Rule,
  opts?: BuilderOptions,
): BuilderResult {
  return composeInto(dna, rule, 'rules', 'operational/rule', opts)
}
