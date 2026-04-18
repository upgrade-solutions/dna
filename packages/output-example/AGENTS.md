# AGENTS.md — `@dna-codes/output-example`

Guidance for AI agents forking this template into a new `output-*` package.

## Role in the pipeline

```
[external format] → input-* → DNA → output-* → [external format]
```

`output-*` packages consume DNA and emit a string (markdown, HTML, Mermaid source, etc.) or serialized bytes. They know nothing about the systems that produced or will consume that string — that's `integration-*`'s job.

## How to fork

1. Copy the directory: `cp -R packages/output-example packages/output-<format>`
2. Update `package.json`:
   - `name` → `@dna-codes/output-<format>`
   - `description` — one sentence stating the output format.
3. Replace the sections/diagrams:
   - For text-like outputs (markdown, HTML, plaintext): keep `src/sections/` and rewrite each section for your format. Extend the `Section` union in `src/index.ts`.
   - For diagram outputs (Mermaid, GraphViz, PlantUML): rename `sections/` to `diagrams/` and rename the option from `sections` to `diagrams` (see `@dna-codes/output-mermaid` for precedent).
4. Rewrite `src/util.ts` with helpers for your format (escaping, wrapping, ID sanitization).
5. If your format has a wrapper concept (e.g. a standalone HTML document vs. a fragment), add a boolean option — see `@dna-codes/output-html`'s `standalone` option for precedent.
6. Update tests to assert on the new output shape.
7. Update this `AGENTS.md` and `README.md`.

## Hard contract

- **Signature:** `render(dna: DnaInput, options?: RenderOptions): string`
- **Sync and pure.** No I/O, no Promises.
- **Never throws on partial/empty DNA.** Return `''` when there's nothing to render.
- **Returns `string`.** If you need to emit binary output (PDF), return a base64 string or export a second function like `renderBinary(): Uint8Array` — don't change `render`'s signature.
- **Zero runtime dependencies.** `@dna-codes/core` may be a dev dep for types only, but never imported at runtime. Keep the `DnaInput` type local and loose.
- **Sections/diagrams return `string | null`.** `null` means "skip me". The top-level `render` drops nulls and joins the rest.

## Design tips

- Keep `DnaInput` in `types.ts` loose — only model fields you actually read, and mark them all optional. Callers pass partial DNA and the renderer should degrade gracefully.
- Put format-specific escaping in `util.ts`, not inline in sections.
- Export `DEFAULT_SECTIONS` (or `DEFAULT_DIAGRAMS`) as a `readonly` array so downstream callers can reuse the default order.
- Heading levels cascade: `render` picks a base level, each section takes `base + 1`. Keep that invariant.

## Wiring into the workspace

After creating the directory, add it to the root `package.json` `workspaces` array and to the package table in the root `README.md`.

## Testing

```bash
npm run build -w @dna-codes/output-<format>
npm test   -w @dna-codes/output-<format>
```
