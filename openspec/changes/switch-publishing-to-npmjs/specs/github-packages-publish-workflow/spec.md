## MODIFIED Requirements

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

### Requirement: Workflow declares minimal permissions

The workflow SHALL declare `permissions: { contents: read }` at the job or workflow level. `packages: write` is NOT required (no GitHub Packages destination) and SHALL NOT be declared. If npm provenance attestations are added later, `id-token: write` becomes required at that point — but that is out of scope for this requirement.

#### Scenario: Permissions block scopes write access narrowly
- **WHEN** the workflow runs
- **THEN** the auto-injected `GITHUB_TOKEN` has only `contents: read`, sufficient for `actions/checkout@v4` and `npm ci`; npm authentication uses a separate `NPM_TOKEN` secret rather than `GITHUB_TOKEN`

#### Scenario: Permissions block accidentally retains packages: write
- **WHEN** a PR keeps `packages: write` in the permissions block
- **THEN** reviewers remove it before merge; it is unused and obscures the principle of least privilege

### Requirement: Workflow builds before it publishes

The workflow SHALL run `npm run build --workspaces --if-present` before `npm publish`. A failing build SHALL halt the run before any package is uploaded — partial publishes are not acceptable. (Unchanged from the prior model.)

#### Scenario: One package's build fails
- **WHEN** any workspace's `build` script exits non-zero
- **THEN** the workflow stops at the build step; no package is published; the run is marked failed

#### Scenario: A workspace has no build script
- **WHEN** a workspace's `package.json` has no `build` script (e.g. `dna-schemas`, which ships JSON only)
- **THEN** `--if-present` skips that workspace silently and the workflow continues

### Requirement: Workflow publishes every workspace and respects `private`

The publish step SHALL iterate every workspace listed in the root `package.json#workspaces` array and run `npm publish` per workspace. Workspaces marked `"private": true` in their `package.json` SHALL be skipped. The loop SHALL tolerate `Cannot publish over existing version` (a 403 from npmjs.com when re-running a tag whose versions are already on the registry) by reporting it as skipped and continuing — the same idempotent re-run behavior as before.

#### Scenario: All non-private workspaces publish
- **WHEN** the publish step runs against a fresh tag (versions not yet on npmjs.com)
- **THEN** all non-private workspaces upload tarballs to `registry.npmjs.org` under the public `@dna-codes` scope, and `dna-integration-jira` (marked `private: true`) is skipped

#### Scenario: Re-running a tag whose versions already exist
- **WHEN** the workflow runs against a tag where some versions are already on npmjs.com (e.g. a partially-completed prior run is being retried)
- **THEN** the loop reports the already-published packages as "Skipped (already on registry)", continues to publish the remaining packages, and exits successfully if no other failures occurred

### Requirement: Workflow authenticates via the `NPM_TOKEN` repo secret

The publish step SHALL set `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` so that the `~/.npmrc` line written by `actions/setup-node` (`//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}`) authenticates against npmjs.com. `NPM_TOKEN` SHALL be an npm **automation token** with publish access to the `@dna-codes` scope, stored as a GitHub Actions repo secret (or org secret) on `dna-codes/dna`. The auto-injected `GITHUB_TOKEN` SHALL NOT be used for npm authentication.

#### Scenario: NPM_TOKEN secret is configured
- **WHEN** the publish step runs and the `NPM_TOKEN` secret is set to a valid npm automation token
- **THEN** authentication to `registry.npmjs.org` succeeds; tarballs upload under the `@dna-codes` scope

#### Scenario: NPM_TOKEN secret is missing or invalid
- **WHEN** the publish step runs and `NPM_TOKEN` is unset, expired, or lacks publish scope on `@dna-codes`
- **THEN** the publish loop fails 401 unauthorized on the first `npm publish`; subsequent workspaces are still attempted (the loop is fault-tolerant), but the overall job exits non-zero so the failure is visible

### Requirement: Workflow configures setup-node for npmjs.com

The workflow SHALL run `actions/setup-node@v4` with `registry-url: 'https://registry.npmjs.org'` and `scope: '@dna-codes'`. Together these write a `~/.npmrc` on the runner that pins the `@dna-codes` scope to npmjs.com and wires `_authToken` to `NODE_AUTH_TOKEN` for the publish step.

#### Scenario: setup-node writes the runner's .npmrc
- **WHEN** the workflow runs the `actions/setup-node@v4` step with `registry-url: https://registry.npmjs.org` and `scope: '@dna-codes'`
- **THEN** the runner's `~/.npmrc` contains `@dna-codes:registry=https://registry.npmjs.org/` and `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}`, and `npm publish` resolves `@dna-codes/*` packages to npmjs.com without further configuration

#### Scenario: setup-node still references GitHub Packages
- **WHEN** a PR leaves `registry-url: 'https://npm.pkg.github.com'` in setup-node config
- **THEN** the change is rejected before merge; the registry URL must point at npmjs.com to match the new distribution model
