"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSummary = renderSummary;
const util_1 = require("../util");
function renderSummary(dna, h) {
    const op = dna.operational;
    if (!op)
        return null;
    const allNouns = collectNouns(op.domain);
    const topLevel = (op.domain.nouns ?? []).map((n) => n.name);
    const rawCounts = [
        ['Nouns', allNouns.length],
        ['Capabilities', op.capabilities?.length ?? 0],
        ['Rules', op.rules?.length ?? 0],
        ['Outcomes', op.outcomes?.length ?? 0],
        ['Signals', op.signals?.length ?? 0],
        ['Equations', op.equations?.length ?? 0],
        ['Relationships', op.relationships?.length ?? 0],
        ['Positions', op.positions?.length ?? 0],
        ['Tasks', op.tasks?.length ?? 0],
        ['Processes', op.processes?.length ?? 0],
    ];
    const counts = rawCounts.filter(([, n]) => n > 0);
    const lines = [`${(0, util_1.hashes)(h)} Summary`, ''];
    if (op.domain.path)
        lines.push(`**Domain:** \`${op.domain.path}\``, '');
    if (counts.length) {
        lines.push('**Primitive counts:**', '');
        for (const [label, n] of counts)
            lines.push(`- ${label}: ${n}`);
    }
    if (topLevel.length) {
        lines.push('', `**Top-level nouns:** ${topLevel.map((n) => `\`${n}\``).join(', ')}`);
    }
    return lines.join('\n');
}
function collectNouns(domain) {
    const out = [...(domain.nouns ?? [])];
    for (const sub of domain.domains ?? [])
        out.push(...collectNouns(sub));
    return out;
}
//# sourceMappingURL=summary.js.map