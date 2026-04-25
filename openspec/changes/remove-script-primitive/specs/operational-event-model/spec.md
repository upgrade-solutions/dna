## ADDED Requirements

### Requirement: No Script primitive in the Technical layer

The Technical layer SHALL NOT declare a `Script` primitive or top-level `scripts[]` collection. Script existed only as the deployment binding for an Operational `Equation`; with Equation removed, Script has no concept it implements. A general-purpose "named compute deployment" primitive will be introduced only when a real consumer needs one.

#### Scenario: Technical schema rejects `scripts[]` collection
- **WHEN** a Technical document declares a top-level `scripts[]` array
- **THEN** schema validation fails with an "additionalProperties" error against `technical.json`

#### Scenario: technical/script schema is no longer registered
- **WHEN** code asks the validator for the `technical/script` schema by id
- **THEN** the schema is not present in the registered set
