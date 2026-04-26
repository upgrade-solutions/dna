## 1. Verification (no code changes — completed during planning)

- [x] 1.1 Reviewed `packages/schemas/product/api/endpoint.json`: `request` and `response` are single direct `$ref`s to the schema definition, with no `content_type` field. Per design decision #3, output-openapi v0.1 scopes to `application/json` and documents SSE behavior in prose. The proper response-map redesign is deferred to a follow-on change `redesign-endpoint-responses`.
- [x] 1.2 Reviewed `@dna-codes/input-text`'s `LayeredConstructor`: `handle(call)` is synchronous and per-tool-call, returning a structured `ToolCallResult`. The api-cell can emit one SSE event per `handle()` return without any change to `input-text`.
- [x] 1.3 Confirmed with product owner: CBA defers to DNA for product description; CBA's technical adapters consume the OpenAPI document emitted by `output-openapi`, not `product.api.json` directly.

## 2. Scaffold

- [x] 2.1 Created `packages/output-openapi/` with `package.json`, `tsconfig.json`, `src/index.ts`, `src/index.test.ts`, `README.md`, `AGENTS.md`. Mirrors `packages/output-markdown/` for layout, scripts, jest config, and publish config.
- [x] 2.2 Added types: `OpenApiOutput = { content: string; format: 'yaml' | 'json' }`; local types for the OpenAPI 3.1 root document and the DNA Product API input shape (no external dependency at runtime).

## 3. Core renderer

- [x] 3.1 Implemented `render(productApi, options?)` returning `OpenApiOutput`.
- [x] 3.2 Mapped named `Schema`s referenced by endpoints' `request`/`response` → `components.schemas`, sorted alphabetically for deterministic output.
- [x] 3.3 Mapped `Endpoint[]` → `paths[path][method]` with `operationId` (camelCased from `Resource.Action`), `description` (preserves prose verbatim), `tags` (from `namespace.name`), `parameters` (path/query/header), `requestBody`, `responses`. Path conversion `:id` → `{id}` included.
- [x] 3.4 Mapped `Endpoint.request` → `requestBody.content["application/json"].schema` with `$ref` into `components.schemas` when the schema has a name.
- [x] 3.5 Mapped `Endpoint.response` (singular) → `responses["200"].content["application/json"].schema` with `$ref`. When `response` is absent, emits `responses["204"]` "No Content".
- [x] 3.6 Handcrafted YAML stringifier in `src/yaml.ts` (no `js-yaml` runtime dep). Object keys preserved in declaration order; arrays of objects use compact dash form.
- [x] 3.7 JSON output is `JSON.stringify(doc, null, 2)`.

## 4. Tests

- [x] 4.1 Round-trip the bookshop fixture (re-exported from `@dna-codes/core` via `bookshopInput.productApi`): `render(bookshopProductApi)` produces YAML that `js-yaml` parses back to a structurally valid OpenAPI doc. Required extending `bookshopInput` with a `productApi` block — small additive change to `packages/core/src/fixtures/bookshop.ts`.
- [x] 4.2 Validate rendered YAML and JSON against an OpenAPI 3.1 schema validator (`@apidevtools/swagger-parser`, devDep only). Both formats pass full validation including all `$ref` resolutions.
- [x] 4.3 Snapshot test on the bookshop fixture — `src/__snapshots__/index.test.ts.snap` committed.
- [x] 4.4 Test that `format: 'json'` produces a structure equivalent to the YAML output.
- [x] 4.5 Test that an `Endpoint` whose `description` mentions SSE renders the description verbatim, with `application/json` content type — confirms the v0.1 prose-only SSE convention.

Total: 13 tests passing.

## 5. Documentation

- [x] 5.1 README: install, usage examples (YAML, JSON, custom title/version/description/servers), API table, mapping table, v0.1 limitation note.
- [x] 5.2 AGENTS.md: role in the pipeline, hard contract, layout, v0.1 SSE convention, "how to add a new mapping" guide, field-type mapping table, testing notes.
- [x] 5.3 Updated root `README.md` Output table with the new package, framed as "the contract layer between DNA and any technical implementation".

## 6. Publish

- [x] 6.1 Added `packages/output-openapi` to root `package.json` workspaces array. (Resolved a pre-existing workspace inconsistency along the way: five adapter packages still pinned `@dna-codes/core@^0.2.0` even though core was published as 0.3.0; bumped to `^0.3.0` so `npm install` resolves cleanly. `@dna-codes/integration-jira` still has a pre-existing TypeScript error in `src/client.ts:132` referring to a `capability` Unit removed from output-text — unrelated to this change.)
- [ ] 6.2 Publish as `@dna-codes/output-openapi@0.1.0` to npm. Coordinate with `dna-platform` Phase 1 — the platform will pin this exact version. (Deferred to manual user action.)
- [ ] 6.3 Round-trip test against `dna-platform`'s actual `product.api.json` once that repo exists. Failures here are renderer bugs to fix in this package; this is the dogfood test. (Deferred until `dna-platform` Phase 1.)
