/**
 * Loose structural types describing the DNA shapes this renderer reads.
 *
 * Subset of the canonical schemas in @dna-codes/core — only fields the
 * renderer consumes are modeled, keeping the package zero-dependency.
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
  roles?: Role[]
  users?: User[]
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

export interface Role {
  name: string
  description?: string
  parent?: string
}

export interface User {
  name: string
  display_name?: string
  roles: string[]
  email?: string
  active?: boolean
}

export interface Task {
  name: string
  role: string
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
