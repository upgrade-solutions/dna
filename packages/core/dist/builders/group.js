"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGroup = addGroup;
const shared_1 = require("./shared");
/**
 * Add a Group template to the DNA's `domain.groups`. Same-name composes via
 * merge rules.
 */
function addGroup(dna, group, opts) {
    return (0, shared_1.composeInto)(dna, group, 'groups', 'operational/group', opts);
}
//# sourceMappingURL=group.js.map