/**
 * Loose structural types describing the DNA Product API shapes this renderer reads,
 * and a minimal local OpenAPI 3.1 root document type for the output side.
 *
 * Mirrors @dna-codes/schemas/product/api/* — kept local so the package stays zero-dependency.
 */

// ────────────────────────────────────────────────────────────────────────────
// DNA Product API input shapes
// ────────────────────────────────────────────────────────────────────────────

export interface ProductApi {
  namespace: Namespace
  resources?: ProductResource[]
  operations?: ProductOperation[]
  endpoints: Endpoint[]
}

export interface Namespace {
  name: string
  path: string
  description?: string
  domain?: string
  resources?: string[]
}

export interface ProductResource {
  name: string
  resource?: string
  fields: Field[]
  actions?: { name: string; action: string }[]
}

export interface ProductOperation {
  resource: string
  action: string
  name: string
}

export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  operation: string
  description?: string
  params?: Param[]
  request?: Schema
  response?: Schema
}

export interface Param {
  name: string
  in: 'path' | 'query' | 'header'
  type: 'string' | 'number' | 'boolean' | 'enum'
  description?: string
  required?: boolean
  values?: string[]
  attribute?: string
}

export interface Schema {
  name: string
  description?: string
  fields: Field[]
  resource?: string
}

export interface Field {
  name: string
  label?: string
  type:
    | 'string'
    | 'text'
    | 'number'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'email'
    | 'phone'
    | 'url'
    | 'enum'
    | 'reference'
  description?: string
  required?: boolean
  readonly?: boolean
  values?: string[]
  attribute?: string
}

// ────────────────────────────────────────────────────────────────────────────
// OpenAPI 3.1 output shapes (minimal, only what we emit)
// ────────────────────────────────────────────────────────────────────────────

export interface OpenApiDocument {
  openapi: '3.1.0'
  info: { title: string; version: string; description?: string }
  servers?: { url: string; description?: string }[]
  tags?: { name: string; description?: string }[]
  paths: Record<string, PathItem>
  components?: { schemas?: Record<string, JsonSchema> }
}

export type PathItem = Partial<Record<HttpMethod, Operation>>

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface Operation {
  operationId?: string
  summary?: string
  description?: string
  tags?: string[]
  parameters?: Parameter[]
  requestBody?: RequestBody
  responses: Record<string, Response>
}

export interface Parameter {
  name: string
  in: 'path' | 'query' | 'header'
  required?: boolean
  description?: string
  schema: JsonSchema
}

export interface RequestBody {
  description?: string
  required?: boolean
  content: Record<string, MediaType>
}

export interface Response {
  description: string
  content?: Record<string, MediaType>
}

export interface MediaType {
  schema: JsonSchema
}

export type JsonSchema = JsonSchemaObject | JsonSchemaRef

export interface JsonSchemaRef {
  $ref: string
}

export interface JsonSchemaObject {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null'
  format?: string
  description?: string
  enum?: string[]
  properties?: Record<string, JsonSchema>
  required?: string[]
  readOnly?: boolean
  items?: JsonSchema
}

// ────────────────────────────────────────────────────────────────────────────
// Public output type
// ────────────────────────────────────────────────────────────────────────────

export interface RenderOptions {
  /** Output format. Default 'yaml'. */
  format?: 'yaml' | 'json'
  /** Document title. Defaults to `<namespace.name> API`. */
  title?: string
  /** Document version. Defaults to '0.1.0'. */
  version?: string
  /** Document-level description. Defaults to `namespace.description`, if present. */
  description?: string
  /** Optional servers block. */
  servers?: { url: string; description?: string }[]
}

export interface OpenApiOutput {
  content: string
  format: 'yaml' | 'json'
}
