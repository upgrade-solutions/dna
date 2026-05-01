# AGENTS.md — `@dna-codes/dna-integration-jira`

Notes for AI agents working inside this package.

## What this integration does

Pure-I/O Jira Cloud client. Implements `Integration.fetch` and `Integration.write` from `@dna-codes/dna-ingest`. **No DNA-aware methods on the library API.** Composition with input/output adapters lives in `src/cli.ts` only.

```
[caller]  jira://EPIC ──▶ client.fetch ──▶ {contents, mimeType, source}
                                              │
                          (caller composes with input/output adapters)
                                              │
[caller]  jira:child://EPIC?... ──▶ client.write ──▶ {target: jira://NEW-KEY}
```

## Why this package has zero adapter deps

It used to import `@dna-codes/dna-input-text` and `@dna-codes/dna-output-text` at runtime to bake the Epic→DNA→Stories pipeline inside the integration. That was a category error — integrations are pure I/O. After `factor-jira-to-pure-io`:

- `dependencies`: only `@dna-codes/dna-core` (types) and `@dna-codes/dna-ingest` (the `Integration`/`WritePayload`/`WriteResult` contracts).
- `devDependencies`: `@dna-codes/dna-input-text` and `@dna-codes/dna-output-text` — used **only** by `src/cli.ts`. The CLI is the canonical composition example.

Don't add input-/output-adapter packages to `dependencies`. If you need to add new functionality that pipelines DNA, do it in `cli.ts` (or the caller's code).

## File layout

| File | Responsibility |
|---|---|
| `src/client.ts` | Jira REST v3 transport, `Integration.fetch`/`write`, label helpers — pure I/O |
| `src/adf.ts` | Atlassian Document Format ⇄ plain text |
| `src/cli.ts` | `pull`, `push`, `update`, `sync` subcommands — composes the client with `parseText` (input-text) and `renderMany` (output-text) |
| `src/types.ts` | Jira record shapes (subset), `ClientOptions`, `Client` interface |
| `src/index.ts` | Barrel exports |
| `bin/integration-jira.js` | `process.exit` shim for the CLI |

## Hard contracts

- **Basic auth only.** No OAuth flow (Atlassian OAuth 2.0 is separate and requires an Atlassian-approved app). Users supply an email + API token.
- **Library API stays DNA-free.** No method on `Client` may take or return an `OperationalDNA`, `ParseResult`, `Style`, or any DNA shape. If a useful flow needs DNA, it goes in `src/cli.ts` — not in `client.ts`.
- **No new cross-adapter imports in library code.** `src/client.ts`, `src/adf.ts`, and `src/types.ts` MUST NOT import `@dna-codes/dna-input-*` or `@dna-codes/dna-output-*`. Only `src/cli.ts` (and CLI tests, if added) may.
- **URI shapes are the public contract.** `jira://<KEY>` (fetch and update) and `jira:child://<EPIC>` (create) are documented in README; treat them as stable.
- **Epic Link field:** Jira Cloud uses `customfield_10014`. The client honors `epicLinkMode` (`auto` | `parent` | `epic-link`).
- **No webhook.** Jira Cloud's native outbound webhooks aren't safely verifiable by an external consumer. The `serve` subcommand is intentionally absent — see README for the reasoning.

## Testing

`fetch` is mocked via a local helper (see `src/index.test.ts`). Don't call the real Jira API in CI; add dry-run support rather than live tests.

```bash
npm run build -w @dna-codes/dna-integration-jira
npm test   -w @dna-codes/dna-integration-jira
```

## Manual smoke test

```bash
export JIRA_BASE_URL=https://<site>.atlassian.net
export JIRA_EMAIL=you@company.com
export JIRA_API_TOKEN=...
export JIRA_PROJECT_KEY=ENG
export DNA_LLM_PROVIDER=anthropic
export DNA_LLM_API_KEY=...

npx integration-jira pull --epic ENG-123 --out /tmp/dna.json
npx integration-jira push --epic ENG-123 --in /tmp/dna.json --dry-run
```
