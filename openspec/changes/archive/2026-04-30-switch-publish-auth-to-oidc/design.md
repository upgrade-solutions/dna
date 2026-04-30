## Context

The just-archived `switch-publishing-to-npmjs` change codified `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` as the publish-step auth and required the `NPM_TOKEN` repo secret. The first run on tag `v0.6.0` failed because the token was a **Publish** token (per-write 2FA) rather than an **Automation** token (CI-friendly, bypasses 2FA). Schemas and core had already been published locally before the workflow ran, so they're live; the other 12 packages aren't.

Rather than regenerate the token as Automation, the user opted to move to npm Trusted Publishers (OIDC). The workflow file was edited in `985e437` to:

1. Add `id-token: write` to the workflow's `permissions:` block.
2. Remove the `NODE_AUTH_TOKEN` env var on the publish step.
3. Pass `--provenance` to `npm publish` inside the per-workspace loop.

The trusted-publisher rule on npmjs.com is the other half — without it, the OIDC token has no matching grant and the registry refuses the publish. Two packages (schemas, core) are already configured; the other 12 are pending.

## Goals / Non-Goals

**Goals:**

- Bring the `github-packages-publish-workflow` spec back in sync with the workflow file as it lives in `main`. After this change, the spec accurately describes OIDC + provenance, not `NPM_TOKEN`.
- Capture *why* the auth model changed mid-release (so the next person reading the spec doesn't wonder why we're "doing it the hard way" with OIDC vs. a token).

**Non-Goals:**

- Re-running the publish workflow. That's a follow-up step the user takes when ready (after configuring the remaining 12 trusted publishers); it doesn't belong in this change's tasks.
- Renaming the `github-packages-publish-workflow` spec to something accurate. Its name is wrong twice over now (no GitHub Packages, no NPM_TOKEN), but renaming OpenSpec capability IDs is a different kind of cleanup; deferred.
- Adding new requirements unrelated to auth. The setup-node + tag-trigger + build-before-publish + workspace-loop requirements stay as-is.
- Touching `dna-codes-package-publishing` (the registry/access spec) — it remains correct as written.

## Decisions

### Decision 1: Replace `NPM_TOKEN`-based auth requirement with an OIDC trusted-publisher requirement

**Choice:** REMOVE the existing `Workflow authenticates via the NPM_TOKEN repo secret` requirement and ADD a new `Workflow authenticates via OIDC trusted publishers` requirement. The new requirement codifies:

- `id-token: write` in the workflow's `permissions:` block
- `npm publish --provenance` in the publish step
- The expectation that each package has a Trusted Publisher rule on npmjs.com matching `dna-codes/dna` + `publish.yml`
- That `NODE_AUTH_TOKEN` is NOT set (any leftover env wiring would be redundant, not harmful)

**Why over alternatives:**

- *MODIFY in place keeping the old name*: rejected — the new requirement isn't a refinement of the old, it's a different mechanism. REMOVE+ADD reads more honestly in spec history and gives space for a `Reason`+`Migration` block on the removed one.
- *Add OIDC alongside NPM_TOKEN as fallback*: rejected — having two auth paths makes the workflow file ambiguous and invites the next contributor to re-add the secret. One clear path.

### Decision 2: Update the minimal-permissions requirement to require `id-token: write`

**Choice:** MODIFY the existing `Workflow declares minimal permissions` requirement so the permissions block now requires both `contents: read` AND `id-token: write`. The `packages: write` exclusion stays.

**Why over alternatives:**

- *Separate the two permissions into a new requirement*: rejected — they belong together as "the permissions block this workflow needs"; splitting them would force readers to cross-reference.
- *Add a third requirement just for `id-token: write`*: same objection, plus harder to validate.

### Decision 3: Update the workspace-publish-loop requirement to require `--provenance`

**Choice:** MODIFY the existing `Workflow publishes every workspace and respects private` requirement to specify the `npm publish` invocation includes `--provenance`. The "skip already-published versions" tolerance and the `private: true` skip behavior are unchanged.

**Why:** `--provenance` is a publish-CLI flag, not a separate auth concern, but on npm it's also the trigger that opts into trusted-publisher OIDC. So it belongs in the publish-loop requirement, not the auth requirement, even though they're deeply related on the implementation side.

### Decision 4: Don't touch the setup-node requirement

**Choice:** Leave `Workflow configures setup-node for npmjs.com` exactly as-is. setup-node still writes `~/.npmrc` with `registry-url` and `scope` — that part of the runner config is needed regardless of auth mechanism. The empty `_authToken=` line in `.npmrc` is harmless; npm CLI reaches OIDC when `--provenance` is set and a Trusted Publisher rule matches.

**Why:** Smallest delta. The setup-node action does its job either way.

## Risks / Trade-offs

- **Risk:** A package on npm is missing a Trusted Publisher rule when the workflow runs → that one publish fails 401/403. → **Mitigation:** workflow loop is fault-tolerant (other packages still attempt); the user fixes the missing rule and re-triggers; idempotent. Tasks already document the pre-flight verification.
- **Risk:** npm changes their OIDC contract or `--provenance` semantics → workflow breaks. → **Mitigation:** none preventative; rely on npm's deprecation timelines + the spec being explicit so a future fix is scoped.
- **Trade-off:** The `github-packages-publish-workflow` spec name is now visibly wrong on two axes. Accepted; renaming is a separate cleanup.
- **Trade-off:** Provenance attestations require GitHub-hosted runners (or specific self-hosted setup). We use GitHub-hosted (`runs-on: ubuntu-latest`), so this is fine; flagging it because it's a constraint that wasn't previously load-bearing.

## Migration Plan

Already partially complete:

1. Workflow file updated in `985e437` ✓
2. Schemas + core trusted publishers configured on npmjs.com ✓

This change adds:

3. Apply spec deltas (the OpenSpec archive step on this change does this).
4. (User action, separate from this change) Configure trusted publishers for the remaining 12 packages on npmjs.com.
5. (User action, separate) Re-trigger the workflow against `v0.6.0` once 12 trusted publishers are configured.
6. (Optional cleanup) Delete `NPM_TOKEN` repo secret.

**Rollback:** if OIDC publishing breaks for some npm-side reason, restore the `NPM_TOKEN` env var + `NODE_AUTH_TOKEN` wiring (one commit revert) and regenerate the token as **Automation**. The `--provenance` flag fails closed if OIDC is unavailable, so a fallback path requires explicit reverting.

## Open Questions

- Should we delete the `NPM_TOKEN` secret as part of this change, or leave it as user discretion? Leaning **leave it** — secret hygiene is the user's call and unused secrets aren't a security issue (no path uses them). Tasks lists it as optional.
