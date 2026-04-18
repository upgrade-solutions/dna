/**
 * Formatting helpers for text output.
 * Keep format-specific escaping here rather than inline in section builders.
 */
/** Turn `LoanApplication` → `Loan Application`. Leaves all-caps acronyms alone. */
export declare function pascalToWords(s: string): string;
/** Lowercase kebab-case slug. `Loan.Apply` → `loan-apply`. */
export declare function slugify(s: string): string;
/** Group an array by a key function into a Map, preserving insertion order. */
export declare function groupBy<T>(arr: T[], key: (x: T) => string): Map<string, T[]>;
/** Join string parts with blank lines, dropping null/empty ones. */
export declare function joinSections(parts: (string | null | undefined)[]): string;
//# sourceMappingURL=util.d.ts.map