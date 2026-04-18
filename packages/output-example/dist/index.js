"use strict";
/**
 * @dna-codes/output-example — template output renderer.
 *
 * Public contract (shared across output-*):
 *
 *   render(dna: DnaInput, options?: RenderOptions): string
 *
 * - Sync, pure, zero I/O.
 * - Never throws on malformed / partial DNA — returns `''` when there's
 *   nothing to render.
 * - Never returns null. If a section produces nothing, it's dropped.
 * - Zero runtime dependencies. `@dna-codes/core` is a dev dep (for types)
 *   at most; don't import it at runtime.
 *
 * The demo renders DNA as plain-text markdown-lite. Fork the sections
 * and rewrite for your target format (HTML, Mermaid, PDF bytes, etc.).
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SECTIONS = void 0;
exports.render = render;
const domain_model_1 = require("./sections/domain-model");
const summary_1 = require("./sections/summary");
const util_1 = require("./util");
exports.DEFAULT_SECTIONS = ['summary', 'domain-model'];
function render(dna, options = {}) {
    const sections = options.sections ?? exports.DEFAULT_SECTIONS;
    const level = options.headingLevel ?? 1;
    const title = options.title ?? inferTitle(dna);
    const parts = [];
    if (title)
        parts.push(`${(0, util_1.repeat)('#', level)} ${title}`);
    const intro = dna.operational?.domain.description;
    if (intro)
        parts.push(intro);
    for (const section of sections) {
        const rendered = renderSection(section, dna, level + 1);
        if (rendered)
            parts.push(rendered);
    }
    return parts.length ? parts.join('\n\n') + '\n' : '';
}
function renderSection(section, dna, h) {
    switch (section) {
        case 'summary':
            return (0, summary_1.renderSummary)(dna, h);
        case 'domain-model':
            return (0, domain_model_1.renderDomainModel)(dna, h);
    }
}
function inferTitle(dna) {
    const d = dna.operational?.domain;
    return d?.path ?? d?.name;
}
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map