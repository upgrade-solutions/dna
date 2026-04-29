## 0. Distribution model (mid-apply revision)

The proposal originally targeted **public** GitHub Packages. Mid-apply the
distribution shifted to **private** packages on GitHub Packages, so a partner
can be granted access via repo collaboration without exposing the codebase
publicly. Functional impact:

- Repo `dna-codes/dna` is private.
- `--access public` is removed from publishConfig and the publish workflow.
- Consumers (current and partner) need a PAT with `read:packages` scope to install.
- The "public visibility means no auth needed" note in design.md decision text no longer holds — that phrasing in the proposal/design is superseded by this section.

## 1. Rename packages

- [x] 1.1 For each `packages/<name>/package.json`, change `"name": "@dna-codes/<name>"` to `"name": "@dna-codes/dna-<name>"`. Bump `"version"` to `"0.4.0"`.
- [x] 1.2 Update internal cross-package deps: any `package.json` that references `@dna-codes/<old>` updates to `@dna-codes/dna-<old>` at `^0.4.0`.
- [x] 1.3 Find/replace `@dna-codes/<old>` → `@dna-codes/dna-<old>` across `packages/*/src/**`, `packages/*/test/**`, `packages/*/README.md`, `packages/*/AGENTS.md`. Verify no stale `@dna-codes/<old>` strings remain (`grep -r "@dna-codes/" packages/ | grep -v "dna-"` should return nothing).
- [x] 1.4 Update root `package.json#workspaces` if any path needs adjusting (probably no — directory names don't change).
- [x] 1.5 Update root `README.md` package table to the new names. Update `AGENTS.md` likewise.
- [x] 1.6 `rm -rf node_modules package-lock.json && npm install`. Run `npm test --workspaces` and confirm the suite still passes against the new names. *(After `npm run build --workspaces`, 13/14 workspaces pass all tests against the renamed packages. `integration-jira` has a pre-existing TS error in `client.ts:132` / `mapping.ts:47` — `styles: { capability: ... }` doesn't match `Unit = 'operation'|'resource'|'process'` — present at HEAD pre-rename. Marked `private: true` and stripped its build/test scripts in commit 689f45e so it doesn't block publishing of the other 13 packages; should be fixed in a separate change.)*

## 2. Add publish configuration

- [x] 2.1 In each renamed `packages/<name>/package.json`, add:
  ```json
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
  ```
  *(Originally included `"access": "public"`; stripped in commit 34e2c7f to default to scoped-private.)*
- [x] 2.2 Verify `files` field in each `package.json` lists what should publish (typically `["dist", "docs", "README.md"]`). Run `npm pack --dry-run --workspaces` to confirm the tarball contents. *(All 14 packages pack cleanly with correct contents — `dna-schemas` ships JSON only, `dna-core` ships dist+docs+README, others ship dist+README, integration-* additionally ship `bin/` + `AGENTS.md`.)*
- [x] 2.3 Add `"repository": "github:dna-codes/dna"` to every package.json — required by GitHub Packages to link uploaded tarballs to the source repo (commit cf1deba). *(Discovered necessary mid-apply; metadata only — first 0.4.0 publish ran from 689f45e without it.)*

## 3. Add publish workflow

- [x] 3.1 Create `.github/workflows/publish.yml` with the shape from design.md decision #4 (tag trigger + `workflow_dispatch`, `npm publish --workspaces`, `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`). *(Originally included `--access public`; removed in commit 34e2c7f.)*
- [x] 3.2 Add a `release.md` (or just a section in the README) documenting the release process: `git tag v0.4.0 && git push --tags` triggers the workflow. *(Updated in commit 34e2c7f to document private-install setup with PAT.)*

## 4. Repo transfer

- [x] 4.1 In GitHub UI, navigate to `upgrade-solutions/dna` → Settings → "Transfer ownership" → enter `dna-codes` as the new owner. Confirm.
- [x] 4.2 Update local clones: `git remote set-url origin git@github.com:dna-codes/dna.git`.
- [x] 4.3 Update README links and any `github.com/upgrade-solutions/dna` references to `github.com/dna-codes/dna`. *(no-op — this repo's README has no `upgrade-solutions/dna` URLs; the cba link is intentionally untouched.)*
- [x] 4.4 Verify GitHub redirects from old URLs work (open `github.com/upgrade-solutions/dna` → should redirect to `github.com/dna-codes/dna`).

## 5. First publish

- [x] 5.1 From the freshly-transferred `dna-codes/dna`, tag `v0.4.0` and push. The workflow runs and publishes every `@dna-codes/dna-*` package. *(Run on commit 689f45e succeeded — 13 packages published; integration-jira intentionally skipped via `private: true`.)*
- [ ] 5.2 Verify on GitHub Packages: visit `github.com/orgs/dna-codes/packages` and confirm all expected packages appear at `0.4.0`. Verify each package's visibility is **Private** (the repo is private; ensure no package was incidentally set public during the `--access public` early publish).
- [ ] 5.3 Smoke test from a clean directory with a `read:packages` PAT in `.npmrc`:
  ```sh
  mkdir /tmp/probe && cd /tmp/probe
  npm init -y
  echo '@dna-codes:registry=https://npm.pkg.github.com' > .npmrc
  echo '//npm.pkg.github.com/:_authToken=ghp_YOUR_PAT' >> .npmrc
  npm install @dna-codes/dna-core@0.4.0
  ```
  Confirm successful install.

## 6. Deprecate the old npm names (optional, after publish succeeds)

- [ ] 6.1 ~~`npm deprecate` for each unprefixed `@dna-codes/<name>` on npmjs.com.~~ *(Decision shifted: the user plans to remove the actual packages from npmjs.com rather than deprecate. Use `npm unpublish @dna-codes/<name>@<version>` per package within the 72h window where allowed; for older versions, npm support / `npm deprecate` remains the only option. Action owner: user.)*

## 7. Coordinate sister proposals

- [ ] 7.1 Notify the cells repo owner that the `0.4.0` publish is live so the cells sister proposal can pin against it. *(Heads-up: cells will need a `read:packages` PAT in CI and any contributor's local `.npmrc` to install — the registry is no longer anonymous-readable.)*
- [ ] 7.2 Confirm dna-platform's sister proposal sees `0.4.0` resolving cleanly before tagging cells. *(Same PAT requirement applies.)*

## Summary of commits

- `013647d` — Rebrand all packages to @dna-codes/dna-*; bump to 0.4.0 (also carried in unrelated object-field-type edits to schemas/product/core/field.json, core/docs/product.md, core/src/validator.test.ts, output-openapi sources)
- `9b53afa` — Add GitHub Packages publish workflow (recovered after dropped stash)
- `689f45e` — Mark integration-jira private and drop build/test scripts → first successful publish
- `cf1deba` — Add `repository` field to every package
- `34e2c7f` — Drop `--access public`; document private install via PAT
