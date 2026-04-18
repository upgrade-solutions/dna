"use strict";
/**
 * Render a single Capability as prose, styled three ways:
 *
 *   - user-story   As a / I want / So that + triggers + acceptance criteria
 *   - gherkin      Feature / Scenario / Given / When / Then
 *   - product-dna  Actor / Resource / Action / Trigger / Preconditions / Postconditions
 *
 * Each helper returns the body only; the title is stable across styles and
 * produced by `capabilityTitle`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.capabilityTitle = capabilityTitle;
exports.renderCapability = renderCapability;
const util_1 = require("./util");
function capabilityTitle(cap) {
    return `${(0, util_1.pascalToWords)(cap.verb)} ${(0, util_1.pascalToWords)(cap.noun)}`.trim();
}
function renderCapability(cap, op, style) {
    if (style === 'gherkin')
        return renderGherkin(cap, op);
    if (style === 'product-dna')
        return renderProductDna(cap, op);
    return renderUserStory(cap, op);
}
// ---------------------------------------------------------------------------
// user-story
// ---------------------------------------------------------------------------
function renderUserStory(cap, op) {
    const { rules, causes, outcomes, roles } = collect(cap, op);
    const parts = [];
    if (cap.description)
        parts.push(cap.description);
    const role = roles[0] ?? 'user';
    const verb = (0, util_1.pascalToWords)(cap.verb).toLowerCase();
    const noun = (0, util_1.pascalToWords)(cap.noun).toLowerCase();
    parts.push(`**As a** ${role}\n**I want to** ${verb} a ${noun}\n**So that** the business outcome of \`${cap.name}\` is achieved.`);
    const triggers = renderTriggerList(causes);
    if (triggers)
        parts.push(`**Triggered by:**\n${triggers}`);
    const criteria = renderCriteriaList(rules, outcomes);
    if (criteria)
        parts.push(`**Acceptance criteria:**\n${criteria}`);
    return parts.join('\n\n');
}
// ---------------------------------------------------------------------------
// gherkin
// ---------------------------------------------------------------------------
function renderGherkin(cap, op) {
    const { rules, causes, outcomes, roles } = collect(cap, op);
    const actor = roles[0] ?? 'user';
    const verb = (0, util_1.pascalToWords)(cap.verb).toLowerCase();
    const noun = (0, util_1.pascalToWords)(cap.noun).toLowerCase();
    const lines = [];
    lines.push(`Feature: ${capabilityTitle(cap)}`);
    if (cap.description)
        lines.push(`  ${cap.description}`);
    lines.push('');
    lines.push(`  Scenario: ${actor} ${verb}s a ${noun}`);
    const conditionRules = rules.filter((r) => r.type === 'condition');
    if (causes.length || conditionRules.length || roles.length) {
        const givens = [];
        if (roles.length)
            givens.push(`an actor with role \`${roles.join('`, `')}\``);
        for (const c of causes) {
            if (c.source === 'schedule')
                givens.push('a scheduled trigger fires');
            else if (c.source === 'webhook')
                givens.push('an inbound webhook is received');
            else if (c.source === 'capability')
                givens.push(`capability \`${c.signal ?? 'previous'}\` has completed`);
        }
        for (const r of conditionRules)
            givens.push(conditionPhrase(r));
        for (let i = 0; i < givens.length; i++) {
            lines.push(`    ${i === 0 ? 'Given' : 'And'} ${givens[i]}`);
        }
    }
    lines.push(`    When they ${verb} the ${noun}`);
    const thens = outcomeLines(outcomes);
    if (thens.length === 0) {
        lines.push(`    Then the capability \`${cap.name}\` succeeds`);
    }
    else {
        for (let i = 0; i < thens.length; i++) {
            lines.push(`    ${i === 0 ? 'Then' : 'And'} ${thens[i]}`);
        }
    }
    return lines.join('\n');
}
// ---------------------------------------------------------------------------
// product-dna
// ---------------------------------------------------------------------------
function renderProductDna(cap, op) {
    const { rules, causes, outcomes, roles } = collect(cap, op);
    const parts = [];
    if (cap.description)
        parts.push(cap.description);
    const kv = [];
    kv.push(`**Resource:** \`${cap.noun}\``);
    kv.push(`**Action:** \`${cap.verb}\``);
    if (roles.length)
        kv.push(`**Actor:** ${roles.map((r) => `\`${r}\``).join(', ')}`);
    if (causes.length)
        kv.push(`**Trigger:** ${causes.map((c) => c.source).join(', ')}`);
    parts.push(kv.join('\n'));
    const preconditions = rules
        .filter((r) => r.type === 'condition')
        .map((r) => `- ${conditionPhrase(r)}`);
    if (preconditions.length)
        parts.push(`**Preconditions:**\n${preconditions.join('\n')}`);
    const postconditions = outcomeLines(outcomes).map((l) => `- ${l}`);
    if (postconditions.length)
        parts.push(`**Postconditions:**\n${postconditions.join('\n')}`);
    return parts.join('\n\n');
}
// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function collect(cap, op) {
    const rules = (0, util_1.groupBy)(op.rules ?? [], (r) => r.capability).get(cap.name) ?? [];
    const causes = (0, util_1.groupBy)(op.causes ?? [], (c) => c.capability).get(cap.name) ?? [];
    const outcomes = (0, util_1.groupBy)(op.outcomes ?? [], (o) => o.capability).get(cap.name) ?? [];
    const roles = [];
    for (const r of rules) {
        if (r.type !== 'access')
            continue;
        for (const a of r.allow ?? [])
            if (a.role && !roles.includes(a.role))
                roles.push(a.role);
    }
    return { rules, causes, outcomes, roles };
}
function renderTriggerList(causes) {
    if (!causes.length)
        return null;
    return causes
        .map((c) => {
        const signal = c.signal ? ` — signal \`${c.signal}\`` : '';
        const desc = c.description ? ` (${c.description})` : '';
        return `- ${c.source}${signal}${desc}`;
    })
        .join('\n');
}
function renderCriteriaList(rules, outcomes) {
    const lines = [];
    for (const r of rules) {
        if (r.type === 'condition')
            lines.push(`- Only when ${r.condition ?? r.description ?? 'condition is met'}`);
        else if (r.type === 'access') {
            const allowed = renderAllow(r.allow ?? []);
            if (allowed)
                lines.push(`- Restricted to ${allowed}`);
        }
        else if (r.description)
            lines.push(`- ${r.description}`);
    }
    lines.push(...outcomeLines(outcomes).map((l) => `- ${l}`));
    return lines.length ? lines.join('\n') : null;
}
function outcomeLines(outcomes) {
    const lines = [];
    for (const o of outcomes) {
        if (o.description)
            lines.push(o.description);
        for (const c of o.changes ?? []) {
            const set = c.set === undefined ? '' : ` to \`${JSON.stringify(c.set)}\``;
            lines.push(`Sets \`${c.attribute}\`${set}`);
        }
        for (const next of o.initiate ?? [])
            lines.push(`Initiates \`${next}\``);
        for (const sig of o.emits ?? [])
            lines.push(`Emits \`${sig}\``);
    }
    return lines;
}
function conditionPhrase(r) {
    return r.condition ?? r.description ?? 'a condition is met';
}
function renderAllow(allow) {
    if (!allow.length)
        return '';
    return allow
        .map((a) => {
        const parts = [];
        if (a.role)
            parts.push(`role \`${a.role}\``);
        if (a.ownership)
            parts.push(`ownership \`${a.ownership}\``);
        if (a.flags?.length)
            parts.push(`flags \`[${a.flags.join(', ')}]\``);
        return parts.join(' + ');
    })
        .filter(Boolean)
        .join(' or ');
}
//# sourceMappingURL=capability.js.map