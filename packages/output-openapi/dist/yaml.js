"use strict";
/**
 * Minimal handcrafted YAML stringifier. Zero dependencies.
 *
 * Scope: emits the subset of YAML used by an OpenAPI 3.1 document — strings,
 * numbers, booleans, null, arrays of objects/scalars, nested objects. No
 * anchors, no flow style, no multi-document streams. Keys are emitted in the
 * order they appear on the input object (the renderer is responsible for
 * inserting them in a deterministic order).
 *
 * Strings that need quoting: anything containing a YAML reserved indicator,
 * leading/trailing whitespace, or that would parse as a non-string scalar
 * (numbers, booleans, null, etc.) get double-quoted with JS-style escapes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toYaml = toYaml;
function toYaml(value) {
    return emit(value, 0).trimEnd() + '\n';
}
function emit(value, indent) {
    if (value === null || value === undefined)
        return 'null\n';
    if (typeof value === 'boolean')
        return `${value}\n`;
    if (typeof value === 'number') {
        if (!Number.isFinite(value))
            return `"${String(value)}"\n`;
        return `${value}\n`;
    }
    if (typeof value === 'string')
        return `${quoteIfNeeded(value)}\n`;
    if (Array.isArray(value))
        return emitArray(value, indent);
    if (typeof value === 'object')
        return emitObject(value, indent);
    return `${quoteIfNeeded(String(value))}\n`;
}
function emitObject(obj, indent) {
    const keys = Object.keys(obj);
    if (keys.length === 0)
        return '{}\n';
    const pad = '  '.repeat(indent);
    const lines = [];
    for (const key of keys) {
        const v = obj[key];
        const keyStr = `${pad}${quoteKey(key)}:`;
        if (v === null || v === undefined) {
            lines.push(`${keyStr} null`);
        }
        else if (typeof v === 'boolean' || typeof v === 'number') {
            lines.push(`${keyStr} ${typeof v === 'number' && !Number.isFinite(v) ? `"${String(v)}"` : v}`);
        }
        else if (typeof v === 'string') {
            lines.push(`${keyStr} ${quoteIfNeeded(v)}`);
        }
        else if (Array.isArray(v)) {
            if (v.length === 0) {
                lines.push(`${keyStr} []`);
            }
            else {
                lines.push(keyStr);
                lines.push(emitArrayBody(v, indent).trimEnd());
            }
        }
        else if (typeof v === 'object') {
            const innerKeys = Object.keys(v);
            if (innerKeys.length === 0) {
                lines.push(`${keyStr} {}`);
            }
            else {
                lines.push(keyStr);
                lines.push(emitObject(v, indent + 1).trimEnd());
            }
        }
        else {
            lines.push(`${keyStr} ${quoteIfNeeded(String(v))}`);
        }
    }
    return lines.join('\n') + '\n';
}
function emitArray(arr, indent) {
    if (arr.length === 0)
        return '[]\n';
    return emitArrayBody(arr, indent);
}
function emitArrayBody(arr, indent) {
    const pad = '  '.repeat(indent);
    const lines = [];
    for (const item of arr) {
        if (item === null || item === undefined) {
            lines.push(`${pad}- null`);
        }
        else if (typeof item === 'boolean' || typeof item === 'number') {
            lines.push(`${pad}- ${typeof item === 'number' && !Number.isFinite(item) ? `"${String(item)}"` : item}`);
        }
        else if (typeof item === 'string') {
            lines.push(`${pad}- ${quoteIfNeeded(item)}`);
        }
        else if (Array.isArray(item)) {
            if (item.length === 0) {
                lines.push(`${pad}- []`);
            }
            else {
                lines.push(`${pad}-`);
                lines.push(emitArrayBody(item, indent + 1).trimEnd());
            }
        }
        else if (typeof item === 'object') {
            const innerKeys = Object.keys(item);
            if (innerKeys.length === 0) {
                lines.push(`${pad}- {}`);
            }
            else {
                const inner = emitObject(item, indent + 1).trimEnd();
                const innerLines = inner.split('\n');
                const firstStripped = innerLines[0].slice((indent + 1) * 2);
                lines.push(`${pad}- ${firstStripped}`);
                for (let i = 1; i < innerLines.length; i++)
                    lines.push(innerLines[i]);
            }
        }
        else {
            lines.push(`${pad}- ${quoteIfNeeded(String(item))}`);
        }
    }
    return lines.join('\n') + '\n';
}
const PLAIN_KEY = /^[A-Za-z_][A-Za-z0-9_./-]*$/;
function quoteKey(key) {
    if (PLAIN_KEY.test(key))
        return key;
    return quote(key);
}
function quoteIfNeeded(s) {
    if (s === '')
        return '""';
    if (needsQuoting(s))
        return quote(s);
    return s;
}
function needsQuoting(s) {
    if (/^\s|\s$/.test(s))
        return true;
    if (/[:#&*!|>'"%@`,\[\]{}]/.test(s))
        return true;
    if (s.includes('\n') || s.includes('\t'))
        return true;
    if (/^[-?]/.test(s))
        return true;
    if (/^(true|false|null|yes|no|on|off|~)$/i.test(s))
        return true;
    if (/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(s))
        return true;
    return false;
}
function quote(s) {
    const escaped = s
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
    return `"${escaped}"`;
}
//# sourceMappingURL=yaml.js.map