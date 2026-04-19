"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectResources = collectResources;
exports.repeat = repeat;
exports.indent = indent;
/** Flatten a domain tree into a single list of Resources. */
function collectResources(domain) {
    const out = [...(domain.resources ?? [])];
    for (const sub of domain.domains ?? [])
        out.push(...collectResources(sub));
    return out;
}
/** Repeat a character n times, clamped to [min, max]. */
function repeat(ch, n, min = 1, max = 6) {
    return ch.repeat(Math.max(min, Math.min(max, n)));
}
/** Indent every line of a string by `spaces` spaces. */
function indent(s, spaces) {
    const pad = ' '.repeat(spaces);
    return s
        .split('\n')
        .map((line) => (line.length ? pad + line : line))
        .join('\n');
}
//# sourceMappingURL=util.js.map