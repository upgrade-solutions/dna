## Why

The `0.4.x` line was published to GitHub Packages on the assumption that private-by-default distribution (read access gated by repo collaboration) was the right default for `@dna-codes/*`. In practice this puts a friction wall in front of every install — every consumer must mint a PAT, configure `~/.npmrc`, and stay listed as a collaborator — for packages we actually want to be openly available. Moving back to npmjs.com makes `npm install @dna-codes/dna-core` a one-line operation again and aligns with the openly-shared positioning the README, examples, and framework docs already imply.

## What Changes

- **BREAKING (distribution)** — All `@dna-codes/*` workspace packages publish to `https://registry.npmjs.org` (the default npm registry) under the `@dna-codes` scope, **publicly**, with `publishConfig.access: "public"`. The GitHub Packages registry is no longer a publish target.
- Drop `publishConfig.registry: https://npm.pkg.github.com` from every `package.json` (15 packages). Add `publishConfig.access: "public"` to each non-private package.
- Rewrite `.github/workflows/publish.yml` to authenticate against npmjs.com via a repo secret `NPM_TOKEN` (npm automation token), point `setup-node`'s `registry-url` at `https://registry.npmjs.org`, and drop the `packages: write` permission (no longer needed).
- Replace the `Installing from GitHub Packages` README section with a one-line `npm install @dna-codes/dna-core` instruction. No `.npmrc` setup, no PAT requirement.
- Rewrite the `Releasing` README section to describe the npmjs.com publish path and the `NPM_TOKEN` secret prerequisite.
- Retire the GitHub-Packages-shaped specs and replace them with npm-shaped equivalents — see Capabilities.
- `dna-integration-jira` remains `"private": true` (unchanged) and is not published to either registry.

## Capabilities

### New Capabilities

(none — this change replaces existing capabilities with renamed/repurposed equivalents rather than introducing net-new spec surface)

### Modified Capabilities

- `dna-codes-package-publishing`: registry target changes from GitHub Packages to npmjs.com; visibility flips from private/restricted to public; `publishConfig.access: "public"` becomes mandatory; the `repository` field requirement is loosened (npm uses it for provenance only, not auth); access-via-collaboration scenarios are removed.
- `github-packages-publish-workflow`: capability is renamed in spirit to an npmjs-publish workflow — the workflow file path stays at `.github/workflows/publish.yml`, but auth flips from auto-injected `GITHUB_TOKEN` + `packages: write` to a repo secret `NPM_TOKEN` against `registry.npmjs.org`. Granular workflow permissions block can drop `packages: write`. Tag-driven trigger and build-before-publish ordering are unchanged.

(Operationally we'll update the existing two specs in place via deltas rather than create a third with a new name — the capability boundary "how DNA packages get published" is the same; only the destination changed.)

## Impact

- **Code**: 15 `package.json` files (`packages/*/package.json`) — registry/access edits.
- **CI**: `.github/workflows/publish.yml` rewritten end-to-end (registry URL, auth env var, permissions block).
- **Secrets**: A new repo secret `NPM_TOKEN` (npm automation token, scoped to `@dna-codes`) is required before the next tag push. The existing reliance on the auto-injected `GITHUB_TOKEN` for publishing goes away.
- **Docs**: `README.md` install section + releasing section. The `.claude/skills/publish-npm/SKILL.md` is already npm-flavored and only needs verification (no edits expected).
- **Specs**: `openspec/specs/dna-codes-package-publishing/spec.md` and `openspec/specs/github-packages-publish-workflow/spec.md` are updated via deltas in this change.
- **Consumers**: Anyone with an `~/.npmrc` line `@dna-codes:registry=https://npm.pkg.github.com` will need to remove it (or it will keep pointing at a registry we no longer publish to). After this change, no `.npmrc` is required for installs.
- **Historical artifacts**: `0.4.x` versions on GitHub Packages remain in place but become deprecated. The first publish to npmjs.com under this change should bump the minor version (per the existing pre-1.0 versioning rule) so consumers see a clean upgrade path.
- **Out of scope**: Republishing prior `0.4.x` versions to npmjs.com. We move forward from the next minor.
