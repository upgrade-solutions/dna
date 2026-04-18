import {
  ParsedAttribute,
  ParsedNoun,
  ParsedRelationship,
  ParseResult,
} from './types'

export interface ParseOptions {
  /** Name for the root noun. Required — input JSON doesn't name itself. */
  name: string
  /** Domain name wrapping the inferred nouns. Defaults to options.name lowercased. */
  domain?: string
  /** Map a property key to the noun name it references. Default: PascalCase, singularized. */
  nounNameFromKey?: (key: string) => string
}

export function parse(data: unknown, options: ParseOptions): ParseResult {
  if (!isRecord(data) && !Array.isArray(data)) {
    throw new Error('input-json.parse: input must be a JSON object or array of objects.')
  }

  const nouns = new Map<string, ParsedNoun>()
  const relationships: ParsedRelationship[] = []
  const rootSample = Array.isArray(data) ? mergeRecords(data) : data
  walk(rootSample, options.name, nouns, relationships, options)

  return {
    operational: {
      domain: {
        name: options.domain ?? options.name.toLowerCase(),
        nouns: [...nouns.values()],
      },
      ...(relationships.length ? { relationships } : {}),
    },
  }
}

function walk(
  data: Record<string, unknown>,
  nounName: string,
  nouns: Map<string, ParsedNoun>,
  relationships: ParsedRelationship[],
  options: ParseOptions,
): void {
  const existing = nouns.get(nounName)
  const attrs: ParsedAttribute[] = existing?.attributes ? [...existing.attributes] : []
  const seen = new Set(attrs.map((a) => a.name))

  for (const [key, value] of Object.entries(data)) {
    if (seen.has(key)) continue
    seen.add(key)

    if (isRecord(value)) {
      const childName = deriveNounName(key, options)
      attrs.push({ name: key, type: 'reference', noun: childName })
      relationships.push(buildRelationship(nounName, childName, key, 'one-to-one'))
      walk(value, childName, nouns, relationships, options)
    } else if (Array.isArray(value)) {
      if (value.length > 0 && isRecord(value[0])) {
        const childName = deriveNounName(key, options)
        attrs.push({ name: key, type: 'reference', noun: childName })
        relationships.push(buildRelationship(nounName, childName, key, 'one-to-many'))
        const merged = mergeRecords(value)
        walk(merged, childName, nouns, relationships, options)
      }
      // Arrays of scalars (e.g. `tags: ["fantasy", "classic"]`) have no faithful
      // representation as a single DNA Attribute — the canonical schema's
      // type enum is string | text | number | boolean | date | datetime | enum
      // | reference. The DNA way to model scalar collections is a child Noun
      // plus a relationship, which requires more context than a JSON sample
      // provides (the scalar's name, its own attributes, etc.). Rather than
      // emit invalid DNA, drop these keys. Upgrade them manually if needed.
    } else {
      attrs.push({ name: key, type: inferScalarType(value) })
    }
  }

  nouns.set(nounName, { name: nounName, attributes: attrs })
}

function buildRelationship(
  from: string,
  to: string,
  attribute: string,
  cardinality: 'one-to-one' | 'one-to-many',
): ParsedRelationship {
  return {
    name: `${from}.${attribute}`,
    from,
    to,
    attribute,
    cardinality,
  }
}

function deriveNounName(key: string, options: ParseOptions): string {
  if (options.nounNameFromKey) return options.nounNameFromKey(key)
  return pascalCase(singularize(key))
}

/**
 * Shallow-merge an array of record-shaped values into a single record by
 * picking the first non-null sample for each key. Handles schemas that drift
 * across array items (partial/optional fields).
 */
function mergeRecords(items: unknown[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const item of items) {
    if (!isRecord(item)) continue
    for (const [k, v] of Object.entries(item)) {
      if (!(k in out) || out[k] == null) out[k] = v
    }
  }
  return out
}

function inferScalarType(value: unknown): string {
  if (value == null) return 'string'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return 'datetime'
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date'
    return 'string'
  }
  return 'string'
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function pascalCase(s: string): string {
  return s
    .split(/[\s\-_./]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

function singularize(s: string): string {
  if (s.endsWith('ies') && s.length > 3) return s.slice(0, -3) + 'y'
  if (s.endsWith('sses')) return s.slice(0, -2)
  if (s.endsWith('s') && !s.endsWith('ss')) return s.slice(0, -1)
  return s
}

export * from './types'
