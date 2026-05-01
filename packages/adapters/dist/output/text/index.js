"use strict";
/**
 * @dna-codes/dna-output-text — render DNA as plain prose.
 *
 *   render(dna, options?)     → string                      // one combined document
 *   renderMany(dna, options?) → Array<{id, title, body}>    // one document per unit
 *
 * Both accept a `styles` map: `{ operation: 'user-story' | 'gherkin' | 'product-dna', ... }`.
 * The key set determines which unit types are emitted; the value picks the
 * body template. Default is `{ operation: 'user-story' }`.
 *
 * `user-story` and `gherkin` are action-shaped and only fit Operation —
 * Resource and Process always render as `product-dna` regardless of the style
 * requested.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STYLES = void 0;
exports.render = render;
exports.renderMany = renderMany;
const operation_1 = require("./operation");
const resource_1 = require("./resource");
const process_1 = require("./process");
const types_1 = require("./types");
const util_1 = require("./util");
const UNIT_ORDER = ['operation', 'resource', 'process'];
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
        case 'operation':
            return (op.operations ?? []).map((o) => operationDoc(o, op, style));
        case 'resource':
            return collectResources(op.domain).map((r) => resourceDoc(r, op));
        case 'process':
            return (op.processes ?? []).map((p) => processDoc(p, op));
    }
}
function operationDoc(op, dna, style) {
    return {
        id: `operation-${(0, util_1.slugify)(op.name)}`,
        title: (0, operation_1.operationTitle)(op),
        body: (0, operation_1.renderOperation)(op, dna, style),
    };
}
function resourceDoc(r, op) {
    return {
        id: `resource-${(0, util_1.slugify)(r.name)}`,
        title: (0, resource_1.resourceTitle)(r),
        body: (0, resource_1.renderResource)(r, op),
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
    if (unit === 'operation')
        return 'Operations';
    if (unit === 'resource')
        return 'Domain model';
    return 'Processes';
}
function collectResources(domain) {
    const out = [...(domain.resources ?? [])];
    for (const sub of domain.domains ?? [])
        out.push(...collectResources(sub));
    return out;
}
var types_2 = require("./types");
Object.defineProperty(exports, "DEFAULT_STYLES", { enumerable: true, get: function () { return types_2.DEFAULT_STYLES; } });
//# sourceMappingURL=index.js.map