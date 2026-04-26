## Context

Three repos converge on this deployment:

- **`dna`** — the npm libraries (`@dna-codes/*`).
- **`cell-based-architecture`** — the framework + CLI + cells + adapters.
- **`dna-platform`** (this repo) — the deployed product.

The platform is a consumer of the other two. It does not contain framework code. Everything that runs at `dna.codes` is generated from the four DNA documents under `dna/dna-codes/` by `cba deploy`.

The architectural decisions that bind across repos are documented in the dna repo's `launch-dna-platform/design.md` and the cell-based-architecture sister proposal's design. This design covers only the dna-platform-specific decisions.

## Goals / Non-Goals

**Goals**
- Stand up a working four-subdomain deployment of `dna.codes` from DNA documents.
- Establish OpenSpec workflow in this repo from day one. All future platform work is proposed → applied → archived here.
- Pin upstream versions strictly. `@dna-codes/*` packages by exact npm version; CBA by git SHA. No floating dependencies in production.
- Phase 1 ships an empty-but-functional shell: every subdomain serves; the API endpoint exists and returns DNA from a sample input. Real content and integrations come in subsequent child changes.

**Non-Goals**
- Real marketing copy, real docs content, or polished playground UX. Those are child changes.
- Auth, billing, or usage metering. All deferred to child changes.
- Multi-region, blue/green, canary deploys. Single region direct-replace for v1.
- BYO LLM keys (enterprise tier). Provider config is env-only in v1; per-org DB override is a future capability.

## Decisions

### 1. Six cells, one technical.json

```json
{
  "cells": [
    { "name": "marketing", "type": "ui-cell", "adapter": "astro",
      "config": { "flavor": "marketing" }, "domain": "dna.codes" },
    { "name": "docs", "type": "ui-cell", "adapter": "astro",
      "config": { "flavor": "starlight", "openapi": "build/openapi.yaml" },
      "domain": "docs.dna.codes" },
    { "name": "app", "type": "ui-cell", "adapter": "next/react",
      "domain": "app.dna.codes" },
    { "name": "api", "type": "api-cell", "adapter": "node/fastify",
      "config": { "compute": "lambda" }, "domain": "api.dna.codes" },
    { "name": "db", "type": "db-cell" },
    { "name": "events", "type": "event-bus-cell", "config": { "transport": "sns-sqs" } }
  ]
}
```

Each ui-cell ships its own CloudFront distribution + S3 origin. The `api` cell ships Lambda + Function URL + CloudFront in front. `db` is RDS Postgres with RDS Proxy (because `api.compute === 'lambda'`). `events` is SNS topics + SQS queues for usage metering.

### 2. Repo layout and dependency pinning

```
package.json
{
  "dependencies": {
    "@dna-codes/core": "0.3.0",          ← exact version, no ^
    "@dna-codes/input-text": "0.3.0",
    "@dna-codes/output-openapi": "0.1.0"
  },
  "devDependencies": {
    "cba": "github:upgrade-solutions/cell-based-architecture#<sha>"
  }
}
```

Bumps are deliberate, reviewed, and tied to a deploy. No semver caret ranges. The platform never auto-upgrades.

### 3. Local dev = docker-compose; prod = terraform-aws

`cba develop dna-codes --env dev` brings up the full stack (postgres, sqs equivalent, all four UI cells served on local ports, api on a local port). Used for iteration.

`cba deploy dna-codes --env prod --adapter terraform/aws` generates the terraform; `terraform apply` does the deploy. Not auto-deployed; review every plan.

### 4. DNS and TLS

- DNS managed in AWS Route 53 (or Cloudflare — TBD).
- ACM cert for `*.dna.codes` (DNS-validated, auto-renewing). One cert covers all subdomains.
- Each subdomain has a separate CloudFront distribution; each distribution gets the same cert.

### 5. API design — `/v1/text`

Single primary endpoint:

- `POST /v1/text` — request body `{ text: string, layers?: Layer[], mode?: 'one-shot' | 'layered', instructions?: string }`. With `Accept: text/event-stream`, response is SSE; otherwise JSON-buffered. Auth via `Authorization: Bearer dna_live_...` for keyed access; otherwise rate-limited anonymous via WAF rule on the playground origin.
- The handler thin-wraps `@dna-codes/input-text.parse()`, forwarding `LayeredConstructor` events as SSE `tool_call` events.
- On completion, emits `UsageEvent` to the SNS topic with token counts, customer ID (or null), endpoint, duration.

**OpenAPI description note (per dna-repo design decision #3)**: the `Endpoint` for `/v1/text` in `product.api.json` will declare its `request`/`response` against the JSON shapes only. The SSE behavior is documented in the endpoint's `description` text (event names, ordering, when SSE vs JSON applies). This is the v0.1 contract limitation; faithful media-type rendering arrives with the future `redesign-endpoint-responses` schema change.

### 6. Anonymous playground rate limiting in v1

WAF rate-based rule on the api.dna.codes CloudFront distribution. Bucket: per IP, 5 requests per 5 minutes for unauthenticated traffic (`Authorization` header absent). Authenticated traffic bypasses the WAF rule and is rate-limited by the customer's plan in the api-cell handler.

This is good enough for v1. Signed-token rate limiting (where app.dna.codes issues a short-lived token to the playground iframe and the api-cell verifies it) is a future capability when the WAF approach proves insufficient.

### 7. Provider config

```
ENV LLM_PROVIDER=anthropic           # one of: anthropic, openai, openrouter
ENV LLM_API_KEY=...                  # Secrets Manager
ENV LLM_MODEL=claude-sonnet-4-5      # provider-specific
```

api-cell reads these at cold start, passes them through to `@dna-codes/input-text.parse()`. No DB lookup in v1.

Future capability: per-org `provider_config` table (org_id, provider, api_key_secret_arn, model). When present, overrides env. Allows enterprise BYO-key. Out of scope for this change.

## Phasing within this repo

```
Phase 0    Repo bootstrap (this change). README, package.json, .gitignore,
           openspec/, MIT license, AGENTS.md.

Phase 1    Stub DNA documents — minimal operational/product/technical
           sufficient to `cba develop` locally and `cba deploy` to AWS.
           "Empty shell": four subdomains serve, api returns DNA from a
           hard-coded LLM provider config.

Phase 2+   Child changes — auth, billing, metering, content. Each is its
           own OpenSpec proposal in this repo.
```

This change covers Phases 0 + 1.

## Open Questions

1. **DNS provider** — Route 53 (AWS-native, integrates with terraform-aws cleanly) vs Cloudflare (already common in the org). Lean: Route 53 for v1; revisit if Cloudflare features wanted later.
2. **Final org for the GitHub repo** — `dna-codes/dna-platform` (matches the npm scope) vs `upgrade-solutions/dna-platform` (matches the parent org). Lean: `dna-codes/dna-platform` for brand cohesion, but defer to whoever owns `dna-codes` org permissions.
3. **OpenSpec adoption** — copy the OpenSpec setup from this dna repo's `openspec/` directory directly, or generate fresh? Lean: copy then prune, retain identical conventions.
4. **First-deploy LLM provider** — Anthropic (decided default for v1) vs OpenRouter (lets users pick model later). Lean: Anthropic only for v1; cleanest billing story.
