## ADDED Requirements

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
