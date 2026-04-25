# AGENTS.md

Orientation for AI agents working in this repo. Read `README.md` first for the DNA language itself; this file covers **how packages are structured** and **where to add new ones**.

## Repo shape

npm workspaces monorepo. All packages publish under the `@dna-codes/` scope.

```
packages/
  schemas/              JSON Schema definitions (Draft 2020-12) — language-agnostic, zero deps
  core/                 TypeScript bindings + cross-layer validator (ajv)
  input-*/              format → DNA
  output-*/             DNA → format
  integration-*/        external system ⇄ DNA (API, webhooks, CLI)
  input-example/        template for input-*
  output-example/       template for output-*
  integration-example/  template for integration-*
```

Every package has a matching `AGENTS.md` — check the relevant template before editing or creating a new package.

## The pipeline

```
[integration] → input-* → DNA → output-* → [integration]
```

- `input-*` is **deterministic by default**. If it uses an LLM it must be marked probabilistic, document the API-key requirement, and expose `fetchImpl` for testability.
- `output-*` is **always pure** — `render(dna, options?): string`, no I/O, no throws on partial DNA.
- `integration-*` owns per-system knowledge: auth, pagination, webhook signatures, CLI. Three surfaces required when the target supports them: API client, webhook receiver, CLI.

## Hard rules across packages

- **Zero runtime dependencies** except `core` (needs `ajv`) and integrations that genuinely can't avoid an SDK. Justify every runtime dep in the package README.
- **One public entry point per package**, named consistently:
  - inputs:  `parse(data, options)` (deterministic) or `parseText(text, options)` (probabilistic, async)
  - outputs: `render(dna, options?)` returning a string
  - integrations: `createClient(options)` + `parseWebhook(...)` + `runCli(argv)`
- **Return layered DNA** — always an object keyed by `operational` / `productCore` / `productApi` / `productUi` / `technical`. Never a bare resource / array.
- **Layers are one-way downstream.** Operational → Product → Technical. Upper layers never import lower.
- **Cross-layer references are strings.** Validated by `@dna-codes/core`, not by JSON Schema `$ref`.
- **DNA naming:** Operational DNA uses the Actor > Action > Resource triad. Resources are PascalCase singular. Actions are PascalCase and must pair with a Resource. Capability names are `Resource.Action`.

## Creating a new package

1. Pick the matching template: `input-example`, `output-example`, or `integration-example`.
2. Copy the directory: `cp -R packages/<template> packages/<new-name>`.
3. Follow the template's `AGENTS.md` step-by-step. Each lists every edit.
4. Add the new package to the `workspaces` array in the root `package.json`.
5. Add a row to the package table in the root `README.md`.
6. `npm install` from the repo root to link workspaces.
7. `npm run build -w @dna-codes/<new-name>` then `npm test -w @dna-codes/<new-name>`.

## Development flow (from CLAUDE.md)

- Work on `main` — no feature branches for now.
- **Default to the OpenSpec workflow** (`/opsx:propose` → `/opsx:apply` → `/opsx:archive`) for any non-trivial change. The proposal/design/specs/tasks artifacts live under `openspec/changes/<name>/`; archived ones move to `openspec/changes/archive/` and seed `openspec/specs/<capability>/spec.md`. Skip OpenSpec only for typo fixes, version bumps, formatting, and other genuinely small or contained edits.
- After a scoped change, commit and update the README.
- For LLM-backed work, the Anthropic API path is the canonical example; OpenAI-compatible covers OpenAI and OpenRouter.
- Run commands individually rather than chaining with `&&`.

## TypeScript conventions

- `target: ES2020`, `module: commonjs`, `strict: true` across every package — copy `tsconfig.json` from any template as-is.
- Jest with `ts-jest` for tests: `npm test` runs `jest --experimental-vm-modules`.
- Export types alongside the runtime API from `src/index.ts` via `export * from './types'`.

## What NOT to do

- Don't import `@dna-codes/core` at runtime from `input-*` or `output-*` — use it as a dev dep for types only. Integrations may import it at runtime for validation.
- Don't reach across layers — an operational helper must not know about Product or Technical shapes.
- Don't add schema validation inside an adapter. That's `@dna-codes/core`'s job.
- Don't invent DNA fields. If a source doesn't give you a value, omit the field.
- Don't skip the webhook signature check. Ever.
