# operational-event-model Specification

## Purpose
TBD - created by archiving change remove-signal-and-equation. Update Purpose after archive.
## Requirements
### Requirement: No first-class event primitive in the Operational layer

The Operational layer SHALL NOT declare a first-class event or signal primitive. State changes are expressed exclusively through `Operation.changes` (which describes what attribute moves from what value to what value); there is no separate "thing was emitted" primitive and no separate `Outcome` wrapper.

This is a deliberate scope decision, not an oversight. A first-class event primitive will be reintroduced only when a real example domain demonstrates a Process that consumes events emitted by another Operation — i.e., when there is a downstream reader, not just an upstream writer.

#### Scenario: Operational schema rejects `signals[]` collection
- **WHEN** an Operational document declares a top-level `signals[]` array
- **THEN** schema validation fails with an "additionalProperties" error against `operational.json`

#### Scenario: Operational schema rejects `outcomes[]` collection
- **WHEN** an Operational document declares a top-level `outcomes[]` array
- **THEN** schema validation fails with an "additionalProperties" error against `operational.json`

#### Scenario: Operational schema rejects `triggers[].source: "signal"`
- **WHEN** a Trigger declares `source: "signal"` (or includes a `signal` field)
- **THEN** schema validation fails because `"signal"` is not in the `source` enum and `signal` is not a declared property

#### Scenario: Operational schema rejects `processes[].emits`
- **WHEN** a Process declares `emits: ["SomeSignal"]`
- **THEN** schema validation fails because `emits` is no longer a declared property of Process

#### Scenario: Operation.changes is the canonical state-mutation output
- **WHEN** an Operation declares `changes: [{ attribute: "loan.status", set: "active" }]`
- **THEN** validation passes; `changes` on Operation is the only state-mutation output the Operational layer provides

### Requirement: State changes are declared on Operation, not on a separate Outcome wrapper

The Operational layer SHALL provide a `changes` field directly on `Operation` to declare which Resource attributes mutate when the Operation completes. The `Outcome` primitive and its `outcomes[]` top-level collection SHALL NOT exist. Each entry in `Operation.changes` MUST resolve to an attribute declared on the Operation's target Resource.

The mutation is intrinsic to the `Resource.Action` pair: `Loan.Approve` produces the same state changes regardless of which Process invokes it, or whether any Process invokes it at all. This shape lets standalone Operations (those fired by a Trigger with no Process) declare mutations directly, and prevents two Steps invoking the same Operation from declaring different changes.

#### Scenario: Operation declares valid changes
- **WHEN** `Loan.Approve` declares `changes: [{ attribute: "status", set: "approved" }]` and the `Loan` Resource declares a `status` attribute
- **THEN** validation passes

#### Scenario: Operation.changes rejects unknown attribute
- **WHEN** `Loan.Approve` declares `changes: [{ attribute: "nonexistentField", set: "x" }]` and the `Loan` Resource has no `nonexistentField` attribute
- **THEN** validation fails with an attribute-resolution error pointing at `operations/Loan.Approve/changes`

#### Scenario: Operational schema rejects `outcomes[]` top-level collection
- **WHEN** an Operational document declares a top-level `outcomes[]` array (even with valid-looking entries)
- **THEN** schema validation fails with an "additionalProperties" error; the Outcome primitive does not exist

#### Scenario: Operation without changes is valid
- **WHEN** an Operation omits `changes` (or declares `changes: []`)
- **THEN** validation passes; `changes` is optional, not required

### Requirement: Operation chaining uses `Trigger.after` only; there is no `initiates` field

The Operational layer SHALL NOT provide a field by which an Operation declares which other Operations it initiates. Operation-to-Operation chaining is expressed only through `Trigger.after` (which fires a downstream Operation or Process when an upstream Operation completes). Intra-Process orchestration is expressed only through `Step.depends_on`. There is no third orchestration path.

#### Scenario: Operation schema rejects `initiates` field
- **WHEN** an Operation declares `initiates: ["Loan.Disburse"]`
- **THEN** schema validation fails because `initiates` is not a declared property of Operation

#### Scenario: `Trigger.after` remains the canonical Operation-chain entry point
- **WHEN** a Trigger declares `source: "operation"` with `after: "Loan.Approve"` to fire a downstream Operation or Process
- **THEN** validation passes; this is the supported Operation-chain mechanism

### Requirement: Triggers do not declare entry-gating conditions

The Operational layer SHALL NOT provide a `condition` field on `Trigger`. Entry gating is expressed by Process orchestration: a first Step with `conditions: [RuleName]` and `else: abort` produces equivalent semantics with one mechanism instead of two. Step.conditions is strictly more general (it also gates mid-Process branching); Trigger.condition added a parallel, weaker form.

#### Scenario: Trigger schema rejects `condition` field
- **WHEN** a Trigger declares `condition: { attribute: "x", eq: "y" }`
- **THEN** schema validation fails because `condition` is not a declared property of Trigger

#### Scenario: Step.conditions remains the canonical gating mechanism
- **WHEN** a Step declares `conditions: ["LoanIsApproved"]` referencing a defined Rule, with optional `else: "abort"`
- **THEN** validation passes; this is the supported gating mechanism for both entry and mid-Process branching

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

### Requirement: Operational schemas reject undeclared properties

Every Operational primitive schema (`operation`, `trigger`, `process`, `rule`, `task`, `attribute`, `relationship`, plus the already-closed `action`, `domain`, `group`, `membership`, `person`, `resource`, `role`) AND the top-level Operational layer schema (`operational.json`) SHALL declare `additionalProperties: false` at the top level. Documents containing any property not listed in the schema's `properties` block MUST fail validation with an `additionalProperties` error.

This requirement gives teeth to existing scenarios that already promise rejection of removed shapes (`signals[]`, `outcomes[]`, `equations[]`, `Operation.initiates`, `Trigger.condition`, `Process.emits`).

#### Scenario: Top-level Operational document rejects an unknown collection
- **WHEN** an Operational document declares a top-level `widgets[]` array (or any other property not in `operational.json`'s `properties`)
- **THEN** validation fails with an Ajv error whose keyword is `additionalProperties` and whose path points at `/widgets`

#### Scenario: Operation rejects an unknown field
- **WHEN** an Operation declares `initiates: ["Loan.Disburse"]` (or any other property not in `operation.json`'s `properties`)
- **THEN** validation fails with an Ajv `additionalProperties` error pointing at the offending property

#### Scenario: Trigger rejects an unknown field
- **WHEN** a Trigger declares `condition: { attribute: "x", eq: "y" }` (or any other property not in `trigger.json`'s `properties`)
- **THEN** validation fails with an Ajv `additionalProperties` error pointing at the offending property

#### Scenario: Process rejects an unknown field
- **WHEN** a Process declares `emits: ["SomeSignal"]` (or any other property not in `process.json`'s `properties`)
- **THEN** validation fails with an Ajv `additionalProperties` error pointing at the offending property

#### Scenario: Rule, Task, Attribute, Relationship reject unknown fields
- **WHEN** a Rule, Task, Attribute, or Relationship declares any property not listed in its respective schema's `properties` block
- **THEN** validation fails with an Ajv `additionalProperties` error pointing at the offending property

#### Scenario: Bookshop fixture and all six examples validate clean against the tightened schemas
- **WHEN** the bookshop fixture and the six example Operational documents (lending, healthcare, manufacturing, marketplace, mass-tort, education) are validated after this change
- **THEN** every document passes — i.e., no fixture or example carries an undeclared property

