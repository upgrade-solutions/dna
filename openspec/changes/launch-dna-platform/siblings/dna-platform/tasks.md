## 1. Repository creation

- [ ] 1.1 Create GitHub repo (final org TBD per design open-question #2). Public, MIT license.
- [ ] 1.2 Initial commit: `README.md`, `AGENTS.md`, `.gitignore` (`output/`, `node_modules/`, `.env*`), `LICENSE`, `package.json` skeleton.
- [ ] 1.3 Adopt OpenSpec workflow: copy `openspec/` setup from the dna repo (then prune to start fresh — keep conventions, not content).
- [ ] 1.4 Add a `CLAUDE.md` at the root mirroring the dna repo's pattern (project orientation, OpenSpec workflow note).

## 2. Dependencies and toolchain

- [ ] 2.1 `package.json` declares exact-version deps:
  ```
  "dependencies": {
    "@dna-codes/core":           "<published version>",
    "@dna-codes/input-text":     "<published version>",
    "@dna-codes/output-openapi": "<published version>"
  },
  "devDependencies": {
    "cba": "github:upgrade-solutions/cell-based-architecture#<sha>"
  }
  ```
- [ ] 2.2 Confirm `@dna-codes/output-openapi` is published from the dna repo (sister change task 6.2). Block on that if not yet.
- [ ] 2.3 Confirm CBA changes (astro adapter, lambda compute, terraform-aws lambda extension) are merged to a SHA we can pin. Block on the cell-based-architecture sister change tasks.

## 3. DNA documents — stub minimum for end-to-end

- [ ] 3.1 `dna/dna-codes/operational.json` — `Customer`, `APIKey`, `Subscription`, `UsageEvent` resources with minimal attributes; `Customer.SignUp`, `APIKey.Issue`, `APIKey.Revoke`, `Text.Parse`, `UsageEvent.Record` operations. Stub access rules (open access for v1; tightened in `add-github-oauth` child change).
- [ ] 3.2 `dna/dna-codes/product.api.json` — `POST /v1/text` (SSE response, JSON request), `GET /v1/usage`, `POST /v1/keys`, `DELETE /v1/keys/:id`. Webhook + auth callback endpoints stubbed but unimplemented (filled in by `add-stripe-billing`, `add-github-oauth`).
- [ ] 3.3 `dna/dna-codes/product.ui.json` — placeholder pages: marketing landing (1 page), app shell (1 page with playground form + dashboard link), docs landing (1 page).
- [ ] 3.4 `dna/dna-codes/technical.json` — six cells per design decision #1; environments `dev` (docker-compose) and `prod` (terraform-aws); provider config via env vars.
- [ ] 3.5 Validate documents: `cba validate dna-codes` reports clean.

## 4. Local stack — Phase 0

- [ ] 4.1 `cba develop dna-codes --env dev` brings up the full stack on docker-compose. Confirm: postgres reachable, four UI cells served on local ports, api on a local port.
- [ ] 4.2 Smoke test the api locally: `curl localhost:<api-port>/v1/text -d '{"text":"Acme lends money..."}'` returns DNA.
- [ ] 4.3 Smoke test SSE streaming: `curl -N -H "Accept: text/event-stream" localhost:<api-port>/v1/text -d ...` streams `tool_call` events then a `result` event.
- [ ] 4.4 Smoke test the playground UI hitting the local api.

## 5. AWS account and DNS

- [ ] 5.1 Set up AWS account, IAM roles for terraform, S3 backend bucket for terraform state, DynamoDB lock table.
- [ ] 5.2 Acquire ACM certificate for `*.dna.codes` (DNS-validated, in `us-east-1` for CloudFront).
- [ ] 5.3 Configure DNS provider (Route 53 per design lean, or Cloudflare). Ensure delegation correct.

## 6. First production deploy — Phase 1

- [ ] 6.1 `cba deploy dna-codes --env prod --adapter terraform/aws` — generate terraform under `output/dna-codes/prod/deploy/`.
- [ ] 6.2 Manual review of generated `.tf` files — first time through, eyeball IAM, security groups, RDS settings, CloudFront cache policies.
- [ ] 6.3 `terraform init` (with S3 backend), `terraform plan`, review.
- [ ] 6.4 `terraform apply`. Capture outputs (CloudFront domain names, API endpoint).
- [ ] 6.5 Add DNS records: `dna.codes` → marketing CloudFront; `app.dna.codes` → app CloudFront; `api.dna.codes` → api CloudFront; `docs.dna.codes` → docs CloudFront.
- [ ] 6.6 Smoke test each subdomain over HTTPS. SSL valid, content serves.
- [ ] 6.7 Smoke test `POST https://api.dna.codes/v1/text` with a sample input. SSE works through CloudFront.
- [ ] 6.8 Verify WAF rate limit fires after expected threshold (anonymous tier).

## 7. Operational hygiene

- [ ] 7.1 Set up CloudWatch alarms: lambda errors, RDS CPU, CloudFront 5xx rate.
- [ ] 7.2 Set up cost budgets: alert at 50%/75%/100% of monthly budget.
- [ ] 7.3 Document the deploy runbook in `README.md`: how to bump CBA SHA, how to deploy, how to rollback.
- [ ] 7.4 Document secrets management: which Secrets Manager entries exist, how to rotate `LLM_API_KEY`.

## 8. Hand-off to subsequent child changes

- [ ] 8.1 File child change proposals (one per item) for: `add-github-oauth`, `add-api-keys-and-dashboard`, `add-usage-metering`, `add-stripe-billing`, `add-marketing-content`, `add-docs-content`, `add-anonymous-playground-tier`.
- [ ] 8.2 Establish a deploy cadence: each child change ships independently to prod after passing through `cba develop`.
