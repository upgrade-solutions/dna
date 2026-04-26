"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderProcessFlow = renderProcessFlow;
const util_1 = require("../util");
function renderProcessFlow(dna, h) {
    const op = dna.operational;
    if (!op?.processes?.length)
        return null;
    const parts = [(0, util_1.heading)(h, 'Process Flows')];
    for (const proc of op.processes) {
        const inner = [(0, util_1.heading)(h + 1, (0, util_1.escape)(proc.name))];
        const lines = [];
        const steps = proc.steps ?? [];
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const taskName = step.task;
            const conds = step.conditions?.length ? ` [when: ${step.conditions.join(' AND ')}]` : '';
            const elseClause = step.else ? ` [else: ${step.else}]` : '';
            const deps = step.depends_on?.length ? ` ← ${step.depends_on.join(', ')}` : '';
            const prefix = i === steps.length - 1 ? '└── ' : '├── ';
            lines.push((0, util_1.escape)(`${prefix}${step.id}: ${taskName}${conds}${elseClause}${deps}`));
        }
        inner.push(`<pre><code>${lines.join('\n')}</code></pre>`);
        parts.push(`<section>${inner.join('')}</section>`);
    }
    return `<section>${parts.join('')}</section>`;
}
//# sourceMappingURL=process-flow.js.map