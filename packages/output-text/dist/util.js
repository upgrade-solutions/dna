"use strict";
/**
 * Formatting helpers for text output.
 * Keep format-specific escaping here rather than inline in section builders.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pascalToWords = pascalToWords;
exports.slugify = slugify;
exports.groupBy = groupBy;
exports.joinSections = joinSections;
/** Turn `LoanApplication` → `Loan Application`. Leaves all-caps acronyms alone. */
function pascalToWords(s) {
    return s
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .trim();
}
/** Lowercase kebab-case slug. `Loan.Apply` → `loan-apply`. */
function slugify(s) {
    return s
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^A-Za-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}
/** Group an array by a key function into a Map, preserving insertion order. */
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
/** Join string parts with blank lines, dropping null/empty ones. */
function joinSections(parts) {
    return parts.filter((p) => typeof p === 'string' && p.length > 0).join('\n\n');
}
//# sourceMappingURL=util.js.map