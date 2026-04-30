## Context

Today's pipeline:

- Each `packages/*/package.json` declares `publishConfig.registry: https://npm.pkg.github.com` and a `repository: github:dna-codes/dna` field. None declare `publishConfig.access`.
- `.github/workflows/publish.yml` triggers on `v*` tag pushes, sets `permissions: { contents: read, packages: write }`, runs `actions/setup-node` with `registry-url: https://npm.pkg.github.com` and `scope: '@dna-codes'`, then loops over workspaces and runs `npm publish` per workspace using `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`. The loop tolerates `Cannot publish over existing version` and reports success.
- Consumers install via a two-line `.npmrc` (`@dna-codes:registry=https://npm.pkg.github.com` + `_authToken=${GITHUB_TOKEN}`) and a PAT with `read:packages`.
- Two specs codify this — `dna-codes-package-publishing` (registry target, private visibility, access-via-collaboration, repository field requirement) and `github-packages-publish-workflow` (tag-driven trigger, granular `packages: write` permission, `GITHUB_TOKEN` auth, build-before-publish ordering, per-workspace publish loop).
- The user owns the `@dna-codes` org on npmjs.com (per memory) and earlier `0.3.x` versions of these packages were already published there. The `0.4.x` line was the GitHub Packages detour.

Constraint: the `@dna-codes` scope on npmjs.com is *scoped* — by default scoped packages are restricted (paid-org or 404). To publish a scoped package as free-public, every `package.json#publishConfig` must include `"access": "public"`. Forgetting this is the #1 first-publish failure mode.

## Goals / Non-Goals

**Goals:**

- Restore `npm install @dna-codes/<name>` as the canonical install command — no `.npmrc`, no PAT, no `_authToken`.
- Keep the existing tag-driven release shape (`git tag vX.Y.Z && git push --tags`). The publish workflow's *trigger* and *workspace iteration* are not the parts that need to change; only its destination registry and auth do.
- Keep `dna-integration-jira` private and unpublished.
- Keep the existing build-before-publish ordering and the "skip already-published versions" tolerance in the workflow loop (idempotent re-runs of a tag are still valuable).
- Update the two affected specs in place so the spec library remains a faithful description of the live system.

**Non-Goals:**

- Backporting `0.4.x` to npmjs.com. The first npm publish under this change is a fresh minor bump (`0.4.x` → `0.5.0` for most packages, modulo where versions have already advanced). Older GitHub Packages versions stay where they are as deprecated artifacts.
- Republishing `dna-integration-jira` publicly. It remains `"private": true`.
- Setting up granular per-package npm tokens, npm provenance/SLSA attestations, or 2FA-required publishing in this change. Those are worth adding later but are independent of "which registry."
- Restructuring `publish.yml` into matrix jobs or splitting per-package — the current single-job loop is fine.

## Decisions

### Decision 1: Use `publishConfig.access: "public"` on every non-private package, and remove `publishConfig.registry` entirely

**Choice:** Each non-private `package.json#publishConfig` becomes:

```json
"publishConfig": {
  "access": "public"
}
```

No `registry` line. With no `publishConfig.registry`, npm falls back to the standard precedence: `--registry` flag → `npm config get registry` (set by `actions/setup-node`'s `registry-url`) → the default `https://registry.npmjs.org`. That's the intended path.

**Why over alternatives:**

- *Pinning `publishConfig.registry: https://registry.npmjs.org`*: redundant — that's already the default — and adds noise that any future registry change (e.g., a private mirror) would have to undo in 15 places. Omit it.
- *Setting access globally via `.npmrc` instead of `publishConfig`*: doesn't work for scoped-package access; npm requires it on the package or via `--access public` on the CLI. Per-package `publishConfig.access` is the durable form.

### Decision 2: Authenticate via `NPM_TOKEN` repo secret, not a per-developer credential

**Choice:** Add an `NPM_TOKEN` repo secret (or org secret) holding an npm **automation token** scoped to the `@dna-codes` org. The workflow exports it as `NODE_AUTH_TOKEN` for the publish step. `actions/setup-node` writes the matching `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}` line into the runner's `~/.npmrc`.

**Why over alternatives:**

- *Personal `_authToken`*: ties releases to an individual; rotates poorly. Automation tokens are the npm-recommended path for CI.
- *npm trusted publisher / OIDC (2024+)*: a strictly better long-term answer (no long-lived secret) but requires npm-side org config and a setup step we'd want as its own change. Defer.
- *Reusing `GITHUB_TOKEN`*: only works against GitHub Packages — the entire point of this change is to leave that registry.

### Decision 3: Update existing specs in place via deltas; do not create new spec names

**Choice:** Both `dna-codes-package-publishing` and `github-packages-publish-workflow` already describe the capability "how packages get published" — only the destination has changed. Reuse the same spec IDs and apply deltas (modify several requirements, remove a couple, add `publishConfig.access` requirement). Do not introduce a parallel `npmjs-publish-workflow` spec.

**Why:** The capability boundary is unchanged; renaming the spec would orphan history and force the workflow file path (`.github/workflows/publish.yml`) to migrate too. Deltas keep the audit trail clean. The spec **name** `github-packages-publish-workflow` is mildly misleading after this change, but renaming OpenSpec capability IDs is a separate cleanup we can take on if it becomes confusing — not load-bearing right now.

### Decision 4: Bump minor on first npm publish, do not match GitHub Packages versions

**Choice:** Whatever versions are sitting in `package.json` today (mix of `0.4.0`–`0.5.1`) get bumped a minor on the first npmjs.com publish under this change. So `dna-core` 0.5.1 → 0.6.0, `dna-schemas` 0.4.0 → 0.5.0, `dna-ingest` 0.1.0 → 0.2.0, etc. The exact cut-over version isn't part of this change's spec — it's an `/opsx:apply` decision — but the design choice is "bump, don't try to match."

**Why:** The pre-1.0 minor-bump-for-breaking-changes rule already in `dna-codes-package-publishing` covers this. Switching registries is observably breaking for consumers (their existing `.npmrc` stops resolving). A new minor signals that and avoids any chance of confusing version overlap with the deprecated GitHub Packages line.

### Decision 5: Keep `repository` field; loosen its requirement language

**Choice:** Every `package.json` keeps `"repository": "github:dna-codes/dna"`. We update the spec to describe this as **recommended** (npm uses it for the registry's "Repository" link and for provenance) rather than **required for auth** (which was a GitHub Packages quirk).

**Why:** It's standard hygiene; no reason to remove it. The spec language just shouldn't claim 401-on-omission anymore.

## Risks / Trade-offs

- **Risk:** First publish forgets `publishConfig.access: "public"` on a package and npm 402s with `Payment Required` — the cryptic error for "scoped package + no public access on a free org plan." → **Mitigation:** Tasks include an explicit pre-flight grep verifying every non-private `package.json` has `"access": "public"`. Also, dry-running one package (`npm publish --dry-run -w @dna-codes/dna-schemas`) catches this before the tag push.
- **Risk:** `NPM_TOKEN` secret missing or expired when the workflow runs → publish fails 401, partial release. → **Mitigation:** Verify the secret exists (a one-time `gh secret list` confirmation belongs in tasks) before tagging. The workflow loop's "tolerate already-published" behavior means a failed mid-run tag can be re-run after fixing the secret without manual cleanup.
- **Risk:** Consumers' existing `~/.npmrc` keeps pointing `@dna-codes` at GitHub Packages and they "successfully" install a stale version. → **Mitigation:** README explicitly tells them to remove that scoped-registry line. Also, bumping the minor on first npm publish means anyone asking for `^0.5.0` (or whatever next is) won't resolve against the old GitHub Packages versions even if their `.npmrc` is wrong.
- **Trade-off:** No provenance attestations on the first npm publish. We could add `--provenance` flag + the OIDC permission to the workflow now, but it expands this change's surface area. Acceptable to defer.
- **Trade-off:** The `github-packages-publish-workflow` spec name reads as misleading post-change. Acceptable for now; a follow-up cleanup change can rename.

## Migration Plan

1. **Pre-flight (manual, before any code edit):** Confirm npm org `@dna-codes` exists and the user is an owner (per memory: it does, they are). Generate an npm automation token. Add it as `NPM_TOKEN` repo secret on `dna-codes/dna`.
2. **Code edits (all on `main`, per repo convention):** Update the 15 `package.json` files, rewrite `publish.yml`, rewrite the README sections, apply the spec deltas. Single commit (or two — one for code/CI, one for docs/specs — at the user's preference).
3. **Version bump:** Decide the cut-over versions (a minor bump per package). Apply in a commit.
4. **Smoke test:** Run `npm publish --dry-run -w @dna-codes/dna-schemas` locally. Verify tarball contents and that the would-be registry is `registry.npmjs.org`.
5. **Cut release:** `git tag vX.Y.Z && git push --tags`. Watch the workflow. The "skip already-published versions" branch is unreachable on first run since these versions are new on npm — any failure here is a real failure, not a re-run artifact.
6. **Verify:** `npm view @dna-codes/dna-core version` from a clean shell (no `.npmrc`, no PAT) should return the new version.

**Rollback:** If the npm publish goes badly mid-run, the workflow's "tolerate already-published" tolerance lets us fix forward and re-run the same tag. No need to unpublish — npm only allows unpublish within 72 hours and even then it's strongly discouraged. We'd ship a patch bump rather than unpublish.

## Open Questions

- Cut-over versions per package — to be decided during `/opsx:apply` rather than in this design. Current draft: bump every non-private package's minor by one.
- Whether to add `--provenance` + the matching `id-token: write` permission in this change. Default: **no**, defer to a follow-up. Open to hearing otherwise.
- Whether to leave the existing `0.4.x` versions on GitHub Packages alone or to mark them deprecated via `npm deprecate` (which doesn't apply — they're on a different registry; GitHub Packages has no equivalent flow short of unpublishing). Default: **leave them**; they'll only be reachable to consumers with the old `.npmrc` configuration.
