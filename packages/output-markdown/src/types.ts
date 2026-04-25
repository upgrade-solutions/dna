/**
 * Loose structural types describing the DNA shapes this renderer reads.
 *
 * These are intentionally a subset of the canonical schemas in @dna-codes/core —
 * only fields the renderer consumes are modeled. That keeps this package
 * zero-dependency and lets callers hand in partially-populated DNA without
 * tripping type errors on unrelated fields.
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
  operations?: Operation[]
  rules?: Rule[]
  outcomes?: Outcome[]
  triggers?: Trigger[]
  signals?: Signal[]
  equations?: Equation[]
  relationships?: Relationship[]
  tasks?: Task[]
  processes?: Process[]
}

export interface OperationalDomain {
  name: string
  path?: string
  description?: string
  resources?: Resource[]
  domains?: OperationalDomain[]
}

export interface Resource {
  name: string
  description?: string
  attributes?: Attribute[]
  actions?: Action[]
  parent?: string
  scope?: string
  memberships?: Membership[]
}

export interface Membership {
  role: string
  in: string
  description?: string
}

export interface Attribute {
  name: string
  type?: string
  required?: boolean
  description?: string
}

export interface Action {
  name: string
  description?: string
}

export interface Operation {
  name: string
  resource: string
  action: string
  description?: string
}

export interface Rule {
  name?: string
  operation: string
  type?: 'access' | 'condition'
  description?: string
  allow?: RuleAllow[]
  conditions?: RuleCondition[]
}

export interface RuleAllow {
  role?: string
  ownership?: boolean
  flags?: string[]
}

export interface RuleCondition {
  attribute: string
  operator: string
  value?: unknown
}

export interface Outcome {
  operation: string
  description?: string
  changes?: OutcomeChange[]
  initiates?: string[]
  emits?: string[]
}

export interface OutcomeChange {
  attribute: string
  set?: unknown
}

export interface Trigger {
  operation?: string
  process?: string
  source: string
  description?: string
  schedule?: string
  event?: string
  after?: string
  signal?: string
}

export interface Signal {
  name: string
  operation: string
  description?: string
  payload?: Field[]
}

export interface Equation {
  name: string
  description?: string
  inputs?: Field[]
  output?: Field
}

export interface Field {
  name: string
  type: string
  required?: boolean
  description?: string
}

export interface Relationship {
  name: string
  from: string
  to: string
  attribute: string
  cardinality: string
  description?: string
}

export interface Task {
  name: string
  actor: string
  operation: string
  description?: string
}

export interface Process {
  name: string
  description?: string
  operator?: string
  startStep?: string
  emits?: string[]
  steps?: ProcessStep[]
}

export interface ProcessStep {
  id: string
  task: string
  description?: string
  depends_on?: string[]
  conditions?: string[]
  else?: string
}

/** Product/technical layers modeled loosely — unused in v1 but reserved. */
export type ProductCoreDna = Record<string, unknown>
export type ProductApiDna = Record<string, unknown>
export type ProductUiDna = Record<string, unknown>
export type TechnicalDna = Record<string, unknown>
