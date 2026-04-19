"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSummary = renderSummary;
const util_1 = require("../util");
/**
 * Render a brief, counts-only summary of the DNA. Returns null when there's
 * nothing to summarize so the top-level `render()` can skip empty sections.
 */
function renderSummary(dna, headingLevel) {
    const op = dna.operational;
    if (!op)
        return null;
    const resources = (0, util_1.collectResources)(op.domain);
    const raw = [
        ['Resources', resources.length],
        ['Capabilities', op.capabilities?.length ?? 0],
        ['Relationships', op.relationships?.length ?? 0],
    ];
    const counts = raw.filter(([, n]) => n > 0);
    if (!counts.length)
        return null;
    const lines = [`${(0, util_1.repeat)('#', headingLevel)} Summary`, ''];
    if (op.domain.path)
        lines.push(`Domain: ${op.domain.path}`, '');
    for (const [label, n] of counts)
        lines.push(`- ${label}: ${n}`);
    return lines.join('\n');
}
//# sourceMappingURL=summary.js.map