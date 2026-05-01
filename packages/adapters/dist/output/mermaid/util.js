"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectResources = collectResources;
exports.mermaidId = mermaidId;
exports.labelEscape = labelEscape;
function collectResources(domain) {
    const out = [...(domain.resources ?? [])];
    for (const sub of domain.domains ?? [])
        out.push(...collectResources(sub));
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