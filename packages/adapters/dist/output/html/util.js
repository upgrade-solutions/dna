"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escape = escape;
exports.heading = heading;
exports.code = code;
exports.label = label;
exports.groupBy = groupBy;
function escape(s) {
    if (s == null)
        return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function heading(level, content) {
    const h = Math.max(1, Math.min(6, level));
    return `<h${h}>${content}</h${h}>`;
}
function code(s) {
    return `<code>${escape(s)}</code>`;
}
/**
 * Apply a rename map to a canonical primitive label. Returns the renamed
 * string when present, otherwise the canonical label unchanged.
 *
 * Rename keys match the rendered LABEL exactly — typically the plural form
 * the renderer would emit (`Resources`, `Persons`, `Roles`). Companies that
 * prefer their own vocabulary supply `{ Roles: 'Positions', Persons: 'Individuals' }`.
 */
function label(canonical, rename) {
    return rename?.[canonical] ?? canonical;
}
function groupBy(arr, key) {
    const out = new Map();
    for (const x of arr) {
        const k = key(x);
        if (!out.has(k))
            out.set(k, []);
        out.get(k).push(x);
    }
    return out;
}
//# sourceMappingURL=util.js.map