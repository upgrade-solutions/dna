"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderProcessFlow = renderProcessFlow;
const util_1 = require("../util");
function renderProcessFlow(dna, h) {
    const op = dna.operational;
    if (!op?.processes?.length)
        return null;
    const lines = [`${(0, util_1.hashes)(h)} Process Flows`];
    for (const proc of op.processes) {
        lines.push('', `${(0, util_1.hashes)(h + 1)} ${proc.name}`);
        const steps = proc.steps ?? [];
        if (steps.length) {
            lines.push('', '```', ...renderSteps(steps), '```');
        }
    }
    return lines.join('\n');
}
/**
 * Outline-style ASCII rendering of a process DAG.
 *
 * Each step prints on one line with a tree-branch prefix, its id + task,
 * any branch marker, and arrow-back references to its depends_on. Concurrent
 * or converging arms render correctly because each step declares its own
 * dependencies — no layout algebra needed.
 */
function renderSteps(steps) {
    return steps.map((step, i) => {
        const last = i === steps.length - 1;
        const prefix = last ? '└── ' : '├── ';
        const conds = step.conditions?.length ? ` [when: ${step.conditions.join(' AND ')}]` : '';
        const elseClause = step.else ? ` [else: ${step.else}]` : '';
        const deps = step.depends_on?.length ? ` ← ${step.depends_on.join(', ')}` : '';
        return `${prefix}${step.id}: ${step.task}${conds}${elseClause}${deps}`;
    });
}
//# sourceMappingURL=process-flow.js.map