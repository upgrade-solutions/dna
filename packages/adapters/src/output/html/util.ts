export function escape(s: string | undefined | null): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function heading(level: number, content: string): string {
  const h = Math.max(1, Math.min(6, level))
  return `<h${h}>${content}</h${h}>`
}

export function code(s: string): string {
  return `<code>${escape(s)}</code>`
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

export function groupBy<T>(arr: T[], key: (x: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>()
  for (const x of arr) {
    const k = key(x)
    if (!out.has(k)) out.set(k, [])
    out.get(k)!.push(x)
  }
  return out
}
