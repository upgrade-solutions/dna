import { Resource, OperationalDomain } from './types'

/** Flatten a domain tree into a single list of Resources. */
export function collectResources(domain: OperationalDomain): Resource[] {
  const out = [...(domain.resources ?? [])]
  for (const sub of domain.domains ?? []) out.push(...collectResources(sub))
  return out
}

/** Repeat a character n times, clamped to [min, max]. */
export function repeat(ch: string, n: number, min = 1, max = 6): string {
  return ch.repeat(Math.max(min, Math.min(max, n)))
}

/** Indent every line of a string by `spaces` spaces. */
export function indent(s: string, spaces: number): string {
  const pad = ' '.repeat(spaces)
  return s
    .split('\n')
    .map((line) => (line.length ? pad + line : line))
    .join('\n')
}
