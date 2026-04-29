# AGENTS.md — `@dna-codes/dna-integration-jira`

Notes for AI agents working inside this package.

## What this integration does

Implements the canonical DNA pipeline against one real system:

```
Jira Epic → input-text → DNA → output-text → Jira Stories
```

This is the first integration to exercise the full bidirectional contract end-to-end, so it doubles as a proof that the `input-*` / `output-*` interfaces are actually symmetric.

## Why this package has runtime deps

The template `integration-example` ships zero runtime deps by design. This package takes two:

- `@dna-codes/dna-input-text` — parse the Epic description into DNA
- `@dna-codes/dna-output-text` — render one Story per DNA Capability

Both are `@dna-codes/*` packages, not third-party SDKs. An integration legitimately needs to compose `input-*` and `output-*`; that's its reason to exist. Don't add other runtime deps without updating this note.

## File layout

| File | Responsibility |
|---|---|
| `src/client.ts` | Jira REST v3 transport: Basic auth, pull Epic, create issues |
| `src/adf.ts` | Atlassian Document Format ⇄ plain text |
| `src/mapping.ts` | Pure DNA → Jira `fields[]` translation (one Story per Capability) |
| `src/cli.ts` | `pull`, `push`, `sync` subcommands |
| `src/types.ts` | Jira record shapes (subset) and client options |
| `src/index.ts` | Barrel exports |
| `bin/integration-jira.js` | `process.exit` shim for the CLI |

## Hard contracts

- **Basic auth only.** No OAuth flow (Atlassian OAuth 2.0 is separate and requires an Atlassian-approved app). Users supply an email + API token.
- **Transport separate from mapping.** Don't import `mapping.ts` from `adf.ts` or vice versa. Client is the only module that does HTTP.
- **One Capability → one Story.** If you add other units later (Resources → Stories, Processes → Epics-within-Epic), do it as a separate mapping function, not by mutating `dnaToStoryFields`.
- **Epic Link field:** Jira Cloud uses `customfield_10014`. Document clearly if you parameterize this; don't silently rewrite.
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
