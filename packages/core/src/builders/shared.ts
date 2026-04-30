import { merge } from '../merge'
import type { Conflict, OperationalDNA } from '../types/merge'
import { DnaValidator } from '../validator'

let cachedValidator: DnaValidator | null = null

function validator(): DnaValidator {
  if (cachedValidator === null) cachedValidator = new DnaValidator()
  return cachedValidator
}

export interface BuilderOptions {
  /**
   * Validate the primitive against `@dna-codes/dna-schemas` before composing.
   * Default `true`. Hot paths (e.g. `merge()`'s emit loop) opt out via
   * `{ validate: false }` when inputs are already known to validate.
   */
  validate?: boolean
}

export interface BuilderResult {
  dna: OperationalDNA
  conflicts: Conflict[]
}

const NOUN_COLLECTIONS = new Set(['resources', 'persons', 'roles', 'groups'] as const)

type NounCollection = 'resources' | 'persons' | 'roles' | 'groups'
type ActivityCollection =
  | 'memberships'
  | 'operations'
  | 'triggers'
  | 'rules'
  | 'tasks'
  | 'processes'
  | 'relationships'

export type BuilderCollection = NounCollection | ActivityCollection

/**
 * Compose a single primitive into a DNA. Used by every `add*` builder.
 *
 * - Validates the primitive against its JSON Schema by default.
 * - Wraps the primitive in a single-primitive DNA chunk that inherits the
 *   target DNA's `domain.name` (so `merge()` doesn't surface a spurious
 *   conflict on the domain name itself).
 * - Calls `merge([dna, wrapper])`. Identity-by-name + conflict reporting +
 *   cross-reference resolution all flow from `merge()`'s existing logic.
 * - Drops the provenance map — builders don't carry source info; `merge()`
 *   handles provenance for the multi-source case directly.
 */
export function composeInto(
  dna: OperationalDNA,
  primitive: unknown,
  collection: BuilderCollection,
  schemaId: string,
  opts: BuilderOptions = {},
): BuilderResult {
  if (opts.validate !== false) {
    const result = validator().validate(primitive, schemaId)
    if (!result.valid) {
      const message = result.errors
        .map((e) => `${e.instancePath || '/'} ${e.message ?? '(no message)'}`)
        .join('; ')
      throw new Error(`dna-builders: ${schemaId} input failed validation: ${message}`)
    }
  }

  const domainName = dna.domain.name
  const wrapper: OperationalDNA = NOUN_COLLECTIONS.has(collection as NounCollection)
    ? {
        domain: { name: domainName, [collection]: [primitive] },
      }
    : {
        domain: { name: domainName },
        [collection]: [primitive],
      }

  const result = merge([dna, wrapper])
  return { dna: result.dna, conflicts: result.conflicts }
}
