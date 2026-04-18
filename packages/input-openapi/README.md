# `@dna-codes/input-openapi`

Parse an OpenAPI 3.x spec (already parsed as a JavaScript object) into DNA Product API shape — namespace, endpoints, and schemas. Zero runtime dependencies.

## Install

```bash
npm install @dna-codes/input-openapi
```

## Usage

```ts
import { parse } from '@dna-codes/input-openapi'
import petstoreSpec from './petstore.openapi.json'

const { productApi } = parse(petstoreSpec)
// → { namespace: { name: 'PetStore', path: '/v1' },
//     endpoints: [{ method: 'GET', path: '/pets', operation: 'Pets.List', ... }, ...],
//     schemas: [{ name: 'Pet', fields: [...] }] }
```

This package expects the spec to be **already parsed into JSON** — it doesn't read YAML or fetch remote URLs. Use [`js-yaml`](https://www.npmjs.com/package/js-yaml) or similar to load YAML specs first.

## API

### `parse(spec, options?)`

Returns `{ productApi }` shaped to plug into a DNA document.

**`ParseOptions`**:

| Option | Default | Meaning |
|--------|---------|---------|
| `namespaceName` | PascalCase of `info.title` | Override the derived namespace name |
| `namespacePath` | path of `servers[0].url`, or `'/'` | Override the namespace path prefix |

## What gets mapped

| OpenAPI | DNA |
|---------|-----|
| `info.title`, `info.description` | namespace name + description |
| `servers[0].url` pathname | namespace path |
| `paths[path][method]` | endpoint (method uppercased, operation derived from `operationId` / tags / path) |
| `operation.parameters` (path, query, header) | endpoint.params (type mapped from JSON Schema) |
| `components.schemas` | Schemas with Fields (required flags preserved, types mapped) |

## Operation name derivation

Priority order for the `operation` field on an endpoint:

1. `operationId` if present — `listPets` → `Pets.List`, `Pet.list` → `Pet.List`
2. First `tags[0]` + HTTP method — e.g. `tags: ['Pet']` + `GET` → `Pet.Get`
3. Last non-parameter path segment + method — e.g. `/pets/{id}` + `GET` → `Pets.Get`

## Type mapping

| JSON Schema type | DNA type |
|------------------|----------|
| `string` | `string` |
| `integer` / `number` | `number` |
| `boolean` | `boolean` |
| `array` | `array` |
| `object` | `object` |
| (unknown) | `string` |

## Not covered yet

- `$ref` resolution — emitted as-is without following the reference
- `oneOf` / `anyOf` / `allOf` composition
- Request bodies aren't yet converted into Schemas (only `components.schemas` entries are)
- Authentication schemes (`securitySchemes`)

## License

MIT.
