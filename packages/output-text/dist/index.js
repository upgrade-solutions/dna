"use strict";
/**
 * @dna-codes/output-text — render DNA as plain prose.
 *
 *   render(dna, options?)     → string                      // one combined document
 *   renderMany(dna, options?) → Array<{id, title, body}>    // one document per unit
 *
 * Both accept a `styles` map: `{ capability: 'user-story' | 'gherkin' | 'product-dna', ... }`.
 * The key set determines which unit types are emitted; the value picks the
 * body template. Default is `{ capability: 'user-story' }`.
 *
 * `user-story` and `gherkin` are action-shaped and only fit Capability — Noun
 * and Process always render as `product-dna` regardless of the style requested.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STYLES = void 0;
exports.render = render;
exports.renderMany = renderMany;
const capability_1 = require("./capability");
const noun_1 = require("./noun");
const process_1 = require("./process");
const types_1 = require("./types");
const util_1 = require("./util");
const UNIT_ORDER = ['capability', 'noun', 'process'];
function render(dna, options = {}) {
    const op = dna.operational;
    if (!op)
        return '';
    const styles = options.styles ?? types_1.DEFAULT_STYLES;
    const title = options.title ?? op.domain.path ?? op.domain.name;
    const intro = op.domain.description;
    const sections = [
        title ? `# ${title}` : null,
        intro ?? null,
    ];
    for (const unit of UNIT_ORDER) {
        if (!styles[unit])
            continue;
        sections.push(renderUnitSection(unit, styles[unit], op));
    }
    const body = (0, util_1.joinSections)(sections);
    return body ? `${body}\n` : '';
}
function renderMany(dna, options = {}) {
    const styles = options.styles ?? types_1.DEFAULT_STYLES;
    const op = dna.operational;
    if (!op)
        return [];
    const docs = [];
    for (const unit of UNIT_ORDER) {
        const style = styles[unit];
        if (!style)
            continue;
        docs.push(...unitDocs(unit, style, op));
    }
    return docs;
}
function unitDocs(unit, style, op) {
    switch (unit) {
        case 'capability':
            return (op.capabilities ?? []).map((c) => capabilityDoc(c, op, style));
        case 'noun':
            return collectNouns(op.domain).map((n) => nounDoc(n, op));
        case 'process':
            return (op.processes ?? []).map((p) => processDoc(p, op));
    }
}
function capabilityDoc(cap, op, style) {
    return {
        id: `capability-${(0, util_1.slugify)(cap.name)}`,
        title: (0, capability_1.capabilityTitle)(cap),
        body: (0, capability_1.renderCapability)(cap, op, style),
    };
}
function nounDoc(n, op) {
    return {
        id: `noun-${(0, util_1.slugify)(n.name)}`,
        title: (0, noun_1.nounTitle)(n),
        body: (0, noun_1.renderNoun)(n, op),
    };
}
function processDoc(p, op) {
    return {
        id: `process-${(0, util_1.slugify)(p.name)}`,
        title: (0, process_1.processTitle)(p),
        body: (0, process_1.renderProcess)(p, op),
    };
}
function renderUnitSection(unit, style, op) {
    const docs = unitDocs(unit, style, op);
    if (!docs.length)
        return null;
    const heading = unitHeading(unit);
    const parts = [`## ${heading}`];
    for (const d of docs) {
        parts.push(`### ${d.title}`);
        if (d.body)
            parts.push(d.body);
    }
    return parts.join('\n\n');
}
function unitHeading(unit) {
    if (unit === 'capability')
        return 'Capabilities';
    if (unit === 'noun')
        return 'Domain model';
    return 'Processes';
}
function collectNouns(domain) {
    const out = [...(domain.nouns ?? [])];
    for (const sub of domain.domains ?? [])
        out.push(...collectNouns(sub));
    return out;
}
var types_2 = require("./types");
Object.defineProperty(exports, "DEFAULT_STYLES", { enumerable: true, get: function () { return types_2.DEFAULT_STYLES; } });
//# sourceMappingURL=index.js.map