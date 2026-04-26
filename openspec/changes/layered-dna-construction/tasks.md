## 1. Schema → tool definitions

- [x] 1.1 Add `packages/input-text/src/tools/schema-to-tool.ts` mapping a per-primitive JSON Schema to a tool-call `parameters` schema
- [x] 1.2 Replace cross-primitive `$ref`s with string fields populated from the in-progress draft (enum injection helper)
- [x] 1.3 Unit tests over every Operational primitive schema asserting the generated tool definition is well-formed JSON Schema

## 2. Layered constructor

- [x] 2.1 Add `packages/input-text/src/layered/constructor.ts` exposing a `LayeredConstructor` class with `tools()`, `handle(toolCall)`, and `result()` methods — no transport dependencies (no `fetch`, no provider, no API key)
- [x] 2.2 Implement `add_*` handlers for `resource`, `person`, `role`, `group`, `membership`, `operation`, `task`, `process`, `trigger`, `rule`
- [x] 2.3 Implement reference-integrity checks that return `{ error: 'unknown_<primitive>', name, available }` when a referenced primitive is missing
- [x] 2.4 Implement `finalize` handler that runs `DnaValidator` and either returns success or returns the error report with a per-call retry counter
- [x] 2.5 Implement duplicate-call detector (same name + identical args twice in a row → `{ error: 'duplicate_call' }`)
- [x] 2.6 Implement iteration cap (default 50, configurable) that throws when exceeded
- [x] 2.7 Export `LayeredConstructor` and provider-shape helpers (`toOpenAITools`, `toAnthropicTools`) from the package's public entry point

## 3. Provider tool-call dispatch

- [x] 3.1 Extend `DispatchArgs` in `packages/input-text/src/providers.ts` with optional `tools` and a uniform `DispatchResult` of `{ type: 'tool_call', id, name, args } | { type: 'final', content }`
- [x] 3.2 Implement OpenAI-compatible tool-call request/response handling (uses `tools` + `tool_choice: 'auto'`)
- [x] 3.3 Implement Anthropic tool-call request/response handling (uses the `tools` block)
- [x] 3.4 Add a helper to append a tool result to the conversation history in each provider's expected shape

## 4. Wire layered mode into `parse()`

- [x] 4.1 Add `mode?: 'one-shot' | 'layered'` and `maxToolCalls?: number` to the `ParseOptions` type in `packages/input-text/src/types.ts`
- [x] 4.2 In `packages/input-text/src/parse.ts`, branch on `mode`. Default `'one-shot'` calls existing path; `'layered'` runs the constructor loop
- [x] 4.3 Build the layered system prompt: explain the tool set, the reference-integrity rule, and the requirement to call `finalize` when done
- [x] 4.4 Populate `raw` with a structured tool-call transcript (array of `{ name, args, result }`) so users can debug the conversation
- [x] 4.5 Preserve `missingLayers` and `onMissingLayers` semantics in layered mode

## 5. Examples and scripts

- [x] 5.1 Update `scripts/run-marshall.js` to demonstrate `mode: 'layered'`; keep the existing one-shot path behind an env flag for comparison (default is now layered; set `MARSHALL_MODE=one-shot` for old behavior)
- [x] 5.2 Add `packages/input-text/examples/run-ollama-layered.ts` mirroring the one-shot example
- [ ] 5.3 Capture before/after results on the Marshall Fire transcript and link from the package README — DEFERRED: requires a live Ollama session, which the sandbox cannot reach. Run `node scripts/run-marshall.js < /tmp/claude/marshall-transcript.txt` (one-shot) and again with the default (layered) to capture results.

## 6. Tests

- [x] 6.1 Add a fixture-based test that round-trips a known-good operational document through layered mode using a stubbed provider that issues tool calls in a recorded order; assert the result equals the fixture
- [x] 6.2 Add a test where the stubbed provider issues an invalid `add_membership` first; assert the constructor returns the structured error and accepts the corrected call
- [x] 6.3 Add a test for the iteration cap and the duplicate-call detector
- [x] 6.4 Add a test that asserts default `mode` (omitted) still calls the one-shot path (backward compatibility regression guard)
- [x] 6.5 Add a no-LLM integration test that drives `LayeredConstructor` directly via `handle()` calls and asserts `result()` returns a schema-valid document

## 7. Documentation

- [x] 7.1 Update `packages/input-text/README.md` with a "Layered construction" section documenting the new `mode` and `maxToolCalls` options, the token/wall-clock tradeoff, the local-model recommendation, and a "Drive it from your own agent (or no agent at all)" subsection showing direct `LayeredConstructor` usage
- [x] 7.2 Update the root `README.md` if the layered approach changes how `input-text` is described in the overall pipeline — no change required: pipeline description ("converts freeform prose into DNA") is still accurate; layered vs one-shot is an internal mode of `input-text`
- [x] 7.3 Bump `@dna-codes/input-text` version (0.2.0 → 0.3.0). No CHANGELOG.md convention in this repo — release notes go in the commit/tag message at publish time
