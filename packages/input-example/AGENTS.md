# AGENTS.md — `@dna-codes/dna-input-example`

Guidance for AI agents forking this template into a new `input-*` package.

## Role in the pipeline

```
[external format] → input-* → DNA → output-* → [external format]
```

`input-*` packages convert some source format into DNA. This template shows two modes in one package; a real fork should contain **exactly one**.

## Picking a mode

| Mode | When | Entry point | Key traits |
|---|---|---|---|
| Deterministic | Structured input (JSON, YAML, CSV, SQL DDL, OpenAPI, proto) | `parse(data, options)` | Sync, pure, zero I/O, same input → same output |
| Probabilistic | Freeform input (prose, transcripts, images) | `parseText(text, options)` | Async, LLM-backed, requires API key, non-deterministic |

## How to fork

1. Copy the directory: `cp -R packages/input-example packages/input-<your-format>`
2. Update `package.json`:
   - `name` → `@dna-codes/dna-input-<your-format>`
   - `description` — one sentence, declare the source format. If probabilistic, note the API-key requirement.
3. **Keep one mode, delete the other:**
   - **Deterministic-only:** delete `src/providers.ts`, `src/prompt.ts`, `examples/`, the probabilistic half of `src/index.ts` (everything below the comment divider), the probabilistic types in `src/types.ts`, and the probabilistic tests.
   - **Probabilistic-only:** delete the deterministic half of `src/index.ts` and `src/types.ts`, and the deterministic tests.
4. Replace the demo `EntityListInput` shape in `types.ts` with your real source shape.
5. Rewrite `parse` / `parseText` to walk your source and emit DNA.
6. Keep the `ParseResult`/`TextParseResult` shape: always an object keyed by DNA layer (`operational`, `productCore`, `productApi`, `productUi`, `technical`). Emit only the layers you produce.
7. Write tests that feed in representative source samples and assert on the returned DNA shape.
8. Update this `AGENTS.md` and `README.md` — do not leave template wording in place.

## Hard contract

- **`@dna-codes/dna-core` is the only `@dna-codes/*` runtime dependency.** It supplies the builders. Dev deps for test/build are fine. No other SDKs or parsers unless truly necessary (and if added, keep them small).
- **Use the builders to compose your output DNA.** `addResource`, `addPerson`, `addOperation`, etc. handle identity-by-name composition, schema validation, and conflict surfacing. Don't roll your own accumulator — `input-json` and `input-text/layered/constructor` both consume builders today; following the pattern keeps your adapter consistent.
- **Throw, do not return error objects.** Validation of the emitted DNA belongs to the builders (default-on); your job is to fail fast on malformed source.
- **Naming:** Resources are PascalCase singular. Actions are PascalCase. Capability names are always `Resource.Action`.
- **Return shape:** always a layered object — `{ operational: {...} }`, not `{...}` alone.

## Probabilistic-specific

- Inject `fetchImpl` in the options so tests can mock HTTP without a network.
- Default `temperature` to `0` — users expect adapters to be as repeatable as possible.
- Keep the system prompt declarative (shape + rules, no examples unless needed).
- Surface `raw` on the result so users can debug bad model output.
- Document the API key requirement prominently in the README.

## Wiring into the workspace

After creating the directory, add it to the root `package.json` `workspaces` array and to the package table in the root `README.md`.

## Testing

```bash
npm run build -w @dna-codes/dna-input-<your-format>
npm test   -w @dna-codes/dna-input-<your-format>
```
