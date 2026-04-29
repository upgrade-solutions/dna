"use strict";
/**
 * Public types for the template input adapter.
 *
 * Convention across all `input-*` packages:
 * - `ParseOptions` is the single-argument options object to `parse()`.
 *   Mark truly required fields as non-optional; everything else is optional
 *   with a documented default.
 * - `ParseResult` is always an object keyed by DNA layer name
 *   (`operational`, `productCore`, `productApi`, `productUi`, `technical`).
 *   A package may emit one layer or many, but never returns a bare array
 *   or a single primitive — always a layered object.
 *
 * Keep the DNA types here loose (structural subsets, optional fields).
 * The authoritative shapes live in `@dna-codes/dna-core` / `@dna-codes/dna-schemas`
 * and are enforced by the cross-layer validator, not at the adapter boundary.
 */
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=types.js.map