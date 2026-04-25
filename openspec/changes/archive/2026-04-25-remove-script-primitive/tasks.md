## 1. Schema deletion

- [x] 1.1 Delete `packages/schemas/technical/script.json`.
- [x] 1.2 In `packages/schemas/technical/technical.json`, remove the `scripts` property (collection + `$ref`) from the top-level object schema.
- [x] 1.3 In `packages/core/src/index.ts`, remove the `script: load('technical/script.json')` entry from the schema bundle. (Also updated `packages/core/src/index.test.ts`: technical schema list 11→10, total schema count 43→42.)

## 2. Verify

- [x] 2.1 Run `npm test --workspaces --if-present` from the repo root; confirm green. (308 tests across 12 workspaces — same total as before since Script had no tests of its own.)
- [x] 2.2 Run `npx openspec validate remove-script-primitive`; confirm green.

## 3. Commit

- [x] 3.1 Commit the three file changes with a message that flags the schema breaking change and references the previous remove-signal-and-equation change as the upstream cause.
