"use strict";
/**
 * Loose structural types describing the DNA shapes this renderer reads.
 *
 * Intentionally a subset of the canonical schemas in @dna-codes/schemas
 * (surfaced as types via @dna-codes/core) — only the fields this renderer
 * consumes are modeled. That keeps the package zero-dependency and lets
 * callers hand in partially-populated DNA without tripping type errors
 * on unrelated fields.
 *
 * When forking, copy just the layers/fields you need. Don't import the
 * full canonical types — stay loose.
 */
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=types.js.map