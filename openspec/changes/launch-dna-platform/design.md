## Context

`product.api.json` is DNA's API description: `Endpoint`, `Namespace`, `Param`, `Schema`. Today, CBA's `api-cell` adapters (NestJS, Express, Fastify, Rails, FastAPI) consume `product.api.json` directly to scaffold framework-specific code.

That coupling has two costs:

1. **Every new CBA adapter re-derives the DNA→framework mapping** — there is no shared canonical translation of DNA's API primitives.
2. **DNA loses leverage with the existing API tooling ecosystem** — Postman, OpenAPI generators, redoc, schemathesis, prism, all speak OpenAPI, none speak `product.api.json`.

`@dna-codes/output-openapi` is the fix. It defines the canonical translation once and emits a standard contract every downstream consumer already understands. CBA's technical adapters become readers of OpenAPI, not readers of DNA — which is the right cut: CBA's job is *implementation*, DNA's job is *spec*.

## Goals / Non-Goals

**Goals**
- Pure renderer, no I/O, zero dependencies (`output-*` package convention).
- Output is OpenAPI 3.1 — the latest version, JSON-Schema-2020-12-aligned (matches DNA's schemas).
- Both YAML and JSON output formats from a single call (`format` option).
- The canonical bookshop fixture round-trips through `output-openapi` and validates against an OpenAPI 3.1 schema validator.
- v0.1 scope: every request and response is `application/json` (see decision #3).

**Non-Goals**
- Per-endpoint content type or media type negotiation. The `Endpoint` schema today has no `content_type` field; v0.1 assumes `application/json` everywhere. Faithful SSE / multi-content-type rendering is deferred to a follow-on change (`redesign-endpoint-responses`) that promotes `response` to a status-code-keyed map.
- Multi-status-code responses (4xx/5xx schemas). The current `Endpoint` schema has a single `response` field; v0.1 emits it under the `200` status code.
- OpenAPI extensions (`x-*` vendor extensions) — not needed for v1.
- OpenAPI 3.0 output — only 3.1 is shipped. Older consumers can downconvert externally if needed.
- Validation of `product.api.json` itself. That belongs in `@dna-codes/core`'s validator, not in the renderer. `render()` assumes input is already valid.
- `input-openapi` work. That package already exists. Round-trip equivalence (`output-openapi(input-openapi(yaml)) ≈ yaml`) is a nice property but not a v1 goal.

## Decisions

### 1. Render signature

```ts
render(
  productApi: ProductApi,
  options?: { format?: 'yaml' | 'json' /* default: 'yaml' */ }
): { content: string; format: 'yaml' | 'json' }
```

Why a result object and not a string: lets callers handle YAML and JSON uniformly, and leaves room for a future `warnings` field without a breaking change.

### 2. YAML emission without a YAML dependency

Zero-dep convention forbids `js-yaml`. DNA's other `output-*` packages emit YAML by hand; do the same here. OpenAPI's YAML surface is narrow (no anchors, no flow style needed) so a 50-line stringifier suffices. Same approach as `@dna-codes/output-markdown`'s structured output.

### 3. SSE in v0.1: prose, not OpenAPI

The platform's `POST /v1/text` is the first DNA API that streams over Server-Sent Events at runtime. The current `@dna-codes/schemas` `Endpoint` definition cannot express that — `request` and `response` are single direct schema `$ref`s with no `content_type` field, and `response` is a single value (not a status-code map). A faithful rendering of SSE or multi-status responses requires upstream schema work.

**v0.1 decision**: render everything as `application/json` and document SSE behavior in the endpoint's `description` (prose). This is the same pattern Anthropic's messaging API uses — the OpenAPI doc is conservative; the prose explains the streaming behavior. SDK consumers and Postman imports will treat `/v1/text` as a regular request/response; that is a known v1 limitation, surfaced honestly in the description text.

A future OpenSpec change in this repo (`redesign-endpoint-responses`) will promote `response` to a status-code-keyed map with per-status content type, enabling proper SSE rendering and multi-status responses. That work is decoupled from this change.

### 4. Mapping table

| DNA primitive                  | OpenAPI target                                                  |
|--------------------------------|-----------------------------------------------------------------|
| `Endpoint(method, path)`       | `paths[path][method]`                                           |
| `Endpoint.operation`           | `paths[path][method].operationId` (camelCased)                  |
| `Endpoint.description`         | `paths[path][method].description` (SSE behavior documented here) |
| `Endpoint.params[in:'path']`   | `paths[path][method].parameters[]` with `in: 'path'`            |
| `Endpoint.params[in:'query']`  | `parameters[]` with `in: 'query'`                               |
| `Endpoint.params[in:'header']` | `parameters[]` with `in: 'header'`                              |
| `Endpoint.request`             | `requestBody.content["application/json"].schema`                |
| `Endpoint.response`            | `responses["200"].content["application/json"].schema`           |
| `Schema`                       | `components.schemas[Schema.name]`                               |
| `Namespace`                    | `paths[path][method].tags = [namespace]`                        |

### 5. No CBA-side OpenAPI emitter

CBA does not, and will not, emit OpenAPI from `product.api.json`. CBA's `api-cell` adapters consume the OpenAPI document produced by this package. Rationale: single source of truth, no drift between two emitters, and DNA stays the canonical product spec owner.

(This decision is captured here because it materially defines `output-openapi`'s role; see `siblings/cell-based-architecture/design.md` for the corresponding consumer-side decision.)

## Open Questions

1. Should the package expose a streaming-friendly variant for very large API specs? Not for v1 (no spec is that large), but worth noting if `dna-platform`'s `product.api.json` ever explodes.
