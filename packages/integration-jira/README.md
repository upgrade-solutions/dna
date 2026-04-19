# `@dna-codes/integration-jira`

Bidirectional DNA integration for Jira Cloud.

```
Jira Epic  ──▶  @dna-codes/input-text  ──▶  DNA  ──▶  @dna-codes/output-text  ──▶  Jira Stories
  (read)              (LLM parse)                   (renderMany: 1 per Capability)      (write)
```

- **Pull:** fetch an Epic, extract its summary + description (ADF or plain), parse to DNA via `@dna-codes/input-text`.
- **Push:** render DNA with `@dna-codes/output-text.renderMany({ unit: 'capability' })`, create one child Story per entry under the Epic.

Node 18+ (global `fetch`). Runtime deps: `@dna-codes/input-text`, `@dna-codes/output-text`.

## Install

```bash
npm install @dna-codes/integration-jira
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

For the pull step (epic → DNA), `@dna-codes/input-text` needs an LLM provider:

```bash
export DNA_LLM_PROVIDER=anthropic       # or openai / openrouter
export DNA_LLM_API_KEY=...              # or ANTHROPIC_API_KEY / OPENAI_API_KEY
```

## CLI

```bash
# Pull an Epic and write DNA JSON.
npx integration-jira pull --epic ENG-123 --out dna.json

# Dry-run a push to see what would land in Jira.
npx integration-jira push --epic ENG-123 --in dna.json --dry-run

# Create child Stories under ENG-123.
npx integration-jira push --epic ENG-123 --in dna.json --labels dna,generated

# Pick a body style for each Story (default: user-story).
npx integration-jira push --epic ENG-123 --in dna.json --style gherkin
npx integration-jira push --epic ENG-123 --in dna.json --style product-dna

# Re-render existing dna-labeled Stories in place (no duplicates).
npx integration-jira update --epic ENG-123 --in dna.json --style gherkin

# Pull + push in a single run.
npx integration-jira sync --epic ENG-123
```

## Programmatic usage

```ts
import { createClient } from '@dna-codes/integration-jira'

const client = createClient({
  baseUrl: process.env.JIRA_BASE_URL!,
  email: process.env.JIRA_EMAIL!,
  apiToken: process.env.JIRA_API_TOKEN!,
  projectKey: process.env.JIRA_PROJECT_KEY!,
})

const dna = await client.pullDnaFromEpic('ENG-123', {
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const { created } = await client.pushStoriesToEpic('ENG-123', dna, {
  labels: ['dna', 'generated'],
})
```

## API surface

| Export | Purpose |
|---|---|
| `createClient(options)` | Build a Jira client with `getEpic`, `extractEpicText`, `pullDnaFromEpic`, `pushStoriesToEpic`, `createIssue` |
| `dnaToStoryFields(dna, opts)` | Pure DNA → Jira issue `fields[]` mapping (one per Capability) |
| `extractText(adf)` / `fromMarkdown(text)` | ADF ⇄ plain text helpers |
| `runCli(argv, env?)` | Programmatic CLI entry |

## Capability → Story mapping

For each Operational Capability, one Story is created:

| Jira field | Source |
|---|---|
| `summary` | `{Action} {Resource}` derived from the Capability (e.g. `Approve Loan`) |
| `description` | Markdown rendered by `output-text`, wrapped in ADF on write |
| `project.key` | `JIRA_PROJECT_KEY` |
| `issuetype.name` | `Story` (configurable via `JIRA_STORY_ISSUE_TYPE`) |
| `customfield_10014` | Epic key (Jira Cloud's "Epic Link" field) |
| `labels` | `dna:<slug>`, plus any `--labels` passed on push |

If your Jira site uses a non-standard custom field for Epic Link, subclass `dnaToStoryFields` or post-process the returned fields array — it's pure, so you can rewrite the key freely.

## No webhook surface

Jira Cloud's native outbound webhooks don't ship signed payloads that an external verifier can validate safely. Rather than ship a stub that skips verification, this package has no `serve` command. Options for inbound events:

1. **Jira Automation** — add a rule that posts to your endpoint with a shared secret in the body, and verify it yourself (pattern in `integration-example`'s `webhook.ts`).
2. **Forge** — build an app that runs inside Atlassian's sandbox; auth is JWT-based and not suited for a generic external gateway.

## License

MIT.
