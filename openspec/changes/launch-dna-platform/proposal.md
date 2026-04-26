## Why

DNA's product layer (`product.api.json`) describes APIs in DNA's own primitives — `Endpoint`, `Namespace`, `Param`, `Schema`. To implement those APIs, downstream consumers (CBA's `api-cell` adapters in particular) need a standard contract. **OpenAPI 3.1 is that contract.**

This change ships `@dna-codes/output-openapi`: a pure renderer from `product.api.json` to OpenAPI 3.1 (YAML or JSON). It is the canonical OpenAPI emitter for DNA. CBA defers to it — CBA's technical adapters (Rails, NestJS, Fastify, Django, Lambda, …) consume the emitted OpenAPI document, not `product.api.json` directly. That keeps responsibilities cleanly split:

- **DNA** owns the *product spec*.
- **`output-openapi`** is the contract layer.
- **CBA** owns the *technical implementation*.

The immediate forcing function is the launch of `dna-platform` (the deployed `dna.codes` product) — see `siblings/dna-platform/proposal.md` for that side, and `siblings/cell-based-architecture/proposal.md` for the CBA work that consumes this artifact.

## What Changes

- New package `@dna-codes/output-openapi`, structured per existing output-* package conventions (zero deps, `render(productApi, options?)` signature, mirrors `@dna-codes/output-markdown`).
- `render()` returns `{ content: string, format: 'yaml' | 'json' }` so callers (CBA adapters, docs builders, Postman importers) can choose.
- Maps DNA `Endpoint` → OpenAPI `paths.<route>.<method>`, `Schema` → `components.schemas`, `Param` → typed parameter, `Namespace` → tags + path prefix.
- Round-trips against the canonical bookshop fixture re-exported from `@dna-codes/core`.
- Round-trips against `dna-platform`'s `product.api.json` once that repo exists (the dogfood test).
- README and AGENTS.md per package convention.

This proposal explicitly does **not** modify any other package in this repo. `@dna-codes/input-text` is verified, not changed: `LayeredConstructor.handle()` is synchronous and per-tool-call, suitable for the api-cell to wrap and emit SSE events from.

**Scope note for v0.1**: per design decision #3, output-openapi assumes `application/json` for every request and response. The platform's `/v1/text` endpoint streams over SSE at runtime; that behavior is documented in the endpoint's `description` (prose), not in the OpenAPI media types. Faithful SSE / multi-status-code rendering is deferred to a follow-on change (`redesign-endpoint-responses`) that requires upstream schema work in `@dna-codes/schemas`.

## Capabilities

### New Capabilities
- `output-openapi` — render `product.api.json` to OpenAPI 3.1 YAML or JSON. The contract layer between DNA's product layer and any technical implementation.

### Modified Capabilities
<!-- None. This is purely additive. -->

## Impact

- **Affected packages**: new `packages/output-openapi/` only.
- **Dependencies**: none added (zero-dep convention).
- **Consumers**: `@dna-codes/output-openapi` becomes a hard dependency of CBA's `api-cell` lambda adapter once that adapter lands in `cell-based-architecture`. It is also consumed by `dna-platform` for rendering `docs.dna.codes`'s API reference via `starlight-openapi`. Neither of those consumers exists yet; this change unblocks both.
- **Risk**: low. Pure renderer, well-bounded surface, mirrors an established package shape.
