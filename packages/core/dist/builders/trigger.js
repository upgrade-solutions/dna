"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTrigger = addTrigger;
const shared_1 = require("./shared");
/**
 * Add a Trigger to the DNA's top-level `triggers`. Triggers have no `name`;
 * identity is derived from `(operation || process)` plus `source` and
 * `after`.
 */
function addTrigger(dna, trigger, opts) {
    return (0, shared_1.composeInto)(dna, trigger, 'triggers', 'operational/trigger', opts);
}
//# sourceMappingURL=trigger.js.map