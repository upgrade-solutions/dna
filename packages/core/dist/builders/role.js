"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRole = addRole;
const shared_1 = require("./shared");
/**
 * Add a Role template to the DNA's `domain.roles`. Same-name composes via
 * merge rules.
 */
function addRole(dna, role, opts) {
    return (0, shared_1.composeInto)(dna, role, 'roles', 'operational/role', opts);
}
//# sourceMappingURL=role.js.map