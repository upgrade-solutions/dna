"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDomainModel = renderDomainModel;
const util_1 = require("../util");
function renderDomainModel(dna, h) {
    const op = dna.operational;
    if (!op)
        return null;
    const resources = collectResources(op.domain);
    if (!resources.length)
        return null;
    const relsByFrom = (0, util_1.groupBy)(op.relationships ?? [], (r) => r.from);
    const parts = [(0, util_1.heading)(h, 'Domain Model')];
    for (const resource of resources) {
        const inner = [(0, util_1.heading)(h + 1, (0, util_1.escape)(resource.name))];
        if (resource.description)
            inner.push(`<p>${(0, util_1.escape)(resource.description)}</p>`);
        if (resource.attributes?.length) {
            const rows = resource.attributes
                .map((a) => `<tr><td>${(0, util_1.code)(a.name)}</td><td>${(0, util_1.escape)(a.type ?? '—')}</td><td>${a.required ? 'yes' : 'no'}</td><td>${(0, util_1.escape)(a.description ?? '')}</td></tr>`)
                .join('');
            inner.push(`<table><thead><tr><th>Attribute</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>`);
        }
        if (resource.actions?.length) {
            const tags = resource.actions.map((a) => (0, util_1.code)(a.name)).join(', ');
            inner.push(`<p><strong>Actions:</strong> ${tags}</p>`);
        }
        const rels = relsByFrom.get(resource.name) ?? [];
        if (rels.length) {
            const items = rels
                .map((r) => `<li>${(0, util_1.code)(r.name)} — ${(0, util_1.escape)(r.cardinality)} → ${(0, util_1.code)(r.to)} (via ${(0, util_1.code)(r.attribute)})</li>`)
                .join('');
            inner.push(`<p><strong>Relationships:</strong></p><ul>${items}</ul>`);
        }
        parts.push(`<section>${inner.join('')}</section>`);
    }
    return `<section>${parts.join('')}</section>`;
}
function collectResources(domain) {
    const out = [...(domain.resources ?? [])];
    for (const sub of domain.domains ?? [])
        out.push(...collectResources(sub));
    return out;
}
//# sourceMappingURL=domain-model.js.map