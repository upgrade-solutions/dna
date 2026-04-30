## 1. Pre-flight (manual / out-of-band)

- [x] 1.1 Confirm npm org `@dna-codes` exists and the active npm user is an owner (`npm org ls @dna-codes`)
- [x] 1.2 Generate an npm **automation token** scoped to publish access on `@dna-codes`
- [x] 1.3 Add the token as repo secret `NPM_TOKEN` on `dna-codes/dna` (`gh secret set NPM_TOKEN`)
- [x] 1.4 Verify the secret is present (`gh secret list` shows `NPM_TOKEN`)

## 2. Update workspace package.json files

- [x] 2.1 Remove `publishConfig.registry` (the `https://npm.pkg.github.com` line) from every `packages/*/package.json`
- [x] 2.2 Add `publishConfig.access: "public"` to every non-private `packages/*/package.json` (14 packages — all except `integration-jira`)
- [x] 2.3 Leave `packages/integration-jira/package.json` `"private": true` untouched (its `publishConfig` can keep `access: "public"` defensively or be dropped — either is fine since it never publishes)
- [x] 2.4 Verify all 15 packages still have `repository: github:dna-codes/dna`
- [x] 2.5 Pre-flight grep: confirm no remaining `npm.pkg.github.com` references in `packages/*/package.json`

## 3. Bump versions

- [x] 3.1 Decide cut-over versions: bump every non-private package's `version` minor by one (e.g. `dna-core` 0.5.1 → 0.6.0, `dna-schemas` 0.4.0 → 0.5.0, `dna-ingest` 0.1.0 → 0.2.0)
- [x] 3.2 Update `dependencies` ranges in dependent packages so internal `@dna-codes/*` deps point at the new minor (e.g. `dna-input-text`'s `@dna-codes/dna-core: ^0.5.0` → `^0.6.0`)
- [x] 3.3 Run `npm install` at the repo root to refresh `package-lock.json` to the new versions

## 4. Rewrite `.github/workflows/publish.yml`

- [x] 4.1 Rename the workflow `name:` from "Publish to GitHub Packages" to "Publish to npm"
- [x] 4.2 Change `permissions:` from `{ contents: read, packages: write }` to `{ contents: read }`
- [x] 4.3 Change `actions/setup-node@v4` `registry-url` from `https://npm.pkg.github.com` to `https://registry.npmjs.org` (keep `scope: '@dna-codes'`)
- [x] 4.4 Change the publish step's `env.NODE_AUTH_TOKEN` from `${{ secrets.GITHUB_TOKEN }}` to `${{ secrets.NPM_TOKEN }}`
- [x] 4.5 Keep the per-workspace publish loop and its "Cannot publish over existing version" tolerance — only the registry it talks to changes
- [x] 4.6 Update any inline echo/group strings that mention "GitHub Packages" to "npm"

## 5. Update README.md

- [x] 5.1 Replace the `Installing from GitHub Packages` section with an `Installing from npm` section: a single `npm install @dna-codes/dna-core` example, no `.npmrc` or PAT instructions
- [x] 5.2 Note in the new install section that consumers with a stale `@dna-codes:registry=https://npm.pkg.github.com` line in their `~/.npmrc` should remove it
- [x] 5.3 Rewrite the `Releasing` section: still tag-driven, but mention that the workflow publishes to npmjs.com and requires the `NPM_TOKEN` repo secret
- [x] 5.4 Update the table of contents (link target from `#installing-from-github-packages` to `#installing-from-npm`)
- [x] 5.5 Update `npm view @dna-codes/dna-core version` quick-verification snippet to note no `.npmrc` is required

## 6. Verify the publish-npm skill is current

- [x] 6.1 Read `.claude/skills/publish-npm/SKILL.md` and verify its `publishConfig.access: "public"` step matches the new package.json shape
- [x] 6.2 If the skill mentions GitHub Packages anywhere (it should not — this was already npm-flavored), correct it

## 7. Smoke test before tagging

- [x] 7.1 Run `npm whoami` locally; confirm logged into npmjs.com
- [x] 7.2 Run `npm publish --dry-run -w @dna-codes/dna-schemas`; confirm tarball would upload to `registry.npmjs.org` and contains the expected `operational/`, `product/`, `technical/`, and `README.md` files
- [x] 7.3 Run `npm publish --dry-run -w @dna-codes/dna-core`; confirm `dist/` and types are included and the would-be registry is npmjs.com
- [x] 7.4 Run `npm run build --workspaces --if-present` from repo root; confirm clean build across all packages

## 8. Cut the release

- [x] 8.1 Commit all the above as a single change (or two — code/CI separate from docs/specs — at the user's preference); confirm with the user before committing
- [ ] 8.2 Choose the cut-over tag (e.g. `v0.6.0` matching the new `dna-core` minor)
- [ ] 8.3 `git tag <tag>` and `git push --tags` (with user confirmation — never push without asking)
- [ ] 8.4 Watch the workflow run on the Actions tab; confirm all non-private packages publish successfully

## 9. Post-publish verification

- [x] 9.1 From a clean shell with no `~/.npmrc`, run `npm view @dna-codes/dna-core version`; confirm it returns the new version from npmjs.com (verified via direct curl: `dna-core@0.6.0` and `dna-schemas@0.5.0` live + public on registry)
- [ ] 9.2 Repeat for `@dna-codes/dna-schemas` and one adapter (e.g. `@dna-codes/dna-output-markdown`) — schemas verified; adapter pending until full release is cut
- [ ] 9.3 Optional: run `npm install @dna-codes/dna-core` in a scratch directory to confirm end-to-end install works with no auth setup

## 10. Archive the change

- [ ] 10.1 Run `/opsx:archive switch-publishing-to-npmjs` to move the change under `openspec/changes/archive/` and apply the spec deltas to `openspec/specs/`
