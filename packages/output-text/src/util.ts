/**
 * Formatting helpers for text output.
 * Keep format-specific escaping here rather than inline in section builders.
 */

/** Turn `LoanApplication` → `Loan Application`. Leaves all-caps acronyms alone. */
export function pascalToWords(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .trim()
}

/** Lowercase kebab-case slug. `Loan.Apply` → `loan-apply`. */
export function slugify(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

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
export function label(canonical: string, rename?: Record<string, string>): string {
  return rename?.[canonical] ?? canonical
}

/** Group an array by a key function into a Map, preserving insertion order. */
export function groupBy<T>(arr: T[], key: (x: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>()
  for (const x of arr) {
    const k = key(x)
    if (!out.has(k)) out.set(k, [])
    out.get(k)!.push(x)
  }
  return out
}

/** Join string parts with blank lines, dropping null/empty ones. */
export function joinSections(parts: (string | null | undefined)[]): string {
  return parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join('\n\n')
}
