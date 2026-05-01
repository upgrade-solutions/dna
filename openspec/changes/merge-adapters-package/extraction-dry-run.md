# Extraction dry-run record

This file documents the procedure proven by `tasks.md` Group 9 — that any single adapter folder under `packages/adapters/src/<kind>/<name>/` can be lifted back into its own published npm package without touching source code.

The dry-run was performed against `packages/adapters/src/output/example/` (the simplest renderer; chosen because it imports nothing outside its own folder, so it's the minimum bar for the extraction promise).

## Steps that succeeded with no source-file edits

1. Copy the entire adapter folder to a new location:
   ```bash
   mkdir -p $TMPDIR/dna-extract-dryrun/packages/output-example/src
   cp -R packages/adapters/src/output/example/* $TMPDIR/dna-extract-dryrun/packages/output-example/src/
   ```

2. Author a fresh `package.json` for the extracted package (no source edits — only this new file):
   ```json
   {
     "name": "@dna-codes/dna-output-example",
     "version": "0.0.0-extraction-dryrun",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "scripts": { "build": "tsc", "test": "node --experimental-vm-modules ../../node_modules/.bin/jest" },
     "devDependencies": { "@types/jest": "^29.5.0", "@types/node": "^20.0.0", "jest": "^29.5.0", "ts-jest": "^29.1.0", "ts-node": "^10.9.0", "typescript": "^5.4.0" },
     "jest": { "preset": "ts-jest", "testEnvironment": "node", "testPathIgnorePatterns": ["/node_modules/", "/dist/"] }
   }
   ```

3. Author a fresh `tsconfig.json` (the same template every adapter package uses).

4. Symlink `node_modules` (or run `npm install`).

5. `tsc` builds clean → `dist/` populated with `index.js`, `index.d.ts`, `sections/`, etc.

6. `jest` runs clean → 8/8 tests pass.

## What this proves

- No source file under `packages/adapters/src/output/example/` references the merged package's name or any sibling adapter. The folder is structurally a complete TypeScript package with only `package.json` and `tsconfig.json` missing.
- The isolation contract (Decision 3 in `design.md`) is enforceable because it is being enforced — `package-isolation.test.ts` blocks any future PR that would introduce a sibling import.
- Extraction of a more complex adapter (e.g. `integration/jira` with its CLI) would require one additional step: the CLI's `@dna-codes/dna-adapters/input/text` and `@dna-codes/dna-adapters/output/text` self-references would either continue to work (if the merged package still ships those subpaths) or be replaced with `@dna-codes/dna-input-text` / `@dna-codes/dna-output-text` (if those are also extracted to standalone packages first). The CLI source itself doesn't change.

## Disposition

The dry-run worktree was discarded — no commit, no follow-up. The recipe lives here in the change archive as the canonical extraction procedure for post-1.0 use.
