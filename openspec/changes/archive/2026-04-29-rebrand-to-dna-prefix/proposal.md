## Why

The `@dna-codes/*` scope has two halves living under it: the DNA layer packages (this repo — `core`, `schemas`, `input-*`, `output-*`, `integration-*`) and the cells framework (the cba repo — currently `@cell/*`). With the cba scope rebranding to `@dna-codes/cells-*` in a sister proposal, this repo adopts a symmetric `@dna-codes/dna-*` prefix so a glance at any package name immediately tells you which half it's from.

Forcing function: the new `dna-codes` GitHub org is being set up to host both repos and publish all packages to GitHub Packages. GitHub Packages requires the npm scope to match the org owner, so `@dna-codes/*` is what we get. Within that scope, `dna-*` vs `cells-*` is the cheapest way to keep the two halves visually distinct.

Sister proposals: `cell-based-architecture/openspec/changes/rebrand-to-cells-prefix/` and `dna-platform/openspec/changes/consume-from-github-packages/`. All three need to ship together; this one runs first so the others have new names to consume.

## What Changes

### 1. Rename every package in `packages/*` to add the `dna-` prefix

| Old | New |
|---|---|
| `@dna-codes/core` | `@dna-codes/dna-core` |
| `@dna-codes/schemas` | `@dna-codes/dna-schemas` |
| `@dna-codes/input-text` | `@dna-codes/dna-input-text` |
| `@dna-codes/input-json` | `@dna-codes/dna-input-json` |
| `@dna-codes/input-openapi` | `@dna-codes/dna-input-openapi` |
| `@dna-codes/output-openapi` | `@dna-codes/dna-output-openapi` |
| `@dna-codes/output-markdown` | `@dna-codes/dna-output-markdown` |
| `@dna-codes/output-mermaid` | `@dna-codes/dna-output-mermaid` |
| `@dna-codes/output-html` | `@dna-codes/dna-output-html` |
| `@dna-codes/output-text` | `@dna-codes/dna-output-text` |
| `@dna-codes/integration-jira` | `@dna-codes/dna-integration-jira` |
| `@dna-codes/{input,output,integration}-example` | `@dna-codes/dna-{input,output,integration}-example` |

For each package: rename in `package.json`, update internal import-from references across the workspace, update README + AGENTS.md mentions, update tests.

### 2. Add `publishConfig` pointing at GitHub Packages

In every renamed `package.json`:

```json
"publishConfig": {
  "registry": "https://npm.pkg.github.com",
  "access": "public"
}
```

GitHub Packages' npm registry hosts public scoped packages without auth on the read side once the package is set to public visibility. Publishing requires a `GITHUB_TOKEN` with `packages:write`.

### 3. Add a publish workflow

`.github/workflows/publish.yml` triggered on tag push (`v*`) and manual dispatch. For each workspace package, runs `npm publish` against GitHub Packages. The workflow uses `permissions: { packages: write, contents: read }` and the auto-injected `GITHUB_TOKEN`.

### 4. Repo transfer to the new org

`upgrade-solutions/dna` → `dna-codes/dna`. GitHub's transfer flow preserves issues, PRs, stars, and sets up redirects. After transfer, update README links and any URLs that point at the old location. This is a one-click operation but it's a hard cut — schedule it last in the apply.

### 5. Publish v0.4.0 (minor bump for the rename)

The package rename is a hard breaking change for any consumer holding the old `@dna-codes/<name>` (without the `dna-` prefix). Bump every package's `version` to `0.4.0` and publish to GitHub Packages from the freshly-transferred repo. This is the version dna-platform and cells will pin against.

## Capabilities

### Modified Capabilities
- `dna-codes-package-naming` — every DNA package carries a `dna-` prefix; the `@dna-codes/*` scope is shared with cells packages but visually separated by prefix.
- `dna-codes-package-publishing` — packages publish to GitHub Packages on tag push, not to npmjs.com.

### New Capabilities
- `github-packages-publish-workflow` — reusable workflow shape for the dna-codes org.

## Impact

- **Affected paths**: every `packages/*/package.json` (rename + publishConfig), every internal cross-package import (`packages/*/src/**`), `README.md`, `AGENTS.md`, `.github/workflows/publish.yml` (new).
- **Backwards compatibility**: hard break. Existing `@dna-codes/<name>` packages on npmjs.com remain published at their current versions but will no longer receive updates. Consumers must switch to GitHub Packages and the `dna-` prefix.
- **Coordination**: blocks `cell-based-architecture/openspec/changes/rebrand-to-cells-prefix/` (cells consumes `@dna-codes/dna-core`, `dna-schemas`) and `dna-platform/openspec/changes/consume-from-github-packages/` (platform consumes everything). Apply order: this one → cells → platform.
- **Risk profile**: medium. The rename surface is large but mechanical (find/replace + lockfile regen). The publish workflow is the main net-new piece.
