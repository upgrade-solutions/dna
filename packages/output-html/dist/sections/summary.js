"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSummary = renderSummary;
const util_1 = require("../util");
function renderSummary(dna, h, options = {}) {
    const op = dna.operational;
    if (!op)
        return null;
    const { resources, persons, groups, roles } = collectNouns(op.domain);
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
    const parts = [(0, util_1.heading)(h, 'Summary')];
    if (op.domain.path) {
        parts.push(`<p><strong>Domain:</strong> ${(0, util_1.code)(op.domain.path)}</p>`);
    }
    if (counts.length) {
        const items = counts.map(([name, n]) => `<li>${(0, util_1.escape)(name)}: ${n}</li>`).join('');
        parts.push(`<p><strong>Primitive counts:</strong></p><ul>${items}</ul>`);
    }
    if (topLevel.length) {
        const tags = topLevel.map((n) => (0, util_1.code)(n)).join(', ');
        parts.push(`<p><strong>Top-level ${(0, util_1.escape)(lbl('Resources').toLowerCase())}:</strong> ${tags}</p>`);
    }
    return `<section>${parts.join('')}</section>`;
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