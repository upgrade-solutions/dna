/**
 * Loose structural types describing the DNA shapes this renderer reads.
 * Only fields actually consumed are modeled; callers may pass partial DNA.
 */

export interface DnaInput {
  operational?: OperationalDna
}

export interface OperationalDna {
  domain: OperationalDomain
  operations?: Operation[]
  rules?: Rule[]
  outcomes?: Outcome[]
  triggers?: Trigger[]
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
  steps?: ProcessStep[]
}

export interface ProcessStep {
  id: string
  task: string
  depends_on?: string[]
  conditions?: string[]
  else?: string
}

// ---------------------------------------------------------------------------
// Public render options and outputs.
// ---------------------------------------------------------------------------

/** Which DNA primitive becomes one text document. */
export type Unit = 'operation' | 'resource' | 'process'

/**
 * Body template applied to a unit's rendered text.
 *
 *   - user-story   As a / I want / So that + acceptance criteria. Fits Operation.
 *   - gherkin      Feature / Scenario / Given / When / Then. Fits Operation.
 *   - product-dna  Key:value blocks using Product-DNA vocabulary
 *                  (Actor, Resource, Action, Role, Field, Operation). Fits all units.
 *
 * Resource and Process always render as `product-dna` regardless of the style
 * requested — user-story/gherkin are action-shaped and don't translate.
 */
export type Style = 'user-story' | 'gherkin' | 'product-dna'

/**
 * Map a DNA primitive to the style used when rendering it.
 * The key set also determines which units are emitted — absent units are skipped.
 */
export type StyleMap = Partial<Record<Unit, Style>>

export const DEFAULT_STYLES: StyleMap = { operation: 'user-story' }

export interface RenderOptions {
  /** Document title. Defaults to the operational domain's path or name. */
  title?: string
  /** Unit → style map. Default: `{ operation: 'user-story' }`. */
  styles?: StyleMap
  /**
   * Rename canonical primitive labels (typically the plural collection name) for
   * company-friendly output. The DNA schema vocabulary stays canonical
   * (Resource/Person/Role/Group/Process) — only the rendered text changes.
   *
   * Currently a no-op for this adapter (no primitive-count or top-level
   * collection labels are emitted) — present for API parity with
   * `@dna-codes/output-markdown` and `@dna-codes/output-html`.
   *
   * @example { Persons: 'Individuals', Roles: 'Positions' }
   */
  rename?: Record<string, string>
}

export interface RenderManyOptions {
  /** Unit → style map. Default: `{ operation: 'user-story' }`. */
  styles?: StyleMap
  /**
   * Rename canonical primitive labels (typically the plural collection name) for
   * company-friendly output. The DNA schema vocabulary stays canonical
   * (Resource/Person/Role/Group/Process) — only the rendered text changes.
   *
   * Currently a no-op for this adapter (no primitive-count or top-level
   * collection labels are emitted) — present for API parity with
   * `@dna-codes/output-markdown` and `@dna-codes/output-html`.
   *
   * @example { Persons: 'Individuals', Roles: 'Positions' }
   */
  rename?: Record<string, string>
}

/**
 * A single rendered document — shaped for pushing to an issue tracker,
 * docs platform, or database row. `id` is `{unit}-{slug}` (e.g.
 * `operation-loan-apply`) so multi-unit results can't collide.
 */
export interface TextDocument {
  id: string
  title: string
  body: string
}
