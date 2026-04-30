"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPerson = addPerson;
const shared_1 = require("./shared");
/**
 * Add a Person template to the DNA's `domain.persons`. Same-name composes
 * via merge rules.
 */
function addPerson(dna, person, opts) {
    return (0, shared_1.composeInto)(dna, person, 'persons', 'operational/person', opts);
}
//# sourceMappingURL=person.js.map