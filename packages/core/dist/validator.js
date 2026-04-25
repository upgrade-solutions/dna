"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnaValidator = void 0;
const _2020_1 = __importDefault(require("ajv/dist/2020"));
const index_1 = require("./index");
class DnaValidator {
    constructor() {
        this.validators = new Map();
        this.ajv = new _2020_1.default({ strict: false, allErrors: true });
        this.registerSchemas();
    }
    registerSchemas() {
        const schemas = (0, index_1.allSchemas)();
        for (const schema of schemas) {
            this.ajv.addSchema(schema);
        }
        for (const schema of schemas) {
            const id = schema.$id;
            this.validators.set(id, this.ajv.getSchema(id));
            // Also register by short ID (e.g. "operational/resource") for convenience
            const shortId = id.replace('https://dna.codes/schemas/', '');
            this.validators.set(shortId, this.ajv.getSchema(id));
        }
    }
    validate(doc, schemaId) {
        const validateFn = this.validators.get(schemaId);
        if (!validateFn) {
            throw new Error(`Unknown schema: "${schemaId}". Available: ${[...this.validators.keys()].join(', ')}`);
        }
        const valid = validateFn(doc);
        return { valid, errors: validateFn.errors ?? [] };
    }
    availableSchemas() {
        return [...this.validators.keys()];
    }
    // ── Cross-layer validation ─────────────────────────────────────────────────
    collectResources(domain) {
        const resources = [...(domain.resources ?? [])];
        for (const sub of domain.domains ?? []) {
            resources.push(...this.collectResources(sub));
        }
        return resources;
    }
    validateCrossLayer(layers) {
        const errors = [];
        const op = layers.operational;
        const core = layers.productCore;
        const api = layers.productApi;
        const ui = layers.productUi;
        const tech = layers.technical;
        // ── Operational ──────────────────────────────────────────────────────
        if (op) {
            const resources = this.collectResources(op.domain);
            const resourceNames = new Set(resources.map(r => r.name));
            const operationNames = new Set((op.operations ?? []).map(o => o.name));
            const signalNames = new Set((op.signals ?? []).map(s => s.name));
            const taskNames = new Set((op.tasks ?? []).map(t => t.name));
            const ruleNames = new Set((op.rules ?? []).filter(r => !!r.name).map(r => r.name));
            const processNames = new Set((op.processes ?? []).map(p => p.name));
            // Signal.operation must reference a valid Operation
            for (const signal of op.signals ?? []) {
                if (!operationNames.has(signal.operation)) {
                    errors.push({
                        layer: 'operational',
                        path: `signals/${signal.name}/operation`,
                        message: `Signal "${signal.name}" references Operation "${signal.operation}" which does not exist. Available: ${[...operationNames].join(', ')}`,
                    });
                }
            }
            // Outcome.emits must reference valid Signal names
            // Outcome.initiates must reference valid Operations
            for (const outcome of op.outcomes ?? []) {
                if (!operationNames.has(outcome.operation)) {
                    errors.push({
                        layer: 'operational',
                        path: `outcomes/${outcome.operation}/operation`,
                        message: `Outcome references Operation "${outcome.operation}" which does not exist. Available: ${[...operationNames].join(', ')}`,
                    });
                }
                for (const signalRef of outcome.emits ?? []) {
                    if (!signalNames.has(signalRef)) {
                        errors.push({
                            layer: 'operational',
                            path: `outcomes/${outcome.operation}/emits/${signalRef}`,
                            message: `Outcome for "${outcome.operation}" emits Signal "${signalRef}" which does not exist. Available: ${[...signalNames].join(', ')}`,
                        });
                    }
                }
                for (const opRef of outcome.initiates ?? []) {
                    if (!operationNames.has(opRef)) {
                        errors.push({
                            layer: 'operational',
                            path: `outcomes/${outcome.operation}/initiates/${opRef}`,
                            message: `Outcome for "${outcome.operation}" initiates Operation "${opRef}" which does not exist. Available: ${[...operationNames].join(', ')}`,
                        });
                    }
                }
            }
            // Trigger: must target either an Operation or a Process (exactly one)
            // Trigger.signal must reference a valid Signal name
            // Trigger.after must reference a valid Operation name (when source=operation)
            for (const trigger of op.triggers ?? []) {
                const target = trigger.operation ? `operation:${trigger.operation}` : trigger.process ? `process:${trigger.process}` : '<missing>';
                if (!trigger.operation && !trigger.process) {
                    errors.push({
                        layer: 'operational',
                        path: `triggers/${target}`,
                        message: `Trigger must target either an Operation or a Process; both are missing.`,
                    });
                }
                if (trigger.operation && trigger.process) {
                    errors.push({
                        layer: 'operational',
                        path: `triggers/${target}`,
                        message: `Trigger may target either an Operation or a Process, not both.`,
                    });
                }
                if (trigger.operation && !operationNames.has(trigger.operation)) {
                    errors.push({
                        layer: 'operational',
                        path: `triggers/${target}/operation`,
                        message: `Trigger references Operation "${trigger.operation}" which does not exist. Available: ${[...operationNames].join(', ')}`,
                    });
                }
                if (trigger.process && !processNames.has(trigger.process)) {
                    errors.push({
                        layer: 'operational',
                        path: `triggers/${target}/process`,
                        message: `Trigger references Process "${trigger.process}" which does not exist. Available: ${[...processNames].join(', ')}`,
                    });
                }
                if (trigger.source === 'signal' && trigger.signal && !signalNames.has(trigger.signal)) {
                    errors.push({
                        layer: 'operational',
                        path: `triggers/${target}/signal`,
                        message: `Trigger references Signal "${trigger.signal}" which does not exist. Available: ${[...signalNames].join(', ')}`,
                    });
                }
                if (trigger.source === 'operation' && trigger.after && !operationNames.has(trigger.after)) {
                    errors.push({
                        layer: 'operational',
                        path: `triggers/${target}/after`,
                        message: `Trigger references upstream Operation "${trigger.after}" which does not exist. Available: ${[...operationNames].join(', ')}`,
                    });
                }
            }
            // Rule.operation must reference a declared Operation
            // Rule.allow[].role must reference a declared Resource (acting as Role)
            for (const rule of op.rules ?? []) {
                if (!operationNames.has(rule.operation)) {
                    errors.push({
                        layer: 'operational',
                        path: `rules/${rule.name ?? rule.operation}/operation`,
                        message: `Rule references Operation "${rule.operation}" which does not exist. Available: ${[...operationNames].join(', ')}`,
                    });
                }
                if (rule.type === 'access' && resourceNames.size > 0) {
                    for (const entry of rule.allow ?? []) {
                        if (entry.role && !resourceNames.has(entry.role)) {
                            errors.push({
                                layer: 'operational',
                                path: `rules/${rule.name ?? rule.operation}/allow/role/${entry.role}`,
                                message: `Rule for "${rule.operation}" references Role "${entry.role}" (Resource) which does not exist. Available: ${[...resourceNames].join(', ')}`,
                            });
                        }
                    }
                }
            }
            // Resource.parent must reference a declared Resource
            // Resource.scope must reference a declared Resource
            // Resource.memberships[].role/in must reference declared Resources
            // Membership.in must match the referenced Role's scope (when declared)
            const resourceByName = new Map(resources.map(r => [r.name, r]));
            for (const resource of resources) {
                if (resource.parent && !resourceNames.has(resource.parent)) {
                    errors.push({
                        layer: 'operational',
                        path: `resources/${resource.name}/parent`,
                        message: `Resource "${resource.name}" parent "${resource.parent}" does not reference a declared Resource. Available: ${[...resourceNames].join(', ')}`,
                    });
                }
                if (resource.scope && !resourceNames.has(resource.scope)) {
                    errors.push({
                        layer: 'operational',
                        path: `resources/${resource.name}/scope`,
                        message: `Resource "${resource.name}" scope "${resource.scope}" does not reference a declared Resource. Available: ${[...resourceNames].join(', ')}`,
                    });
                }
                for (const membership of resource.memberships ?? []) {
                    if (!resourceNames.has(membership.role)) {
                        errors.push({
                            layer: 'operational',
                            path: `resources/${resource.name}/memberships/${membership.role}`,
                            message: `Resource "${resource.name}" membership references Role "${membership.role}" (Resource) which does not exist. Available: ${[...resourceNames].join(', ')}`,
                        });
                    }
                    if (!resourceNames.has(membership.in)) {
                        errors.push({
                            layer: 'operational',
                            path: `resources/${resource.name}/memberships/${membership.role}/in`,
                            message: `Resource "${resource.name}" membership references Group "${membership.in}" (Resource) which does not exist. Available: ${[...resourceNames].join(', ')}`,
                        });
                    }
                    // Scope match
                    const roleResource = resourceByName.get(membership.role);
                    if (roleResource?.scope && resourceNames.has(membership.in) && roleResource.scope !== membership.in) {
                        errors.push({
                            layer: 'operational',
                            path: `resources/${resource.name}/memberships/${membership.role}/in`,
                            message: `Membership of "${resource.name}" pins Role "${membership.role}" in "${membership.in}", but Role "${membership.role}" declares scope "${roleResource.scope}".`,
                        });
                    }
                }
            }
            // Relationship validation: from/to must reference valid Resources, attribute must exist on "from" Resource
            for (const rel of op.relationships ?? []) {
                if (!resourceNames.has(rel.from)) {
                    errors.push({
                        layer: 'operational',
                        path: `relationships/${rel.name}/from`,
                        message: `Relationship "${rel.name}" references Resource "${rel.from}" (from) which does not exist. Available: ${[...resourceNames].join(', ')}`,
                    });
                }
                if (!resourceNames.has(rel.to)) {
                    errors.push({
                        layer: 'operational',
                        path: `relationships/${rel.name}/to`,
                        message: `Relationship "${rel.name}" references Resource "${rel.to}" (to) which does not exist. Available: ${[...resourceNames].join(', ')}`,
                    });
                }
                if (resourceNames.has(rel.from)) {
                    const fromResource = resources.find(r => r.name === rel.from);
                    const attrNames = new Set((fromResource?.attributes ?? []).map(a => a.name));
                    if (!attrNames.has(rel.attribute)) {
                        errors.push({
                            layer: 'operational',
                            path: `relationships/${rel.name}/attribute`,
                            message: `Relationship "${rel.name}" references Attribute "${rel.attribute}" which does not exist on Resource "${rel.from}". Available: ${[...attrNames].join(', ')}`,
                        });
                    }
                }
            }
            // Task.actor must reference a declared Resource (acting as Role)
            // Task.operation must reference a declared Operation
            for (const task of op.tasks ?? []) {
                if (resourceNames.size > 0 && !resourceNames.has(task.actor)) {
                    errors.push({
                        layer: 'operational',
                        path: `tasks/${task.name}/actor`,
                        message: `Task "${task.name}" references Actor "${task.actor}" (Resource) which does not exist. Available: ${[...resourceNames].join(', ')}`,
                    });
                }
                if (!operationNames.has(task.operation)) {
                    errors.push({
                        layer: 'operational',
                        path: `tasks/${task.name}/operation`,
                        message: `Task "${task.name}" references Operation "${task.operation}" which does not exist. Available: ${[...operationNames].join(', ')}`,
                    });
                }
            }
            // Process.operator must reference a declared Resource
            // Process.startStep must be a defined Step id
            // Process.steps[].task must reference a declared Task
            // Process.steps[].depends_on[] must reference sibling step IDs
            // Process.steps[].conditions[] must reference declared Rule names
            // Process.steps[].else must be a sibling step ID or "abort"
            // Process.emits[] must reference declared Signals
            for (const proc of op.processes ?? []) {
                if (resourceNames.size > 0 && !resourceNames.has(proc.operator)) {
                    errors.push({
                        layer: 'operational',
                        path: `processes/${proc.name}/operator`,
                        message: `Process "${proc.name}" operator "${proc.operator}" does not reference a declared Resource. Available: ${[...resourceNames].join(', ')}`,
                    });
                }
                const stepIds = new Set((proc.steps ?? []).map(s => s.id));
                if (!stepIds.has(proc.startStep)) {
                    errors.push({
                        layer: 'operational',
                        path: `processes/${proc.name}/startStep`,
                        message: `Process "${proc.name}" startStep "${proc.startStep}" is not a defined Step. Available: ${[...stepIds].join(', ')}`,
                    });
                }
                for (const step of proc.steps ?? []) {
                    if (!taskNames.has(step.task)) {
                        errors.push({
                            layer: 'operational',
                            path: `processes/${proc.name}/steps/${step.id}/task`,
                            message: `Step "${step.id}" in Process "${proc.name}" references Task "${step.task}" which does not exist. Available: ${[...taskNames].join(', ')}`,
                        });
                    }
                    for (const dep of step.depends_on ?? []) {
                        if (!stepIds.has(dep)) {
                            errors.push({
                                layer: 'operational',
                                path: `processes/${proc.name}/steps/${step.id}/depends_on/${dep}`,
                                message: `Step "${step.id}" in Process "${proc.name}" depends_on "${dep}" which is not a sibling step ID. Available: ${[...stepIds].join(', ')}`,
                            });
                        }
                    }
                    for (const cond of step.conditions ?? []) {
                        if (ruleNames.size > 0 && !ruleNames.has(cond)) {
                            errors.push({
                                layer: 'operational',
                                path: `processes/${proc.name}/steps/${step.id}/conditions/${cond}`,
                                message: `Step "${step.id}" in Process "${proc.name}" references Rule "${cond}" which does not exist or has no name. Available: ${[...ruleNames].join(', ')}`,
                            });
                        }
                    }
                    if (step.else && step.else !== 'abort' && !stepIds.has(step.else)) {
                        errors.push({
                            layer: 'operational',
                            path: `processes/${proc.name}/steps/${step.id}/else`,
                            message: `Step "${step.id}" in Process "${proc.name}" else "${step.else}" is neither "abort" nor a sibling step ID. Available: ${[...stepIds].join(', ')}, abort`,
                        });
                    }
                }
                for (const sig of proc.emits ?? []) {
                    if (!signalNames.has(sig)) {
                        errors.push({
                            layer: 'operational',
                            path: `processes/${proc.name}/emits/${sig}`,
                            message: `Process "${proc.name}" emits Signal "${sig}" which does not exist. Available: ${[...signalNames].join(', ')}`,
                        });
                    }
                }
            }
        }
        // ── Operational → Product Core (materializer consistency) ──────────────
        // If both are present, every Resource/Operation/Signal in product.core must
        // also exist in operational — product core is a projection, never invents.
        if (op && core) {
            const opResources = this.collectResources(op.domain);
            const opResourceNames = new Set(opResources.map(r => r.name));
            const opOperationNames = new Set((op.operations ?? []).map(o => o.name));
            const opSignalNames = new Set((op.signals ?? []).map(s => s.name));
            for (const resource of core.resources ?? []) {
                if (!opResourceNames.has(resource.name)) {
                    errors.push({
                        layer: 'product/core',
                        path: `resources/${resource.name}`,
                        message: `Product Core Resource "${resource.name}" is not present in Operational DNA. Re-run the materializer.`,
                    });
                }
            }
            for (const op2 of core.operations ?? []) {
                if (!opOperationNames.has(op2.name)) {
                    errors.push({
                        layer: 'product/core',
                        path: `operations/${op2.name}`,
                        message: `Product Core Operation "${op2.name}" is not present in Operational DNA. Re-run the materializer.`,
                    });
                }
            }
            for (const sig of core.signals ?? []) {
                if (!opSignalNames.has(sig.name)) {
                    errors.push({
                        layer: 'product/core',
                        path: `signals/${sig.name}`,
                        message: `Product Core Signal "${sig.name}" is not present in Operational DNA. Re-run the materializer.`,
                    });
                }
            }
        }
        // ── Product API → Product Core (preferred) or Operational (fallback) ───
        if ((core || op) && api) {
            const resources = core
                ? (core.resources ?? [])
                : this.collectResources(op.domain);
            const resourceNames = new Set(resources.map(r => r.name));
            const operations = core ? core.operations : op.operations;
            const operationNames = new Set((operations ?? []).map(o => o.name));
            const referenceLayer = core ? 'product/core' : 'operational';
            // Resource → Operational Resource cross-layer reference
            for (const resource of api.resources ?? []) {
                if (resource.resource && !resourceNames.has(resource.resource)) {
                    errors.push({
                        layer: 'product/api',
                        path: `resources/${resource.name}/resource`,
                        message: `Resource "${resource.name}" references Resource "${resource.resource}" which does not exist in ${referenceLayer === 'product/core' ? 'Product Core' : 'Operational'} DNA. Available: ${[...resourceNames].join(', ')}`,
                    });
                }
                // Action → Operational Action cross-layer reference
                if (resource.resource && resourceNames.has(resource.resource)) {
                    const opResource = resources.find(r => r.name === resource.resource);
                    const actionNames = new Set((opResource?.actions ?? []).map(a => a.name));
                    for (const action of resource.actions ?? []) {
                        if (action.action && !actionNames.has(action.action)) {
                            errors.push({
                                layer: 'product/api',
                                path: `resources/${resource.name}/actions/${action.name}/action`,
                                message: `Action "${action.name}" on Resource "${resource.name}" references Action "${action.action}" which does not exist on Resource "${resource.resource}". Available: ${[...actionNames].join(', ')}`,
                            });
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
                    });
                }
            }
            // Endpoint operation references
            const apiOperationNames = new Set((api.operations ?? []).map(o => o.name));
            for (const endpoint of api.endpoints ?? []) {
                if (endpoint.operation && !apiOperationNames.has(endpoint.operation)) {
                    errors.push({
                        layer: 'product/api',
                        path: `endpoints/${endpoint.operation}/operation`,
                        message: `Endpoint references Operation "${endpoint.operation}" which is not defined in operations. Available: ${[...apiOperationNames].join(', ')}`,
                    });
                }
            }
        }
        // ── Product UI → Product API ───────────────────────────────────────────
        if (api && ui) {
            const resourceNames = new Set((api.resources ?? []).map(r => r.name));
            const operationNames = new Set((api.operations ?? []).map(o => o.name));
            // Page resource references
            for (const page of ui.pages ?? []) {
                if (page.resource && !resourceNames.has(page.resource)) {
                    errors.push({
                        layer: 'product/ui',
                        path: `pages/${page.name}/resource`,
                        message: `Page "${page.name}" references Resource "${page.resource}" which does not exist in Product API DNA. Available: ${[...resourceNames].join(', ')}`,
                    });
                }
                // Block operation references
                for (const block of page.blocks ?? []) {
                    if (block.operation && !operationNames.has(block.operation)) {
                        errors.push({
                            layer: 'product/ui',
                            path: `pages/${page.name}/blocks/${block.name}/operation`,
                            message: `Block "${block.name}" on Page "${page.name}" references Operation "${block.operation}" which does not exist in Product API DNA. Available: ${[...operationNames].join(', ')}`,
                        });
                    }
                }
            }
            // Route page references
            const pageNames = new Set((ui.pages ?? []).map(p => p.name));
            for (const route of ui.routes ?? []) {
                if (route.page && !pageNames.has(route.page)) {
                    errors.push({
                        layer: 'product/ui',
                        path: `routes/${route.page}/page`,
                        message: `Route references Page "${route.page}" which is not defined in pages. Available: ${[...pageNames].join(', ')}`,
                    });
                }
            }
        }
        // ── Technical → Product/Operational ────────────────────────────────────
        if (tech) {
            const providerNames = new Set((tech.providers ?? []).map(p => p.name));
            const constructNames = new Set((tech.constructs ?? []).map(c => c.name));
            // Construct provider references
            for (const construct of tech.constructs ?? []) {
                if (construct.provider && !providerNames.has(construct.provider)) {
                    errors.push({
                        layer: 'technical',
                        path: `constructs/${construct.name}/provider`,
                        message: `Construct "${construct.name}" references Provider "${construct.provider}" which does not exist. Available: ${[...providerNames].join(', ')}`,
                    });
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
                        });
                    }
                }
            }
        }
        return { valid: errors.length === 0, errors };
    }
}
exports.DnaValidator = DnaValidator;
//# sourceMappingURL=validator.js.map