"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectNouns = collectNouns;
exports.mermaidId = mermaidId;
exports.labelEscape = labelEscape;
function collectNouns(domain) {
    const out = [...(domain.nouns ?? [])];
    for (const sub of domain.domains ?? [])
        out.push(...collectNouns(sub));
    return out;
}
/** Sanitize a DNA name for use as a mermaid identifier (no quotes / spaces). */
function mermaidId(s) {
    return s.replace(/[^A-Za-z0-9_]/g, '_');
}
/** Escape a string for use inside a mermaid node label (quotes become &quot;). */
function labelEscape(s) {
    return s.replace(/"/g, '&quot;');
}
//# sourceMappingURL=util.js.map