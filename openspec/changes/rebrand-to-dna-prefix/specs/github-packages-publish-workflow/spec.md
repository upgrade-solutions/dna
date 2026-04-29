## ADDED Requirements

### Requirement: Publish is tag-driven

A GitHub Actions workflow at `.github/workflows/publish.yml` SHALL trigger on tag pushes matching `v*` and on manual `workflow_dispatch`. There SHALL be no automatic publish on `push` to `main`; cutting a release is an explicit `git tag vX.Y.Z && git push --tags` action.

#### Scenario: Tag push triggers the workflow
- **WHEN** `git push origin v0.4.0` lands on the repo
- **THEN** the "Publish to GitHub Packages" workflow run starts automatically against the tagged commit

#### Scenario: Push to main does NOT trigger the workflow
- **WHEN** a commit is pushed to `main` without a tag
- **THEN** no publish run starts

#### Scenario: Manual re-run via workflow_dispatch
- **WHEN** a maintainer clicks "Run workflow" on the Actions tab and selects `main`
- **THEN** the workflow runs against the current `main` HEAD (independent of tags)

### Requirement: Workflow declares granular elevated permissions

The workflow SHALL declare `permissions: { contents: read, packages: write }` at the job or workflow level. This pattern grants `packages: write` to the `GITHUB_TOKEN` for that workflow only, without flipping the org-level default to read-write.

#### Scenario: Org default is read-only
- **WHEN** the org's "Default workflow permissions" setting is "Read repository contents"
- **THEN** the publish workflow still publishes successfully because its `permissions:` block elevates the token for its own run

#### Scenario: Permissions block omitted
- **WHEN** the workflow file has no `permissions:` block
- **THEN** `npm publish` fails with 401 unauthorized because `GITHUB_TOKEN` lacks `packages: write`

### Requirement: Workflow builds before it publishes

The workflow SHALL run `npm run build --workspaces --if-present` before `npm publish`. A failing build SHALL halt the run before any package is uploaded — partial publishes are not acceptable.

#### Scenario: One package's build fails
- **WHEN** any workspace's `build` script exits non-zero
- **THEN** the workflow stops at the build step; no package is published; the run is marked failed

#### Scenario: A workspace has no build script
- **WHEN** a workspace's `package.json` has no `build` script (e.g. `dna-schemas`, which ships JSON only)
- **THEN** `--if-present` skips that workspace silently and the workflow continues

### Requirement: Workflow publishes every workspace and respects `private`

The publish step SHALL run `npm publish --workspaces`, which iterates every workspace listed in the root `package.json#workspaces` array. Workspaces marked `"private": true` in their `package.json` SHALL be skipped automatically by npm.

#### Scenario: All non-private workspaces publish
- **WHEN** the publish step runs against the v0.4.0 tag
- **THEN** all 13 non-private workspaces upload `0.4.0` tarballs to GitHub Packages, and `dna-integration-jira` (marked `private: true`) is skipped

#### Scenario: Re-publishing the same version is rejected
- **WHEN** the workflow runs against a tag whose version already exists on the registry
- **THEN** GitHub Packages returns `409 Conflict — Cannot publish over existing version`; the run fails (this is correct registry behavior — bump the version to re-publish)

### Requirement: Workflow uses the auto-injected `GITHUB_TOKEN`

The publish step SHALL set `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` as the env var npm uses for authentication. A user-managed Personal Access Token SHALL NOT be required for the publish path; `GITHUB_TOKEN` is sufficient because the workflow declares `packages: write`.

#### Scenario: GITHUB_TOKEN is the only auth used by the workflow
- **WHEN** the publish step runs
- **THEN** authentication to `npm.pkg.github.com` succeeds via the auto-injected `GITHUB_TOKEN`; no repo secret with a manually-managed PAT is consulted
