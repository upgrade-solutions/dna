# AGENTS.md

Orientation for AI agents working in this repo. Read `README.md` first for the DNA language itself; this file covers **how packages are structured** and **where to add new ones**.

## Repo shape

npm workspaces monorepo. Four published packages under the `@dna-codes/` scope.

```
packages/
  schemas/              JSON Schema definitions (Draft 2020-12) — language-agnostic, zero deps
  core/                 TypeScript bindings + cross-layer validator (ajv) + shared adapter contracts
  ingest/               Multi-source orchestrator; defines the Integration / InputAdapter ports
  adapters/             Unified adapter package — input/output/integration as subpaths
    src/
      input/<name>/         format → DNA
      output/<name>/        DNA → format
      integration/<name>/   external system ⇄ raw bytes (pure I/O — never DNA)
    bin/                CLI shims (one per integration that ships a CLI)
```

Each adapter folder under `packages/adapters/src/<kind>/<name>/` is self-contained and mechanically extractable into its own published package post-1.0 — file moves + a new `package.json`, no source-file edits.

Every adapter folder has its own `README.md`; templates (`input/example`, `output/example`, `integration/example`) ship `AGENTS.md` with fork instructions.

## The pipeline

```
[integration] → input/<x> → DNA → output/<x> → [integration]
```

- `input/<x>` is **deterministic by default**. If it uses an LLM it must be marked probabilistic, document the API-key requirement, and expose `fetchImpl` for testability.
- `output/<x>` is **always pure** — `render(dna, options?): string`, no I/O, no throws on partial DNA.
- `integration/<x>` is **pure I/O**. `Integration.fetch(uri)` returns raw bytes + mimeType + source; `Integration.write(target, payload)` (optional) writes raw bytes. **No DNA-aware methods on the library API.** Composition with input/output adapters lives in the integration's own `cli.ts` (or in caller code) — that's the canonical pattern.

## Hard rules across packages

- **Zero runtime dependencies** for the merged adapters package beyond `dna-core`, `dna-ingest`, `dna-schemas`, and the few integration-specific external SDKs (`@apidevtools/swagger-parser`, `js-yaml` today). Justify every runtime dep in the package README.
- **One public entry point per adapter folder**, named consistently:
  - inputs:  `parse(data, options)` (deterministic) or `parseText(text, options)` (probabilistic, async)
  - outputs: `render(dna, options?)` returning a string
  - integrations: `createClient(options)` returning an `Integration` impl + any low-level escape hatches; `runCli(argv)` for the CLI composition example
- **Return layered DNA** — always an object keyed by `operational` / `productCore` / `productApi` / `productUi` / `technical`. Never a bare resource / array.
- **Layers are one-way downstream.** Operational → Product → Technical. Upper layers never import lower.
- **Cross-layer references are strings.** Validated by `@dna-codes/dna-core`, not by JSON Schema `$ref`.
- **DNA naming:** Operational DNA uses the Actor > Action > Resource triad. Resources are PascalCase singular. Actions are PascalCase and must pair with a Resource. Capability names are `Resource.Action`.
- **No cross-adapter imports in library code.** Library files (everything except `cli.ts` / `cli.test.ts`) under any adapter folder MUST NOT import siblings. CLI files inside `integration/<x>/` MAY import `input/<y>` and `output/<y>` siblings, but only via the package's published subpath form (`@dna-codes/dna-adapters/input/<y>`), never via relative paths. Inputs and outputs do not get this carve-out. Enforced by `packages/adapters/src/package-isolation.test.ts`.

## Creating a new adapter

1. Pick the matching template inside `packages/adapters/src/`: `input/example`, `output/example`, or `integration/example`.
2. Copy the directory: `cp -R packages/adapters/src/<kind>/example packages/adapters/src/<kind>/<new-name>`.
3. Follow the template's local `AGENTS.md` step-by-step. Each lists every edit.
4. Add a `./<kind>/<new-name>` entry to `packages/adapters/package.json#exports` pointing at `dist/<kind>/<new-name>/index.{d.ts,js}`.
5. Add a row to the Adapters table in the root `README.md`.
6. `npm run build -w @dna-codes/dna-adapters` then `npm test -w @dna-codes/dna-adapters`. The `exports-coverage`, `package-isolation`, and `subpath-smoke` tests all need to pass.
7. If the adapter is an integration that ships a CLI binary, add a `bin/<name>.js` shim and an entry to `packages/adapters/package.json#bin` (prefixed `dna-` to avoid global-bin collisions).

## Development flow (from CLAUDE.md)

- Work on `main` — no feature branches for now.
- **Default to the OpenSpec workflow** (`/opsx:propose` → `/opsx:apply` → `/opsx:archive`) for any non-trivial change. The proposal/design/specs/tasks artifacts live under `openspec/changes/<name>/`; archived ones move to `openspec/changes/archive/` and seed `openspec/specs/<capability>/spec.md`. Skip OpenSpec only for typo fixes, version bumps, formatting, and other genuinely small or contained edits.
- After a scoped change, commit and update the README.
- For LLM-backed work, the Anthropic API path is the canonical example; OpenAI-compatible covers OpenAI and OpenRouter.
- Run commands individually rather than chaining with `&&`.

## TypeScript conventions

- `target: ES2020`, `module: commonjs`, `strict: true` for the merged package — see `packages/adapters/tsconfig.json`. The `paths` mapping is intentionally minimal (only the subpaths the Jira CLI imports) so type-check resolves the package's own subpath self-references at compile time; runtime resolution is handled by Node's exports map.
- Jest with `ts-jest` for tests: `npm test` runs `jest --experimental-vm-modules`.
- Export types alongside the runtime API from each adapter's `src/index.ts` via `export * from './types'`.

## What NOT to do

- Don't reach across layers — an operational helper must not know about Product or Technical shapes.
- Don't add schema validation inside an adapter. That's `@dna-codes/dna-core`'s job.
- Don't invent DNA fields. If a source doesn't give you a value, omit the field.
- Don't skip the webhook signature check. Ever.
- Don't add DNA-aware methods to an integration's library API. Pipelines belong in `cli.ts` or in caller code.
- Don't add a `src/util/`, `src/shared/`, or any other top-level helper directory inside `packages/adapters/src/`. The isolation test will reject it. If two adapters appear to need the same helper, duplicate it.
