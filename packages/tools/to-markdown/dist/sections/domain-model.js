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
    const relsByFrom = groupBy(op.relationships ?? [], (r) => r.from);
    const lines = [`${(0, util_1.hashes)(h)} Domain Model`];
    for (const noun of nouns) {
        lines.push('', `${(0, util_1.hashes)(h + 1)} ${noun.name}`);
        if (noun.description)
            lines.push('', noun.description);
        if (noun.attributes?.length) {
            lines.push('', '| Attribute | Type | Required | Description |', '| --- | --- | --- | --- |');
            for (const attr of noun.attributes) {
                lines.push(`| \`${attr.name}\` | ${attr.type ?? '—'} | ${attr.required ? 'yes' : 'no'} | ${attr.description ?? ''} |`);
            }
        }
        if (noun.verbs?.length) {
            lines.push('', `**Verbs:** ${noun.verbs.map((v) => `\`${v.name}\``).join(', ')}`);
        }
        const rels = relsByFrom.get(noun.name) ?? [];
        if (rels.length) {
            lines.push('', '**Relationships:**');
            for (const r of rels) {
                lines.push(`- \`${r.name}\` — ${r.cardinality} → \`${r.to}\` (via \`${r.attribute}\`)`);
            }
        }
    }
    return lines.join('\n');
}
function collectNouns(domain) {
    const out = [...(domain.nouns ?? [])];
    for (const sub of domain.domains ?? [])
        out.push(...collectNouns(sub));
    return out;
}
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
//# sourceMappingURL=domain-model.js.map