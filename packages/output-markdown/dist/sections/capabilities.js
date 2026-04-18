"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCapabilities = renderCapabilities;
const util_1 = require("../util");
function renderCapabilities(dna, h) {
    const op = dna.operational;
    if (!op?.capabilities?.length)
        return null;
    const causesByCap = groupBy(op.causes ?? [], (c) => c.capability);
    const rulesByCap = groupBy(op.rules ?? [], (r) => r.capability);
    const outcomesByCap = groupBy(op.outcomes ?? [], (o) => o.capability);
    const signalsByCap = groupBy(op.signals ?? [], (s) => s.capability);
    const lines = [`${(0, util_1.hashes)(h)} Capabilities`];
    for (const cap of op.capabilities) {
        lines.push('', `${(0, util_1.hashes)(h + 1)} ${cap.name}`);
        if (cap.description)
            lines.push('', cap.description);
        const causes = causesByCap.get(cap.name) ?? [];
        if (causes.length) {
            lines.push('', '**Triggered by:**');
            for (const c of causes) {
                const signal = c.signal ? ` — signal \`${c.signal}\`` : '';
                const desc = c.description ? ` (${c.description})` : '';
                lines.push(`- ${c.source}${signal}${desc}`);
            }
        }
        const rules = rulesByCap.get(cap.name) ?? [];
        if (rules.length) {
            lines.push('', '**Rules:**');
            for (const r of rules)
                lines.push(`- ${renderRule(r)}`);
        }
        const outcomes = outcomesByCap.get(cap.name) ?? [];
        if (outcomes.length) {
            lines.push('', '**Outcomes:**');
            for (const o of outcomes) {
                if (o.description)
                    lines.push(`- ${o.description}`);
                for (const c of o.changes ?? []) {
                    const set = c.set === undefined ? '' : ` → \`${JSON.stringify(c.set)}\``;
                    lines.push(`- Sets \`${c.attribute}\`${set}`);
                }
                for (const next of o.initiate ?? [])
                    lines.push(`- Initiates \`${next}\``);
                for (const sig of o.emits ?? [])
                    lines.push(`- Emits \`${sig}\``);
            }
        }
        const signals = signalsByCap.get(cap.name) ?? [];
        if (signals.length) {
            lines.push('', '**Signals published:**');
            for (const s of signals) {
                lines.push(`- \`${s.name}\`${s.description ? ` — ${s.description}` : ''}`);
                if (s.payload?.length) {
                    for (const field of s.payload) {
                        const req = field.required ? ' (required)' : '';
                        lines.push(`  - \`${field.name}\`: ${field.type}${req}`);
                    }
                }
            }
        }
    }
    return lines.join('\n');
}
function renderRule(r) {
    if (r.type === 'access')
        return `*Access:* ${renderAllow(r.allow ?? [])}`;
    if (r.type === 'condition')
        return `*Condition:* ${r.condition ?? r.description ?? '—'}`;
    return r.description ?? r.name ?? '—';
}
function renderAllow(allow) {
    if (!allow.length)
        return '—';
    return allow
        .map((a) => {
        const parts = [];
        if (a.role)
            parts.push(`role \`${a.role}\``);
        if (a.ownership)
            parts.push(`ownership \`${a.ownership}\``);
        if (a.flags?.length)
            parts.push(`flags \`[${a.flags.join(', ')}]\``);
        return parts.join(' + ') || '—';
    })
        .join(' OR ');
}
function groupBy(arr, key) {
    const out = new Map();
    for (const x of arr) {
        const k = key(x);
        if (!out.has(k))
            out.set(k, []);
        out.get(k).push(x);
    }
    return out;
}
//# sourceMappingURL=capabilities.js.map