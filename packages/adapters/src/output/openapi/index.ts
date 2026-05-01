import {
  Endpoint,
  Field,
  HttpMethod,
  JsonSchema,
  JsonSchemaObject,
  OpenApiDocument,
  OpenApiOutput,
  Operation,
  Parameter,
  ProductApi,
  RenderOptions,
  Response,
  Schema,
} from './types'
import { toYaml } from './yaml'

const APPLICATION_JSON = 'application/json'

/**
 * Render a DNA Product API document to an OpenAPI 3.1 specification.
 *
 * v0.1 scope: every request and response is `application/json`. The current
 * `@dna-codes/dna-schemas` Endpoint shape carries no `content_type` field and a
 * single `response` (not a status-code map), so SSE and multi-status responses
 * are not faithfully rendered. SSE behavior should be documented in the
 * endpoint's `description` (prose). See `redesign-endpoint-responses` for the
 * follow-on schema work.
 */
export function render(productApi: ProductApi, options: RenderOptions = {}): OpenApiOutput {
  const format = options.format ?? 'yaml'
  const doc = buildDocument(productApi, options)
  const content = format === 'json' ? JSON.stringify(doc, null, 2) + '\n' : toYaml(doc)
  return { content, format }
}

function buildDocument(productApi: ProductApi, options: RenderOptions): OpenApiDocument {
  const tags = collectTags(productApi)
  const componentSchemas = collectComponentSchemas(productApi)
  const paths = buildPaths(productApi, componentSchemas)

  const doc: OpenApiDocument = {
    openapi: '3.1.0',
    info: {
      title: options.title ?? `${productApi.namespace.name} API`,
      version: options.version ?? '0.1.0',
      ...(options.description ?? productApi.namespace.description
        ? { description: options.description ?? productApi.namespace.description }
        : {}),
    },
    ...(options.servers && options.servers.length ? { servers: options.servers } : {}),
    ...(tags.length ? { tags } : {}),
    paths,
    ...(Object.keys(componentSchemas).length
      ? { components: { schemas: componentSchemas } }
      : {}),
  }

  return doc
}

function collectTags(productApi: ProductApi): { name: string; description?: string }[] {
  const ns = productApi.namespace
  if (!ns?.name) return []
  return [
    {
      name: ns.name,
      ...(ns.description ? { description: ns.description } : {}),
    },
  ]
}

function collectComponentSchemas(productApi: ProductApi): Record<string, JsonSchemaObject> {
  const schemas: Record<string, JsonSchemaObject> = {}
  for (const endpoint of productApi.endpoints) {
    if (endpoint.request) registerSchema(schemas, endpoint.request)
    if (endpoint.response) registerSchema(schemas, endpoint.response)
  }
  return Object.fromEntries(Object.entries(schemas).sort(([a], [b]) => a.localeCompare(b)))
}

function registerSchema(target: Record<string, JsonSchemaObject>, schema: Schema): void {
  if (!schema.name) return
  if (target[schema.name]) return
  target[schema.name] = schemaToJsonSchema(schema)
}

function schemaToJsonSchema(schema: Schema): JsonSchemaObject {
  const properties: Record<string, JsonSchema> = {}
  const required: string[] = []
  for (const field of schema.fields) {
    properties[field.name] = fieldToJsonSchema(field)
    if (field.required) required.push(field.name)
  }
  return {
    type: 'object',
    ...(schema.description ? { description: schema.description } : {}),
    properties,
    ...(required.length ? { required } : {}),
  }
}

function fieldToJsonSchema(field: Field): JsonSchemaObject {
  const out: JsonSchemaObject = mapFieldType(field)
  if (field.description) out.description = field.description
  if (field.readonly) out.readOnly = true
  return out
}

function mapFieldType(field: Field): JsonSchemaObject {
  switch (field.type) {
    case 'string':
    case 'text':
    case 'phone':
    case 'reference':
      return { type: 'string' }
    case 'number':
      return { type: 'number' }
    case 'boolean':
      return { type: 'boolean' }
    case 'date':
      return { type: 'string', format: 'date' }
    case 'datetime':
      return { type: 'string', format: 'date-time' }
    case 'email':
      return { type: 'string', format: 'email' }
    case 'url':
      return { type: 'string', format: 'uri' }
    case 'enum':
      return { type: 'string', ...(field.values ? { enum: field.values } : {}) }
    case 'object': {
      const subFields = field.fields ?? []
      const properties: Record<string, JsonSchema> = {}
      const required: string[] = []
      for (const sub of subFields) {
        properties[sub.name] = fieldToJsonSchema(sub)
        if (sub.required) required.push(sub.name)
      }
      return {
        type: 'object',
        properties,
        ...(required.length ? { required } : {}),
      }
    }
    default:
      return { type: 'string' }
  }
}

function buildPaths(
  productApi: ProductApi,
  componentSchemas: Record<string, JsonSchemaObject>,
): Record<string, Record<HttpMethod, Operation>> {
  const paths: Record<string, Record<HttpMethod, Operation>> = {}
  for (const endpoint of productApi.endpoints) {
    const path = toOpenApiPath(endpoint.path)
    const method = endpoint.method.toLowerCase() as HttpMethod
    if (!paths[path]) paths[path] = {} as Record<HttpMethod, Operation>
    paths[path][method] = buildOperation(endpoint, productApi, componentSchemas)
  }
  return paths
}

/** Convert DNA's `:id` path segments into OpenAPI's `{id}` form. */
function toOpenApiPath(path: string): string {
  return path.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, '{$1}')
}

function buildOperation(
  endpoint: Endpoint,
  productApi: ProductApi,
  componentSchemas: Record<string, JsonSchemaObject>,
): Operation {
  const op: Operation = {
    operationId: toOperationId(endpoint.operation),
    ...(endpoint.description ? { description: endpoint.description } : {}),
    ...(productApi.namespace?.name ? { tags: [productApi.namespace.name] } : {}),
    ...buildParameters(endpoint),
    ...buildRequestBody(endpoint, componentSchemas),
    responses: buildResponses(endpoint, componentSchemas),
  }
  return op
}

function buildParameters(endpoint: Endpoint): Pick<Operation, 'parameters'> {
  if (!endpoint.params || endpoint.params.length === 0) return {}
  const parameters: Parameter[] = endpoint.params.map((param) => {
    const schema: JsonSchemaObject = mapFieldType({
      name: param.name,
      type: param.type as Field['type'],
      values: param.values,
    } as Field)
    return {
      name: param.name,
      in: param.in,
      ...(param.required ? { required: true } : param.in === 'path' ? { required: true } : {}),
      ...(param.description ? { description: param.description } : {}),
      schema,
    }
  })
  return { parameters }
}

function buildRequestBody(
  endpoint: Endpoint,
  componentSchemas: Record<string, JsonSchemaObject>,
): Pick<Operation, 'requestBody'> {
  if (!endpoint.request) return {}
  return {
    requestBody: {
      required: true,
      content: {
        [APPLICATION_JSON]: {
          schema: schemaRefOrInline(endpoint.request, componentSchemas),
        },
      },
    },
  }
}

function buildResponses(
  endpoint: Endpoint,
  componentSchemas: Record<string, JsonSchemaObject>,
): Record<string, Response> {
  const responses: Record<string, Response> = {}
  if (endpoint.response) {
    responses['200'] = {
      description: 'Success',
      content: {
        [APPLICATION_JSON]: {
          schema: schemaRefOrInline(endpoint.response, componentSchemas),
        },
      },
    }
  } else {
    responses['204'] = { description: 'No Content' }
  }
  return responses
}

function schemaRefOrInline(
  schema: Schema,
  componentSchemas: Record<string, JsonSchemaObject>,
): JsonSchema {
  if (schema.name && componentSchemas[schema.name]) {
    return { $ref: `#/components/schemas/${schema.name}` }
  }
  return schemaToJsonSchema(schema)
}

/** `Resource.Action` → `resourceAction` (camelCase). */
function toOperationId(operation: string): string {
  const parts = operation.split('.')
  if (parts.length !== 2) return operation
  const [resource, action] = parts
  return `${resource[0].toLowerCase()}${resource.slice(1)}${action[0].toUpperCase()}${action.slice(1)}`
}

export * from './types'
