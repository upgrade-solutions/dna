# AGENTS.md — `@dna-codes/output-openapi`

Guidance for AI agents working on this package.

## Role in the pipeline

```
   product.api.json (DNA)  ──▶  output-openapi  ──▶  openapi.yaml/json
                                                         │
                                                         ▼
                                                   downstream tooling
                                                   (CBA api-cell, codegen,
                                                    docs renderers, mocks,
                                                    Postman, schemathesis…)
```

`output-openapi` is the **contract layer** between DNA's product layer and any technical implementation. It does not own the spec (DNA does) and it does not implement the API (CBA's adapters do). Its single job: emit faithful OpenAPI 3.1 from a `product.api.json`.

## Hard contract

- **Signature:** `render(productApi: ProductApi, options?: RenderOptions): OpenApiOutput`
- **Sync and pure.** No I/O, no Promises.
- **Zero runtime dependencies.** `@dna-codes/core` is a dev-dep for the test fixture only; never imported at runtime.
- **YAML stringifier is hand-rolled** in `src/yaml.ts` — *do not* add `js-yaml` (or any other YAML library) to `dependencies`. `js-yaml` is only allowed as a test devDep for round-trip parsing.
- **Validation happens against `@apidevtools/swagger-parser`** in tests (devDep), never at runtime.
- **Returns `OpenApiOutput`** (`{ content, format }`) so callers get both the string and the format chosen.

## Layout

```
src/
├── index.ts          # render() + buildDocument() + mapping helpers
├── types.ts          # ProductApi (input) + OpenApiDocument (output) + RenderOptions
├── yaml.ts           # hand-rolled YAML stringifier
└── index.test.ts     # bookshop round-trip + OpenAPI 3.1 schema validation + snapshots
```

## v0.1 scope and the SSE convention

The `Endpoint` shape in `@dna-codes/schemas/product/api/endpoint.json` carries:
- a single `request` (no content type)
- a single `response` (no content type, no status-code map)

So this package hardcodes `application/json` for every request and response, and emits `responses["200"]` only. SSE endpoints, multi-status responses, and alternate content types are **not** faithfully rendered.

Convention for v0.1: callers document streaming or status-specific behavior in the endpoint's `description` (prose). The renderer preserves that prose verbatim. See the test `preserves endpoint description verbatim, including SSE-behavior prose (v0.1 convention)` for the supported shape.

A future `redesign-endpoint-responses` change in `@dna-codes/schemas` will promote `response` to a status-code-keyed map with per-status content type. When that lands, this package gains:
- proper `responses[<status>].content[<media-type>]` emission
- `text/event-stream` rendering for SSE endpoints
- 4xx/5xx response schemas

That work is decoupled from this package's v0.1.

## Adding a new mapping

The mapping is centralized in `index.ts`. To add a new field:

1. Extend the `ProductApi`-side type in `types.ts` if the field isn't there.
2. If it's a top-level concept (servers, security schemes, callbacks), add to `OpenApiDocument` in `types.ts` and emit in `buildDocument()`.
3. If it's an endpoint-level concept (security, deprecated, x-vendor extensions), emit in `buildOperation()`.
4. Add a focused test in `index.test.ts` under "render() — mapping rules". Keep tests structural (assert on parsed-back YAML), not string-matching.
5. Update the mapping table in `README.md`.

## Field type mapping

`mapFieldType()` translates DNA's `Field.type` to JSON Schema. New types from `@dna-codes/schemas/product/core/field.json`'s enum should be added there. The current mapping:

| DNA type     | JSON Schema                              |
|--------------|------------------------------------------|
| `string`/`text`/`phone`/`reference` | `string`               |
| `number`     | `number`                                 |
| `boolean`    | `boolean`                                |
| `date`       | `string` + `format: date`                |
| `datetime`   | `string` + `format: date-time`           |
| `email`      | `string` + `format: email`               |
| `url`        | `string` + `format: uri`                 |
| `enum`       | `string` + `enum: values`                |

When adding a new type, add a case in `mapFieldType()` and a test asserting the output schema.

## Testing

```bash
npm run build -w @dna-codes/output-openapi
npm test     -w @dna-codes/output-openapi
```

The bookshop fixture (`@dna-codes/core` → `bookshopInput.productApi`) is the canonical test input. Cross-adapter consistency requires it stays the source of truth — if you need to extend it, do so in `packages/core/src/fixtures/bookshop.ts` and rebuild core before re-running tests here.

## Snapshots

`emits stable output for the bookshop fixture (snapshot)` writes `src/__snapshots__/index.test.ts.snap`. Review diffs carefully — any change to the renderer surfaces as a YAML diff, which is exactly the point. Update snapshots with `--updateSnapshot` only when the change is intended.
