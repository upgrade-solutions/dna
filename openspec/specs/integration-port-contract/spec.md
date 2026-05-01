# integration-port-contract Specification

## Purpose

Defines the architectural rule that `@dna-codes/dna-integration-*` packages are pure I/O ports: they fetch and write raw bytes against external systems, but never take or return DNA documents and never embed input/output-adapter pipelines in their library API. DNA ⇄ external-format conversion is the responsibility of `@dna-codes/dna-input-*` and `@dna-codes/dna-output-*` adapters; composition of `(integration → input → DNA)` or `(DNA → output → integration)` pipelines lives in caller code, in `@dna-codes/dna-ingest`, or in an integration package's own CLI/example surface — never inside the integration's library. This contract keeps the package graph acyclic, the integration boundary auditable, and the canonical worked example (the integration's CLI) the single place where all three packages meet.

## Requirements

### Requirement: Integration packages are pure I/O

Every `@dna-codes/dna-integration-*` package SHALL expose only transport- and identity-level concerns for its target system: authenticating, fetching bytes from remote objects, writing bytes to remote objects, listing/searching remote objects, and any system-specific normalization that has no DNA semantics (e.g. Atlassian Document Format ↔ markdown conversion). Integration packages SHALL NOT expose methods that take or return DNA documents, run input/output-adapter pipelines, or otherwise embed format conversion in their runtime path.

DNA ⇄ external-format conversion is the responsibility of `@dna-codes/dna-input-*` and `@dna-codes/dna-output-*` adapters. Composition of `(integration → input → DNA)` or `(DNA → output → integration)` pipelines lives in caller code, in `@dna-codes/dna-ingest`, or in an integration package's own CLI/example surface — never inside the integration's library API.

#### Scenario: Integration's library API exposes no DNA-aware methods
- **WHEN** `@dna-codes/dna-integration-jira`'s exported `Client` interface is inspected
- **THEN** no method takes or returns an `OperationalDNA`, `ParseResult`, or any DNA-shape parameter; methods deal only in raw bytes (`{ contents, mimeType, source }`), Jira issue payloads, and JQL/identifier strings

#### Scenario: An integration with a baked DNA pipeline is rejected at review
- **WHEN** a PR introduces a method on an integration's `Client` such as `pullDnaFromX(...)` or `pushDnaToX(...)` that internally calls `parse(...)` from a `dna-input-*` package or `render(...)` from a `dna-output-*` package
- **THEN** the change is rejected; the equivalent flow is moved into the integration's CLI (or the caller's code) where input/output adapters are explicitly imported and composed

### Requirement: Integration packages declare zero adapter dependencies

Every `@dna-codes/dna-integration-*` package's `package.json#dependencies` and `peerDependencies` SHALL contain no entry matching `@dna-codes/dna-input-*` or `@dna-codes/dna-output-*`. Integrations MAY depend on `@dna-codes/dna-core` (for shared types), `@dna-codes/dna-ingest` (for the `Integration`/`WritePayload`/`WriteResult` contracts), and external transport SDKs.

If an integration package ships a CLI (`bin/...`) that demonstrates composition with input/output adapters, the adapter imports SHALL appear only in CLI source files (e.g. `src/cli.ts`), and the adapter packages SHALL be declared as `devDependencies` of the integration package so they are bundled with the CLI script but excluded from the library install closure.

#### Scenario: Integration package.json contains no adapter runtime deps
- **WHEN** any `packages/integration-*/package.json` is inspected
- **THEN** its `dependencies` and `peerDependencies` blocks contain no entry whose name matches `@dna-codes/dna-input-*` or `@dna-codes/dna-output-*`

#### Scenario: CLI imports of input/output adapters are dev-only
- **WHEN** `packages/integration-jira/src/cli.ts` imports `@dna-codes/dna-input-text` and `@dna-codes/dna-output-text`
- **THEN** those packages appear in `packages/integration-jira/package.json#devDependencies` (not `dependencies`); the published library install does not pull them in

#### Scenario: Library source contains no adapter imports
- **WHEN** every TypeScript file under `packages/integration-*/src/` *except* CLI files (`src/cli.ts` and `src/cli.test.ts`) is scanned for imports
- **THEN** no file imports from `@dna-codes/dna-input-*` or `@dna-codes/dna-output-*`

### Requirement: Bidirectional integrations implement `Integration.write`

Any integration package that supports writing back to its external system SHALL implement the `Integration.write(target, payload)` method defined in `@dna-codes/dna-ingest`. The `target` URI shape is integration-specific but SHALL be documented in the integration's `README.md`, and the implementation SHALL accept the same `{ contents, mimeType }` payload shape that `fetch` returns — i.e. round-tripping bytes through `fetch` → `write` is a no-op at the byte level.

#### Scenario: Jira write accepts both create and update URI shapes
- **WHEN** Jira's `write(target, payload)` is called with `target = "jira://<EPIC-KEY>"`
- **THEN** the integration creates a new child issue under the Epic and resolves with `{ target: "jira://<NEW-CHILD-KEY>", meta: { ... } }`

#### Scenario: Jira write updates by URI
- **WHEN** Jira's `write(target, payload)` is called with `target = "jira://<STORY-KEY>"`
- **THEN** the integration PUTs the payload onto the existing issue and resolves with `{ target: "jira://<STORY-KEY>" }`

#### Scenario: Read-only integration omits write
- **WHEN** `@dna-codes/dna-integration-google-drive`'s implementation is inspected
- **THEN** the exported integration object has no `write` method (or has it explicitly set to `undefined`); attempting to call `write` is a TypeScript error without optional chaining

### Requirement: Composition pipelines live in CLIs or caller code, not inside integrations

When an integration ships a CLI that composes with input/output adapters (e.g. `dna-integration-jira`'s `pull` / `push` / `update` / `sync` commands), the CLI source SHALL be the single place where the integration package and the relevant input/output adapter packages are imported together. The integration's library code SHALL NOT participate in that composition.

The CLI MAY be the canonical worked example for callers — its source file is documentation by demonstration. README.md SHALL link to the CLI source as the reference composition pattern.

#### Scenario: CLI is the only file importing all three packages
- **WHEN** every TypeScript file under `packages/integration-jira/src/` is scanned for imports of `@dna-codes/dna-input-text`, `@dna-codes/dna-output-text`, and `./client`
- **THEN** exactly one source file (`src/cli.ts`) imports all three together; no other library file imports any of the input/output packages

#### Scenario: README links CLI as the composition example
- **WHEN** `packages/integration-jira/README.md` is read
- **THEN** it contains a section explaining that the integration is pure I/O and links to `src/cli.ts` as the reference for composing Epic-fetch + input-text-parse and DNA + output-text-render + Jira-write
