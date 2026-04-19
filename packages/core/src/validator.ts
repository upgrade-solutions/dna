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

interface OperationalDNA {
  domain: {
    name: string
    domains?: OperationalDNA['domain'][]
    resources?: { name: string; actions?: { name: string }[]; attributes?: { name: string }[] }[]
  }
  capabilities?: { name: string; resource: string; action: string }[]
  signals?: { name: string; capability: string }[]
  outcomes?: { capability: string; emits?: string[] }[]
  causes?: { capability: string; source: string; signal?: string }[]
  rules?: { capability: string; type?: string; allow?: { role?: string }[] }[]
  relationships?: { name: string; from: string; to: string; attribute: string; cardinality: string }[]
  roles?: { name: string; parent?: string }[]
  users?: { name: string; roles: string[] }[]
  tasks?: { name: string; role: string; capability: string }[]
  processes?: { name: string; operator: string; steps: { id: string; task: string; depends_on?: string[] }[]; emits?: string[] }[]
}

interface ProductCoreDNA {
  domain: { name: string; path: string }
  resources?: { name: string; actions?: { name: string }[]; attributes?: { name: string }[] }[]
  capabilities?: { name: string; resource: string; action: string }[]
  signals?: { name: string; capability: string }[]
  outcomes?: { capability: string; emits?: string[] }[]
  causes?: { capability: string; source: string; signal?: string }[]
  relationships?: { name: string; from: string; to: string; attribute: string }[]
  roles?: { name: string; parent?: string }[]
}

interface ProductApiDNA {
  namespace?: { name: string; resources?: string[] }
  resources?: { name: string; resource?: string; actions?: { name: string; action?: string }[] }[]
  operations?: { name: string; resource: string; action: string; capability?: string }[]
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
      const shortId = id.replace('https://dna.local/', '')
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

  private collectResources(domain: OperationalDNA['domain']): { name: string; actions?: { name: string }[]; attributes?: { name: string }[] }[] {
    const resources: { name: string; actions?: { name: string }[]; attributes?: { name: string }[] }[] = [...(domain.resources ?? [])]
    for (const sub of domain.domains ?? []) {
      resources.push(...this.collectResources(sub))
    }
    return resources
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

    // ── Operational: Signal consistency ──────────────────────────────────
    if (op) {
      const capabilityNames = new Set((op.capabilities ?? []).map(c => c.name))
      const signalNames = new Set((op.signals ?? []).map(s => s.name))

      // Signal.capability must reference a valid Capability
      for (const signal of op.signals ?? []) {
        if (!capabilityNames.has(signal.capability)) {
          errors.push({
            layer: 'operational',
            path: `signals/${signal.name}/capability`,
            message: `Signal "${signal.name}" references Capability "${signal.capability}" which does not exist. Available: ${[...capabilityNames].join(', ')}`,
          })
        }
      }

      // Outcome.emits must reference valid Signal names
      for (const outcome of op.outcomes ?? []) {
        for (const signalRef of outcome.emits ?? []) {
          if (!signalNames.has(signalRef)) {
            errors.push({
              layer: 'operational',
              path: `outcomes/${outcome.capability}/emits/${signalRef}`,
              message: `Outcome for "${outcome.capability}" emits Signal "${signalRef}" which does not exist. Available: ${[...signalNames].join(', ')}`,
            })
          }
        }
      }

      // Cause with source "signal" must reference a valid Signal name
      for (const cause of op.causes ?? []) {
        if (cause.source === 'signal' && cause.signal && !signalNames.has(cause.signal)) {
          errors.push({
            layer: 'operational',
            path: `causes/${cause.capability}/signal`,
            message: `Cause for "${cause.capability}" references Signal "${cause.signal}" which does not exist. Available: ${[...signalNames].join(', ')}`,
          })
        }
      }

      // Relationship validation: from/to must reference valid Resources, attribute must exist on "from" Resource
      const resources = this.collectResources(op.domain)
      const resourceNames = new Set(resources.map(r => r.name))
      for (const rel of op.relationships ?? []) {
        if (!resourceNames.has(rel.from)) {
          errors.push({
            layer: 'operational',
            path: `relationships/${rel.name}/from`,
            message: `Relationship "${rel.name}" references Resource "${rel.from}" (from) which does not exist. Available: ${[...resourceNames].join(', ')}`,
          })
        }
        if (!resourceNames.has(rel.to)) {
          errors.push({
            layer: 'operational',
            path: `relationships/${rel.name}/to`,
            message: `Relationship "${rel.name}" references Resource "${rel.to}" (to) which does not exist. Available: ${[...resourceNames].join(', ')}`,
          })
        }
        if (resourceNames.has(rel.from)) {
          const fromResource = resources.find(r => r.name === rel.from) as any
          const attrNames = new Set(((fromResource?.attributes as any[]) ?? []).map((a: any) => a.name))
          if (!attrNames.has(rel.attribute)) {
            errors.push({
              layer: 'operational',
              path: `relationships/${rel.name}/attribute`,
              message: `Relationship "${rel.name}" references Attribute "${rel.attribute}" which does not exist on Resource "${rel.from}". Available: ${[...attrNames].join(', ')}`,
            })
          }
        }
      }

      // ── SOP: intra-operational references ─────────────────────────────
      const roleNames = new Set((op.roles ?? []).map(r => r.name))
      const taskNames = new Set((op.tasks ?? []).map(t => t.name))

      // Role.parent must reference a declared Role
      for (const role of op.roles ?? []) {
        if (role.parent && !roleNames.has(role.parent)) {
          errors.push({
            layer: 'operational',
            path: `roles/${role.name}/parent`,
            message: `Role "${role.name}" parent "${role.parent}" does not reference a declared Role. Available: ${[...roleNames].join(', ')}`,
          })
        }
      }

      // Rule.allow[].role must reference a declared Role (skip validation when
      // no Roles are declared — some fixtures only exercise non-access rules).
      if (roleNames.size > 0) {
        for (const rule of op.rules ?? []) {
          if (rule.type !== 'access') continue
          for (const entry of rule.allow ?? []) {
            if (entry.role && !roleNames.has(entry.role)) {
              errors.push({
                layer: 'operational',
                path: `rules/${rule.capability}/allow/role/${entry.role}`,
                message: `Rule for "${rule.capability}" references Role "${entry.role}" which does not exist. Available: ${[...roleNames].join(', ')}`,
              })
            }
          }
        }
      }

      // User.roles[] must reference declared Roles
      for (const user of op.users ?? []) {
        for (const roleName of user.roles ?? []) {
          if (!roleNames.has(roleName)) {
            errors.push({
              layer: 'operational',
              path: `users/${user.name}/roles/${roleName}`,
              message: `User "${user.name}" references Role "${roleName}" which does not exist. Available: ${[...roleNames].join(', ')}`,
            })
          }
        }
      }

      // Task.role must reference a declared Role
      // Task.capability must reference a declared Capability
      for (const task of op.tasks ?? []) {
        if (!roleNames.has(task.role)) {
          errors.push({
            layer: 'operational',
            path: `tasks/${task.name}/role`,
            message: `Task "${task.name}" references Role "${task.role}" which does not exist. Available: ${[...roleNames].join(', ')}`,
          })
        }
        if (!capabilityNames.has(task.capability)) {
          errors.push({
            layer: 'operational',
            path: `tasks/${task.name}/capability`,
            message: `Task "${task.name}" references Capability "${task.capability}" which does not exist. Available: ${[...capabilityNames].join(', ')}`,
          })
        }
      }

      // Process.operator must reference a declared Role
      // Process.steps[].task must reference a declared Task
      // Process.steps[].depends_on[] must reference sibling step IDs
      // Process.emits[] must reference declared Signals
      for (const proc of op.processes ?? []) {
        if (!roleNames.has(proc.operator)) {
          errors.push({
            layer: 'operational',
            path: `processes/${proc.name}/operator`,
            message: `Process "${proc.name}" operator "${proc.operator}" does not reference a declared Role. Available: ${[...roleNames].join(', ')}`,
          })
        }
        const stepIds = new Set((proc.steps ?? []).map(s => s.id))
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
    // If both are present, every Resource/Capability/Signal in product.core must
    // also exist in operational — product core is a projection, never invents.
    if (op && core) {
      const opResources = this.collectResources(op.domain)
      const opResourceNames = new Set(opResources.map(r => r.name))
      const opCapabilityNames = new Set((op.capabilities ?? []).map(c => c.name))
      const opSignalNames = new Set((op.signals ?? []).map(s => s.name))

      for (const resource of core.resources ?? []) {
        if (!opResourceNames.has(resource.name)) {
          errors.push({
            layer: 'product/core',
            path: `resources/${resource.name}`,
            message: `Product Core Resource "${resource.name}" is not present in Operational DNA. Re-run the materializer.`,
          })
        }
      }
      for (const cap of core.capabilities ?? []) {
        if (!opCapabilityNames.has(cap.name)) {
          errors.push({
            layer: 'product/core',
            path: `capabilities/${cap.name}`,
            message: `Product Core Capability "${cap.name}" is not present in Operational DNA. Re-run the materializer.`,
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

      // ── Operational → Product Core: Role materialization check ────────
      // Every Role surfaced in product core must exist in operational — core
      // is a projection, never invents.
      const opRoleNames = new Set((op.roles ?? []).map(r => r.name))
      for (const role of core.roles ?? []) {
        if (!opRoleNames.has(role.name)) {
          errors.push({
            layer: 'product/core',
            path: `roles/${role.name}`,
            message: `Product Core Role "${role.name}" is not present in Operational DNA. Re-run the materializer.`,
          })
        }
      }
    }

    // ── Product API → Product Core (preferred) or Operational (fallback) ───
    // When product.core is available, API references resolve against it;
    // otherwise fall back to walking operational directly. Technical layers
    // only ever see product.core, so the core path is the canonical one.
    if ((core || op) && api) {
      const resources = core
        ? (core.resources ?? [])
        : this.collectResources((op as OperationalDNA).domain)
      const resourceNames = new Set(resources.map(r => r.name))
      const capabilities = core ? core.capabilities : (op as OperationalDNA).capabilities
      const capabilityNames = new Set((capabilities ?? []).map(c => c.name))
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

      // Operation capability references
      for (const operation of api.operations ?? []) {
        if (operation.capability && !capabilityNames.has(operation.capability)) {
          errors.push({
            layer: 'product/api',
            path: `operations/${operation.name}/capability`,
            message: `Operation "${operation.name}" references Capability "${operation.capability}" which does not exist in ${referenceLayer === 'product/core' ? 'Product Core' : 'Operational'} DNA. Available: ${[...capabilityNames].join(', ')}`,
          })
        }
      }

      // Endpoint operation references
      const operationNames = new Set((api.operations ?? []).map(o => o.name))
      for (const endpoint of api.endpoints ?? []) {
        if (endpoint.operation && !operationNames.has(endpoint.operation)) {
          errors.push({
            layer: 'product/api',
            path: `endpoints/${endpoint.operation}/operation`,
            message: `Endpoint references Operation "${endpoint.operation}" which is not defined in operations. Available: ${[...operationNames].join(', ')}`,
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
