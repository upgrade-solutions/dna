"use strict";
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
const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head']);
function parse(spec, options = {}) {
    const namespace = {
        name: options.namespaceName ?? toPascalCase(spec.info?.title ?? 'Api'),
        path: options.namespacePath ?? deriveNamespacePath(spec.servers),
        description: spec.info?.description,
    };
    const endpoints = [];
    for (const [path, methods] of Object.entries(spec.paths ?? {})) {
        for (const [method, operation] of Object.entries(methods ?? {})) {
            if (!HTTP_METHODS.has(method.toLowerCase()))
                continue;
            endpoints.push(buildEndpoint(path, method, operation));
        }
    }
    const schemas = buildSchemas(spec.components?.schemas);
    return {
        productApi: {
            namespace,
            endpoints,
            ...(schemas.length ? { schemas } : {}),
        },
    };
}
function buildEndpoint(path, method, op) {
    const params = (op.parameters ?? [])
        .filter((p) => p.in === 'path' || p.in === 'query' || p.in === 'header')
        .map((p) => ({
        name: p.name,
        in: p.in,
        type: mapType(p.schema?.type),
        required: p.required,
        description: p.description,
    }));
    return {
        method: method.toUpperCase(),
        path,
        operation: deriveOperationName(op, method, path),
        description: op.summary ?? op.description,
        ...(params.length ? { params } : {}),
    };
}
function buildSchemas(schemas) {
    if (!schemas)
        return [];
    const out = [];
    for (const [name, schema] of Object.entries(schemas)) {
        out.push({
            name,
            description: schema.description,
            fields: propertiesToFields(schema),
        });
    }
    return out;
}
function propertiesToFields(schema) {
    const required = new Set(schema.required ?? []);
    return Object.entries(schema.properties ?? {}).map(([name, prop]) => {
        const field = {
            name,
            type: mapType(prop.type),
        };
        if (required.has(name))
            field.required = true;
        if (prop.description)
            field.description = prop.description;
        return field;
    });
}
function deriveOperationName(op, method, path) {
    if (op.operationId)
        return toPascalDot(op.operationId);
    const tag = op.tags?.[0];
    if (tag)
        return `${toPascalCase(tag)}.${toPascalCase(method)}`;
    const last = path
        .split('/')
        .filter(Boolean)
        .filter((seg) => !seg.startsWith('{') && !seg.startsWith(':'))
        .pop();
    const resource = last ? toPascalCase(last) : 'Root';
    return `${resource}.${toPascalCase(method)}`;
}
function deriveNamespacePath(servers) {
    if (!servers?.length)
        return '/';
    try {
        const url = new URL(servers[0].url, 'http://placeholder.local');
        return url.pathname || '/';
    }
    catch {
        // Relative URL like '/api/v1' — use as-is.
        const u = servers[0].url;
        return u.startsWith('/') ? u : `/${u}`;
    }
}
function toPascalCase(s) {
    return s
        .split(/[\s\-_/.]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
}
/**
 * Convert an operationId like "listPets" or "Pet.list" to "Pet.List".
 * If the id contains a dot, preserve its parts; otherwise split on camelCase.
 */
function toPascalDot(id) {
    if (id.includes('.')) {
        return id
            .split('.')
            .map(toPascalCase)
            .filter(Boolean)
            .join('.');
    }
    const parts = id.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/\s+/);
    if (parts.length < 2)
        return toPascalCase(id) + '.Do';
    const verb = parts[0];
    const noun = parts.slice(1).join(' ');
    return `${toPascalCase(noun)}.${toPascalCase(verb)}`;
}
function mapType(t) {
    switch (t) {
        case 'integer':
        case 'number':
            return 'number';
        case 'boolean':
            return 'boolean';
        case 'array':
            return 'array';
        case 'object':
            return 'object';
        case 'string':
        default:
            return 'string';
    }
}
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map