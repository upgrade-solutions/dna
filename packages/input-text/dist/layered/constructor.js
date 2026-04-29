"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayeredConstructor = void 0;
const dna_core_1 = require("@dna-codes/dna-core");
const schema_to_tool_1 = require("../tools/schema-to-tool");
const COLLECTION_FOR = {
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
};
const NAME_POOL_FOR = {
    resource: 'resources',
    person: 'persons',
    role: 'roles',
    group: 'groups',
    task: 'tasks',
    process: 'processes',
    rule: 'rules',
    // membership has names too but they're not in the EnumPools shape — handle separately below
};
function capitalize(s) {
    return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}
class LayeredConstructor {
    constructor(options = {}) {
        this.validator = new dna_core_1.DnaValidator();
        this.transcript = [];
        this.callCount = 0;
        this.finalizeAttempts = 0;
        this.lastCallSig = null;
        this.finalized = false;
        const domain = options.domain ?? { name: 'domain' };
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
        };
        this.tools_ = (0, schema_to_tool_1.buildLayeredTools)();
        this.maxToolCalls = options.maxToolCalls ?? 50;
        this.maxFinalizeRetries = options.maxFinalizeRetries ?? 3;
    }
    /** Tool definitions in a provider-neutral shape. */
    tools() {
        return this.tools_.map((t) => ({ ...t, parameters: { ...t.parameters } }));
    }
    /** Pools of declared primitive names — useful for narrowing tool schemas mid-flight. */
    pools() {
        return {
            resources: this.draft.domain.resources.map((r) => r.name),
            persons: this.draft.domain.persons.map((p) => p.name),
            roles: this.draft.domain.roles.map((r) => r.name),
            groups: this.draft.domain.groups.map((g) => g.name),
            operations: this.draft.operations.map((o) => o.name ?? ''),
            tasks: this.draft.tasks.map((t) => t.name),
            processes: this.draft.processes.map((p) => p.name),
            rules: this.draft.rules
                .map((r) => r.name)
                .filter((n) => typeof n === 'string'),
        };
    }
    /** The assembled draft. Returns a deep-cloned snapshot. */
    result() {
        return cleanDocument(this.draft);
    }
    hasFinalized() {
        return this.finalized;
    }
    toolCallCount() {
        return this.callCount;
    }
    toolCallTranscript() {
        return [...this.transcript];
    }
    /** Process a tool call from the LLM (or any caller). Synchronous and side-effect-free on errors. */
    handle(call) {
        if (this.callCount >= this.maxToolCalls) {
            const result = {
                ok: false,
                error: 'iteration_cap_reached',
                message: `Iteration cap of ${this.maxToolCalls} tool calls reached.`,
            };
            this.recordCall(call, result, /*increment*/ false);
            throw new Error(result.message);
        }
        const sig = signatureFor(call);
        if (sig !== null && sig === this.lastCallSig) {
            const result = {
                ok: false,
                error: 'duplicate_call',
                message: `Duplicate consecutive tool call rejected: ${call.name}.`,
            };
            this.recordCall(call, result, /*increment*/ true);
            this.lastCallSig = sig;
            return result;
        }
        let result;
        if (call.name === 'finalize') {
            result = this.handleFinalize();
        }
        else if (call.name.startsWith('add_')) {
            const kind = call.name.slice(4);
            if (!schema_to_tool_1.PRIMITIVE_KINDS.includes(kind)) {
                result = {
                    ok: false,
                    error: 'unknown_tool',
                    message: `Unknown tool: "${call.name}". Expected one of: ${this.tools_.map((t) => t.name).join(', ')}.`,
                };
            }
            else {
                result = this.handleAdd(kind, call.args);
            }
        }
        else {
            result = {
                ok: false,
                error: 'unknown_tool',
                message: `Unknown tool: "${call.name}". Expected one of: ${this.tools_.map((t) => t.name).join(', ')}.`,
            };
        }
        this.recordCall(call, result, /*increment*/ true);
        this.lastCallSig = sig;
        return result;
    }
    recordCall(call, result, increment) {
        if (increment)
            this.callCount += 1;
        this.transcript.push({ name: call.name, args: call.args, result });
    }
    handleAdd(kind, args) {
        if (!args || typeof args !== 'object') {
            return { ok: false, error: 'invalid_args', message: `add_${kind}: args must be an object.` };
        }
        const validation = this.validatePrimitive(kind, args);
        if (!validation.valid) {
            return {
                ok: false,
                error: 'schema_violation',
                message: `add_${kind}: schema validation failed.`,
                details: validation.errors,
            };
        }
        const dupName = this.checkNameUniqueness(kind, args);
        if (dupName)
            return dupName;
        const refError = this.checkReferences(kind, args);
        if (refError)
            return refError;
        const target = COLLECTION_FOR[kind];
        if (target.startsWith('domain.')) {
            const field = target.slice('domain.'.length);
            this.draft.domain[field].push(args);
        }
        else {
            ;
            this.draft[target].push(args);
        }
        const name = typeof args.name === 'string' ? args.name : '<unnamed>';
        return {
            ok: true,
            primitive: kind,
            name,
            message: `Added ${kind} "${name}".`,
        };
    }
    validatePrimitive(kind, args) {
        const schemaId = `operational/${kind}`;
        return this.validator.validate(args, schemaId);
    }
    checkNameUniqueness(kind, args) {
        // Triggers are inherently anonymous (multiple per Operation are valid).
        if (kind === 'trigger')
            return null;
        const pools = this.pools();
        if (kind === 'operation') {
            const name = typeof args.name === 'string' ? args.name : undefined;
            const target = typeof args.target === 'string' ? args.target : undefined;
            const action = typeof args.action === 'string' ? args.action : undefined;
            const composed = name ?? (target && action ? `${target}.${action}` : undefined);
            if (composed && (pools.operations ?? []).includes(composed)) {
                return {
                    ok: false,
                    error: 'duplicate_name',
                    message: `Operation "${composed}" has already been added. Each Target.Action pair is unique.`,
                };
            }
            return null;
        }
        const name = typeof args.name === 'string' ? args.name : undefined;
        if (!name)
            return null;
        if (kind === 'membership') {
            const existing = this.draft.memberships.map((m) => m.name).filter(Boolean);
            if (existing.includes(name)) {
                return {
                    ok: false,
                    error: 'duplicate_name',
                    message: `Membership "${name}" has already been added.`,
                };
            }
            return null;
        }
        const poolKey = NAME_POOL_FOR[kind];
        if (!poolKey)
            return null;
        const existing = (pools[poolKey] ?? []);
        if (existing.includes(name)) {
            return {
                ok: false,
                error: 'duplicate_name',
                message: `${capitalize(kind)} "${name}" has already been added.`,
            };
        }
        return null;
    }
    checkReferences(kind, args) {
        const pools = this.pools();
        const string = (k) => typeof args[k] === 'string' ? args[k] : undefined;
        switch (kind) {
            case 'resource': {
                const parent = string('parent');
                if (parent && !(pools.resources ?? []).includes(parent)) {
                    return refError('unknown_resource', 'parent', parent, pools.resources ?? []);
                }
                return null;
            }
            case 'person': {
                const parent = string('parent');
                if (parent && !(pools.persons ?? []).includes(parent)) {
                    return refError('unknown_person', 'parent', parent, pools.persons ?? []);
                }
                const resource = string('resource');
                if (resource && !(pools.resources ?? []).includes(resource)) {
                    return refError('unknown_resource', 'resource', resource, pools.resources ?? []);
                }
                return null;
            }
            case 'role': {
                const parent = string('parent');
                if (parent && !(pools.roles ?? []).includes(parent)) {
                    return refError('unknown_role', 'parent', parent, pools.roles ?? []);
                }
                const resource = string('resource');
                if (resource && !(pools.resources ?? []).includes(resource)) {
                    return refError('unknown_resource', 'resource', resource, pools.resources ?? []);
                }
                const scope = args.scope;
                const scopes = typeof scope === 'string' ? [scope] : Array.isArray(scope) ? scope.filter((s) => typeof s === 'string') : [];
                const scopeable = new Set([...(pools.groups ?? []), ...(pools.persons ?? [])]);
                for (const s of scopes) {
                    if (!scopeable.has(s)) {
                        return refError('unknown_group', 'scope', s, [...scopeable]);
                    }
                }
                return null;
            }
            case 'group': {
                const parent = string('parent');
                if (parent && !(pools.groups ?? []).includes(parent)) {
                    return refError('unknown_group', 'parent', parent, pools.groups ?? []);
                }
                return null;
            }
            case 'membership': {
                const person = string('person');
                if (person && !(pools.persons ?? []).includes(person)) {
                    return refError('unknown_person', 'person', person, pools.persons ?? []);
                }
                const role = string('role');
                if (role && !(pools.roles ?? []).includes(role)) {
                    return refError('unknown_role', 'role', role, pools.roles ?? []);
                }
                const group = string('group');
                const groupable = new Set([...(pools.groups ?? []), ...(pools.persons ?? [])]);
                if (group && !groupable.has(group)) {
                    return refError('unknown_group', 'group', group, [...groupable]);
                }
                return null;
            }
            case 'operation': {
                const target = string('target');
                const targets = new Set([
                    ...(pools.resources ?? []),
                    ...(pools.persons ?? []),
                    ...(pools.roles ?? []),
                    ...(pools.groups ?? []),
                    ...(pools.processes ?? []),
                ]);
                if (target && !targets.has(target)) {
                    return refError('unknown_target', 'target', target, [...targets]);
                }
                return null;
            }
            case 'task': {
                const actor = string('actor');
                const actors = new Set([...(pools.roles ?? []), ...(pools.persons ?? [])]);
                if (actor && !actors.has(actor)) {
                    return refError('unknown_actor', 'actor', actor, [...actors]);
                }
                const operation = string('operation');
                if (operation && !(pools.operations ?? []).includes(operation)) {
                    return refError('unknown_operation', 'operation', operation, pools.operations ?? []);
                }
                return null;
            }
            case 'process': {
                const operator = string('operator');
                const operators = new Set([...(pools.roles ?? []), ...(pools.persons ?? [])]);
                if (operator && !operators.has(operator)) {
                    return refError('unknown_operator', 'operator', operator, [...operators]);
                }
                const taskNames = new Set(pools.tasks ?? []);
                const steps = Array.isArray(args.steps) ? args.steps : [];
                for (const step of steps) {
                    if (!step || typeof step !== 'object')
                        continue;
                    const stepObj = step;
                    const taskRef = stepObj.task;
                    if (typeof taskRef === 'string' && !taskNames.has(taskRef)) {
                        return refError('unknown_task', `steps[].task`, taskRef, [...taskNames]);
                    }
                    const conditions = Array.isArray(stepObj.conditions) ? stepObj.conditions : [];
                    for (const cond of conditions) {
                        if (typeof cond === 'string' && !(pools.rules ?? []).includes(cond)) {
                            return refError('unknown_rule', `steps[].conditions`, cond, pools.rules ?? []);
                        }
                    }
                }
                return null;
            }
            case 'trigger': {
                const operation = string('operation');
                if (operation && !(pools.operations ?? []).includes(operation)) {
                    return refError('unknown_operation', 'operation', operation, pools.operations ?? []);
                }
                const process = string('process');
                if (process && !(pools.processes ?? []).includes(process)) {
                    return refError('unknown_process', 'process', process, pools.processes ?? []);
                }
                const after = string('after');
                if (after && !(pools.operations ?? []).includes(after)) {
                    return refError('unknown_operation', 'after', after, pools.operations ?? []);
                }
                return null;
            }
            case 'rule': {
                const operation = string('operation');
                if (operation && !(pools.operations ?? []).includes(operation)) {
                    return refError('unknown_operation', 'operation', operation, pools.operations ?? []);
                }
                return null;
            }
        }
        return null;
    }
    handleFinalize() {
        this.finalizeAttempts += 1;
        const document = cleanDocument(this.draft);
        const result = this.validator.validate(document, 'operational');
        const cross = this.validator.validateCrossLayer({ operational: document });
        if (result.valid && cross.valid) {
            this.finalized = true;
            return { ok: true, finalized: true, document };
        }
        if (this.finalizeAttempts >= this.maxFinalizeRetries) {
            return {
                ok: false,
                error: 'finalize_retries_exhausted',
                message: `Finalize failed ${this.finalizeAttempts} times; giving up.`,
                details: { schemaErrors: result.errors, crossLayerErrors: cross.errors },
            };
        }
        return {
            ok: false,
            error: 'finalize_failed',
            message: `Validation failed (attempt ${this.finalizeAttempts}/${this.maxFinalizeRetries}). Issue corrective add_* calls and call finalize again.`,
            details: { schemaErrors: result.errors, crossLayerErrors: cross.errors },
        };
    }
}
exports.LayeredConstructor = LayeredConstructor;
function refError(code, field, value, available) {
    return {
        ok: false,
        error: code,
        message: `Field "${field}" references "${value}" which is not declared. Available: ${available.length ? available.join(', ') : '(none yet)'}.`,
        available,
    };
}
function signatureFor(call) {
    try {
        return `${call.name}|${stableStringify(call.args ?? {})}`;
    }
    catch {
        return null;
    }
}
function stableStringify(value) {
    if (value === null || typeof value !== 'object')
        return JSON.stringify(value);
    if (Array.isArray(value))
        return `[${value.map(stableStringify).join(',')}]`;
    const obj = value;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}
function cleanDocument(draft) {
    const out = { domain: cleanDomain(draft.domain) };
    const sections = [
        'memberships',
        'operations',
        'triggers',
        'rules',
        'tasks',
        'processes',
    ];
    for (const key of sections) {
        const arr = draft[key];
        if (arr.length > 0)
            out[key] = arr;
    }
    return out;
}
function cleanDomain(d) {
    const out = { name: d.name };
    if (d.path)
        out.path = d.path;
    if (d.description)
        out.description = d.description;
    if (d.resources.length)
        out.resources = d.resources;
    if (d.persons.length)
        out.persons = d.persons;
    if (d.roles.length)
        out.roles = d.roles;
    if (d.groups.length)
        out.groups = d.groups;
    return out;
}
//# sourceMappingURL=constructor.js.map