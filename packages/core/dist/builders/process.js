"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProcess = addProcess;
const shared_1 = require("./shared");
/**
 * Add a Process to the DNA's top-level `processes`. Same-name composes via
 * merge rules; `steps[]` union by `id`.
 */
function addProcess(dna, process, opts) {
    return (0, shared_1.composeInto)(dna, process, 'processes', 'operational/process', opts);
}
//# sourceMappingURL=process.js.map