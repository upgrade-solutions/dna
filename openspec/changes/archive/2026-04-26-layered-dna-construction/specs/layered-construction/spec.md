## ADDED Requirements

### Requirement: Layered construction mode opt-in

`@dna-codes/input-text` SHALL accept a `mode` option on `parse()` with values `'one-shot'` (default) and `'layered'`. When `mode` is `'layered'`, the parser SHALL drive the LLM through tool calls instead of requesting a single JSON document. The return shape of `parse()` SHALL be identical in both modes.

#### Scenario: Default mode is one-shot
- **WHEN** a caller invokes `parse(text, { provider, apiKey })` without specifying `mode`
- **THEN** the parser executes the existing one-shot path and produces the same result as before this change

#### Scenario: Layered mode is selected
- **WHEN** a caller invokes `parse(text, { provider, apiKey, mode: 'layered' })`
- **THEN** the parser dispatches a tool-calling conversation and returns `{ operational?, product?, technical?, missingLayers, raw }` matching the one-shot shape

### Requirement: Primitive tools cover every Operational primitive

The layered constructor SHALL expose one tool per Operational primitive: `add_resource`, `add_person`, `add_role`, `add_group`, `add_membership`, `add_operation`, `add_task`, `add_process`, `add_trigger`, `add_rule`, plus a terminal `finalize` tool.

#### Scenario: Every primitive has a tool
- **WHEN** the constructor initializes for the Operational layer
- **THEN** the tool list passed to the provider contains exactly the 10 `add_*` tools plus `finalize`

#### Scenario: Tool parameters derive from core schemas
- **WHEN** the constructor builds a tool definition for a primitive
- **THEN** the tool's `parameters` JSON Schema is derived from the corresponding `@dna-codes/core` schema, with cross-primitive references represented as string fields

### Requirement: Per-primitive validation on each tool call

Each `add_*` tool SHALL validate its arguments against the per-primitive schema and reject invalid calls with a structured error returned to the model as a tool result. References to other primitives SHALL be checked against the in-progress draft document.

#### Scenario: Invalid attribute type rejected
- **WHEN** the model calls `add_resource` with `attributes: [{ name: "status", type: "invalid_type" }]`
- **THEN** the tool returns `{ error: "schema_violation", details: [...] }` and the primitive is NOT added to the draft

#### Scenario: Reference to undeclared role rejected
- **WHEN** the model calls `add_membership` with `role: "Paralegal"` before `add_role` has been called for `Paralegal`
- **THEN** the tool returns `{ error: "unknown_role", name: "Paralegal", available: [...declared role names] }`

#### Scenario: Successful add returns confirmation
- **WHEN** the model calls `add_resource` with valid arguments
- **THEN** the tool returns `{ ok: true, name: "<resource name>" }` and the primitive is appended to the draft

### Requirement: Construction order enforced by reference checks

The constructor SHALL NOT impose a fixed call order beyond the reference-integrity checks above. A model MAY interleave noun and activity primitive declarations as long as references resolve at the time they are made.

#### Scenario: Out-of-order declaration permitted when references resolve
- **WHEN** the model calls `add_role`, then `add_resource`, then `add_membership` referencing both
- **THEN** all three calls succeed (order is governed by reference resolution, not phase)

### Requirement: Finalize triggers full schema validation

The `finalize` tool SHALL run `@dna-codes/core`'s `DnaValidator` against the assembled draft. On success the conversation ends and `parse()` returns. On validation failure the tool SHALL return the validator errors to the model so it can issue corrective `add_*` calls; this loop SHALL be capped at a configurable retry count (default 3 finalize attempts).

#### Scenario: Successful finalize ends the loop
- **WHEN** the model calls `finalize` and the draft passes `DnaValidator`
- **THEN** the constructor returns the validated layer and the conversation terminates

#### Scenario: Failed finalize feeds errors back
- **WHEN** the model calls `finalize` and validation fails
- **THEN** the tool returns `{ ok: false, errors: [...] }` and the model may continue issuing tool calls

#### Scenario: Finalize retry cap reached
- **WHEN** `finalize` has failed validation 3 times
- **THEN** the constructor surfaces the latest validation report as a thrown error containing the draft and the validator output

### Requirement: Iteration safety caps

The constructor SHALL enforce a maximum total tool-call count per `parse()` invocation (default 50, configurable via `maxToolCalls`) and SHALL detect duplicate consecutive calls (same tool name + identical arguments) and reject the second occurrence.

#### Scenario: Iteration cap halts runaway loops
- **WHEN** the model has made 50 tool calls in a single `parse()` invocation
- **THEN** the constructor stops the loop and throws an error reporting the cap was reached

#### Scenario: Duplicate tool call rejected
- **WHEN** the model issues `add_role { name: "Paralegal" }` immediately after a successful `add_role { name: "Paralegal" }`
- **THEN** the duplicate call returns `{ error: "duplicate_call" }` without modifying the draft

### Requirement: Provider tool-call support

`providers.ts` SHALL support tool calling for OpenAI-compatible (`tools` + `tool_choice`) and Anthropic (`tools` block). The dispatcher SHALL expose a uniform interface to the constructor: input messages plus tool definitions in, either a tool-call request or a final assistant message out.

#### Scenario: OpenAI-compatible tool call round-trip
- **WHEN** the constructor sends a request with tools to an OpenAI-compatible endpoint
- **THEN** the dispatcher returns either `{ type: 'tool_call', name, args }` or `{ type: 'final', content }`

#### Scenario: Anthropic tool call round-trip
- **WHEN** the constructor sends a request with tools to an Anthropic endpoint
- **THEN** the dispatcher returns the same uniform shape as the OpenAI path

### Requirement: Constructor is independently usable

`@dna-codes/input-text` SHALL export a `LayeredConstructor` class as part of its public API. The class SHALL have no transport dependencies (no `fetch`, no provider, no API key). Callers SHALL be able to drive it directly without invoking `parse()` and without an LLM in the loop.

#### Scenario: Constructor runs without an LLM
- **WHEN** test code instantiates `new LayeredConstructor({ layer: 'operational' })` and calls `handle({ name: 'add_resource', args: { name: 'Book' } })` followed by `handle({ name: 'finalize', args: {} })`
- **THEN** the constructor returns a successful result and `result()` yields a schema-valid Operational document containing the Book resource

#### Scenario: Constructor exposes tool definitions for external agents
- **WHEN** an external agent (e.g. an MCP server or Claude Code subagent) imports `LayeredConstructor` and calls `tools()`
- **THEN** the returned array contains tool definitions in a provider-neutral shape sufficient to register with any tool-calling LLM

#### Scenario: Provider-shape rendering helpers are exported
- **WHEN** an external caller wants OpenAI-shape or Anthropic-shape tool definitions
- **THEN** helpers `toOpenAITools(constructor.tools())` and `toAnthropicTools(constructor.tools())` are exported from the package and produce the corresponding shapes

### Requirement: Backward compatibility preserved

Existing callers of `parse()` that do not specify `mode` SHALL continue to receive identical behavior to before this change, including the same default models, default `temperature`, default `onMissingLayers` handling, and identical return shape.

#### Scenario: Pre-existing call signature unchanged
- **WHEN** code that previously worked against `@dna-codes/input-text` is run after this change without modification
- **THEN** it produces the same result as before
