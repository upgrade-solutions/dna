/**
 * Loose structural types describing the DNA shapes this renderer reads.
 *
 * Intentionally a subset of the canonical schemas in @dna-codes/schemas
 * (surfaced as types via @dna-codes/core) — only the fields this renderer
 * consumes are modeled. That keeps the package zero-dependency and lets
 * callers hand in partially-populated DNA without tripping type errors
 * on unrelated fields.
 *
 * When forking, copy just the layers/fields you need. Don't import the
 * full canonical types — stay loose.
 */

export interface DnaInput {
  operational?: OperationalDna
  // Add productCore / productApi / productUi / technical as needed.
}

export interface OperationalDna {
  domain: OperationalDomain
  capabilities?: Capability[]
  relationships?: Relationship[]
}

export interface OperationalDomain {
  name: string
  path?: string
  description?: string
  nouns?: Noun[]
  domains?: OperationalDomain[]
}

export interface Noun {
  name: string
  attributes?: Attribute[]
  verbs?: Verb[]
}

export interface Attribute {
  name: string
  type: string
  required?: boolean
}

export interface Verb {
  name: string
  description?: string
}

export interface Capability {
  noun: string
  verb: string
  name: string
  description?: string
}

export interface Relationship {
  name: string
  from: string
  to: string
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
}
