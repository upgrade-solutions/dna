"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeInto = composeInto;
const merge_1 = require("../merge");
const validator_1 = require("../validator");
let cachedValidator = null;
function validator() {
    if (cachedValidator === null)
        cachedValidator = new validator_1.DnaValidator();
    return cachedValidator;
}
const NOUN_COLLECTIONS = new Set(['resources', 'persons', 'roles', 'groups']);
/**
 * Compose a single primitive into a DNA. Used by every `add*` builder.
 *
 * - Validates the primitive against its JSON Schema by default.
 * - Wraps the primitive in a single-primitive DNA chunk that inherits the
 *   target DNA's `domain.name` (so `merge()` doesn't surface a spurious
 *   conflict on the domain name itself).
 * - Calls `merge([dna, wrapper])`. Identity-by-name + conflict reporting +
 *   cross-reference resolution all flow from `merge()`'s existing logic.
 * - Drops the provenance map — builders don't carry source info; `merge()`
 *   handles provenance for the multi-source case directly.
 */
function composeInto(dna, primitive, collection, schemaId, opts = {}) {
    if (opts.validate !== false) {
        const result = validator().validate(primitive, schemaId);
        if (!result.valid) {
            const message = result.errors
                .map((e) => `${e.instancePath || '/'} ${e.message ?? '(no message)'}`)
                .join('; ');
            throw new Error(`dna-builders: ${schemaId} input failed validation: ${message}`);
        }
    }
    const domainName = dna.domain.name;
    const wrapper = NOUN_COLLECTIONS.has(collection)
        ? {
            domain: { name: domainName, [collection]: [primitive] },
        }
        : {
            domain: { name: domainName },
            [collection]: [primitive],
        };
    const result = (0, merge_1.merge)([dna, wrapper]);
    return { dna: result.dna, conflicts: result.conflicts };
}
//# sourceMappingURL=shared.js.map