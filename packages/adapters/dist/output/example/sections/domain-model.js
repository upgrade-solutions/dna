"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDomainModel = renderDomainModel;
const util_1 = require("../util");
/**
 * Render an indented outline of Resources, their Attributes, and Actions.
 * Returns null when the operational layer is missing or has no Resources.
 */
function renderDomainModel(dna, headingLevel) {
    const op = dna.operational;
    if (!op)
        return null;
    const resources = (0, util_1.collectResources)(op.domain);
    if (!resources.length)
        return null;
    const lines = [`${(0, util_1.repeat)('#', headingLevel)} Domain model`, ''];
    for (const resource of resources) {
        lines.push(`- ${resource.name}`);
        for (const attr of resource.attributes ?? []) {
            const req = attr.required ? ' (required)' : '';
            lines.push(`  - ${attr.name}: ${attr.type}${req}`);
        }
        for (const action of resource.actions ?? []) {
            lines.push(`  - action: ${action.name}`);
        }
    }
    return lines.join('\n');
}
//# sourceMappingURL=domain-model.js.map