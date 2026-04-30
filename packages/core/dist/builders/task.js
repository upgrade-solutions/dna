"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTask = addTask;
const shared_1 = require("./shared");
/**
 * Add a Task to the DNA's top-level `tasks`. Same-name composes via merge
 * rules.
 */
function addTask(dna, task, opts) {
    return (0, shared_1.composeInto)(dna, task, 'tasks', 'operational/task', opts);
}
//# sourceMappingURL=task.js.map