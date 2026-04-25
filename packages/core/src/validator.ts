import Ajv, { ValidateFunction, ErrorObject } from 'ajv/dist/2020'
import { allSchemas } from './index'

export interface ValidationResult {
  valid: boolean
  errors: ErrorObject[]
}

export interface CrossLayerError {
  layer: string
  path: string
  message: string
}

export interface CrossLayerResult {
  valid: boolean
  errors: CrossLayerError[]
}

interface ActionShape {
  name: string
  description?: string
  type?: 'read' | 'write' | 'destructive'
  idempotent?: boolean
}

interface NounShape {
  name: string
  parent?: string
  actions?: ActionShape[]
  attributes?: { name: string }[]
}

interface RoleShape extends NounShape {
  scope?: string | string[]
  system?: boolean
  resource?: string
}

interface MembershipShape {
  name: string
  person: string
  role: string
  group?: string
}

interface DomainShape {
  name: string
  domains?: DomainShape[]
  resources?: NounShape[]
  persons?: NounShape[]
  roles?: RoleShape[]
  groups?: NounShape[]
}

interface ProcessShape {
  name: string
  operator: string
  startStep: string
  steps: { id: string; task: string; depends_on?: string[]; conditions?: string[]; else?: string }[]
  emits?: string[]
}

interface OperationalDNA {
  domain: DomainShape
  memberships?: MembershipShape[]
  operations?: { name: string; target: string; action: string }[]
  signals?: { name: string; operation: string }[]
  outcomes?: { operation: string; emits?: string[]; initiates?: string[] }[]
  triggers?: { operation?: string; process?: string; source: string; signal?: string; after?: string }[]
  rules?: { name?: string; operation: string; type?: string; allow?: { role?: string }[] }[]
  relationships?: { name: string; from: string; to: string; attribute: string; cardinality: string }[]
  tasks?: { name: string; actor: string; operation: string }[]
  processes?: ProcessShape[]
}

interface ProductCoreDNA {
  domain: { name: string; path: string }
  resources?: NounShape[]
  operations?: { name: string; resource?: string; target?: string; action: string }[]
  signals?: { name: string; operation: string }[]
  outcomes?: { operation: string; emits?: string[] }[]
  triggers?: { operation?: string; process?: string; source: string; signal?: string }[]
  relationships?: { name: string; from: string; to: string; attribute: string }[]
}

interface ProductApiDNA {
  namespace?: { name: string; resources?: string[] }
  resources?: { name: string; resource?: string; actions?: { name: string; action?: string }[] }[]
  operations?: { name: string; resource?: string; target?: string; action: string }[]
  endpoints?: { operation: string }[]
}

interface ProductUiDNA {
  pages?: { name: string; resource?: string; blocks?: { name: string; operation?: string }[] }[]
  routes?: { page: string }[]
}

interface TechnicalDNA {
  providers?: { name: string }[]
  constructs?: { name: string; provider?: string }[]
  cells?: { name: string; dna: string; constructs?: string[] }[]
}

// ── Primitive characteristics ─────────────────────────────────────────────
// Source of truth for which primitives can fill which slots. See the 5×5
// table in `docs/operational.md`.

type Characteristic = 'targetable' | 'actorable' | 'scopeable' | 'memberable' | 'executable'
type PrimitiveKind = 'resource' | 'person' | 'group' | 'role' | 'process'

const CHARACTERISTICS: Record<PrimitiveKind, ReadonlySet<Characteristic>> = {
  resource: new Set(['targetable']),
  // Person is scopeable so Roles can be exercised per-individual (e.g.
  // AttendingPhysician.scope = Patient); not in the canonical 5×5 table.
  person:   new Set(['targetable', 'actorable', 'scopeable']),
  group:    new Set(['targetable', 'scopeable']),
  role:     new Set(['targetable', 'actorable', 'memberable']),
  process:  new Set(['targetable', 'executable']),
}

const KIND_LABEL: Record<PrimitiveKind, string> = {
  resource: 'Resource',
  person: 'Person',
  group: 'Group',
  role: 'Role',
  process: 'Process',
}

function kindsWith(characteristic: Characteristic): PrimitiveKind[] {
  return (Object.keys(CHARACTERISTICS) as PrimitiveKind[]).filter(k => CHARACTERISTICS[k].has(characteristic))
}

function kindLabelsFor(characteristic: Characteristic, joiner: 'or' | 'nor'): string {
  const labels = kindsWith(characteristic).map(k => KIND_LABEL[k])
  if (labels.length <= 1) return labels.join('')
  if (labels.length === 2) return `${labels[0]} ${joiner} ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, ${joiner} ${labels[labels.length - 1]}`
}

interface PrimitiveEntry {
  kind: PrimitiveKind
  noun: NounShape | RoleShape | ProcessShape
}

interface PrimitiveIndex {
  resources: NounShape[]
  persons: NounShape[]
  roles: RoleShape[]
  groups: NounShape[]
  processes: ProcessShape[]
  byName: Map<string, PrimitiveEntry>
  resourceNames: Set<string>
  personNames: Set<string>
  roleNames: Set<string>
  groupNames: Set<string>
  processNames: Set<string>
  allNounNames: Set<string>
  pool(characteristic: Characteristic): Set<string>
  hasCharacteristic(name: string, characteristic: Characteristic): boolean
}

export class DnaValidator {
  private ajv: Ajv
  private validators = new Map<string, ValidateFunction>()

  constructor() {
    this.ajv = new Ajv({ strict: false, allErrors: true })
    this.registerSchemas()
  }

  private registerSchemas(): void {
    const schemas = allSchemas()

    for (const schema of schemas) {
      this.ajv.addSchema(schema)
    }

    for (const schema of schemas) {
      const id = schema.$id as string
      this.validators.set(id, this.ajv.getSchema(id)!)
      // Also register by short ID (e.g. "operational/resource") for convenience
      const shortId = id.replace('https://dna.codes/schemas/', '')
      this.validators.set(shortId, this.ajv.getSchema(id)!)
    }
  }

  validate(doc: unknown, schemaId: string): ValidationResult {
    const validateFn = this.validators.get(schemaId)
    if (!validateFn) {
      throw new Error(`Unknown schema: "${schemaId}". Available: ${[...this.validators.keys()].join(', ')}`)
    }
    const valid = validateFn(doc) as boolean
    return { valid, errors: validateFn.errors ?? [] }
  }

  availableSchemas(): string[] {
    return [...this.validators.keys()]
  }

  // ── Cross-layer validation ─────────────────────────────────────────────────

  private collectPrimitives(op: OperationalDNA): PrimitiveIndex {
    const resources: NounShape[] = []
    const persons: NounShape[] = []
    const roles: RoleShape[] = []
    const groups: NounShape[] = []
    const walk = (d: DomainShape) => {
      for (const r of d.resources ?? []) resources.push(r)
      for (const p of d.persons ?? []) persons.push(p)
      for (const r of d.roles ?? []) roles.push(r)
      for (const g of d.groups ?? []) groups.push(g)
      for (const sub of d.domains ?? []) walk(sub)
    }
    walk(op.domain)
    const processes: ProcessShape[] = op.processes ?? []
    const byName = new Map<string, PrimitiveEntry>()
    for (const r of resources) byName.set(r.name, { kind: 'resource', noun: r })
    for (const p of persons) byName.set(p.name, { kind: 'person', noun: p })
    for (const r of roles) byName.set(r.name, { kind: 'role', noun: r })
    for (const g of groups) byName.set(g.name, { kind: 'group', noun: g })
    for (const p of processes) byName.set(p.name, { kind: 'process', noun: p })

    const resourceNames = new Set(resources.map(r => r.name))
    const personNames = new Set(persons.map(p => p.name))
    const roleNames = new Set(roles.map(r => r.name))
    const groupNames = new Set(groups.map(g => g.name))
    const processNames = new Set(processes.map(p => p.name))

    const namesByKind: Record<PrimitiveKind, Set<string>> = {
      resource: resourceNames,
      person: personNames,
      role: roleNames,
      group: groupNames,
      process: processNames,
    }

    return {
      resources,
      persons,
      roles,
      groups,
      processes,
      byName,
      resourceNames,
      personNames,
      roleNames,
      groupNames,
      processNames,
      allNounNames: new Set([
        ...resourceNames,
        ...personNames,
        ...roleNames,
        ...groupNames,
      ]),
      pool(characteristic) {
        const out = new Set<string>()
        for (const kind of kindsWith(characteristic)) {
          for (const n of namesByKind[kind]) out.add(n)
        }
        return out
      },
      hasCharacteristic(name, characteristic) {
        const entry = byName.get(name)
        return !!entry && CHARACTERISTICS[entry.kind].has(characteristic)
      },
    }
  }

  validateCrossLayer(layers: {
    operational?: unknown
    productCore?: unknown
    productApi?: unknown
    productUi?: unknown
    technical?: unknown
  }): CrossLayerResult {
    const errors: CrossLayerError[] = []
    const op = layers.operational as OperationalDNA | undefined
    const core = layers.productCore as ProductCoreDNA | undefined
    const api = layers.productApi as ProductApiDNA | undefined
    const ui = layers.productUi as ProductUiDNA | undefined
    const tech = layers.technical as TechnicalDNA | undefined

    // ── Operational ──────────────────────────────────────────────────────
    if (op) {
      const primitives = this.collectPrimitives(op)
      const operationNames = new Set((op.operations ?? []).map(o => o.name))
      const signalNames = new Set((op.signals ?? []).map(s => s.name))
      const taskNames = new Set((op.tasks ?? []).map(t => t.name))
      const ruleNames = new Set((op.rules ?? []).filter(r => !!r.name).map(r => r.name as string))
      const processNames = primitives.processNames
      const membershipNames = new Set((op.memberships ?? []).map(m => m.name))

      const targetablePool = primitives.pool('targetable')
      const actorablePool = primitives.pool('actorable')
      const scopeablePool = primitives.pool('scopeable')
      const targetableKinds = kindLabelsFor('targetable', 'or')
      const actorableKinds = kindLabelsFor('actorable', 'nor')
      const scopeableKinds = kindLabelsFor('scopeable', 'or')

      // Operation.target must reference a targetable primitive.
      // Operation.action must match an action name in the target's actions[] catalog.
      for (const operation of op.operations ?? []) {
        if (!targetablePool.has(operation.target)) {
          errors.push({
            layer: 'operational',
            path: `operations/${operation.name}/target`,
            message: `Operation "${operation.name}" references target "${operation.target}" which does not exist as a ${targetableKinds}. Available: ${[...targetablePool].sort().join(', ')}`,
          })
        } else {
          const entry = primitives.byName.get(operation.target)!
          const actions = (entry.noun as NounShape).actions
          const actionNames = new Set((actions ?? []).map(a => a.name))
          if (actionNames.size > 0 && !actionNames.has(operation.action)) {
            errors.push({
              layer: 'operational',
              path: `operations/${operation.name}/action`,
              message: `Operation "${operation.name}" references action "${operation.action}" which is not declared in ${entry.kind} "${operation.target}".actions[]. Available: ${[...actionNames].join(', ')}`,
            })
          }
        }
      }

      // Signal.operation must reference a valid Operation
      for (const signal of op.signals ?? []) {
        if (!operationNames.has(signal.operation)) {
          errors.push({
            layer: 'operational',
            path: `signals/${signal.name}/operation`,
            message: `Signal "${signal.name}" references Operation "${signal.operation}" which does not exist. Available: ${[...operationNames].join(', ')}`,
          })
        }
      }

      // Outcome.operation/emits/initiates references
      for (const outcome of op.outcomes ?? []) {
        if (!operationNames.has(outcome.operation)) {
          errors.push({
            layer: 'operational',
            path: `outcomes/${outcome.operation}/operation`,
            message: `Outcome references Operation "${outcome.operation}" which does not exist. Available: ${[...operationNames].join(', ')}`,
          })
        }
        for (const signalRef of outcome.emits ?? []) {
          if (!signalNames.has(signalRef)) {
            errors.push({
              layer: 'operational',
              path: `outcomes/${outcome.operation}/emits/${signalRef}`,
              message: `Outcome for "${outcome.operation}" emits Signal "${signalRef}" which does not exist. Available: ${[...signalNames].join(', ')}`,
            })
          }
        }
        for (const opRef of outcome.initiates ?? []) {
          if (!operationNames.has(opRef)) {
            errors.push({
              layer: 'operational',
              path: `outcomes/${outcome.operation}/initiates/${opRef}`,
              message: `Outcome for "${outcome.operation}" initiates Operation "${opRef}" which does not exist. Available: ${[...operationNames].join(', ')}`,
            })
          }
        }
      }

      // Trigger references (operation/process/signal/after)
      for (const trigger of op.triggers ?? []) {
        const target = trigger.operation ? `operation:${trigger.operation}` : trigger.process ? `process:${trigger.process}` : '<missing>'
        if (!trigger.operation && !trigger.process) {
          errors.push({
            layer: 'operational',
            path: `triggers/${target}`,
            message: `Trigger must target either an Operation or a Process; both are missing.`,
          })
        }
        if (trigger.operation && trigger.process) {
          errors.push({
            layer: 'operational',
            path: `triggers/${target}`,
            message: `Trigger may target either an Operation or a Process, not both.`,
          })
        }
        if (trigger.operation && !operationNames.has(trigger.operation)) {
          errors.push({
            layer: 'operational',
            path: `triggers/${target}/operation`,
            message: `Trigger references Operation "${trigger.operation}" which does not exist. Available: ${[...operationNames].join(', ')}`,
          })
        }
        if (trigger.process && !processNames.has(trigger.process)) {
          errors.push({
            layer: 'operational',
            path: `triggers/${target}/process`,
            message: `Trigger references Process "${trigger.process}" which does not exist. Available: ${[...processNames].join(', ')}`,
          })
        }
        if (trigger.source === 'signal' && trigger.signal && !signalNames.has(trigger.signal)) {
          errors.push({
            layer: 'operational',
            path: `triggers/${target}/signal`,
            message: `Trigger references Signal "${trigger.signal}" which does not exist. Available: ${[...signalNames].join(', ')}`,
          })
        }
        if (trigger.source === 'operation' && trigger.after && !operationNames.has(trigger.after)) {
          errors.push({
            layer: 'operational',
            path: `triggers/${target}/after`,
            message: `Trigger references upstream Operation "${trigger.after}" which does not exist. Available: ${[...operationNames].join(', ')}`,
          })
        }
      }

      // Rule.operation must reference a declared Operation
      // Rule.allow[].role must reference an actorable primitive (Role or Person)
      for (const rule of op.rules ?? []) {
        if (!operationNames.has(rule.operation)) {
          errors.push({
            layer: 'operational',
            path: `rules/${rule.name ?? rule.operation}/operation`,
            message: `Rule references Operation "${rule.operation}" which does not exist. Available: ${[...operationNames].join(', ')}`,
          })
        }
        if (rule.type === 'access') {
          if (actorablePool.size > 0) {
            for (const entry of rule.allow ?? []) {
              if (entry.role && !actorablePool.has(entry.role)) {
                errors.push({
                  layer: 'operational',
                  path: `rules/${rule.name ?? rule.operation}/allow/role/${entry.role}`,
                  message: `Rule for "${rule.operation}" references actor "${entry.role}" which is neither a declared ${actorableKinds}. Available: ${[...actorablePool].sort().join(', ')}`,
                })
              }
            }
          }
        }
      }

      // Noun-level integrity: parent must reference a noun of the same kind
      for (const r of primitives.resources) {
        if (r.parent && !primitives.resourceNames.has(r.parent)) {
          errors.push({
            layer: 'operational',
            path: `resources/${r.name}/parent`,
            message: `Resource "${r.name}" parent "${r.parent}" does not reference a declared Resource. Available: ${[...primitives.resourceNames].join(', ')}`,
          })
        }
      }
      for (const p of primitives.persons) {
        if (p.parent && !primitives.personNames.has(p.parent)) {
          errors.push({
            layer: 'operational',
            path: `persons/${p.name}/parent`,
            message: `Person "${p.name}" parent "${p.parent}" does not reference a declared Person. Available: ${[...primitives.personNames].join(', ')}`,
          })
        }
      }
      for (const g of primitives.groups) {
        if (g.parent && !primitives.groupNames.has(g.parent)) {
          errors.push({
            layer: 'operational',
            path: `groups/${g.name}/parent`,
            message: `Group "${g.name}" parent "${g.parent}" does not reference a declared Group. Available: ${[...primitives.groupNames].join(', ')}`,
          })
        }
      }

      // Role-specific integrity:
      // - scope (string | string[]) → must resolve to a scopeable primitive.
      // - parent → another Role.
      // - resource → a Resource (when system Role is backed by a Resource template).
      for (const role of primitives.roles) {
        if (role.parent && !primitives.roleNames.has(role.parent)) {
          errors.push({
            layer: 'operational',
            path: `roles/${role.name}/parent`,
            message: `Role "${role.name}" parent "${role.parent}" does not reference a declared Role. Available: ${[...primitives.roleNames].join(', ')}`,
          })
        }
        const scopes = role.scope === undefined ? [] : Array.isArray(role.scope) ? role.scope : [role.scope]
        for (const s of scopes) {
          if (!scopeablePool.has(s)) {
            errors.push({
              layer: 'operational',
              path: `roles/${role.name}/scope`,
              message: `Role "${role.name}" scope "${s}" does not reference a declared ${scopeableKinds}. Available: ${[...scopeablePool].sort().join(', ')}`,
            })
          }
        }
        if (role.resource && !primitives.resourceNames.has(role.resource)) {
          errors.push({
            layer: 'operational',
            path: `roles/${role.name}/resource`,
            message: `Role "${role.name}" resource "${role.resource}" does not reference a declared Resource. Available: ${[...primitives.resourceNames].join(', ')}`,
          })
        }
      }

      // Membership integrity: person/role/group references; group must match Role.scope when both present
      for (const m of op.memberships ?? []) {
        if (!primitives.personNames.has(m.person)) {
          errors.push({
            layer: 'operational',
            path: `memberships/${m.name}/person`,
            message: `Membership "${m.name}" references Person "${m.person}" which does not exist. Available: ${[...primitives.personNames].join(', ')}`,
          })
        }
        if (!primitives.hasCharacteristic(m.role, 'memberable')) {
          errors.push({
            layer: 'operational',
            path: `memberships/${m.name}/role`,
            message: `Membership "${m.name}" references Role "${m.role}" which does not exist. Available: ${[...primitives.roleNames].join(', ')}`,
          })
        }
        if (m.group && !scopeablePool.has(m.group)) {
          errors.push({
            layer: 'operational',
            path: `memberships/${m.name}/group`,
            message: `Membership "${m.name}" references "${m.group}" which is not a declared ${scopeableKinds} (the valid Role.scope targets). Available: ${[...scopeablePool].sort().join(', ')}`,
          })
        }
        if (m.group && primitives.roleNames.has(m.role)) {
          const role = primitives.roles.find(r => r.name === m.role)!
          const scopes = role.scope === undefined ? [] : Array.isArray(role.scope) ? role.scope : [role.scope]
          if (scopes.length > 0 && !scopes.includes(m.group)) {
            errors.push({
              layer: 'operational',
              path: `memberships/${m.name}/group`,
              message: `Membership "${m.name}" pins Role "${m.role}" in "${m.group}", but Role "${m.role}" declares scope "${scopes.join(' | ')}".`,
            })
          }
        }
        // Multi-scope ambiguity: Role with array scope requires Membership.group
        if (!m.group && primitives.roleNames.has(m.role)) {
          const role = primitives.roles.find(r => r.name === m.role)!
          if (Array.isArray(role.scope) && role.scope.length > 1) {
            errors.push({
              layer: 'operational',
              path: `memberships/${m.name}/group`,
              message: `Membership "${m.name}" references multi-scope Role "${m.role}" (scope: ${role.scope.join(' | ')}) but does not specify a group; Membership.group is required to disambiguate.`,
            })
          }
        }
      }
      void membershipNames

      // Relationship validation: from/to must reference any noun, attribute must exist on "from"
      for (const rel of op.relationships ?? []) {
        if (!primitives.allNounNames.has(rel.from)) {
          errors.push({
            layer: 'operational',
            path: `relationships/${rel.name}/from`,
            message: `Relationship "${rel.name}" references "${rel.from}" (from) which does not exist as any noun primitive. Available: ${[...primitives.allNounNames].sort().join(', ')}`,
          })
        }
        if (!primitives.allNounNames.has(rel.to)) {
          errors.push({
            layer: 'operational',
            path: `relationships/${rel.name}/to`,
            message: `Relationship "${rel.name}" references "${rel.to}" (to) which does not exist as any noun primitive. Available: ${[...primitives.allNounNames].sort().join(', ')}`,
          })
        }
        if (primitives.allNounNames.has(rel.from)) {
          const fromNoun = primitives.byName.get(rel.from)!.noun as NounShape
          const attrNames = new Set((fromNoun.attributes ?? []).map(a => a.name))
          if (!attrNames.has(rel.attribute)) {
            errors.push({
              layer: 'operational',
              path: `relationships/${rel.name}/attribute`,
              message: `Relationship "${rel.name}" references Attribute "${rel.attribute}" which does not exist on "${rel.from}". Available: ${[...attrNames].join(', ')}`,
            })
          }
        }
      }

      // Task.actor must reference an actorable primitive (Role or Person).
      // Task.operation must reference a declared Operation.
      for (const task of op.tasks ?? []) {
        if (actorablePool.size > 0 && !actorablePool.has(task.actor)) {
          errors.push({
            layer: 'operational',
            path: `tasks/${task.name}/actor`,
            message: `Task "${task.name}" references actor "${task.actor}" which is neither a declared ${actorableKinds}. Available: ${[...actorablePool].sort().join(', ')}`,
          })
        }
        if (!operationNames.has(task.operation)) {
          errors.push({
            layer: 'operational',
            path: `tasks/${task.name}/operation`,
            message: `Task "${task.name}" references Operation "${task.operation}" which does not exist. Available: ${[...operationNames].join(', ')}`,
          })
        }
      }

      // Process.operator must reference an actorable primitive.
      // Process.startStep must be a defined Step id.
      // Process.steps[].task must reference a declared Task.
      for (const proc of op.processes ?? []) {
        if (actorablePool.size > 0 && !actorablePool.has(proc.operator)) {
          errors.push({
            layer: 'operational',
            path: `processes/${proc.name}/operator`,
            message: `Process "${proc.name}" operator "${proc.operator}" is neither a declared ${actorableKinds}. Available: ${[...actorablePool].sort().join(', ')}`,
          })
        }
        const stepIds = new Set((proc.steps ?? []).map(s => s.id))
        if (!stepIds.has(proc.startStep)) {
          errors.push({
            layer: 'operational',
            path: `processes/${proc.name}/startStep`,
            message: `Process "${proc.name}" startStep "${proc.startStep}" is not a defined Step. Available: ${[...stepIds].join(', ')}`,
          })
        }
        for (const step of proc.steps ?? []) {
          if (!taskNames.has(step.task)) {
            errors.push({
              layer: 'operational',
              path: `processes/${proc.name}/steps/${step.id}/task`,
              message: `Step "${step.id}" in Process "${proc.name}" references Task "${step.task}" which does not exist. Available: ${[...taskNames].join(', ')}`,
            })
          }
          for (const dep of step.depends_on ?? []) {
            if (!stepIds.has(dep)) {
              errors.push({
                layer: 'operational',
                path: `processes/${proc.name}/steps/${step.id}/depends_on/${dep}`,
                message: `Step "${step.id}" in Process "${proc.name}" depends_on "${dep}" which is not a sibling step ID. Available: ${[...stepIds].join(', ')}`,
              })
            }
          }
          for (const cond of step.conditions ?? []) {
            if (ruleNames.size > 0 && !ruleNames.has(cond)) {
              errors.push({
                layer: 'operational',
                path: `processes/${proc.name}/steps/${step.id}/conditions/${cond}`,
                message: `Step "${step.id}" in Process "${proc.name}" references Rule "${cond}" which does not exist or has no name. Available: ${[...ruleNames].join(', ')}`,
              })
            }
          }
          if (step.else && step.else !== 'abort' && !stepIds.has(step.else)) {
            errors.push({
              layer: 'operational',
              path: `processes/${proc.name}/steps/${step.id}/else`,
              message: `Step "${step.id}" in Process "${proc.name}" else "${step.else}" is neither "abort" nor a sibling step ID. Available: ${[...stepIds].join(', ')}, abort`,
            })
          }
        }
        for (const sig of proc.emits ?? []) {
          if (!signalNames.has(sig)) {
            errors.push({
              layer: 'operational',
              path: `processes/${proc.name}/emits/${sig}`,
              message: `Process "${proc.name}" emits Signal "${sig}" which does not exist. Available: ${[...signalNames].join(', ')}`,
            })
          }
        }
      }
    }

    // ── Operational → Product Core (materializer consistency) ──────────────
    // If both are present, every Resource/Operation/Signal in product.core must
    // also exist in operational — product core is a projection, never invents.
    if (op && core) {
      const opPrimitives = this.collectPrimitives(op)
      const opOperationNames = new Set((op.operations ?? []).map(o => o.name))
      const opSignalNames = new Set((op.signals ?? []).map(s => s.name))

      for (const resource of core.resources ?? []) {
        if (!opPrimitives.resourceNames.has(resource.name)) {
          errors.push({
            layer: 'product/core',
            path: `resources/${resource.name}`,
            message: `Product Core Resource "${resource.name}" is not present in Operational DNA. Re-run the materializer.`,
          })
        }
      }
      for (const op2 of core.operations ?? []) {
        if (!opOperationNames.has(op2.name)) {
          errors.push({
            layer: 'product/core',
            path: `operations/${op2.name}`,
            message: `Product Core Operation "${op2.name}" is not present in Operational DNA. Re-run the materializer.`,
          })
        }
      }
      for (const sig of core.signals ?? []) {
        if (!opSignalNames.has(sig.name)) {
          errors.push({
            layer: 'product/core',
            path: `signals/${sig.name}`,
            message: `Product Core Signal "${sig.name}" is not present in Operational DNA. Re-run the materializer.`,
          })
        }
      }
    }

    // ── Product API → Product Core (preferred) or Operational (fallback) ───
    if ((core || op) && api) {
      const resources = core
        ? (core.resources ?? [])
        : this.collectPrimitives(op as OperationalDNA).resources
      const resourceNames = new Set(resources.map(r => r.name))
      const operations = core ? core.operations : (op as OperationalDNA).operations
      const operationNames = new Set((operations ?? []).map(o => o.name))
      const referenceLayer = core ? 'product/core' : 'operational'

      // Resource → Operational Resource cross-layer reference
      for (const resource of api.resources ?? []) {
        if (resource.resource && !resourceNames.has(resource.resource)) {
          errors.push({
            layer: 'product/api',
            path: `resources/${resource.name}/resource`,
            message: `Resource "${resource.name}" references Resource "${resource.resource}" which does not exist in ${referenceLayer === 'product/core' ? 'Product Core' : 'Operational'} DNA. Available: ${[...resourceNames].join(', ')}`,
          })
        }

        // Action → Operational Action cross-layer reference
        if (resource.resource && resourceNames.has(resource.resource)) {
          const opResource = resources.find(r => r.name === resource.resource)
          const actionNames = new Set((opResource?.actions ?? []).map(a => a.name))
          for (const action of resource.actions ?? []) {
            if (action.action && !actionNames.has(action.action)) {
              errors.push({
                layer: 'product/api',
                path: `resources/${resource.name}/actions/${action.name}/action`,
                message: `Action "${action.name}" on Resource "${resource.name}" references Action "${action.action}" which does not exist on Resource "${resource.resource}". Available: ${[...actionNames].join(', ')}`,
              })
            }
          }
        }
      }

      // Operation cross-layer reference (the API operation's name must match an upstream Operation)
      for (const operation of api.operations ?? []) {
        if (operation.name && !operationNames.has(operation.name)) {
          errors.push({
            layer: 'product/api',
            path: `operations/${operation.name}`,
            message: `Operation "${operation.name}" is not present in ${referenceLayer === 'product/core' ? 'Product Core' : 'Operational'} DNA. Available: ${[...operationNames].join(', ')}`,
          })
        }
      }

      // Endpoint operation references
      const apiOperationNames = new Set((api.operations ?? []).map(o => o.name))
      for (const endpoint of api.endpoints ?? []) {
        if (endpoint.operation && !apiOperationNames.has(endpoint.operation)) {
          errors.push({
            layer: 'product/api',
            path: `endpoints/${endpoint.operation}/operation`,
            message: `Endpoint references Operation "${endpoint.operation}" which is not defined in operations. Available: ${[...apiOperationNames].join(', ')}`,
          })
        }
      }
    }

    // ── Product UI → Product API ───────────────────────────────────────────
    if (api && ui) {
      const resourceNames = new Set((api.resources ?? []).map(r => r.name))
      const operationNames = new Set((api.operations ?? []).map(o => o.name))

      // Page resource references
      for (const page of ui.pages ?? []) {
        if (page.resource && !resourceNames.has(page.resource)) {
          errors.push({
            layer: 'product/ui',
            path: `pages/${page.name}/resource`,
            message: `Page "${page.name}" references Resource "${page.resource}" which does not exist in Product API DNA. Available: ${[...resourceNames].join(', ')}`,
          })
        }

        // Block operation references
        for (const block of page.blocks ?? []) {
          if (block.operation && !operationNames.has(block.operation)) {
            errors.push({
              layer: 'product/ui',
              path: `pages/${page.name}/blocks/${block.name}/operation`,
              message: `Block "${block.name}" on Page "${page.name}" references Operation "${block.operation}" which does not exist in Product API DNA. Available: ${[...operationNames].join(', ')}`,
            })
          }
        }
      }

      // Route page references
      const pageNames = new Set((ui.pages ?? []).map(p => p.name))
      for (const route of ui.routes ?? []) {
        if (route.page && !pageNames.has(route.page)) {
          errors.push({
            layer: 'product/ui',
            path: `routes/${route.page}/page`,
            message: `Route references Page "${route.page}" which is not defined in pages. Available: ${[...pageNames].join(', ')}`,
          })
        }
      }
    }

    // ── Technical → Product/Operational ────────────────────────────────────
    if (tech) {
      const providerNames = new Set((tech.providers ?? []).map(p => p.name))
      const constructNames = new Set((tech.constructs ?? []).map(c => c.name))

      // Construct provider references
      for (const construct of tech.constructs ?? []) {
        if (construct.provider && !providerNames.has(construct.provider)) {
          errors.push({
            layer: 'technical',
            path: `constructs/${construct.name}/provider`,
            message: `Construct "${construct.name}" references Provider "${construct.provider}" which does not exist. Available: ${[...providerNames].join(', ')}`,
          })
        }
      }

      // Cell construct references
      for (const cell of tech.cells ?? []) {
        for (const constructRef of cell.constructs ?? []) {
          if (!constructNames.has(constructRef)) {
            errors.push({
              layer: 'technical',
              path: `cells/${cell.name}/constructs/${constructRef}`,
              message: `Cell "${cell.name}" references Construct "${constructRef}" which does not exist. Available: ${[...constructNames].join(', ')}`,
            })
          }
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }
}
