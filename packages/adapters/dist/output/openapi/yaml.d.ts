/**
 * Minimal handcrafted YAML stringifier. Zero dependencies.
 *
 * Scope: emits the subset of YAML used by an OpenAPI 3.1 document — strings,
 * numbers, booleans, null, arrays of objects/scalars, nested objects. No
 * anchors, no flow style, no multi-document streams. Keys are emitted in the
 * order they appear on the input object (the renderer is responsible for
 * inserting them in a deterministic order).
 *
 * Strings that need quoting: anything containing a YAML reserved indicator,
 * leading/trailing whitespace, or that would parse as a non-string scalar
 * (numbers, booleans, null, etc.) get double-quoted with JS-style escapes.
 */
export declare function toYaml(value: unknown): string;
//# sourceMappingURL=yaml.d.ts.map