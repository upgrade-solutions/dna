"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderErd = renderErd;
const util_1 = require("../util");
function renderErd(dna) {
    const op = dna.operational;
    if (!op)
        return null;
    const resources = (0, util_1.collectResources)(op.domain);
    if (!resources.length)
        return null;
    const lines = ['erDiagram'];
    for (const resource of resources) {
        const id = (0, util_1.mermaidId)(resource.name);
        if (!resource.attributes?.length) {
            lines.push(`    ${id} {`);
            lines.push(`    }`);
            continue;
        }
        lines.push(`    ${id} {`);
        for (const attr of resource.attributes) {
            const type = (0, util_1.mermaidId)(attr.type ?? 'string');
            lines.push(`        ${type} ${(0, util_1.mermaidId)(attr.name)}`);
        }
        lines.push(`    }`);
    }
    for (const rel of op.relationships ?? []) {
        const from = (0, util_1.mermaidId)(rel.from);
        const to = (0, util_1.mermaidId)(rel.to);
        lines.push(`    ${from} ${cardinality(rel.cardinality)} ${to} : "${rel.name.replace(/"/g, '\\"')}"`);
    }
    return lines.join('\n');
}
function cardinality(c) {
    switch (c) {
        case 'one-to-one':
            return '||--||';
        case 'one-to-many':
            return '||--o{';
        case 'many-to-one':
            return '}o--||';
        case 'many-to-many':
            return '}o--o{';
        default:
            return '||--||';
    }
}
//# sourceMappingURL=erd.js.map