## Context

This repo's packages predate the consolidation under `dna-codes`. Names like `@dna-codes/core` were authored when "core" was unambiguous. With cba's framework now sharing the same scope (as `@dna-codes/cells*`), the unprefixed `@dna-codes/core` reads ambiguously — is "core" the DNA validator, the cells engine, or something else?

The `dna-` prefix removes that ambiguity at zero ongoing cost. Symmetric naming with `cells-*` on the other side gives the org a coherent shape.

## Goals / Non-Goals

**Goals**
- Every package in this repo is published as `@dna-codes/dna-*` to GitHub Packages.
- A consumer reading `@dna-codes/dna-output-openapi` immediately knows: it's a DNA-side renderer.
- Publish workflow is reusable as a template for any future `@dna-codes/*` repo.

**Non-Goals**
- Continuing to publish to npmjs.com. The existing `0.3.x` line on npm becomes a dead branch — anyone consuming it stays at `0.3.x` forever or migrates to GitHub Packages.
- Breaking the package's exported APIs. The TypeScript surface and runtime behavior are identical pre/post rename; only the package *name* changes.
- Renaming files inside packages (e.g., `core/src/index.ts` stays). Only `package.json#name` and import specifiers change.

## Decisions

### 1. Version bump strategy: minor (0.3.x → 0.4.0)

A package rename is a hard break for consumers. The semver convention says hard breaks bump major, but since these packages are pre-1.0 and use minor bumps for API breaks (per the existing `0.3.x` line history with `0.3.0` shipping multiple breaking schema changes), `0.4.0` is the consistent escalation. The 0.3.x npm copies stay frozen as the historical "old name" line.

### 2. Internal cross-package import rewrites

Every `import { X } from '@dna-codes/core'` becomes `from '@dna-codes/dna-core'`. Same for the others. This is a mechanical find-replace across `packages/*/src/**` plus tests. The rewrite happens *before* the publish — the published artifacts already reference the new names.

### 3. Workspace dep declarations follow the same rename

`packages/dna-output-openapi/package.json` declares `"@dna-codes/dna-core": "^0.4.0"` (pinned to the new version). The workspace root's `workspaces` field lists each package's directory; npm workspaces still resolve cross-package references locally during development. Versions are pinned to the registry version so external consumers see consistent intent.

### 4. Publish workflow shape

```yaml
# .github/workflows/publish.yml
name: Publish to GitHub Packages
on:
  push:
    tags: ['v*']
  workflow_dispatch:
permissions:
  contents: read
  packages: write
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@dna-codes'
      - run: npm ci
      - run: npm run build --workspaces --if-present
      - run: npm publish --workspaces --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Triggers on tag push (so cutting a release is `git tag v0.4.0 && git push --tags`). `npm publish --workspaces` publishes every workspace in one shot. `--access public` makes them readable without auth.

### 5. Repo transfer is the LAST step

Order of operations matters. If we transfer the repo before the rename ships, the publish workflow runs from the new location with the old names — which is publishable but confusing. Sequence: rename → land on main → tag → publish workflow runs (still at upgrade-solutions) → first publish succeeds → THEN transfer to dna-codes/dna. Subsequent publishes happen from the new home.

Alternative considered: transfer first, then rename and publish. Risk: the redirect from `upgrade-solutions/dna` only works for HTTP, not for npm registry's URL substitution in tooling. Stick with rename-first.

## Open Questions

1. **Should the existing `0.3.x` versions on npmjs.com be deprecated?** `npm deprecate @dna-codes/core@'<0.4.0' "renamed to @dna-codes/dna-core; see github.com/dna-codes/dna"` is a one-liner that tells stragglers where to go. Lean: yes, after `0.4.0` is up.
2. **Workspaces with dna-prefix in the directory name?** `packages/core/` could become `packages/dna-core/` for symmetry. Lean: skip — directory names are internal, package names are the public surface. Don't churn what doesn't need to change.
3. **Single `dna-codes` GitHub Actions workflow file shared across repos?** Reusable workflows are a feature, but for two repos the duplication cost is one file each. Lean: copy-paste; revisit if a third repo joins the org.
