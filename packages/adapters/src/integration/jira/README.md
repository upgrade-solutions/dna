# `@dna-codes/dna-integration-jira`

Pure-I/O Jira Cloud integration. Implements the `Integration` port from `@dna-codes/dna-ingest`: it fetches Epic prose and writes back arbitrary `text/markdown` bytes. Composition with input/output adapters (Epic → DNA → Stories) lives in `src/cli.ts` — that's the canonical example for callers.

```
[caller]  jira://EPIC ──▶ client.fetch ──▶ {contents, mimeType, source}
                                              │
                       (caller composes with @dna-codes/dna-input-text)
                                              ▼
                                             DNA
                                              │
                       (caller composes with @dna-codes/dna-output-text)
                                              ▼
                                          [doc.title, doc.body, doc.id]
                                              │
[caller]  jira:child://EPIC?summary=…&label=… ──▶ client.write ──▶ {target: jira://NEW-KEY}
```

The integration's library API contains zero DNA-aware methods. Parsing and rendering live in their own adapter packages and are composed by the caller.

Node 18+ (global `fetch`). Runtime deps: `@dna-codes/dna-core`, `@dna-codes/dna-ingest`. `@dna-codes/dna-input-text` and `@dna-codes/dna-output-text` are devDeps — used only by the bundled CLI.

## Install

```bash
npm install @dna-codes/dna-integration-jira
```

## Credentials

Jira Cloud uses Basic auth with an API token (not a password). Create one at <https://id.atlassian.com/manage-profile/security/api-tokens>.

```bash
export JIRA_BASE_URL=https://<site>.atlassian.net
export JIRA_EMAIL=you@company.com
export JIRA_API_TOKEN=...              # Atlassian API token
export JIRA_PROJECT_KEY=ENG
# Optional: override the child issue type (defaults to 'Story').
export JIRA_STORY_ISSUE_TYPE=Story
```

For the `pull` and `sync` CLI commands, `@dna-codes/dna-input-text` needs an LLM provider:

```bash
export DNA_LLM_PROVIDER=anthropic       # or openai / openrouter
export DNA_LLM_API_KEY=...              # or ANTHROPIC_API_KEY / OPENAI_API_KEY
```

## CLI

The CLI is the canonical composition example: open `src/cli.ts` to see how the pure-I/O client is wired up with `parseText` and `renderMany`.

```bash
# Pull an Epic and write DNA JSON. Composes: client.fetch → input-text.parse.
npx integration-jira pull --epic ENG-123 --out dna.json

# Dry-run a push.
npx integration-jira push --epic ENG-123 --in dna.json --dry-run

# Create child Stories under ENG-123. Composes: output-text.renderMany → client.write.
npx integration-jira push --epic ENG-123 --in dna.json --labels generated,review

# Pick a body style for each Story (default: user-story).
npx integration-jira push --epic ENG-123 --in dna.json --style gherkin
npx integration-jira push --epic ENG-123 --in dna.json --style product-dna

# Re-render existing dna-labeled Stories in place (no duplicates).
# Composes: output-text.renderMany → client.searchChildrenByDnaLabel → client.write.
npx integration-jira update --epic ENG-123 --in dna.json --style gherkin

# Pull + push in a single run.
npx integration-jira sync --epic ENG-123
```

## URI shapes

The client implements `Integration.fetch` and `Integration.write` from `@dna-codes/dna-ingest`. Two URI shapes are accepted:

| URI | Direction | Behavior |
|---|---|---|
| `jira://<KEY>` | `fetch` | Returns the issue's prose (summary + ADF description), MIME `text/markdown`. |
| `jira://<KEY>?summary=…&label=…` | `write` | PUT update issue `<KEY>`. `summary` is optional (only set if present). `label`, when present, replaces any existing `dna:*` label and preserves all others. |
| `jira:child://<EPIC>?summary=…&label=…` | `write` | POST a new child issue under Epic `<EPIC>`. `summary` is required. `label` becomes the issue's `dna:<label>` tag. Child is linked via `parent` and/or `customfield_10014` per the client's `epicLinkMode` option (default `auto`: both). |

Both `write` URIs accept multiple `extra-label=<value>` query params for additional Story labels.

`payload.mimeType` must be `text/markdown`. Anything else is rejected.

## Programmatic usage (pure I/O)

```ts
import { createClient } from '@dna-codes/dna-integration-jira'

const client = createClient({
  baseUrl: process.env.JIRA_BASE_URL!,
  email: process.env.JIRA_EMAIL!,
  apiToken: process.env.JIRA_API_TOKEN!,
  projectKey: process.env.JIRA_PROJECT_KEY!,
})

// Fetch an Epic's prose.
const { contents } = await client.fetch('jira://ENG-123')

// Compose with your own input/output adapters here.
// (See src/cli.ts for the canonical pattern.)

// Write back a child Story.
const { target } = await client.write(
  'jira:child://ENG-123?summary=' + encodeURIComponent('Apply Loan') + '&label=operation-loan-apply',
  { contents: 'As a Borrower\n\nI want to submit a loan…', mimeType: 'text/markdown' },
)
console.log(target) // → 'jira://ENG-456'
```

## API surface

| Export | Purpose |
|---|---|
| `createClient(options)` | Build a Jira client implementing `Integration` (fetch/write) plus low-level escape hatches (`getEpic`, `searchIssues`, `createIssue`, `updateIssue`, `extractEpicText`, `searchChildrenByDnaLabel`) |
| `extractText(adf)` / `fromMarkdown(text)` | ADF ⇄ plain text helpers |
| `runCli(argv, env?)` | Programmatic CLI entry — composition example |

## No webhook surface

Jira Cloud's native outbound webhooks don't ship signed payloads that an external verifier can validate safely. Rather than ship a stub that skips verification, this package has no `serve` command. Options for inbound events:

1. **Jira Automation** — add a rule that posts to your endpoint with a shared secret in the body, and verify it yourself (pattern in `integration-example`'s `webhook.ts`).
2. **Forge** — build an app that runs inside Atlassian's sandbox; auth is JWT-based and not suited for a generic external gateway.

## License

MIT.
