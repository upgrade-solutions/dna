/**
 * Loose structural types describing the DNA shapes this renderer reads.
 * Subset of @dna-codes/core schemas — only fields the renderer consumes.
 */

export interface DnaInput {
  operational?: OperationalDna
  productCore?: ProductCoreDna
  productApi?: ProductApiDna
  productUi?: ProductUiDna
  technical?: TechnicalDna
}

export interface OperationalDna {
  domain: OperationalDomain
  relationships?: Relationship[]
  tasks?: Task[]
  processes?: Process[]
}

export interface OperationalDomain {
  name: string
  path?: string
  nouns?: Noun[]
  domains?: OperationalDomain[]
}

export interface Noun {
  name: string
  attributes?: Attribute[]
}

export interface Attribute {
  name: string
  type?: string
}

export interface Relationship {
  name: string
  from: string
  to: string
  attribute: string
  cardinality: string
}

export interface Task {
  name: string
  capability?: string
  description?: string
}

export interface Process {
  name: string
  steps?: ProcessStep[]
}

export interface ProcessStep {
  id: string
  task: string
  depends_on?: string[]
  branch?: ProcessBranch
}

export interface ProcessBranch {
  when?: string
  else?: boolean
}

export type ProductCoreDna = Record<string, unknown>
export type ProductApiDna = Record<string, unknown>
export type ProductUiDna = Record<string, unknown>
export type TechnicalDna = Record<string, unknown>
