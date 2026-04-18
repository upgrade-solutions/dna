"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDomainModel = renderDomainModel;
const util_1 = require("../util");
/**
 * Render an indented outline of Nouns, their Attributes, and Verbs.
 * Returns null when the operational layer is missing or has no Nouns.
 */
function renderDomainModel(dna, headingLevel) {
    const op = dna.operational;
    if (!op)
        return null;
    const nouns = (0, util_1.collectNouns)(op.domain);
    if (!nouns.length)
        return null;
    const lines = [`${(0, util_1.repeat)('#', headingLevel)} Domain model`, ''];
    for (const noun of nouns) {
        lines.push(`- ${noun.name}`);
        for (const attr of noun.attributes ?? []) {
            const req = attr.required ? ' (required)' : '';
            lines.push(`  - ${attr.name}: ${attr.type}${req}`);
        }
        for (const verb of noun.verbs ?? []) {
            lines.push(`  - verb: ${verb.name}`);
        }
    }
    return lines.join('\n');
}
//# sourceMappingURL=domain-model.js.map