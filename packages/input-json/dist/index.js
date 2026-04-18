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
function parse(data, options) {
    if (!isRecord(data) && !Array.isArray(data)) {
        throw new Error('input-json.parse: input must be a JSON object or array of objects.');
    }
    const nouns = new Map();
    const relationships = [];
    const rootSample = Array.isArray(data) ? mergeRecords(data) : data;
    walk(rootSample, options.name, nouns, relationships, options);
    return {
        operational: {
            domain: {
                name: options.domain ?? options.name.toLowerCase(),
                nouns: [...nouns.values()],
            },
            ...(relationships.length ? { relationships } : {}),
        },
    };
}
function walk(data, nounName, nouns, relationships, options) {
    const existing = nouns.get(nounName);
    const attrs = existing?.attributes ? [...existing.attributes] : [];
    const seen = new Set(attrs.map((a) => a.name));
    for (const [key, value] of Object.entries(data)) {
        if (seen.has(key))
            continue;
        seen.add(key);
        if (isRecord(value)) {
            const childName = deriveNounName(key, options);
            attrs.push({ name: key, type: 'reference', noun: childName });
            relationships.push(buildRelationship(nounName, childName, key, 'one-to-one'));
            walk(value, childName, nouns, relationships, options);
        }
        else if (Array.isArray(value)) {
            if (value.length > 0 && isRecord(value[0])) {
                const childName = deriveNounName(key, options);
                attrs.push({ name: key, type: 'reference', noun: childName });
                relationships.push(buildRelationship(nounName, childName, key, 'one-to-many'));
                const merged = mergeRecords(value);
                walk(merged, childName, nouns, relationships, options);
            }
            else {
                attrs.push({ name: key, type: 'array' });
            }
        }
        else {
            attrs.push({ name: key, type: inferScalarType(value) });
        }
    }
    nouns.set(nounName, { name: nounName, attributes: attrs });
}
function buildRelationship(from, to, attribute, cardinality) {
    return {
        name: `${from}.${attribute}`,
        from,
        to,
        attribute,
        cardinality,
    };
}
function deriveNounName(key, options) {
    if (options.nounNameFromKey)
        return options.nounNameFromKey(key);
    return pascalCase(singularize(key));
}
/**
 * Shallow-merge an array of record-shaped values into a single record by
 * picking the first non-null sample for each key. Handles schemas that drift
 * across array items (partial/optional fields).
 */
function mergeRecords(items) {
    const out = {};
    for (const item of items) {
        if (!isRecord(item))
            continue;
        for (const [k, v] of Object.entries(item)) {
            if (!(k in out) || out[k] == null)
                out[k] = v;
        }
    }
    return out;
}
function inferScalarType(value) {
    if (value == null)
        return 'string';
    if (typeof value === 'boolean')
        return 'boolean';
    if (typeof value === 'number')
        return 'number';
    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}T/.test(value))
            return 'datetime';
        if (/^\d{4}-\d{2}-\d{2}$/.test(value))
            return 'date';
        return 'string';
    }
    return 'string';
}
function isRecord(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function pascalCase(s) {
    return s
        .split(/[\s\-_./]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
}
function singularize(s) {
    if (s.endsWith('ies') && s.length > 3)
        return s.slice(0, -3) + 'y';
    if (s.endsWith('sses'))
        return s.slice(0, -2);
    if (s.endsWith('s') && !s.endsWith('ss'))
        return s.slice(0, -1);
    return s;
}
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map