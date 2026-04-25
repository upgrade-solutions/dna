## Context

The Operational layer's primitive set was decided pre-OpenSpec by stress-testing against eight domains. Two primitives — Signal and Equation — passed that test as "plausibly useful" rather than "required by an example":

- **Signal** is wired up across `Outcome.emits`, `Trigger.signal` / `source: "signal"`, and `Process.emits`, with a Signal pool in the validator and a `**Signals published:**` rendering in the markdown/html operations sections. Six examples declare `signals[]`. None of them have a downstream Trigger that consumes one — Signals are emit-only, decorative.
- **Equation** is declared in the schema and the validator notes its existence, but no example, fixture, or adapter actually uses it. It's pure schema dead weight.

The recently-shipped `add-role-hierarchy` change made the validator's per-Role pass denser and clarified that "earn its place" applies to the validator too. With Role.parent in, the next obvious cleanup is removing the two primitives that haven't earned their place.

## Goals / Non-Goals

**Goals:**
- Delete `signal.json` and `equation.json` outright; remove all references in schemas, validator, fixtures, examples, adapters, tests, and docs
- Keep `Outcome.changes` (state mutations) — Outcomes still have a job after Signal is gone
- Keep all four non-signal `Trigger.source` values (`user | schedule | webhook | operation`) and the `Trigger.after` field for upstream-Operation chaining
- Land in a single change so the schema, validator, and adapter test bars stay coherent
- Net code shrink: validator gets simpler, fixtures + adapter goldens get smaller

**Non-Goals:**
- Adding a generic event-emit field on Outcome to "preserve the slot" — explicit YAGNI; if event-emission becomes important, propose it with a real consumer
- Touching unrelated Trigger sources, Process orchestration, or Outcome state-change semantics
- Rewriting `event-storming.md` more than the minimal Signal-row removal — the Cedar/Trigger framework comparison docs are a separate proposal

## Decisions

### 1. Remove, don't deprecate

Mark-and-warn would mean keeping the schemas + validator branches around indefinitely. The repo has no published consumers, OpenSpec records the rationale, and reintroduction is a small reverse-PR. No deprecation period.

**Rejected alternative:** Add a `deprecated: true` schema annotation. Doesn't change runtime behavior, doesn't reduce code surface, just adds another obscure flag.

### 2. Sequence the cleanup by layer

Rip out everything in one commit, but order the file edits inside the apply pass:

1. Schemas (delete files, prune umbrella)
2. TypeScript types (drop `Signal`, `Equation`, and the affected fields on `Outcome`/`Trigger`/`Process`)
3. Validator (drop pool, cross-refs, equation handling)
4. Fixtures (`bookshopInput`)
5. Examples (all six)
6. Output adapters (drop renderers + summary counts)
7. Tests (validator + adapter goldens)
8. Docs (README, operational.md, event-storming.md)

Test failures during the apply pass localize cleanly to the layer being edited. A `npm test` after each layer would surface drift fast — but a single `npm test` at the end is acceptable since each layer's failures are obvious from the diff.

**Rejected alternative:** Two changes (one for Equation, one for Signal). Signal touches more files but they share the same architectural rationale ("earn its place"). One change keeps the rationale and the test bar together.

### 3. `Outcome.emits` and `Process.emits` deletions are not soft

`emits` was a `string[]` referencing Signal names. With Signal gone, the field has no semantic meaning. Removing it from the schema is a hard schema-breaking change for any DNA author who used it. We accept the break — no published consumers, and Outcome's `changes` field still expresses everything that mattered (what state mutated). The proposal calls this out as **BREAKING**.

### 4. `Trigger.source: "signal"` collapses cleanly

The other four `source` values stay. The `signal` field is the only `source`-scoped optional field; removing both the enum value and the field is a single edit per file. The `after` field (used with `source: "operation"`) is unaffected.

### 5. Examples lose their `signals[]` arrays

All six examples have `signals[]`, but none reference them in a way the validator catches as "consumed." Strip them. The audit confirmed Signal coverage was decorative across all six — no example becomes incoherent without them.

If, post-removal, an example feels thin, that's evidence the example was thin to begin with — propose a richer scenario as its own change.

### 6. Framework doc touch

`docs/frameworks/event-storming.md` maps Event Storming's orange-event sticky to DNA's `Signal`. With Signal gone, the row needs to either:

- Map orange to `Outcome.changes` (closest analog — both describe "something happened")
- Note that DNA currently doesn't have a first-class event primitive

Choose the second framing. It's honest about the tradeoff and signals that an event primitive could come back if a real workshop forces it. Keep the change minimal — one paragraph rewrite, no full restructure.

## Risks / Trade-offs

- **Risk**: a downstream consumer (someone outside the repo) depends on Signal in their DNA. → Mitigation: none — there are no known external consumers, and a reverse-PR is cheap. Document the BREAKING change in the proposal so future archaeology is easy.
- **Risk**: removing `Outcome.emits` paints us into a corner if we later want generic event emission. → Mitigation: schemas are reversible. When a real consumer arrives, propose `add-event-emission` with that consumer as the test case. Don't preserve the slot speculatively.
- **Risk**: the validator's Trigger logic still has an `if (trigger.source === 'signal')` branch hidden somewhere we miss. → Mitigation: after the schema enum is tightened, type-check (`tsc --noEmit`) catches dangling references; full test suite run catches anything the type system doesn't.
- **Trade-off**: Equation removal is uncontested (zero usage). Signal removal is the only debate, and we resolve it on "no consumer" grounds. Re-adding Signal later requires a real Trigger that consumes one — a higher bar than today's "we should have events because frameworks have events."
