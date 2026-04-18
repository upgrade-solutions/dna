"use strict";
/**
 * Render a single Noun. Nouns only render in `product-dna` style — the other
 * styles are action-shaped and don't fit an entity.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nounTitle = nounTitle;
exports.renderNoun = renderNoun;
const util_1 = require("./util");
function nounTitle(n) {
    return (0, util_1.pascalToWords)(n.name);
}
function renderNoun(n, op) {
    const parts = [];
    if (n.description)
        parts.push(n.description);
    parts.push(`**Resource:** \`${n.name}\``);
    if (n.attributes?.length) {
        const lines = ['**Fields:**'];
        for (const a of n.attributes) {
            const type = a.type ? `: ${a.type}` : '';
            const req = a.required ? ' (required)' : '';
            const desc = a.description ? ` — ${a.description}` : '';
            lines.push(`- \`${a.name}\`${type}${req}${desc}`);
        }
        parts.push(lines.join('\n'));
    }
    if (n.verbs?.length) {
        const lines = ['**Actions:**'];
        for (const v of n.verbs) {
            const desc = v.description ? ` — ${v.description}` : '';
            lines.push(`- \`${v.name}\`${desc}`);
        }
        parts.push(lines.join('\n'));
    }
    const related = (op.relationships ?? []).filter((r) => r.from === n.name || r.to === n.name);
    if (related.length) {
        const lines = ['**Relationships:**'];
        for (const r of related)
            lines.push(`- ${renderRelationship(r)}`);
        parts.push(lines.join('\n'));
    }
    return parts.join('\n\n');
}
function renderRelationship(r) {
    const desc = r.description ? ` — ${r.description}` : '';
    return `\`${r.from}\` ${r.cardinality} \`${r.to}\` via \`${r.attribute}\`${desc}`;
}
//# sourceMappingURL=noun.js.map