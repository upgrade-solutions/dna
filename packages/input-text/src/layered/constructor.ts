import { DnaValidator, type ValidationResult } from '@dna-codes/core'
import {
  PRIMITIVE_KINDS,
  buildLayeredTools,
  type EnumPools,
  type PrimitiveKind,
  type ToolDefinition,
} from '../tools/schema-to-tool'

export interface LayeredConstructorOptions {
  /**
   * Domain metadata wrapping the noun primitives. Defaults to `{ name: 'domain' }`.
   * The constructor never asks the LLM for this; it's set up-front so the model
   * can focus on primitives.
   */
  domain?: { name: string; path?: string; description?: string }
  /**
   * Maximum total tool calls before the constructor throws. Default 50.
   */
  maxToolCalls?: number
  /**
   * Maximum number of `finalize` retries (after a failed validation). Default 3.
   */
  maxFinalizeRetries?: number
}

export interface ToolCallRequest {
  name: string
  args: Record<string, unknown>
}

export type ToolCallResult =
  | { ok: true; finalized?: false; primitive?: PrimitiveKind; name?: string; message?: string }
  | { ok: true; finalized: true; document: Record<string, unknown> }
  | {
      ok: false
      error:
        | 'unknown_tool'
        | 'duplicate_call'
        | 'duplicate_name'
        | 'schema_violation'
        | 'unknown_resource'
        | 'unknown_person'
        | 'unknown_role'
        | 'unknown_group'
        | 'unknown_operation'
        | 'unknown_target'
        | 'unknown_actor'
        | 'unknown_operator'
        | 'unknown_task'
        | 'unknown_process'
        | 'unknown_rule'
        | 'invalid_args'
        | 'iteration_cap_reached'
        | 'finalize_failed'
        | 'finalize_retries_exhausted'
      message: string
      details?: unknown
      available?: string[]
    }

interface DomainShape {
  name: string
  path?: string
  description?: string
  resources: unknown[]
  persons: unknown[]
  roles: unknown[]
  groups: unknown[]
}

interface DraftDocument {
  domain: DomainShape
  memberships: unknown[]
  operations: unknown[]
  triggers: unknown[]
  rules: unknown[]
  tasks: unknown[]
  processes: unknown[]
}

const COLLECTION_FOR: Record<PrimitiveKind, keyof DraftDocument | 'domain.resources' | 'domain.persons' | 'domain.roles' | 'domain.groups'> = {
  resource: 'domain.resources',
  person: 'domain.persons',
  role: 'domain.roles',
  group: 'domain.groups',
  membership: 'memberships',
  operation: 'operations',
  task: 'tasks',
  process: 'processes',
  trigger: 'triggers',
  rule: 'rules',
}

const NAME_POOL_FOR: Partial<Record<PrimitiveKind, keyof EnumPools>> = {
  resource: 'resources',
  person: 'persons',
  role: 'roles',
  group: 'groups',
  task: 'tasks',
  process: 'processes',
  rule: 'rules',
  // membership has names too but they're not in the EnumPools shape — handle separately below
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)
}

export class LayeredConstructor {
  private readonly tools_: ToolDefinition[]
  private readonly maxToolCalls: number
  private readonly maxFinalizeRetries: number
  private readonly draft: DraftDocument
  private readonly validator = new DnaValidator()
  private readonly transcript: { name: string; args: Record<string, unknown>; result: ToolCallResult }[] = []
  private callCount = 0
  private finalizeAttempts = 0
  private lastCallSig: string | null = null
  private finalized = false

  constructor(options: LayeredConstructorOptions = {}) {
    const domain = options.domain ?? { name: 'domain' }
    this.draft = {
      domain: {
        name: domain.name,
        ...(domain.path ? { path: domain.path } : {}),
        ...(domain.description ? { description: domain.description } : {}),
        resources: [],
        persons: [],
        roles: [],
        groups: [],
      },
      memberships: [],
      operations: [],
      triggers: [],
      rules: [],
      tasks: [],
      processes: [],
    }
    this.tools_ = buildLayeredTools()
    this.maxToolCalls = options.maxToolCalls ?? 50
    this.maxFinalizeRetries = options.maxFinalizeRetries ?? 3
  }

  /** Tool definitions in a provider-neutral shape. */
  tools(): ToolDefinition[] {
    return this.tools_.map((t) => ({ ...t, parameters: { ...t.parameters } }))
  }

  /** Pools of declared primitive names — useful for narrowing tool schemas mid-flight. */
  pools(): EnumPools {
    return {
      resources: this.draft.domain.resources.map((r) => (r as { name: string }).name),
      persons: this.draft.domain.persons.map((p) => (p as { name: string }).name),
      roles: this.draft.domain.roles.map((r) => (r as { name: string }).name),
      groups: this.draft.domain.groups.map((g) => (g as { name: string }).name),
      operations: this.draft.operations.map((o) => (o as { name?: string }).name ?? ''),
      tasks: this.draft.tasks.map((t) => (t as { name: string }).name),
      processes: this.draft.processes.map((p) => (p as { name: string }).name),
      rules: this.draft.rules
        .map((r) => (r as { name?: string }).name)
        .filter((n): n is string => typeof n === 'string'),
    }
  }

  /** The assembled draft. Returns a deep-cloned snapshot. */
  result(): Record<string, unknown> {
    return cleanDocument(this.draft)
  }

  hasFinalized(): boolean {
    return this.finalized
  }

  toolCallCount(): number {
    return this.callCount
  }

  toolCallTranscript(): { name: string; args: Record<string, unknown>; result: ToolCallResult }[] {
    return [...this.transcript]
  }

  /** Process a tool call from the LLM (or any caller). Synchronous and side-effect-free on errors. */
  handle(call: ToolCallRequest): ToolCallResult {
    if (this.callCount >= this.maxToolCalls) {
      const result: ToolCallResult = {
        ok: false,
        error: 'iteration_cap_reached',
        message: `Iteration cap of ${this.maxToolCalls} tool calls reached.`,
      }
      this.recordCall(call, result, /*increment*/ false)
      throw new Error(result.message)
    }

    const sig = signatureFor(call)
    if (sig !== null && sig === this.lastCallSig) {
      const result: ToolCallResult = {
        ok: false,
        error: 'duplicate_call',
        message: `Duplicate consecutive tool call rejected: ${call.name}.`,
      }
      this.recordCall(call, result, /*increment*/ true)
      this.lastCallSig = sig
      return result
    }

    let result: ToolCallResult
    if (call.name === 'finalize') {
      result = this.handleFinalize()
    } else if (call.name.startsWith('add_')) {
      const kind = call.name.slice(4) as PrimitiveKind
      if (!PRIMITIVE_KINDS.includes(kind)) {
        result = {
          ok: false,
          error: 'unknown_tool',
          message: `Unknown tool: "${call.name}". Expected one of: ${this.tools_.map((t) => t.name).join(', ')}.`,
        }
      } else {
        result = this.handleAdd(kind, call.args)
      }
    } else {
      result = {
        ok: false,
        error: 'unknown_tool',
        message: `Unknown tool: "${call.name}". Expected one of: ${this.tools_.map((t) => t.name).join(', ')}.`,
      }
    }

    this.recordCall(call, result, /*increment*/ true)
    this.lastCallSig = sig
    return result
  }

  private recordCall(call: ToolCallRequest, result: ToolCallResult, increment: boolean): void {
    if (increment) this.callCount += 1
    this.transcript.push({ name: call.name, args: call.args, result })
  }

  private handleAdd(kind: PrimitiveKind, args: Record<string, unknown>): ToolCallResult {
    if (!args || typeof args !== 'object') {
      return { ok: false, error: 'invalid_args', message: `add_${kind}: args must be an object.` }
    }

    const validation = this.validatePrimitive(kind, args)
    if (!validation.valid) {
      return {
        ok: false,
        error: 'schema_violation',
        message: `add_${kind}: schema validation failed.`,
        details: validation.errors,
      }
    }

    const dupName = this.checkNameUniqueness(kind, args)
    if (dupName) return dupName

    const refError = this.checkReferences(kind, args)
    if (refError) return refError

    const target = COLLECTION_FOR[kind]
    if (target.startsWith('domain.')) {
      const field = target.slice('domain.'.length) as 'resources' | 'persons' | 'roles' | 'groups'
      ;(this.draft.domain[field] as unknown[]).push(args)
    } else {
      ;(this.draft[target as keyof DraftDocument] as unknown[]).push(args)
    }

    const name = typeof args.name === 'string' ? args.name : '<unnamed>'
    return {
      ok: true,
      primitive: kind,
      name,
      message: `Added ${kind} "${name}".`,
    }
  }

  private validatePrimitive(kind: PrimitiveKind, args: Record<string, unknown>): ValidationResult {
    const schemaId = `operational/${kind}`
    return this.validator.validate(args, schemaId)
  }

  private checkNameUniqueness(kind: PrimitiveKind, args: Record<string, unknown>): ToolCallResult | null {
    // Triggers are inherently anonymous (multiple per Operation are valid).
    if (kind === 'trigger') return null
    const pools = this.pools()
    if (kind === 'operation') {
      const name = typeof args.name === 'string' ? args.name : undefined
      const target = typeof args.target === 'string' ? args.target : undefined
      const action = typeof args.action === 'string' ? args.action : undefined
      const composed = name ?? (target && action ? `${target}.${action}` : undefined)
      if (composed && (pools.operations ?? []).includes(composed)) {
        return {
          ok: false,
          error: 'duplicate_name',
          message: `Operation "${composed}" has already been added. Each Target.Action pair is unique.`,
        }
      }
      return null
    }
    const name = typeof args.name === 'string' ? args.name : undefined
    if (!name) return null
    if (kind === 'membership') {
      const existing = this.draft.memberships.map((m) => (m as { name?: string }).name).filter(Boolean) as string[]
      if (existing.includes(name)) {
        return {
          ok: false,
          error: 'duplicate_name',
          message: `Membership "${name}" has already been added.`,
        }
      }
      return null
    }
    const poolKey = NAME_POOL_FOR[kind]
    if (!poolKey) return null
    const existing = (pools[poolKey] ?? []) as string[]
    if (existing.includes(name)) {
      return {
        ok: false,
        error: 'duplicate_name',
        message: `${capitalize(kind)} "${name}" has already been added.`,
      }
    }
    return null
  }

  private checkReferences(kind: PrimitiveKind, args: Record<string, unknown>): ToolCallResult | null {
    const pools = this.pools()
    const string = (k: string): string | undefined =>
      typeof args[k] === 'string' ? (args[k] as string) : undefined

    switch (kind) {
      case 'resource': {
        const parent = string('parent')
        if (parent && !(pools.resources ?? []).includes(parent)) {
          return refError('unknown_resource', 'parent', parent, pools.resources ?? [])
        }
        return null
      }
      case 'person': {
        const parent = string('parent')
        if (parent && !(pools.persons ?? []).includes(parent)) {
          return refError('unknown_person', 'parent', parent, pools.persons ?? [])
        }
        const resource = string('resource')
        if (resource && !(pools.resources ?? []).includes(resource)) {
          return refError('unknown_resource', 'resource', resource, pools.resources ?? [])
        }
        return null
      }
      case 'role': {
        const parent = string('parent')
        if (parent && !(pools.roles ?? []).includes(parent)) {
          return refError('unknown_role', 'parent', parent, pools.roles ?? [])
        }
        const resource = string('resource')
        if (resource && !(pools.resources ?? []).includes(resource)) {
          return refError('unknown_resource', 'resource', resource, pools.resources ?? [])
        }
        const scope = args.scope
        const scopes = typeof scope === 'string' ? [scope] : Array.isArray(scope) ? scope.filter((s): s is string => typeof s === 'string') : []
        const scopeable = new Set([...(pools.groups ?? []), ...(pools.persons ?? [])])
        for (const s of scopes) {
          if (!scopeable.has(s)) {
            return refError('unknown_group', 'scope', s, [...scopeable])
          }
        }
        return null
      }
      case 'group': {
        const parent = string('parent')
        if (parent && !(pools.groups ?? []).includes(parent)) {
          return refError('unknown_group', 'parent', parent, pools.groups ?? [])
        }
        return null
      }
      case 'membership': {
        const person = string('person')
        if (person && !(pools.persons ?? []).includes(person)) {
          return refError('unknown_person', 'person', person, pools.persons ?? [])
        }
        const role = string('role')
        if (role && !(pools.roles ?? []).includes(role)) {
          return refError('unknown_role', 'role', role, pools.roles ?? [])
        }
        const group = string('group')
        const groupable = new Set([...(pools.groups ?? []), ...(pools.persons ?? [])])
        if (group && !groupable.has(group)) {
          return refError('unknown_group', 'group', group, [...groupable])
        }
        return null
      }
      case 'operation': {
        const target = string('target')
        const targets = new Set([
          ...(pools.resources ?? []),
          ...(pools.persons ?? []),
          ...(pools.roles ?? []),
          ...(pools.groups ?? []),
          ...(pools.processes ?? []),
        ])
        if (target && !targets.has(target)) {
          return refError('unknown_target', 'target', target, [...targets])
        }
        return null
      }
      case 'task': {
        const actor = string('actor')
        const actors = new Set([...(pools.roles ?? []), ...(pools.persons ?? [])])
        if (actor && !actors.has(actor)) {
          return refError('unknown_actor', 'actor', actor, [...actors])
        }
        const operation = string('operation')
        if (operation && !(pools.operations ?? []).includes(operation)) {
          return refError('unknown_operation', 'operation', operation, pools.operations ?? [])
        }
        return null
      }
      case 'process': {
        const operator = string('operator')
        const operators = new Set([...(pools.roles ?? []), ...(pools.persons ?? [])])
        if (operator && !operators.has(operator)) {
          return refError('unknown_operator', 'operator', operator, [...operators])
        }
        const taskNames = new Set(pools.tasks ?? [])
        const steps = Array.isArray(args.steps) ? args.steps : []
        for (const step of steps) {
          if (!step || typeof step !== 'object') continue
          const stepObj = step as Record<string, unknown>
          const taskRef = stepObj.task
          if (typeof taskRef === 'string' && !taskNames.has(taskRef)) {
            return refError('unknown_task', `steps[].task`, taskRef, [...taskNames])
          }
          const conditions = Array.isArray(stepObj.conditions) ? stepObj.conditions : []
          for (const cond of conditions) {
            if (typeof cond === 'string' && !(pools.rules ?? []).includes(cond)) {
              return refError('unknown_rule', `steps[].conditions`, cond, pools.rules ?? [])
            }
          }
        }
        return null
      }
      case 'trigger': {
        const operation = string('operation')
        if (operation && !(pools.operations ?? []).includes(operation)) {
          return refError('unknown_operation', 'operation', operation, pools.operations ?? [])
        }
        const process = string('process')
        if (process && !(pools.processes ?? []).includes(process)) {
          return refError('unknown_process', 'process', process, pools.processes ?? [])
        }
        const after = string('after')
        if (after && !(pools.operations ?? []).includes(after)) {
          return refError('unknown_operation', 'after', after, pools.operations ?? [])
        }
        return null
      }
      case 'rule': {
        const operation = string('operation')
        if (operation && !(pools.operations ?? []).includes(operation)) {
          return refError('unknown_operation', 'operation', operation, pools.operations ?? [])
        }
        return null
      }
    }
    return null
  }

  private handleFinalize(): ToolCallResult {
    this.finalizeAttempts += 1
    const document = cleanDocument(this.draft)
    const result = this.validator.validate(document, 'operational')
    const cross = this.validator.validateCrossLayer({ operational: document })
    if (result.valid && cross.valid) {
      this.finalized = true
      return { ok: true, finalized: true, document }
    }
    if (this.finalizeAttempts >= this.maxFinalizeRetries) {
      return {
        ok: false,
        error: 'finalize_retries_exhausted',
        message: `Finalize failed ${this.finalizeAttempts} times; giving up.`,
        details: { schemaErrors: result.errors, crossLayerErrors: cross.errors },
      }
    }
    return {
      ok: false,
      error: 'finalize_failed',
      message: `Validation failed (attempt ${this.finalizeAttempts}/${this.maxFinalizeRetries}). Issue corrective add_* calls and call finalize again.`,
      details: { schemaErrors: result.errors, crossLayerErrors: cross.errors },
    }
  }
}

function refError(
  code:
    | 'unknown_resource'
    | 'unknown_person'
    | 'unknown_role'
    | 'unknown_group'
    | 'unknown_operation'
    | 'unknown_target'
    | 'unknown_actor'
    | 'unknown_operator'
    | 'unknown_task'
    | 'unknown_process'
    | 'unknown_rule',
  field: string,
  value: string,
  available: string[],
): ToolCallResult {
  return {
    ok: false,
    error: code,
    message: `Field "${field}" references "${value}" which is not declared. Available: ${available.length ? available.join(', ') : '(none yet)'}.`,
    available,
  }
}

function signatureFor(call: ToolCallRequest): string | null {
  try {
    return `${call.name}|${stableStringify(call.args ?? {})}`
  } catch {
    return null
  }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`
}

function cleanDocument(draft: DraftDocument): Record<string, unknown> {
  const out: Record<string, unknown> = { domain: cleanDomain(draft.domain) }
  const sections: (keyof DraftDocument)[] = [
    'memberships',
    'operations',
    'triggers',
    'rules',
    'tasks',
    'processes',
  ]
  for (const key of sections) {
    const arr = draft[key] as unknown[]
    if (arr.length > 0) out[key] = arr
  }
  return out
}

function cleanDomain(d: DomainShape): Record<string, unknown> {
  const out: Record<string, unknown> = { name: d.name }
  if (d.path) out.path = d.path
  if (d.description) out.description = d.description
  if (d.resources.length) out.resources = d.resources
  if (d.persons.length) out.persons = d.persons
  if (d.roles.length) out.roles = d.roles
  if (d.groups.length) out.groups = d.groups
  return out
}
