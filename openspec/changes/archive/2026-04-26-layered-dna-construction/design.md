## Context

`@dna-codes/input-text` today calls the LLM once per layer with `response_format: json_object` and parses the result. Empirical testing on a real mass-tort transcript (Marshall Fire Justice docket) shows this strategy fails on local models: `qwen2.5:14b` produces partial documents with invented operators and missing primitives; `qwen2.5:32b` (8 min wall-clock after warmup) drops the `operational` wrapper and emits `processes[].tasks: [strings]` instead of the schema's `steps[]` shape. Hosted frontier models do better but the failure mode is the same — a single mistake in a 400-line JSON document throws the whole document away with no way to recover.

DNA has rich internal structure: primitives reference each other (a Membership pins a Person × Role × Group; a Step.task must match a declared Task; a Rule.operation must match an Operation). One-shot generation requires the model to hold all of this in working memory simultaneously. Tool-call construction lets the model decide one primitive at a time, with the runtime enforcing schema and reference integrity at each step.

## Goals / Non-Goals

**Goals:**
- Produce schema-valid Operational layer DNA from real-world transcripts using local models in the qwen2.5:14b–32b range.
- Recover from per-primitive errors without discarding the whole document.
- Keep the existing one-shot `parse()` API and behavior intact (additive change).
- Reuse `@dna-codes/core` schemas as the source of truth for tool definitions — no parallel schema definition.
- Expose the constructor as a standalone public API: drivable by `parse()`, by external agents (Claude Code, MCP, Anthropic SDK, custom loops), and by plain code with no LLM in the loop at all.

**Non-Goals:**
- Replacing one-shot mode. It is faster and cheaper for small inputs and frontier models; it remains the default.
- Building a generic agentic framework. The tool set is fixed by the DNA schema, not user-extensible.
- Generating Product or Technical layers in this change. Layered mode targets Operational first; the same pattern can extend to other layers later.
- Writing a model that can run without tool-calling support. Models that lack function calling will continue to use one-shot mode.

## Decisions

### 1. Construction order is enforced by the runtime, not the prompt
Tool calls that reference an unknown primitive (e.g. `add_membership` referencing a Role that hasn't been declared) return a structured error like `{ "error": "unknown_role", "name": "Paralegal", "available": ["IntakeSpecialist", ...] }`. The model sees this as a tool result and corrects.

**Why over prompt-only ordering:** prompts can be ignored; runtime validation cannot. This shifts correctness from "the model remembered the rule" to "the runtime enforced the invariant."

**Alternatives considered:** (a) one giant `add_layer` tool with the same one-shot payload — defeats the purpose. (b) Free-order tool calls with a final validate — model can rack up dozens of broken calls before noticing. Ordered enforcement gives early feedback.

### 2. Tool schemas are derived from `@dna-codes/core` JSON Schemas at runtime
A small mapper turns each primitive schema (`resource.json`, `role.json`, etc.) into a JSON Schema fragment suitable for OpenAI/Anthropic `tools[].parameters`. References to other primitives become string fields with an `enum` populated from the in-progress document.

**Why over hand-written tool definitions:** keeps a single source of truth. When the schemas evolve, tools follow automatically.

**Alternatives considered:** hand-roll a parallel set of tool schemas — guaranteed to drift. Embed the schemas verbatim — too verbose for a tool-call interface and exposes internal `$ref`s that confuse models.

### 3. The constructor accumulates a draft document; `finalize` runs full schema validation
Each `add_*` tool validates the *single primitive* it adds (cheap, gives immediate feedback). The model decides when it is done by calling `finalize`. The runtime then runs the full `DnaValidator` and either returns success or reports remaining errors as another tool result so the model can patch.

**Why:** per-primitive validation catches typos early; whole-document validation catches global invariants (e.g., every Role.scope names a real Group) that can only be checked once everything is declared.

### 4. `parse({ mode: 'layered' })` opts in; the return shape is unchanged
Callers pass `mode: 'layered'` and get back the same `{ operational?, product?, technical?, missingLayers, raw }` shape. `raw` becomes the transcript of tool calls and results, which is invaluable for debugging.

**Why:** zero migration cost. A user who flips the flag gets the new behavior; everyone else is unaffected.

### 5. Tool-call dispatch is added to `providers.ts`, not a separate transport
The existing `dispatch()` function gains an optional `tools` parameter. Layered mode loops: send messages + tool definitions → receive either a tool call or a final message → execute the tool → append the result → repeat until `finalize` succeeds or a max-iteration cap is hit (default 50, configurable).

**Why:** keeps provider-specific quirks (OpenAI `tools` vs Anthropic `tools` block) localized in one file.

### 6. `LayeredConstructor` is a transport-free public class
The constructor knows nothing about `fetch`, providers, or LLMs. Its surface is:
- `tools()` → array of tool definitions in a provider-neutral shape (also rendered to OpenAI/Anthropic shapes by helpers)
- `handle({ name, args })` → synchronous tool result `{ ok: true, ... } | { error, ... }`
- `result()` → the assembled draft (after `finalize` succeeds)

Three usage patterns drop out for free:
1. **`parse({ mode: 'layered' })`** wires constructor ↔ `dispatch()` in a loop (the path most callers will use).
2. **External agent** (Claude Code, MCP, custom Anthropic SDK loop): import `LayeredConstructor`, expose its `tools()` to the agent, route tool calls to `handle()`. No `parse()` involved.
3. **No LLM at all**: a script reading from a CSV or hand-crafting test fixtures can call `handle({ name: 'add_resource', args: {...} })` directly. Useful for fixtures, migrations, and tests.

**Why:** an LLM-bound constructor would require every agent author to re-implement the loop. Keeping the constructor transport-free makes the same code reusable in every context.

## Risks / Trade-offs

- **[Token cost is higher]** → Document this clearly. Layered mode trades tokens for reliability; one-shot remains the default for users who want the cheap path on frontier models.
- **[Wall-clock can be longer]** → Same mitigation. Also: the loop can be parallelized for independent primitives in a future change (out of scope here).
- **[Local models with weak tool calling produce malformed tool args]** → The per-tool JSON Schema validator catches this and returns an error the model can retry. If retries blow the iteration cap, surface a clear error pointing at the offending tool call.
- **[Loop runaway / infinite tool calls]** → Hard cap on iterations (default 50) and a duplicate-call detector (same tool + same args twice in a row → error).
- **[Schema → tool-schema mapper has subtle bugs]** → Cover with unit tests over every primitive schema; round-trip a known-good fixture (the bookshop or Marshall Fire example) through layered mode and assert the result validates.
- **[Anthropic and OpenAI tool-calling semantics differ]** → Localize the difference in `providers.ts`; the constructor sees a uniform `{ name, args }` interface.

## Migration Plan

This is a purely additive change.

1. Ship layered mode behind `mode: 'layered'`. Default stays `'one-shot'`.
2. Update `scripts/run-marshall.js` to demo `mode: 'layered'` and capture before/after results in the README.
3. After the mass-tort proof-of-concept validates the approach, consider flipping the default in a follow-up change (a separate proposal — not part of this one).

Rollback: remove the layered code path and the `mode` option. Existing callers are unaffected because none of them pass `mode`.

## Open Questions

- **Should `finalize` errors loop back to the model, or fail hard?** Default plan: loop back up to N times (configurable, default 3), then surface the validation report. Open to user feedback.
- **Should the iteration cap be exposed as a `parse()` option or kept internal?** Lean toward exposing it (`maxToolCalls`) since the right value differs by transcript size.
- **Tool-call streaming for progress UX?** Out of scope for this change but the architecture allows it.
