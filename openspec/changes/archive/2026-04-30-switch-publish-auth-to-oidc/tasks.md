## 1. Workflow file (already done in `985e437`, listed for completeness)

- [x] 1.1 Add `id-token: write` to `.github/workflows/publish.yml` permissions block
- [x] 1.2 Remove `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` env var from the publish step
- [x] 1.3 Add `--provenance` flag to `npm publish` inside the per-workspace loop

## 2. Trusted Publishers on npmjs.com (user action)

- [x] 2.1 Configure Trusted Publisher for `@dna-codes/dna-schemas` (org `dna-codes`, repo `dna`, workflow `publish.yml`)
- [x] 2.2 Configure Trusted Publisher for `@dna-codes/dna-core`
- [ ] 2.3 Configure Trusted Publishers for the remaining 12 non-private packages (deferred per user — to be done before re-running the workflow):
  - `@dna-codes/dna-ingest`
  - `@dna-codes/dna-input-json`, `dna-input-openapi`, `dna-input-text`, `dna-input-example`
  - `@dna-codes/dna-output-markdown`, `dna-output-html`, `dna-output-mermaid`, `dna-output-openapi`, `dna-output-text`, `dna-output-example`
  - `@dna-codes/dna-integration-example`, `dna-integration-google-drive`

## 3. Re-trigger the workflow (user action, after Section 2 completes)

- [ ] 3.1 Run `gh workflow run publish.yml --repo dna-codes/dna --ref v0.6.0` (workflow_dispatch against the existing tag)
- [ ] 3.2 Watch the run; confirm schemas + core report `Skipped (already on registry)` and the other 12 publish successfully with provenance
- [ ] 3.3 Verify a fresh package on npmjs.com — package page should show a "Provenance" badge linking to the attestation

## 4. Optional cleanup

- [ ] 4.1 Delete the unused `NPM_TOKEN` secret: `gh secret delete NPM_TOKEN --repo dna-codes/dna`

## 5. Archive this change

- [ ] 5.1 Run `openspec archive switch-publish-auth-to-oidc --yes` once Sections 2–3 are complete (Section 4 is optional and not blocking)
