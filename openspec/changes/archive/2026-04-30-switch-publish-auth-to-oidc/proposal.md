## Why

The previous change (`switch-publishing-to-npmjs`, archived 2026-04-30) codified `NPM_TOKEN` repo secret as the publish auth path. The first tag-driven run hit `EOTP — This operation requires a one-time password` on every package because the token had been minted as a "Publish" token (still 2FA-gated) instead of an "Automation" token. Rather than regenerate as Automation and keep a long-lived secret around, we're moving to npm's **Trusted Publishers** (OIDC) — short-lived, no rotation, and `--provenance` ships supply-chain attestations as a side effect.

The workflow itself was already updated in commit `985e437`. This change exists to bring the `github-packages-publish-workflow` spec back in sync with what the workflow actually does — without it, the spec is wrong about how publish auth works.

## What Changes

- **BREAKING (CI auth)** — Workflow no longer references `NPM_TOKEN` secret. Authentication to npmjs.com happens via OIDC token exchange between GitHub Actions and the npm registry, scoped to a Trusted Publisher rule per package on npmjs.com.
- `permissions:` block in `.github/workflows/publish.yml` adds `id-token: write` (required so the runner can mint an OIDC JWT for the registry to verify).
- `npm publish` invocation adds `--provenance` (npm requires this flag to opt into trusted-publisher publishes and to emit attestations).
- The `NODE_AUTH_TOKEN` env var is removed from the publish step; `actions/setup-node`'s `_authToken=` line in the runner's `.npmrc` becomes inert (left empty), and npm CLI reaches OIDC instead.
- The `NPM_TOKEN` repo secret can be deleted or left in place — it's no longer referenced.
- Each package on npmjs.com requires a Trusted Publisher entry (org `dna-codes`, repo `dna`, workflow filename `publish.yml`). For packages that don't yet exist on npm, the entry is configured in advance and the first publish creates the package.

## Capabilities

### New Capabilities

(none — replaces existing requirements)

### Modified Capabilities

- `github-packages-publish-workflow`: the auth + permissions + publish-step requirements change. Specifically: the `NPM_TOKEN`-based auth requirement is replaced with an OIDC trusted-publisher requirement; the minimal-permissions requirement gains `id-token: write`; the workspace-publish-loop requirement gains `--provenance`. Other requirements (tag-driven trigger, build-before-publish, setup-node config) are unchanged.

## Impact

- **Code**: `.github/workflows/publish.yml` — already updated in `985e437` (this change is documentation catching up).
- **Secrets**: `NPM_TOKEN` becomes unreferenced; can be deleted via `gh secret delete NPM_TOKEN --repo dna-codes/dna` (optional cleanup).
- **npm registry**: each of the 14 published packages needs a Trusted Publisher entry on npmjs.com. Two are configured (`@dna-codes/dna-schemas`, `@dna-codes/dna-core`); the other 12 are pending the user's action and can be configured pre-publish.
- **Specs**: `openspec/specs/github-packages-publish-workflow/spec.md` — modify in place via deltas. The capability boundary "how DNA packages get published" is unchanged; only the auth mechanism flips.
- **Consumers**: zero impact. The auth model only affects who can publish, not who can install.
- **Out of scope**: Renaming the `github-packages-publish-workflow` spec — its name is increasingly misleading (no GitHub Packages, no NPM_TOKEN), but renaming is a separate cleanup we can take on if/when it becomes a real point of confusion.
