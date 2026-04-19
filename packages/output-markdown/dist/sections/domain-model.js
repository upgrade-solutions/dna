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
    const relsByFrom = groupBy(op.relationships ?? [], (r) => r.from);
    const lines = [`${(0, util_1.hashes)(h)} Domain Model`];
    for (const resource of resources) {
        lines.push('', `${(0, util_1.hashes)(h + 1)} ${resource.name}`);
        if (resource.description)
            lines.push('', resource.description);
        if (resource.attributes?.length) {
            lines.push('', '| Attribute | Type | Required | Description |', '| --- | --- | --- | --- |');
            for (const attr of resource.attributes) {
                lines.push(`| \`${attr.name}\` | ${attr.type ?? '—'} | ${attr.required ? 'yes' : 'no'} | ${attr.description ?? ''} |`);
            }
        }
        if (resource.actions?.length) {
            lines.push('', `**Actions:** ${resource.actions.map((a) => `\`${a.name}\``).join(', ')}`);
        }
        const rels = relsByFrom.get(resource.name) ?? [];
        if (rels.length) {
            lines.push('', '**Relationships:**');
            for (const r of rels) {
                lines.push(`- \`${r.name}\` — ${r.cardinality} → \`${r.to}\` (via \`${r.attribute}\`)`);
            }
        }
    }
    return lines.join('\n');
}
function collectResources(domain) {
    const out = [...(domain.resources ?? [])];
    for (const sub of domain.domains ?? [])
        out.push(...collectResources(sub));
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