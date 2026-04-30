"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMembership = addMembership;
const shared_1 = require("./shared");
/**
 * Add a Membership to the DNA's top-level `memberships`. Same-name composes
 * via merge rules.
 */
function addMembership(dna, membership, opts) {
    return (0, shared_1.composeInto)(dna, membership, 'memberships', 'operational/membership', opts);
}
//# sourceMappingURL=membership.js.map