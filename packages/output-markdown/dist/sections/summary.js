"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSummary = renderSummary;
const util_1 = require("../util");
function renderSummary(dna, h, options = {}) {
    const op = dna.operational;
    if (!op)
        return null;
    const { resources, persons, roles, groups } = collectNouns(op.domain);
    const topLevel = (op.domain.resources ?? []).map((r) => r.name);
    const lbl = (canonical) => (0, util_1.label)(canonical, options.rename);
    const rawCounts = [
        [lbl('Resources'), resources.length],
        [lbl('Persons'), persons.length],
        [lbl('Groups'), groups.length],
        [lbl('Roles'), roles.length],
        [lbl('Memberships'), op.memberships?.length ?? 0],
        [lbl('Operations'), op.operations?.length ?? 0],
        [lbl('Triggers'), op.triggers?.length ?? 0],
        [lbl('Rules'), op.rules?.length ?? 0],
        [lbl('Relationships'), op.relationships?.length ?? 0],
        [lbl('Tasks'), op.tasks?.length ?? 0],
        [lbl('Processes'), op.processes?.length ?? 0],
    ];
    const counts = rawCounts.filter(([, n]) => n > 0);
    const lines = [`${(0, util_1.hashes)(h)} Summary`, ''];
    if (op.domain.path)
        lines.push(`**Domain:** \`${op.domain.path}\``, '');
    if (counts.length) {
        lines.push('**Primitive counts:**', '');
        for (const [name, n] of counts)
            lines.push(`- ${name}: ${n}`);
    }
    if (topLevel.length) {
        lines.push('', `**Top-level ${lbl('Resources').toLowerCase()}:** ${topLevel.map((r) => `\`${r}\``).join(', ')}`);
    }
    return lines.join('\n');
}
function collectNouns(domain) {
    const out = { resources: [], persons: [], groups: [], roles: [] };
    const walk = (d) => {
        for (const r of d.resources ?? [])
            out.resources.push(r);
        for (const p of d.persons ?? [])
            out.persons.push(p);
        for (const g of d.groups ?? [])
            out.groups.push(g);
        for (const r of d.roles ?? [])
            out.roles.push(r);
        for (const sub of d.domains ?? [])
            walk(sub);
    };
    walk(domain);
    return out;
}
//# sourceMappingURL=summary.js.map