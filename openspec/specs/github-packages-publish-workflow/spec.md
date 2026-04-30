# github-packages-publish-workflow Specification

## Purpose

Defines the contract for the GitHub Actions publish workflow at `.github/workflows/publish.yml`. Codifies the tag-driven trigger, the granular permissions pattern (so the org default can stay read-only), the build-before-publish ordering, and the use of the auto-injected `GITHUB_TOKEN` for authentication. Reusable as a template for any future `@dna-codes/*` repo.
## Requirements
### Requirement: Publish is tag-driven

A GitHub Actions workflow at `.github/workflows/publish.yml` SHALL trigger on tag pushes matching `v*` and on manual `workflow_dispatch`. There SHALL be no automatic publish on `push` to `main`; cutting a release is an explicit `git tag vX.Y.Z && git push --tags` action. (Unchanged from the prior model — only the destination registry changes.)

#### Scenario: Tag push triggers the workflow
- **WHEN** `git push origin v0.6.0` lands on the repo
- **THEN** the publish workflow run starts automatically against the tagged commit and publishes to npmjs.com

#### Scenario: Push to main does NOT trigger the workflow
- **WHEN** a commit is pushed to `main` without a tag
- **THEN** no publish run starts

#### Scenario: Manual re-run via workflow_dispatch
- **WHEN** a maintainer clicks "Run workflow" on the Actions tab and selects `main`
- **THEN** the workflow runs against the current `main` HEAD (independent of tags)

### Requirement: Workflow builds before it publishes

The workflow SHALL run `npm run build --workspaces --if-present` before `npm publish`. A failing build SHALL halt the run before any package is uploaded — partial publishes are not acceptable. (Unchanged from the prior model.)

#### Scenario: One package's build fails
- **WHEN** any workspace's `build` script exits non-zero
- **THEN** the workflow stops at the build step; no package is published; the run is marked failed

#### Scenario: A workspace has no build script
- **WHEN** a workspace's `package.json` has no `build` script (e.g. `dna-schemas`, which ships JSON only)
- **THEN** `--if-present` skips that workspace silently and the workflow continues

### Requirement: Workflow publishes every workspace and respects `private`

The publish step SHALL iterate every workspace listed in the root `package.json#workspaces` array and run `npm publish --provenance` per workspace. The `--provenance` flag is mandatory: it triggers the OIDC trusted-publisher exchange on npmjs.com and emits a supply-chain provenance attestation alongside the tarball. Workspaces marked `"private": true` in their `package.json` SHALL be skipped. The loop SHALL tolerate `Cannot publish over existing version` (a 403 from npmjs.com when re-running a tag whose versions are already on the registry) by reporting it as skipped and continuing — the same idempotent re-run behavior as before.

#### Scenario: All non-private workspaces publish with provenance
- **WHEN** the publish step runs against a fresh tag (versions not yet on npmjs.com)
- **THEN** all non-private workspaces upload tarballs to `registry.npmjs.org` under the public `@dna-codes` scope with provenance attestations attached, and `dna-integration-jira` (marked `private: true`) is skipped

#### Scenario: Re-running a tag whose versions already exist
- **WHEN** the workflow runs against a tag where some versions are already on npmjs.com (e.g. a partially-completed prior run is being retried)
- **THEN** the loop reports the already-published packages as "Skipped (already on registry)", continues to publish the remaining packages, and exits successfully if no other failures occurred

#### Scenario: --provenance flag is omitted
- **WHEN** a PR removes the `--provenance` flag from the `npm publish` invocation in the loop
- **THEN** the change is rejected before merge; without `--provenance`, npm CLI does not attempt the OIDC exchange and the publish falls back to looking for a static token (which is intentionally absent), failing 401

### Requirement: Workflow declares minimal permissions

The workflow SHALL declare `permissions: { contents: read, id-token: write }` at the job or workflow level. `contents: read` is sufficient for `actions/checkout@v4` and `npm ci`; `id-token: write` is required for the runner to mint the OIDC token used by trusted-publisher OIDC publishes. `packages: write` is NOT required (no GitHub Packages destination) and SHALL NOT be declared.

#### Scenario: Permissions block grants exactly the two required scopes
- **WHEN** the workflow runs
- **THEN** the auto-injected `GITHUB_TOKEN` has `contents: read` for the checkout/install path and the runner can mint an OIDC token via `id-token: write`; npm authentication uses neither `GITHUB_TOKEN` nor a stored secret — it uses the OIDC trusted-publisher flow

#### Scenario: Permissions block accidentally retains packages: write
- **WHEN** a PR keeps `packages: write` in the permissions block
- **THEN** reviewers remove it before merge; it is unused and obscures the principle of least privilege

#### Scenario: Permissions block omits id-token: write
- **WHEN** a PR removes `id-token: write` from the permissions block
- **THEN** `npm publish --provenance` fails because GitHub Actions cannot issue an OIDC token without that grant; the change is rejected before merge

### Requirement: Workflow configures setup-node for npmjs.com

The workflow SHALL run `actions/setup-node@v4` with `registry-url: 'https://registry.npmjs.org'` and `scope: '@dna-codes'`. Together these write a `~/.npmrc` on the runner that pins the `@dna-codes` scope to npmjs.com and wires `_authToken` to `NODE_AUTH_TOKEN` for the publish step.

#### Scenario: setup-node writes the runner's .npmrc
- **WHEN** the workflow runs the `actions/setup-node@v4` step with `registry-url: https://registry.npmjs.org` and `scope: '@dna-codes'`
- **THEN** the runner's `~/.npmrc` contains `@dna-codes:registry=https://registry.npmjs.org/` and `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}`, and `npm publish` resolves `@dna-codes/*` packages to npmjs.com without further configuration

#### Scenario: setup-node still references GitHub Packages
- **WHEN** a PR leaves `registry-url: 'https://npm.pkg.github.com'` in setup-node config
- **THEN** the change is rejected before merge; the registry URL must point at npmjs.com to match the new distribution model

### Requirement: Workflow authenticates via OIDC trusted publishers

The publish step SHALL authenticate to npmjs.com via OpenID Connect (OIDC) "trusted publishers" rather than a long-lived registry token. The workflow MUST grant `id-token: write` permission so the runner can mint an OIDC JWT, and the publish CLI MUST be invoked with `--provenance` (which on npm registry both opts into trusted-publisher OIDC exchange and emits supply-chain provenance attestations).

Each published package on npmjs.com SHALL have a Trusted Publisher rule configured with:

- Organization or user: `dna-codes`
- Repository: `dna`
- Workflow filename: `publish.yml`
- Environment: (blank)

Packages without a matching Trusted Publisher rule SHALL fail their individual `npm publish` call (the workflow's per-workspace loop tolerates this and continues with the rest). `NODE_AUTH_TOKEN` SHALL NOT be set on the publish step; any leftover `_authToken=` line in the runner's `.npmrc` is inert under OIDC publishing.

#### Scenario: All packages have trusted publishers configured and the workflow publishes successfully
- **WHEN** the publish step runs against a fresh tag and every non-private package has a Trusted Publisher rule on npmjs.com matching `dna-codes/dna` + `publish.yml`
- **THEN** each `npm publish --provenance` invocation exchanges the runner's OIDC token for a registry-issued credential, the package uploads, and a provenance attestation is published alongside the tarball

#### Scenario: A package missing its trusted publisher rule
- **WHEN** the publish loop reaches a package whose npmjs.com entry lacks a matching Trusted Publisher rule
- **THEN** that package's `npm publish` returns 403 Forbidden; the loop reports the failure and continues with the next workspace; the overall job exits non-zero

#### Scenario: id-token: write permission is missing
- **WHEN** the workflow's `permissions:` block lacks `id-token: write`
- **THEN** GitHub Actions refuses to issue an OIDC token; `npm publish --provenance` fails before the registry round-trip with an OIDC-related error message

