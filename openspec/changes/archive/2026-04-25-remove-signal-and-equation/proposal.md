## Why

Signal and Equation are declared at the schema level and threaded through validator, fixtures, examples, and adapters — but no example exercises Equation, and Signals are emit-only (no example consumes a downstream Signal in a Process). They're carrying weight without paying rent. Removing them shrinks the Operational surface area, simplifies the validator, and matches the project's "earn its place" convention. Reintroducing either is a small reverse-PR if a real consumer shows up.

## What Changes

- **Schemas**: delete `packages/schemas/operational/signal.json` and `equation.json`; drop `signals[]` and `equations[]` from `packages/schemas/operational/operational.json`
- **Outcome schema**: drop the `emits` field that referenced Signals; keep `changes` (state mutations) — Outcomes still describe what mutates, just no longer announce events
- **Trigger schema**: drop the `source: "signal"` enum value and the `signal` field — Triggers still fire from `user | schedule | webhook | operation`
- **Process schema**: drop the `emits` field
- **Validator** (`packages/core/src/validator.ts`): remove the Signal pool, all Signal cross-ref checks (Outcome.emits, Trigger.signal, Process.emits), and Equation handling
- **TypeScript types** (`packages/core/src/fixtures/types.ts` and downstream): drop `Signal`, `Equation`, and the corresponding fields on `Outcome`/`Trigger`/`Process`
- **Bookshop fixture** (`packages/core/src/fixtures/bookshop.ts`): remove `signals[]`, `outcomes[].emits`, `processes[].emits`
- **Examples** (all 6 under `examples/*/operational.json`): same removal
- **Output adapters** (`packages/output-markdown` + `packages/output-html`): drop the "**Signals published:**" rendering in operations sections and the Signal count line in summary sections
- **Adapter tests**: drop signal-related assertions; update primitive-count assertions in summary tests
- **Validator tests**: drop Signal/Equation cross-ref tests
- **Docs**: remove Signal/Equation from the primitive lists in `README.md` (root) and `packages/core/docs/operational.md`
- **Framework comparison**: in `docs/frameworks/event-storming.md`, drop the "Event (orange) = Signal" mapping row and note that DNA currently models state changes as `Outcome.changes` rather than first-class events
- **BREAKING (schema)**: existing DNA documents that declare `signals[]`, `equations[]`, `outcome.emits`, `process.emits`, `trigger.source: "signal"`, or `trigger.signal` will fail validation. No published consumers depend on these today.

## Capabilities

### New Capabilities
<!-- None — this change removes primitives that were never given canonical OpenSpec specs (they predate OpenSpec adoption in this repo). -->

### Modified Capabilities
<!-- None — the only existing spec, `role-hierarchy`, doesn't touch Signal or Equation. -->

## Impact

- **Schema breaking change**: documented above; no published consumers
- **Validator**: ~80 LOC of cross-reference checks removed; no new logic
- **Tests**: net removal — validator + adapter golden tests get smaller
- **Docs**: small touch in README, operational.md, event-storming.md
- **Reversibility**: schemas are in version control; reintroducing either primitive is a copy-back from history plus updated cross-refs and a real consumer to motivate it
