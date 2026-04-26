## Why

DNA — the description language and library suite at `@dna-codes/*` — currently has no public face. There is no marketing site, no playground, no hosted API, no docs site. A prospective user has to clone a repo and read code to feel the pitch.

This change creates the `dna-platform` repository and ships its first deployment: a four-subdomain platform on `dna.codes`, deployed by Cell-Based Architecture from DNA documents. The dogfood loop is the point — the marketing pitch ("describe your business, get working software") is proved by the site that delivers it.

Public surfaces:

- **`dna.codes`** — fully static marketing site (Astro). Hero demo, framework comparisons, pricing, sign-up CTA.
- **`app.dna.codes`** — Next.js application. Anonymous playground (`/playground`), customer dashboard (sign-in via GitHub OAuth, API keys, usage view, billing).
- **`api.dna.codes`** — Lambda-on-Function-URL Fastify service wrapping `@dna-codes/input-text`. SSE streaming. Bearer auth. Usage metering.
- **`docs.dna.codes`** — Astro + Starlight. Language reference, package reference, API reference (rendered from `@dna-codes/output-openapi`).

Sister proposals: [`@dna-codes/output-openapi`] in the dna repo (the contract layer this platform depends on); [`launch-dna-platform`] in `cell-based-architecture` (the three CBA additions this platform requires).

## What Changes

### Repository

- New repository `dna-codes/dna-platform` (or `upgrade-solutions/dna-platform` — final org TBD).
- Public, MIT-licensed, OpenSpec workflow adopted from day one.
- Standard layout:
  ```
  dna-platform/
  ├── dna/dna-codes/
  │   ├── operational.json
  │   ├── product.api.json
  │   ├── product.ui.json
  │   └── technical.json
  ├── package.json   (deps: @dna-codes/{core,input-text,output-openapi}, cba)
  ├── output/        (gitignored — cba deploy artifacts)
  ├── openspec/      (mirrors dna repo's setup)
  └── README.md
  ```

### DNA documents (`dna/dna-codes/`)

- `operational.json` — `Customer`, `APIKey`, `Subscription`, `UsageEvent` resources; `Customer.SignUp`, `APIKey.Issue`, `APIKey.Revoke`, `Text.Parse`, `UsageEvent.Record` operations.
- `product.api.json` — `POST /v1/text` (SSE), `GET /v1/usage`, `POST /v1/keys`, `DELETE /v1/keys/:id`, `POST /v1/webhooks/stripe`, `POST /v1/auth/github/callback`.
- `product.ui.json` — pages and blocks for marketing, app (playground + dashboard), and docs.
- `technical.json` — six cells: `marketing` (astro), `docs` (astro+starlight), `app` (next/react), `api` (fastify, compute=lambda), `db` (db-cell, postgres), `events` (event-bus-cell, sns+sqs); two environments (dev: docker-compose; prod: terraform-aws).

### Integrations

- **GitHub OAuth** for sign-in. Sessions persisted in Postgres. No magic-link email in v1.
- **Stripe** for metered usage billing. Customer portal for plan management. Webhook handler at `POST /v1/webhooks/stripe`.
- **LLM provider config** — `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL` env vars at api-cell boot. Per-org override via Postgres table is a future capability, not v1.
- **Anonymous playground tier** — IP-based rate limit at AWS WAF on the `/v1/text` route. Signed-token tier is a future capability.

### Phasing within this repo

This change ships the repository and its first end-to-end deploy. Subsequent capabilities (auth, billing, content) are separate child changes within this repo:

```
launch-dna-platform               ← this proposal: repo bootstrap + Phase 1 deploy
add-github-oauth                  ← child change
add-api-keys-and-dashboard        ← child change
add-usage-metering                ← child change
add-stripe-billing                ← child change
add-marketing-content             ← child change (real copy + hero demo)
add-docs-content                  ← child change (language ref, package ref)
add-anonymous-playground-tier     ← child change
```

## Capabilities

### New Capabilities
- `dna-platform-deployment` — six cells configured, deployed, and serving on the four subdomains.
- `provider-config-via-env` — api-cell reads LLM provider config from env vars at boot.

### Capabilities deferred to child changes within this repo
- `github-oauth-auth`
- `api-keys-and-dashboard`
- `usage-metering`
- `stripe-billing`
- `marketing-content`
- `docs-content`
- `anonymous-playground-tier`

## Impact

- **New repository**, public.
- **First production AWS spend** for this org. Estimated v1 monthly: ~$100-300 (RDS small, CloudFront, Lambda invocations, ACM is free).
- **First Stripe account, first GitHub OAuth app, first DNS records on `dna.codes`.**
- **Hard dependencies**:
  - `@dna-codes/output-openapi@>=0.1.0` published from the dna repo (sister change).
  - The three CBA additions (astro adapter, lambda compute target, terraform-aws lambda extension) merged and consumable (sister change).
- **Risk profile**: high in the sense that this is the org's first hosted product. Mitigated by:
  - Phasing — Phase 1 ships an empty marketing site and a stub API; subsequent phases add real content and integrations.
  - Dogfooding — every CBA bug shows up on `dna.codes`, but that's also the forcing function for fixing them.
  - Pin discipline — pin specific versions of `@dna-codes/*` and a CBA git SHA; bump deliberately.
