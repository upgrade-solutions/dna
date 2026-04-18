import {
  OpenApiOperation,
  OpenApiSchema,
  OpenApiSpec,
  ParsedEndpoint,
  ParsedField,
  ParsedParam,
  ParsedSchema,
  ParseResult,
} from './types'

export interface ParseOptions {
  /** Override the derived namespace name (default: PascalCase of info.title). */
  namespaceName?: string
  /** Override the derived namespace path (default: path of servers[0].url, or '/'). */
  namespacePath?: string
}

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head'])

export function parse(spec: OpenApiSpec, options: ParseOptions = {}): ParseResult {
  const namespace = {
    name: options.namespaceName ?? toPascalCase(spec.info?.title ?? 'Api'),
    path: options.namespacePath ?? deriveNamespacePath(spec.servers),
    description: spec.info?.description,
  }

  const endpoints: ParsedEndpoint[] = []
  for (const [path, methods] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(methods ?? {})) {
      if (!HTTP_METHODS.has(method.toLowerCase())) continue
      endpoints.push(buildEndpoint(path, method, operation))
    }
  }

  const schemas = buildSchemas(spec.components?.schemas)

  return {
    productApi: {
      namespace,
      endpoints,
      ...(schemas.length ? { schemas } : {}),
    },
  }
}

function buildEndpoint(path: string, method: string, op: OpenApiOperation): ParsedEndpoint {
  const params: ParsedParam[] = (op.parameters ?? [])
    .filter((p) => p.in === 'path' || p.in === 'query' || p.in === 'header')
    .map((p) => ({
      name: p.name,
      in: p.in as ParsedParam['in'],
      type: mapType(p.schema?.type),
      required: p.required,
      description: p.description,
    }))

  return {
    method: method.toUpperCase(),
    path,
    operation: deriveOperationName(op, method, path),
    description: op.summary ?? op.description,
    ...(params.length ? { params } : {}),
  }
}

function buildSchemas(schemas?: Record<string, OpenApiSchema>): ParsedSchema[] {
  if (!schemas) return []
  const out: ParsedSchema[] = []
  for (const [name, schema] of Object.entries(schemas)) {
    out.push({
      name,
      description: schema.description,
      fields: propertiesToFields(schema),
    })
  }
  return out
}

function propertiesToFields(schema: OpenApiSchema): ParsedField[] {
  const required = new Set(schema.required ?? [])
  return Object.entries(schema.properties ?? {}).map(([name, prop]) => {
    const field: ParsedField = {
      name,
      type: mapType(prop.type),
    }
    if (required.has(name)) field.required = true
    if (prop.description) field.description = prop.description
    return field
  })
}

function deriveOperationName(op: OpenApiOperation, method: string, path: string): string {
  if (op.operationId) return toPascalDot(op.operationId)
  const tag = op.tags?.[0]
  if (tag) return `${toPascalCase(tag)}.${toPascalCase(method)}`
  const last = path
    .split('/')
    .filter(Boolean)
    .filter((seg) => !seg.startsWith('{') && !seg.startsWith(':'))
    .pop()
  const resource = last ? toPascalCase(last) : 'Root'
  return `${resource}.${toPascalCase(method)}`
}

function deriveNamespacePath(servers: OpenApiSpec['servers']): string {
  if (!servers?.length) return '/'
  try {
    const url = new URL(servers[0].url, 'http://placeholder.local')
    return url.pathname || '/'
  } catch {
    // Relative URL like '/api/v1' — use as-is.
    const u = servers[0].url
    return u.startsWith('/') ? u : `/${u}`
  }
}

function toPascalCase(s: string): string {
  return s
    .split(/[\s\-_/.]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

/**
 * Convert an operationId like "listPets" or "Pet.list" to "Pet.List".
 * If the id contains a dot, preserve its parts; otherwise split on camelCase.
 */
function toPascalDot(id: string): string {
  if (id.includes('.')) {
    return id
      .split('.')
      .map(toPascalCase)
      .filter(Boolean)
      .join('.')
  }
  const parts = id.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/\s+/)
  if (parts.length < 2) return toPascalCase(id) + '.Do'
  const verb = parts[0]
  const noun = parts.slice(1).join(' ')
  return `${toPascalCase(noun)}.${toPascalCase(verb)}`
}

function mapType(t?: string): string {
  switch (t) {
    case 'integer':
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'array':
      return 'array'
    case 'object':
      return 'object'
    case 'string':
    default:
      return 'string'
  }
}

export * from './types'
