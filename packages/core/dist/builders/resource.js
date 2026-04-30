"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addResource = addResource;
const shared_1 = require("./shared");
/**
 * Add a Resource to the DNA's `domain.resources`.
 *
 * If a Resource with the same `name` already exists in the DNA, the new
 * Resource is composed into the existing one using the `merge()` rules:
 * list-shaped children union by name; scalar disagreements emit `Conflict`
 * entries via the v1 recommendation policy. Returns the new DNA plus any
 * conflicts produced.
 */
function addResource(dna, resource, opts) {
    return (0, shared_1.composeInto)(dna, resource, 'resources', 'operational/resource', opts);
}
//# sourceMappingURL=resource.js.map