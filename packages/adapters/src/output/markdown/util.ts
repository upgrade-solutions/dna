export function hashes(count: number): string {
  return '#'.repeat(Math.max(1, Math.min(6, count)))
}

/**
 * Apply a rename map to a canonical primitive label. Returns the renamed
 * string when present, otherwise the canonical label unchanged.
 *
 * Rename keys match the rendered LABEL exactly — typically the plural form
 * the renderer would emit (`Resources`, `Persons`, `Roles`). Companies that
 * prefer their own vocabulary supply `{ Roles: 'Positions', Persons: 'Individuals' }`.
 */
export function label(canonical: string, rename?: Record<string, string>): string {
  return rename?.[canonical] ?? canonical
}
