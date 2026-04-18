"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFlowchart = renderFlowchart;
const util_1 = require("../util");
function renderFlowchart(dna, direction = 'TD') {
    const op = dna.operational;
    if (!op?.processes?.length)
        return null;
    const tasksByName = new Map();
    for (const t of op.tasks ?? [])
        tasksByName.set(t.name, t);
    const blocks = [];
    for (const proc of op.processes) {
        if (!proc.steps?.length)
            continue;
        const lines = [`flowchart ${direction}`];
        const subgraph = (0, util_1.mermaidId)(proc.name);
        lines.push(`    subgraph ${subgraph}["${(0, util_1.labelEscape)(proc.name)}"]`);
        for (const step of proc.steps) {
            const id = (0, util_1.mermaidId)(step.id);
            const task = tasksByName.get(step.task);
            const label = (0, util_1.labelEscape)(task?.capability ?? step.task);
            lines.push(`        ${id}["${label}"]`);
        }
        for (const step of proc.steps) {
            const to = (0, util_1.mermaidId)(step.id);
            for (const depId of step.depends_on ?? []) {
                const from = (0, util_1.mermaidId)(depId);
                const branch = step.branch?.when
                    ? `-- "${(0, util_1.labelEscape)(step.branch.when)}" -->`
                    : step.branch?.else
                        ? '-- "else" -->'
                        : '-->';
                lines.push(`        ${from} ${branch} ${to}`);
            }
        }
        lines.push('    end');
        blocks.push(lines.join('\n'));
    }
    return blocks.length ? blocks.join('\n\n') : null;
}
//# sourceMappingURL=flowchart.js.map