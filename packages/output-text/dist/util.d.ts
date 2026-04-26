/**
 * Formatting helpers for text output.
 * Keep format-specific escaping here rather than inline in section builders.
 */
/** Turn `LoanApplication` → `Loan Application`. Leaves all-caps acronyms alone. */
export declare function pascalToWords(s: string): string;
/** Lowercase kebab-case slug. `Loan.Apply` → `loan-apply`. */
export declare function slugify(s: string): string;
/**
 * Apply a rename map to a canonical primitive label. Returns the renamed
 * string when present, otherwise the canonical label unchanged.
 *
 * Rename keys match the rendered LABEL exactly — typically the plural form
 * the renderer would emit (`Resources`, `Persons`, `Roles`). Companies that
 * prefer their own vocabulary supply `{ Roles: 'Positions', Persons: 'Individuals' }`.
 *
 * Currently unused by this adapter (no primitive-count or top-level
 * collection labels are emitted) — kept for parity with the markdown / HTML
 * adapters, ready when prose-style summaries land.
 */
export declare function label(canonical: string, rename?: Record<string, string>): string;
/** Group an array by a key function into a Map, preserving insertion order. */
export declare function groupBy<T>(arr: T[], key: (x: T) => string): Map<string, T[]>;
/** Join string parts with blank lines, dropping null/empty ones. */
export declare function joinSections(parts: (string | null | undefined)[]): string;
//# sourceMappingURL=util.d.ts.map