## 1. Rename packages

- [x] 1.1 For each `packages/<name>/package.json`, change `"name": "@dna-codes/<name>"` to `"name": "@dna-codes/dna-<name>"`. Bump `"version"` to `"0.4.0"`.
- [x] 1.2 Update internal cross-package deps: any `package.json` that references `@dna-codes/<old>` updates to `@dna-codes/dna-<old>` at `^0.4.0`.
- [x] 1.3 Find/replace `@dna-codes/<old>` → `@dna-codes/dna-<old>` across `packages/*/src/**`, `packages/*/test/**`, `packages/*/README.md`, `packages/*/AGENTS.md`. Verify no stale `@dna-codes/<old>` strings remain (`grep -r "@dna-codes/" packages/ | grep -v "dna-"` should return nothing).
- [x] 1.4 Update root `package.json#workspaces` if any path needs adjusting (probably no — directory names don't change).
- [x] 1.5 Update root `README.md` package table to the new names. Update `AGENTS.md` likewise.
- [x] 1.6 `rm -rf node_modules package-lock.json && npm install`. Run `npm test --workspaces` and confirm the suite still passes against the new names. *(After `npm run build --workspaces`, 13/14 workspaces pass all tests against the renamed packages. `integration-jira` has a pre-existing TS error in `client.ts:132` / `mapping.ts:47` — `styles: { capability: ... }` doesn't match `Unit = 'operation'|'resource'|'process'` — present at HEAD pre-rename, should be a separate change.)*

## 2. Add publish configuration

- [x] 2.1 In each renamed `packages/<name>/package.json`, add:
  ```json
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "public"
  }
  ```
- [x] 2.2 Verify `files` field in each `package.json` lists what should publish (typically `["dist", "docs", "README.md"]`). Run `npm pack --dry-run --workspaces` to confirm the tarball contents. *(All 14 packages pack cleanly with correct contents — `dna-schemas` ships JSON only, `dna-core` ships dist+docs+README, others ship dist+README, integration-* additionally ship `bin/` + `AGENTS.md`.)*

## 3. Add publish workflow

- [x] 3.1 Create `.github/workflows/publish.yml` with the shape from design.md decision #4 (tag trigger + `workflow_dispatch`, `npm publish --workspaces --access public`, `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`).
- [x] 3.2 Add a `release.md` (or just a section in the README) documenting the release process: `git tag v0.4.0 && git push --tags` triggers the workflow.

## 4. Repo transfer

- [ ] 4.1 In GitHub UI, navigate to `upgrade-solutions/dna` → Settings → "Transfer ownership" → enter `dna-codes` as the new owner. Confirm.
- [ ] 4.2 Update local clones: `git remote set-url origin git@github.com:dna-codes/dna.git`.
- [x] 4.3 Update README links and any `github.com/upgrade-solutions/dna` references to `github.com/dna-codes/dna`. *(no-op — this repo's README has no `upgrade-solutions/dna` URLs; the cba link is intentionally untouched.)*
- [ ] 4.4 Verify GitHub redirects from old URLs work (open `github.com/upgrade-solutions/dna` → should redirect to `github.com/dna-codes/dna`).

## 5. First publish

- [ ] 5.1 From the freshly-transferred `dna-codes/dna`, tag `v0.4.0` and push. The workflow runs and publishes every `@dna-codes/dna-*` package.
- [ ] 5.2 Verify on GitHub Packages: visit `github.com/orgs/dna-codes/packages` and confirm all expected packages appear at `0.4.0` with public visibility.
- [ ] 5.3 Smoke test from a clean directory: `mkdir /tmp/probe && cd /tmp/probe && npm init -y && echo '@dna-codes:registry=https://npm.pkg.github.com' > .npmrc && npm install @dna-codes/dna-core@0.4.0`. Confirm successful install.

## 6. Deprecate the old npm names (optional, after publish succeeds)

- [ ] 6.1 `npm deprecate @dna-codes/core "renamed to @dna-codes/dna-core; see github.com/dna-codes/dna"` for each unprefixed name. This is a one-time announcement to anyone still pulling `0.3.x` from npmjs.com.

## 7. Coordinate sister proposals

- [ ] 7.1 Notify the cells repo owner that the `0.4.0` publish is live so the cells sister proposal can pin against it.
- [ ] 7.2 Confirm dna-platform's sister proposal sees `0.4.0` resolving cleanly before tagging cells.
