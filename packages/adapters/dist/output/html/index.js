"use strict";
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
const summary_1 = require("./sections/summary");
const domain_model_1 = require("./sections/domain-model");
const operations_1 = require("./sections/operations");
const sops_1 = require("./sections/sops");
const process_flow_1 = require("./sections/process-flow");
const util_1 = require("./util");
exports.DEFAULT_SECTIONS = [
    'summary',
    'domain-model',
    'operations',
    'sops',
    'process-flow',
];
function render(dna, options = {}) {
    const sections = options.sections ?? exports.DEFAULT_SECTIONS;
    const level = options.headingLevel ?? 1;
    const title = options.title ?? inferTitle(dna);
    const parts = [];
    if (title)
        parts.push((0, util_1.heading)(level, (0, util_1.escape)(title)));
    const intro = dna.operational?.domain.description;
    if (intro)
        parts.push(`<p>${(0, util_1.escape)(intro)}</p>`);
    for (const section of sections) {
        const rendered = renderSection(section, dna, level + 1, options);
        if (rendered)
            parts.push(rendered);
    }
    const body = parts.join('');
    if (!body)
        return '';
    if (options.standalone) {
        const pageTitle = title ?? 'DNA';
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${(0, util_1.escape)(pageTitle)}</title></head><body>${body}</body></html>`;
    }
    return body;
}
function renderSection(section, dna, h, options) {
    switch (section) {
        case 'summary':
            return (0, summary_1.renderSummary)(dna, h, options);
        case 'domain-model':
            return (0, domain_model_1.renderDomainModel)(dna, h);
        case 'operations':
            return (0, operations_1.renderOperations)(dna, h);
        case 'sops':
            return (0, sops_1.renderSops)(dna, h);
        case 'process-flow':
            return (0, process_flow_1.renderProcessFlow)(dna, h);
    }
}
function inferTitle(dna) {
    const op = dna.operational;
    if (!op)
        return undefined;
    return op.domain.path ?? op.domain.name;
}
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map