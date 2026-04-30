"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOperation = addOperation;
const shared_1 = require("./shared");
/**
 * Add an Operation to the DNA's top-level `operations`. Identity is by
 * `name` if provided, otherwise derived from `Target.Action`.
 */
function addOperation(dna, operation, opts) {
    return (0, shared_1.composeInto)(dna, operation, 'operations', 'operational/operation', opts);
}
//# sourceMappingURL=operation.js.map