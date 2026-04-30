"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemeOf = schemeOf;
exports.integrationFor = integrationFor;
exports.adapterFor = adapterFor;
const file_integration_1 = require("./file-integration");
/**
 * Extract the URI scheme (`gdrive`, `notion`, `file`, ...) from a source
 * string. Returns `null` for bare paths.
 */
function schemeOf(uri) {
    const match = /^([a-z][a-z0-9+\-.]*):/i.exec(uri);
    return match ? match[1].toLowerCase() : null;
}
/**
 * Look up an Integration for a source URI. `file://` URIs and bare
 * filesystem paths return the built-in fs fetcher. Other schemes route to
 * `integrations[<scheme>]`. Unknown scheme → `null` (caller surfaces a
 * non-fatal error).
 */
function integrationFor(uri, integrations, builtIn = (0, file_integration_1.fileIntegration)()) {
    const scheme = schemeOf(uri);
    if (scheme === null)
        return builtIn; // bare path
    if (scheme === 'file')
        return builtIn;
    return integrations[scheme] ?? null;
}
/**
 * Look up an InputAdapter for a MIME type. Glob match against the keys of
 * the `inputs` map: `*` is a wildcard within a MIME segment (`text/*`
 * matches `text/markdown`). More specific keys are preferred over
 * wildcards.
 *
 * Specificity score = number of non-`*` segments. With two MIME segments
 * (`type/subtype`), an exact match scores 2, `text/*` scores 1, `*\/*`
 * scores 0.
 */
function adapterFor(mimeType, inputs) {
    let best = null;
    for (const [key, adapter] of Object.entries(inputs)) {
        if (!matchesMimeGlob(key, mimeType))
            continue;
        const score = specificity(key);
        if (!best || score > best.score) {
            best = { key, adapter, score };
        }
    }
    return best ? { key: best.key, adapter: best.adapter } : null;
}
function matchesMimeGlob(glob, mimeType) {
    const globParts = glob.split('/');
    const mimeParts = mimeType.split('/');
    if (globParts.length !== mimeParts.length)
        return false;
    for (let i = 0; i < globParts.length; i++) {
        if (globParts[i] === '*')
            continue;
        if (globParts[i].toLowerCase() !== mimeParts[i].toLowerCase())
            return false;
    }
    return true;
}
function specificity(glob) {
    return glob.split('/').filter((p) => p !== '*').length;
}
//# sourceMappingURL=dispatch.js.map