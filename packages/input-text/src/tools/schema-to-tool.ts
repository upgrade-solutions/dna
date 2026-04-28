import { schemas, type JsonSchema } from '@dna-codes/core'

export type PrimitiveKind =
  | 'resource'
  | 'person'
  | 'role'
  | 'group'
  | 'membership'
  | 'operation'
  | 'task'
  | 'process'
  | 'trigger'
  | 'rule'

export const PRIMITIVE_KINDS: PrimitiveKind[] = [
  'resource',
  'person',
  'role',
  'group',
  'membership',
  'operation',
  'task',
  'process',
  'trigger',
  'rule',
]

export interface ToolDefinition {
  name: string
  description: string
  parameters: JsonSchema
}

export interface EnumPools {
  resources?: string[]
  persons?: string[]
  roles?: string[]
  groups?: string[]
  operations?: string[]
  tasks?: string[]
  processes?: string[]
  rules?: string[]
}

const SHARED_DEFS: Record<string, JsonSchema> = {
  'https://dna.codes/schemas/operational/attribute': schemas.operational.attribute,
  'https://dna.codes/schemas/operational/action': schemas.operational.action,
}

export function inlineSchema(schema: JsonSchema): JsonSchema {
  return walk(schema) as JsonSchema
}

function walk(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(walk)
  if (!node || typeof node !== 'object') return node
  const obj = node as Record<string, unknown>
  if (typeof obj.$ref === 'string' && SHARED_DEFS[obj.$ref]) {
    return walk(SHARED_DEFS[obj.$ref])
  }
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k === '$id' || k === '$schema' || k === 'examples') continue
    out[k] = walk(v)
  }
  return out
}

const PRIMITIVE_SCHEMA: Record<PrimitiveKind, JsonSchema> = {
  resource: schemas.operational.resource,
  person: schemas.operational.person,
  role: schemas.operational.role,
  group: schemas.operational.group,
  membership: schemas.operational.membership,
  operation: schemas.operational.operation,
  task: schemas.operational.task,
  process: schemas.operational.process,
  trigger: schemas.operational.trigger,
  rule: schemas.operational.rule,
}

const PRIMITIVE_PURPOSE: Record<PrimitiveKind, string> = {
  resource: 'Add a Resource (structure the org tracks: Loan, Invoice, Document).',
  person: 'Add a Person template (kind of human: Customer, Employee, Patient).',
  role: 'Add a Role template (position: Underwriter, Doctor, LeadCounsel).',
  group: 'Add a Group template (work-unit / container that scopes Roles: BankDepartment, Case).',
  membership: 'Add a Membership: a Person template is eligible to hold a Role template (optionally within a Group).',
  operation: 'Add an Operation: a Target.Action atomic unit of business activity (e.g. Loan.Approve).',
  task: 'Add a Task: an Actor (Role) performing exactly one Operation.',
  process: 'Add a Process: a named DAG of Steps (an SOP / workflow).',
  trigger: 'Add a Trigger: what initiates an Operation or Process (user, schedule, webhook, prior operation).',
  rule: 'Add a Rule: an access constraint or condition gating an Operation.',
}

export function buildPrimitiveTool(kind: PrimitiveKind): ToolDefinition {
  const schema = PRIMITIVE_SCHEMA[kind]
  const inlined = inlineSchema(schema)
  const description = `${PRIMITIVE_PURPOSE[kind]} ${schema.title ?? ''}`.trim()
  return {
    name: `add_${kind}`,
    description,
    parameters: { ...inlined, additionalProperties: false },
  }
}

export const FINALIZE_TOOL: ToolDefinition = {
  name: 'finalize',
  description:
    'Signal that the Operational DNA is complete and run full schema validation. Call this exactly once after every Operational primitive named in the input has been added. Returns { ok: true } on success or { ok: false, errors } if validation fails (you may then issue corrective add_* calls and call finalize again).',
  parameters: {
    type: 'object',
    additionalProperties: false,
    properties: {},
  },
}

export function buildLayeredTools(): ToolDefinition[] {
  return [...PRIMITIVE_KINDS.map(buildPrimitiveTool), FINALIZE_TOOL]
}

const REFERENCE_FIELDS: Record<PrimitiveKind, Partial<Record<string, keyof EnumPools>>> = {
  resource: { parent: 'resources' },
  person: { parent: 'persons', resource: 'resources' },
  role: { parent: 'roles', resource: 'resources' },
  group: { parent: 'groups' },
  membership: { person: 'persons', role: 'roles', group: 'groups' },
  operation: { target: 'resources' },
  task: { actor: 'roles' },
  process: { operator: 'roles' },
  trigger: {},
  rule: {},
}

/**
 * Returns a copy of `tools` with cross-primitive string fields narrowed to enum
 * lists drawn from the in-progress draft. Use this between tool-call rounds when
 * a provider supports per-round tool re-registration; otherwise the runtime
 * `LayeredConstructor.handle()` enforces the same checks via structured errors.
 */
export function injectEnums(
  tools: ToolDefinition[],
  pools: EnumPools,
): ToolDefinition[] {
  return tools.map((tool) => {
    const kind = toolToKind(tool.name)
    if (!kind) return tool
    const refs = REFERENCE_FIELDS[kind]
    if (!refs) return tool
    const params = JSON.parse(JSON.stringify(tool.parameters)) as JsonSchema
    const props = (params.properties ?? {}) as Record<string, JsonSchema>
    for (const [field, poolKey] of Object.entries(refs)) {
      if (!poolKey) continue
      const pool = pools[poolKey] ?? []
      if (pool.length === 0) continue
      if (props[field]) {
        props[field] = { ...props[field], enum: [...pool] }
      }
    }
    params.properties = props
    return { ...tool, parameters: params }
  })
}

function toolToKind(name: string): PrimitiveKind | null {
  if (!name.startsWith('add_')) return null
  const k = name.slice(4) as PrimitiveKind
  return PRIMITIVE_KINDS.includes(k) ? k : null
}
