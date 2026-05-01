"use strict";
/**
 * Loose structural types describing the DNA shapes this renderer reads.
 * Only fields actually consumed are modeled; callers may pass partial DNA.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STYLES = void 0;
// ---------------------------------------------------------------------------
// Public render options and outputs.
// ---------------------------------------------------------------------------
// `Unit`, `Style`, `StyleMap`, and `DEFAULT_STYLES` are canonical contracts
// shared with integrations and other consumers; they live in `@dna-codes/dna-core`.
var dna_core_1 = require("@dna-codes/dna-core");
Object.defineProperty(exports, "DEFAULT_STYLES", { enumerable: true, get: function () { return dna_core_1.DEFAULT_STYLES; } });
//# sourceMappingURL=types.js.map