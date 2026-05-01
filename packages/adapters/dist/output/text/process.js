"use strict";
/**
 * Render a single Process. Processes render in `product-dna` vocabulary
 * (Operation / Role / Steps) — the action-shaped styles don't fit a DAG.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTitle = processTitle;
exports.renderProcess = renderProcess;
function processTitle(p) {
    return p.name;
}
function renderProcess(p, op) {
    const parts = [];
    if (p.description)
        parts.push(p.description);
    parts.push(`**Operation:** \`${p.name}\``);
    if (p.operator)
        parts.push(`**Role:** \`${p.operator}\``);
    const tasksByName = new Map();
    for (const t of op.tasks ?? [])
        tasksByName.set(t.name, t);
    if (p.steps?.length) {
        const lines = ['**Steps:**'];
        for (const step of p.steps) {
            const task = tasksByName.get(step.task);
            const title = task
                ? `${task.name} — \`${task.actor}\` performs \`${task.operation}\``
                : step.task;
            const deps = step.depends_on?.length ? ` (after: ${step.depends_on.join(', ')})` : '';
            const conds = step.conditions?.length ? ` (when: ${step.conditions.join(' AND ')})` : '';
            const elseClause = step.else ? ` (else: ${step.else})` : '';
            lines.push(`- \`${step.id}\` ${title}${deps}${conds}${elseClause}`);
        }
        parts.push(lines.join('\n'));
    }
    return parts.join('\n\n');
}
//# sourceMappingURL=process.js.map