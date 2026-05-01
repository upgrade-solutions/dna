export declare function hashes(count: number): string;
/**
 * Apply a rename map to a canonical primitive label. Returns the renamed
 * string when present, otherwise the canonical label unchanged.
 *
 * Rename keys match the rendered LABEL exactly — typically the plural form
 * the renderer would emit (`Resources`, `Persons`, `Roles`). Companies that
 * prefer their own vocabulary supply `{ Roles: 'Positions', Persons: 'Individuals' }`.
 */
export declare function label(canonical: string, rename?: Record<string, string>): string;
//# sourceMappingURL=util.d.ts.map