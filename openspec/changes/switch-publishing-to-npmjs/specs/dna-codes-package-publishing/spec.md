## MODIFIED Requirements

### Requirement: Packages publish to npmjs.com under the public `@dna-codes` scope

Every package in this repo SHALL publish to the default npm registry (`https://registry.npmjs.org`) under the `@dna-codes` scope, with public access. Publishing to GitHub Packages from this repo is no longer supported. Versions previously published to GitHub Packages on the `0.4.x` line are deprecated historical artifacts and SHALL NOT be updated.

Each package's `package.json#publishConfig` SHALL declare public access:

```json
"publishConfig": {
  "access": "public"
}
```

`publishConfig.registry` SHALL be omitted; npm's default precedence (CLI flag → `npm config` → built-in default of `https://registry.npmjs.org`) provides the registry. The publish workflow sets the registry via `actions/setup-node`'s `registry-url`.

`publishConfig.access` SHALL be `"public"` for every non-private package. Scoped `@dna-codes/*` packages otherwise default to `restricted` and fail to publish on the npm free org plan.

#### Scenario: A non-private package missing publishConfig.access fails publish
- **WHEN** a `package.json` lacks `publishConfig.access: "public"` and is not marked `"private": true`
- **THEN** `npm publish` returns 402 Payment Required (npm's surface error for "scoped package + restricted access on a free org plan"); the publish job exits non-zero

#### Scenario: A package mistakenly pins publishConfig.registry to GitHub Packages is corrected
- **WHEN** a contributor adds `"registry": "https://npm.pkg.github.com"` (or any non-npmjs registry) to publishConfig in a PR
- **THEN** the change is rejected; the field is removed before merge so the workflow's registry-url controls the destination

### Requirement: Each package declares its source repository

Every `package.json` SHALL declare a `repository` field pointing at the source repo. npm uses this field for the registry's "Repository" link and for provenance metadata. It is RECOMMENDED but not required for authentication.

```json
"repository": "github:dna-codes/dna"
```

#### Scenario: Repository field absent on publish
- **WHEN** a `package.json` is published without a `repository` field
- **THEN** the publish succeeds, but the registry listing has no source-repo link; reviewers SHOULD add it before merge

#### Scenario: Repository field points at a different org
- **WHEN** `repository` declares an org other than `dna-codes`
- **THEN** the field is corrected before merge to match the actual source repo

### Requirement: Packages are public; access flows from the npmjs.com registry

Published packages SHALL be publicly installable from npmjs.com with no per-consumer gating: no PAT requirement and no `~/.npmrc` configuration needed for installs. `dna-integration-jira` SHALL remain marked `"private": true` in its `package.json` and MUST NOT be published.

#### Scenario: Any consumer installs the packages with a default npm setup
- **WHEN** anyone runs `npm install @dna-codes/dna-core` against the default npm registry, with no `.npmrc` configuration
- **THEN** the package resolves and installs successfully

#### Scenario: A consumer with a stale @dna-codes scoped registry override
- **WHEN** a consumer's `~/.npmrc` still contains `@dna-codes:registry=https://npm.pkg.github.com` from the prior distribution model
- **THEN** their installs continue to resolve against GitHub Packages and pick up only the deprecated `0.4.x` versions; they MUST remove the scoped-registry line to receive new versions from npmjs.com

#### Scenario: A package marked private is not published
- **WHEN** the publish workflow iterates workspaces and encounters `dna-integration-jira` (`"private": true`)
- **THEN** npm skips it automatically; nothing is uploaded for that package

### Requirement: Versions follow semver minor-bump for breaking changes pre-1.0

While packages remain pre-1.0, breaking changes (renames, schema breaks, API removals, **registry/distribution changes observable to consumers**) SHALL bump the **minor** version. The patch version is reserved for non-breaking fixes within a minor line. Major bumps are reserved for the eventual 1.0 release.

#### Scenario: Switching the publish registry bumps minor
- **WHEN** the distribution registry changes from GitHub Packages to npmjs.com (this change)
- **THEN** every non-private package bumps its minor version on its first npmjs.com publish, signaling the observably-breaking distribution change to consumers

#### Scenario: A non-breaking fix bumps patch only
- **WHEN** a workspace ships a bug fix or doc update with no API change
- **THEN** the patch version is incremented; the minor stays the same

## REMOVED Requirements

### Requirement: Packages are private by default; access flows from repo collaboration

**Reason**: This requirement encoded the GitHub Packages distribution model — private visibility, read access gated by repo collaboration, PAT-with-`read:packages` for installs. The new model is public on npmjs.com with no per-consumer gating, so the requirement no longer holds. Public access is now codified in the modified "Packages are public; access flows from the npmjs.com registry" requirement above.

**Migration**: Consumers who previously authenticated with a PAT and a scoped `.npmrc` line should remove both. `npm install @dna-codes/<name>` works against the default registry with no setup. The `dna-codes/dna` repo can remain private; the published packages no longer inherit visibility from it.
