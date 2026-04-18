"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSops = renderSops;
const util_1 = require("../util");
function renderSops(dna, h) {
    const op = dna.operational;
    if (!op?.processes?.length)
        return null;
    const tasksByName = new Map();
    for (const t of op.tasks ?? [])
        tasksByName.set(t.name, t);
    const parts = [(0, util_1.heading)(h, 'SOPs')];
    for (const proc of op.processes) {
        const inner = [(0, util_1.heading)(h + 1, (0, util_1.escape)(proc.name))];
        if (proc.description)
            inner.push(`<p>${(0, util_1.escape)(proc.description)}</p>`);
        if (proc.operator) {
            inner.push(`<p><strong>Operator:</strong> ${(0, util_1.code)(proc.operator)}</p>`);
        }
        if (proc.steps?.length) {
            const items = proc.steps
                .map((step) => {
                const task = tasksByName.get(step.task);
                const position = task?.position ? (0, util_1.code)(task.position) : '—';
                const capability = task?.capability ? (0, util_1.code)(task.capability) : (0, util_1.code)(step.task);
                const branch = step.branch?.when
                    ? ` (when: ${(0, util_1.escape)(step.branch.when)})`
                    : step.branch?.else
                        ? ' (else)'
                        : '';
                const deps = step.depends_on?.length ? ` — after: ${step.depends_on.map(util_1.code).join(', ')}` : '';
                const desc = task?.description ? `<br/>${(0, util_1.escape)(task.description)}` : '';
                return `<li><strong>${(0, util_1.escape)(step.id)}</strong> — ${position} does ${capability}${branch}${deps}${desc}</li>`;
            })
                .join('');
            inner.push(`<ol>${items}</ol>`);
        }
        parts.push(`<section>${inner.join('')}</section>`);
    }
    return `<section>${parts.join('')}</section>`;
}
//# sourceMappingURL=sops.js.map