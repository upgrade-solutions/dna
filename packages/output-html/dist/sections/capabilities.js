"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCapabilities = renderCapabilities;
const util_1 = require("../util");
function renderCapabilities(dna, h) {
    const op = dna.operational;
    if (!op?.capabilities?.length)
        return null;
    const causesByCap = (0, util_1.groupBy)(op.causes ?? [], (c) => c.capability);
    const rulesByCap = (0, util_1.groupBy)(op.rules ?? [], (r) => r.capability);
    const outcomesByCap = (0, util_1.groupBy)(op.outcomes ?? [], (o) => o.capability);
    const signalsByCap = (0, util_1.groupBy)(op.signals ?? [], (s) => s.capability);
    const parts = [(0, util_1.heading)(h, 'Capabilities')];
    for (const cap of op.capabilities) {
        const inner = [(0, util_1.heading)(h + 1, (0, util_1.escape)(cap.name))];
        if (cap.description)
            inner.push(`<p>${(0, util_1.escape)(cap.description)}</p>`);
        const causes = causesByCap.get(cap.name) ?? [];
        if (causes.length) {
            const items = causes
                .map((c) => {
                const signal = c.signal ? ` — signal ${(0, util_1.code)(c.signal)}` : '';
                const desc = c.description ? ` (${(0, util_1.escape)(c.description)})` : '';
                return `<li>${(0, util_1.escape)(c.source)}${signal}${desc}</li>`;
            })
                .join('');
            inner.push(`<p><strong>Triggered by:</strong></p><ul>${items}</ul>`);
        }
        const rules = rulesByCap.get(cap.name) ?? [];
        if (rules.length) {
            const items = rules.map((r) => `<li>${renderRule(r)}</li>`).join('');
            inner.push(`<p><strong>Rules:</strong></p><ul>${items}</ul>`);
        }
        const outcomes = outcomesByCap.get(cap.name) ?? [];
        if (outcomes.length) {
            const lines = [];
            for (const o of outcomes) {
                if (o.description)
                    lines.push(`<li>${(0, util_1.escape)(o.description)}</li>`);
                for (const c of o.changes ?? []) {
                    const set = c.set === undefined ? '' : ` → ${(0, util_1.code)(JSON.stringify(c.set))}`;
                    lines.push(`<li>Sets ${(0, util_1.code)(c.attribute)}${set}</li>`);
                }
                for (const next of o.initiate ?? [])
                    lines.push(`<li>Initiates ${(0, util_1.code)(next)}</li>`);
                for (const sig of o.emits ?? [])
                    lines.push(`<li>Emits ${(0, util_1.code)(sig)}</li>`);
            }
            inner.push(`<p><strong>Outcomes:</strong></p><ul>${lines.join('')}</ul>`);
        }
        const signals = signalsByCap.get(cap.name) ?? [];
        if (signals.length) {
            const items = [];
            for (const s of signals) {
                const desc = s.description ? ` — ${(0, util_1.escape)(s.description)}` : '';
                let line = `<li>${(0, util_1.code)(s.name)}${desc}`;
                if (s.payload?.length) {
                    const fields = s.payload
                        .map((f) => {
                        const req = f.required ? ' (required)' : '';
                        return `<li>${(0, util_1.code)(f.name)}: ${(0, util_1.escape)(f.type)}${req}</li>`;
                    })
                        .join('');
                    line += `<ul>${fields}</ul>`;
                }
                line += '</li>';
                items.push(line);
            }
            inner.push(`<p><strong>Signals published:</strong></p><ul>${items.join('')}</ul>`);
        }
        parts.push(`<section>${inner.join('')}</section>`);
    }
    return `<section>${parts.join('')}</section>`;
}
function renderRule(r) {
    if (r.type === 'access')
        return `<em>Access:</em> ${renderAllow(r.allow ?? [])}`;
    if (r.type === 'condition')
        return `<em>Condition:</em> ${(0, util_1.escape)(r.condition ?? r.description ?? '—')}`;
    return (0, util_1.escape)(r.description ?? r.name ?? '—');
}
function renderAllow(allow) {
    if (!allow.length)
        return '—';
    return allow
        .map((a) => {
        const parts = [];
        if (a.role)
            parts.push(`role ${(0, util_1.code)(a.role)}`);
        if (a.ownership)
            parts.push(`ownership ${(0, util_1.code)(a.ownership)}`);
        if (a.flags?.length)
            parts.push(`flags ${(0, util_1.code)(`[${a.flags.join(', ')}]`)}`);
        return parts.join(' + ') || '—';
    })
        .join(' OR ');
}
//# sourceMappingURL=capabilities.js.map