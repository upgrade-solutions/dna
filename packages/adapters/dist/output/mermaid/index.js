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
exports.DEFAULT_DIAGRAMS = void 0;
exports.render = render;
const erd_1 = require("./diagrams/erd");
const flowchart_1 = require("./diagrams/flowchart");
exports.DEFAULT_DIAGRAMS = ['erd', 'flowchart'];
/**
 * Returns raw Mermaid source. Multiple diagrams are concatenated with blank
 * lines between blocks; no code-fence wrapping (callers can add ``` markers
 * if embedding in markdown).
 */
function render(dna, options = {}) {
    const diagrams = options.diagrams ?? exports.DEFAULT_DIAGRAMS;
    const blocks = [];
    for (const diagram of diagrams) {
        const rendered = renderDiagram(diagram, dna, options);
        if (rendered)
            blocks.push(rendered);
    }
    return blocks.length ? blocks.join('\n\n') + '\n' : '';
}
function renderDiagram(diagram, dna, options) {
    switch (diagram) {
        case 'erd':
            return (0, erd_1.renderErd)(dna);
        case 'flowchart':
            return (0, flowchart_1.renderFlowchart)(dna, options.flowchartDirection);
    }
}
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map