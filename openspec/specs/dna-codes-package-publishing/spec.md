# dna-codes-package-publishing Specification

## Purpose

Defines the registry, visibility, versioning, and access-control model for npm packages published from the `dna-codes/dna` repository. Packages publish to GitHub Packages (not npmjs.com), default to private visibility, and inherit access from repo collaboration. This is the canonical distribution policy for any `@dna-codes/dna-*` package.

## Requirements

### Requirement: Packages publish to GitHub Packages, not npmjs.com

Every package in this repo SHALL publish to GitHub Packages (`https://npm.pkg.github.com`) under the `@dna-codes` scope. Publishing to npmjs.com from this repo is NOT supported. The `0.3.x` and earlier versions remaining on npmjs.com are deprecated historical artifacts and SHALL NOT be updated.

Each package's `package.json#publishConfig` SHALL declare the GitHub Packages registry:

```json
"publishConfig": {
  "registry": "https://npm.pkg.github.com"
}
```

The `access` field SHALL NOT be set to `"public"`; scoped packages default to `restricted` (private) which is the intended distribution model.

#### Scenario: A package missing publishConfig fails publish
- **WHEN** a `package.json` omits `publishConfig.registry`
- **THEN** `npm publish` from the workflow targets the default npmjs.com registry, fails on auth or scope conflict, and the publish job exits non-zero

#### Scenario: A package with publishConfig.access "public" is corrected
- **WHEN** a contributor adds `"access": "public"` to publishConfig in a PR
- **THEN** the change is rejected; the field is removed (or set to `"restricted"`) before merge so private visibility is preserved

### Requirement: Each package declares its source repository

Every `package.json` SHALL declare a `repository` field pointing at the source repo. GitHub Packages uses this field to link the published tarball to its source repository for visibility and access-control inheritance; without it the registry rejects the upload as unauthorized.

```json
"repository": "github:dna-codes/dna"
```

#### Scenario: Repository field absent on first publish
- **WHEN** a `package.json` is published without a `repository` field
- **THEN** GitHub Packages returns 401 unauthorized regardless of token permissions; the workflow fails

#### Scenario: Repository field points at a different org
- **WHEN** `repository` declares an org other than the publishing repo's owner
- **THEN** the publish is rejected; the field MUST match the actual source repo

### Requirement: Packages are private by default; access flows from repo collaboration

The `dna-codes/dna` repository is private. Every published package inherits private visibility on GitHub Packages by virtue of being linked (via the `repository` field) to a private repo. Read access is granted by adding the consumer as a collaborator on the source repo; the consumer authenticates `npm install` with a Personal Access Token bearing the `read:packages` scope.

#### Scenario: A new collaborator installs the packages
- **WHEN** a new collaborator is added to `dna-codes/dna` and creates a PAT with `read:packages`
- **THEN** they can `npm install @dna-codes/dna-core@0.4.0` after configuring `~/.npmrc` with the registry line and the `_authToken`

#### Scenario: A non-collaborator attempts to install
- **WHEN** an outside party with no repo access attempts `npm install @dna-codes/dna-core@0.4.0`, even with a syntactically valid PAT
- **THEN** GitHub Packages returns 404 (intentionally indistinguishable from "not found" to avoid leaking package existence)

### Requirement: Versions follow semver minor-bump for breaking changes pre-1.0

While packages remain pre-1.0, breaking changes (renames, schema breaks, API removals) SHALL bump the **minor** version (0.3.x → 0.4.0). The patch version is reserved for non-breaking fixes within a minor line. Major bumps are reserved for the eventual 1.0 release.

#### Scenario: A package rename bumps minor
- **WHEN** all packages are renamed from `@dna-codes/<name>` to `@dna-codes/dna-<name>`
- **THEN** every package's version moves from `0.3.x` (or `0.1.x` for newer ones) to `0.4.0`, not `1.0.0`
