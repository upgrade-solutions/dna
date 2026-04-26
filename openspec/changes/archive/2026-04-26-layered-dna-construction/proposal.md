## Why

`@dna-codes/input-text` currently asks the LLM to emit one giant JSON document for an entire DNA layer. On the Marshall Fire mass-tort transcript, even `qwen2.5:32b` (8 min wall-clock) failed to produce schema-valid output — wrong wrappers, missing primitives, malformed `Process.steps`, invented operators. A one-shot generation has no way to recover from a single mistake; the whole document is thrown away. We need a construction mode where the model assembles DNA primitive-by-primitive through tool calls, so the schema is enforced at each step and small/local models become viable.

## What Changes

- Add a **layered construction mode** to `@dna-codes/input-text` that drives the LLM through a sequence of tool calls (one per primitive) instead of a single JSON emit.
- Introduce a primitive-tool registry derived from `@dna-codes/core` schemas: `add_resource`, `add_person`, `add_role`, `add_group`, `add_membership`, `add_operation`, `add_task`, `add_process`, `add_trigger`, `add_rule`, `finalize`.
- Enforce **construction order**: nouns (resources, persons, groups, roles) → memberships → operations → activities (tasks, steps, processes) → rules/triggers → finalize. Tools that reference earlier primitives reject unknown names with a structured error the model can recover from.
- Add a `mode` option to `parse()`: `'one-shot'` (current behavior, default for backward compat) or `'layered'` (new tool-call construction). `parse()` return shape unchanged.
- Provider dispatch gains tool-calling support for OpenAI-compatible (`tools` + `tool_choice`) and Anthropic (`tools` block). Local Ollama models that support function calling work via the OpenAI-compatible path.
- Export `LayeredConstructor` as a public API so it can be driven *without* `parse()` — usable directly from any agent loop (Claude Code, MCP server, Anthropic SDK, custom orchestrator) **or** from plain code that already knows what primitives to add (no LLM required).
- Document the token/wall-clock tradeoff: layered mode uses more tokens but recovers from per-tool errors and works on smaller models.

## Capabilities

### New Capabilities
- `layered-construction`: tool-call-driven assembly of a DNA layer, with per-primitive validation, dependency-order enforcement, and structured error recovery.

### Modified Capabilities
<!-- None — this adds a new mode behind an opt-in option; existing one-shot behavior is preserved. -->

## Impact

- **Affected packages**: `packages/input-text` (new module + exports), `packages/core` (no changes, but `DnaValidator` and schema introspection are consumed to build the tool registry).
- **API surface**: additive — new `mode` option, new exported `LayeredConstructor` for advanced use; existing `parse()` calls keep working unchanged.
- **Dependencies**: none added; tool calling is part of the OpenAI/Anthropic APIs already in use.
- **Provider compatibility**: requires a model that supports tool/function calling. Models that don't (older Ollama variants) will continue to use one-shot mode.
- **Examples/scripts**: `scripts/run-marshall.js` and `packages/input-text/examples/run-ollama.ts` updated to demonstrate `mode: 'layered'`.
