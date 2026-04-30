"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRelationship = addRelationship;
const shared_1 = require("./shared");
/**
 * Add a Relationship to the DNA's top-level `relationships`. Identity is by
 * `name`. Used by `input-json`'s walker to emit relationship records
 * without rolling its own dedup.
 */
function addRelationship(dna, relationship, opts) {
    return (0, shared_1.composeInto)(dna, relationship, 'relationships', 'operational/relationship', opts);
}
//# sourceMappingURL=relationship.js.map