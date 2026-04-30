# AGENTS.md — `@dna-codes/dna-ingest`

Guidance for AI agents extending the orchestrator or writing reader-side `integration-*` packages that participate in it.

## What this package is

A thin coordinator. Two responsibilities, nothing else:

1. **Fetch** — given a list of source URIs, dispatch each by URI scheme to either a built-in fs fetcher (for `file://` and bare paths) or a caller-supplied `Integration`.
2. **Extract** — given fetched `{ contents, mimeType, source }`, dispatch by MIME type (with `*`-segment globs) to a caller-supplied `InputAdapter`.

Then it hands every per-source DNA chunk to `@dna-codes/dna-core`'s `merge()` and returns `{ dna, conflicts, errors, provenance }`.

## Hard rules

- **No `@dna-codes/dna-input-*` or `@dna-codes/dna-integration-*` runtime dependencies.** Ever. Including peer deps. Test for this in CI.
- **No package-internal fetcher beyond `file://`.** Every other scheme must go through caller-supplied integrations. Adding a built-in HTTP fetcher would creep this into a fat-hub.
- **Forward LLM options verbatim.** Do not default, mutate, or interpret `llm.{model, temperature, seed}`. The orchestrator's job is plumbing, not policy.
- **Fail soft per source.** A failed fetch or extract on one source records an `errors[]` entry and the run continues. Never let one source abort the whole call.
- **Bounded concurrency.** Default 4; configurable; reject `< 1`. Do not add advanced rate-limiting — that lives in individual integrations.

## Writing a new `integration-*` that participates

Implement the `Integration` interface (re-exported from this package):

```ts
import type { Integration } from '@dna-codes/dna-ingest'

export default function myIntegration(opts: MyOpts): Integration {
  return {
    async fetch(uri) {
      // 1. Auth, request, retry, rate-limit handling — your responsibility.
      // 2. Normalize PDF / Office / proprietary formats to text or bytes.
      // 3. Return { contents, mimeType, source: { uri, loadedAt: <ISO 8601> } }.
    },
  }
}
```

Notes:

- **PDF/Office text extraction belongs inside the integration.** Don't push that to the orchestrator. Each integration that supports such formats brings its own parser dependency — this scopes the dep correctly.
- **`mimeType` must be specific enough to route.** `text/markdown` is good; `application/octet-stream` will probably miss every input adapter. If you can sniff a more specific type, do.
- **`source.loadedAt` is fetch-time.** Not factory-time. Set it inside `fetch()` so retries get a fresh timestamp.
- **Errors thrown from `fetch()` are caught upstream** and surfaced as `errors[]` entries with `stage: 'fetch'`. Throw a useful Error with a clear message; the orchestrator does not classify error subtypes.

## Writing a new `input-*` that participates

`InputAdapter` matches the existing `input-text`/`input-transcript`/`input-image` shape:

```ts
type InputAdapter = (
  contents: string | Buffer,
  options: { llm: { model: string; temperature: number; seed: number } },
) => Promise<OperationalDNA>
```

If you're forking `input-example`, the function exported as the default already matches. The orchestrator passes `llm` through verbatim — your adapter is free to extend the second argument with adapter-specific fields, but `llm` must be respected as-is.

**Use the `@dna-codes/dna-core` builders to construct your output DNA.** Don't roll your own `Map<name, Resource>` accumulator — `addResource` / `addPerson` / `addOperation` / etc. handle identity-by-name composition, schema validation, and conflict surfacing for you. The walkers in `input-json` and `input-text/layered/constructor` both consume builders today; following the pattern keeps your adapter consistent and inherits the same schema enforcement.

```ts
import { createOperationalDna, addResource, addOperation, type OperationalDNA } from '@dna-codes/dna-core'

let dna: OperationalDNA = createOperationalDna({ domain: { name: 'my-domain' } })
;({ dna } = addResource(dna, { name: 'Foo', attributes: [...] }))
;({ dna } = addOperation(dna, { name: 'Foo.Do', target: 'Foo', action: 'Do' }))
return dna
```

See [`@dna-codes/dna-core`'s `docs/builders.md`](../core/docs/builders.md) for the full API.

## Common pitfalls

- **Don't return DNA from an integration.** Some authors are tempted to skip the input-`*` step. Don't — it forces every integration to embed an LLM, duplicates extraction logic, and breaks the MIME dispatch story.
- **Don't reach for the merge utility from inside an integration.** `merge()` is the orchestrator's fan-in step; integrations return per-doc DNA chunks via the adapter, not pre-merged DNA.
- **Don't mutate the `contents` Buffer in-place.** The orchestrator may pass it to multiple consumers in future versions; treat fetched contents as immutable.
- **Don't bake retry policy into the orchestrator.** Bounded concurrency is in scope; per-integration backoff is not. If your integration needs retries, do it inside `fetch()`.

## Testing checklist for a new integration

- [ ] `package.json` declares no `@dna-codes/dna-input-*` and no other `@dna-codes/dna-integration-*` runtime/peer deps.
- [ ] Unit test: success path returns `{ contents, mimeType, source }` with a parseable ISO 8601 `loadedAt`.
- [ ] Unit test: failure path throws an Error with a useful message (the orchestrator records its `.message` into `errors[]`).
- [ ] Integration test (optional but recommended): drive your integration through `ingest()` with a stub `InputAdapter` that returns a fixed DNA chunk. Verify the chunk's source flows into `provenance`.
