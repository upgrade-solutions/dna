# operational-event-model Specification

## Purpose
TBD - created by archiving change remove-signal-and-equation. Update Purpose after archive.
## Requirements
### Requirement: No first-class event primitive in the Operational layer

The Operational layer SHALL NOT declare a first-class event or signal primitive. State changes are expressed exclusively through `Outcome.changes` (which describes what attribute moves from what value to what value); there is no separate "thing was emitted" primitive.

This is a deliberate scope decision, not an oversight. A first-class event primitive will be reintroduced only when a real example domain demonstrates a Process that consumes events emitted by another Operation — i.e., when there is a downstream reader, not just an upstream writer.

#### Scenario: Operational schema rejects `signals[]` collection
- **WHEN** an Operational document declares a top-level `signals[]` array
- **THEN** schema validation fails with an "additionalProperties" error against `operational.json`

#### Scenario: Operational schema rejects `outcomes[].emits`
- **WHEN** an Outcome declares `emits: ["SomeSignal"]`
- **THEN** schema validation fails because `emits` is no longer a declared property of Outcome

#### Scenario: Operational schema rejects `triggers[].source: "signal"`
- **WHEN** a Trigger declares `source: "signal"` (or includes a `signal` field)
- **THEN** schema validation fails because `"signal"` is not in the `source` enum and `signal` is not a declared property

#### Scenario: Operational schema rejects `processes[].emits`
- **WHEN** a Process declares `emits: ["SomeSignal"]`
- **THEN** schema validation fails because `emits` is no longer a declared property of Process

#### Scenario: Outcome.changes remains the canonical event-shaped output
- **WHEN** an Outcome declares `changes: [{ attribute: "loan.status", set: "active" }]`
- **THEN** validation passes; `changes` is the only event-shaped output the Operational layer provides

### Requirement: No Equation primitive in the Operational layer

The Operational layer SHALL NOT declare an `Equation` primitive or top-level `equations[]` collection. Computed/derived values can be expressed by Operations that mutate Resource attributes; a separate Equation primitive is unnecessary until a real example domain motivates one.

#### Scenario: Operational schema rejects `equations[]` collection
- **WHEN** an Operational document declares a top-level `equations[]` array
- **THEN** schema validation fails with an "additionalProperties" error against `operational.json`

### Requirement: No Script primitive in the Technical layer

The Technical layer SHALL NOT declare a `Script` primitive or top-level `scripts[]` collection. Script existed only as the deployment binding for an Operational `Equation`; with Equation removed, Script has no concept it implements. A general-purpose "named compute deployment" primitive will be introduced only when a real consumer needs one.

#### Scenario: Technical schema rejects `scripts[]` collection
- **WHEN** a Technical document declares a top-level `scripts[]` array
- **THEN** schema validation fails with an "additionalProperties" error against `technical.json`

#### Scenario: technical/script schema is no longer registered
- **WHEN** code asks the validator for the `technical/script` schema by id
- **THEN** the schema is not present in the registered set

