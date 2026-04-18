"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDomainModel = renderDomainModel;
const util_1 = require("../util");
function renderDomainModel(dna, h) {
    const op = dna.operational;
    if (!op)
        return null;
    const nouns = collectNouns(op.domain);
    if (!nouns.length)
        return null;
    const relsByFrom = (0, util_1.groupBy)(op.relationships ?? [], (r) => r.from);
    const parts = [(0, util_1.heading)(h, 'Domain Model')];
    for (const noun of nouns) {
        const inner = [(0, util_1.heading)(h + 1, (0, util_1.escape)(noun.name))];
        if (noun.description)
            inner.push(`<p>${(0, util_1.escape)(noun.description)}</p>`);
        if (noun.attributes?.length) {
            const rows = noun.attributes
                .map((a) => `<tr><td>${(0, util_1.code)(a.name)}</td><td>${(0, util_1.escape)(a.type ?? '—')}</td><td>${a.required ? 'yes' : 'no'}</td><td>${(0, util_1.escape)(a.description ?? '')}</td></tr>`)
                .join('');
            inner.push(`<table><thead><tr><th>Attribute</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>`);
        }
        if (noun.verbs?.length) {
            const tags = noun.verbs.map((v) => (0, util_1.code)(v.name)).join(', ');
            inner.push(`<p><strong>Verbs:</strong> ${tags}</p>`);
        }
        const rels = relsByFrom.get(noun.name) ?? [];
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
function collectNouns(domain) {
    const out = [...(domain.nouns ?? [])];
    for (const sub of domain.domains ?? [])
        out.push(...collectNouns(sub));
    return out;
}
//# sourceMappingURL=domain-model.js.map