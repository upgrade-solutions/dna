# `@dna-codes/dna-output-openapi`

Render a DNA Product API document as an OpenAPI 3.1 specification (YAML or JSON).

`output-openapi` is the **contract layer** between DNA's product layer and any technical implementation. DNA owns the spec; OpenAPI is the contract; downstream tooling (codegen, mocking, validation, docs renderers, Cell-Based Architecture's `api-cell` adapters) speak OpenAPI.

Zero runtime dependencies. Works against the shapes in `@dna-codes/dna-schemas/product/api/*` but doesn't import them, so callers can pass raw JSON directly without an install graph.

## Install

```bash
npm install @dna-codes/dna-output-openapi
```

## Usage

```ts
import { render } from '@dna-codes/dna-output-openapi'
import productApi from './dna/acme/product.api.json'

const { content, format } = render(productApi)
// content: a YAML string with `openapi: 3.1.0` at the top
// format: 'yaml'

import { writeFileSync } from 'node:fs'
writeFileSync('openapi.yaml', content)
```

JSON instead of YAML:

```ts
const { content } = render(productApi, { format: 'json' })
writeFileSync('openapi.json', content)
```

Override document metadata:

```ts
render(productApi, {
  title: 'Bookshop Public API',
  version: '1.2.0',
  description: 'Catalog and publishing endpoints.',
  servers: [{ url: 'https://api.example.com', description: 'Production' }],
})
```

## API

### `render(productApi, options?)`

```ts
render(productApi: ProductApi, options?: RenderOptions): OpenApiOutput
```

`ProductApi` is the structural shape of `product.api.json` — namespace, resources, operations, endpoints. See `src/types.ts` for the full type.

`RenderOptions`:

| Field | Type | Default |
|---|---|---|
| `format` | `'yaml' \| 'json'` | `'yaml'` |
| `title` | `string` | `<namespace.name> API` |
| `version` | `string` | `'0.1.0'` |
| `description` | `string` | `namespace.description` |
| `servers` | `{ url, description? }[]` | `undefined` |

`OpenApiOutput`:

```ts
{ content: string; format: 'yaml' | 'json' }
```

## Mapping

| DNA primitive                  | OpenAPI 3.1 target                                              |
|--------------------------------|-----------------------------------------------------------------|
| `Endpoint(method, path)`       | `paths[path][method]`                                           |
| `Endpoint.operation`           | `paths[path][method].operationId` (`Resource.Action` → `resourceAction`) |
| `Endpoint.description`         | `paths[path][method].description`                               |
| `Endpoint.params[in:'path']`   | `parameters[]` with `in: 'path'`                                |
| `Endpoint.params[in:'query']`  | `parameters[]` with `in: 'query'`                               |
| `Endpoint.params[in:'header']` | `parameters[]` with `in: 'header'`                              |
| `Endpoint.request`             | `requestBody.content["application/json"].schema`                |
| `Endpoint.response`            | `responses["200"].content["application/json"].schema`           |
| `Schema` (request/response)    | hoisted into `components.schemas[Schema.name]` and `$ref`'d     |
| `Namespace.name`               | document tag + `tags` on each operation                         |

DNA's `:id` path segments are converted to OpenAPI's `{id}` form automatically.

### Field type → JSON Schema

| DNA `Field.type` | OpenAPI / JSON Schema           |
|------------------|---------------------------------|
| `string`, `text`, `phone`, `reference` | `{ type: 'string' }`     |
| `number`         | `{ type: 'number' }`            |
| `boolean`        | `{ type: 'boolean' }`           |
| `date`           | `{ type: 'string', format: 'date' }`      |
| `datetime`       | `{ type: 'string', format: 'date-time' }` |
| `email`          | `{ type: 'string', format: 'email' }`     |
| `url`            | `{ type: 'string', format: 'uri' }`       |
| `enum`           | `{ type: 'string', enum: [...] }`         |
| `object` + `fields[]` | `{ type: 'object', properties: ..., required: [...] }` (recursive) |

#### Nested object fields

A `Field` with `type: 'object'` carries its own `fields[]` and renders as a nested OpenAPI object schema. Sub-fields with `required: true` populate the parent's `required[]` array.

**Authoring (DNA):**

```jsonc
{
  "name": "from",
  "label": "From",
  "type": "object",
  "required": true,
  "fields": [
    { "name": "format", "type": "enum", "values": ["text", "json", "dna"], "required": true },
    { "name": "input", "type": "string", "required": true }
  ]
}
```

**Rendered (OpenAPI):**

```yaml
from:
  type: object
  properties:
    format:
      type: string
      enum: [text, json, dna]
    input:
      type: string
  required: [format, input]
```

Object fields nest recursively. `values` is mutually exclusive with `type: 'object'` — the schema rejects a Field that declares both.

## v0.1 limitation: no media-type fidelity

The current `@dna-codes/dna-schemas` `Endpoint` shape carries:
- a single `request` (no content type)
- a single `response` (no content type, no status-code map)

Consequence: `output-openapi` v0.1 hardcodes `application/json` for every request and response, and emits `responses["200"]` only. **SSE endpoints, multi-status responses, and alternate content types are not faithfully rendered.**

The conventional workaround for v0.1: document streaming or status-specific behavior in the endpoint's `description` (prose). Anthropic's messaging API uses this pattern.

A future `redesign-endpoint-responses` change in `@dna-codes/dna-schemas` will promote `response` to a status-code-keyed map with per-status content type, at which point `output-openapi` can emit faithful SSE/4xx/5xx responses.

## License

MIT
