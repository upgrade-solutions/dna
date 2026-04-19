/**
 * Loose structural types for DNA fixture data.
 *
 * Intentionally a superset of what any single adapter consumes — covers
 * every field a canonical fixture might populate. Adapters with narrower
 * local types assign these fixtures via structural subtyping.
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
  capabilities?: Capability[]
  rules?: Rule[]
  outcomes?: Outcome[]
  causes?: Cause[]
  signals?: Signal[]
  equations?: Equation[]
  relationships?: Relationship[]
  positions?: Position[]
  persons?: Person[]
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

export interface Capability {
  name: string
  resource: string
  action: string
  description?: string
}

export interface Rule {
  name?: string
  capability: string
  type?: 'access' | 'condition'
  description?: string
  allow?: RuleAllow[]
  condition?: string
}

export interface RuleAllow {
  role?: string
  ownership?: string
  flags?: string[]
}

export interface Outcome {
  capability: string
  description?: string
  changes?: OutcomeChange[]
  initiate?: string[]
  emits?: string[]
}

export interface OutcomeChange {
  attribute: string
  set?: unknown
}

export interface Cause {
  capability: string
  source: string
  description?: string
  signal?: string
}

export interface Signal {
  name: string
  capability: string
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

export interface Position {
  name: string
  description?: string
  roles?: string[]
  reports_to?: string
}

export interface Person {
  name: string
  position: string
}

export interface Task {
  name: string
  position: string
  capability: string
  description?: string
}

export interface Process {
  name: string
  description?: string
  operator?: string
  emits?: string[]
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
