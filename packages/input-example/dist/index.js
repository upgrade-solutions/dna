"use strict";
/**
 * @dna-codes/input-example — template input adapter.
 *
 * This package demonstrates the two input modes with matching entry points:
 *
 *   parse(data, options)                  — deterministic (sync, pure)
 *   parseText(text, options)              — probabilistic (async, LLM-backed)
 *
 * When forking, KEEP ONE mode and delete the other along with its files
 * (`providers.ts` + `prompt.ts` for the probabilistic side). Both are kept
 * here so agents can see either pattern without hunting across packages.
 *
 * Contract (shared across input-*):
 *   - Throw on structural errors the caller should fix; let the
 *     `@dna-codes/core` validator handle downstream DNA validation.
 *   - Return an object keyed by DNA layer (operational, productCore, ...).
 *     Never return a bare array or scalar.
 *   - Zero runtime dependencies. Use global `fetch` for probabilistic mode.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.parseText = parseText;
const prompt_1 = require("./prompt");
const providers_1 = require("./providers");
// ---------------------------------------------------------------------------
// Deterministic mode — synchronous, pure, no I/O.
// ---------------------------------------------------------------------------
function parse(data, options) {
    if (!data || typeof data !== 'object' || !Array.isArray(data.entities)) {
        throw new Error('input-example.parse: data must be an object with an `entities` array.');
    }
    if (!options.domain) {
        throw new Error('input-example.parse: options.domain is required.');
    }
    const resourceName = options.resourceNameFromEntity ?? defaultResourceName;
    const resources = data.entities.map((entity) => toResource(entity, resourceName));
    const capabilities = (data.actions ?? []).map((action) => toCapability(action, resourceName));
    attachActions(resources, capabilities);
    return {
        operational: {
            domain: {
                name: domainLeaf(options.domain),
                path: options.domain,
                resources,
            },
            ...(capabilities.length ? { capabilities } : {}),
        },
    };
}
function toResource(entity, resourceName) {
    return {
        name: resourceName(entity.name),
        attributes: (entity.fields ?? []).map((f) => ({
            name: f.name,
            type: f.type,
            ...(f.required ? { required: true } : {}),
        })),
    };
}
function toCapability(action, resourceName) {
    const resource = resourceName(action.entity);
    const actionName = toPascalCase(action.action);
    return { resource, action: actionName, name: `${resource}.${actionName}` };
}
function attachActions(resources, capabilities) {
    for (const cap of capabilities) {
        const resource = resources.find((r) => r.name === cap.resource);
        if (!resource)
            continue;
        resource.actions ?? (resource.actions = []);
        if (!resource.actions.some((a) => a.name === cap.action))
            resource.actions.push({ name: cap.action });
    }
}
function defaultResourceName(entity) {
    return toPascalCase(entity);
}
function toPascalCase(s) {
    return s
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join('');
}
function domainLeaf(path) {
    const parts = path.split('.');
    return parts[parts.length - 1];
}
// ---------------------------------------------------------------------------
// Probabilistic mode — async, LLM-backed. Delete this half if not needed.
// ---------------------------------------------------------------------------
async function parseText(text, options) {
    if (typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('input-example.parseText: text must be a non-empty string.');
    }
    if (!options.apiKey) {
        throw new Error('input-example.parseText: options.apiKey is required.');
    }
    const raw = await (0, providers_1.dispatch)({
        provider: options.provider,
        apiKey: options.apiKey,
        baseUrl: options.baseUrl,
        model: options.model ?? (0, providers_1.defaultModel)(options.provider),
        system: (0, prompt_1.buildSystemPrompt)(options.instructions),
        user: (0, prompt_1.buildUserPrompt)(text),
        temperature: options.temperature ?? 0,
        fetchImpl: options.fetchImpl ?? fetch,
    });
    const parsed = parseJsonObject(raw);
    return {
        ...(parsed.operational ? { operational: parsed.operational } : {}),
        raw,
    };
}
function parseJsonObject(raw) {
    const stripped = stripFences(raw.trim());
    try {
        const value = JSON.parse(stripped);
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new Error('expected top-level object');
        }
        return value;
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`input-example.parseText: model did not return valid JSON (${message}). Raw:\n${raw}`);
    }
}
function stripFences(s) {
    const match = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return match ? match[1] : s;
}
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map