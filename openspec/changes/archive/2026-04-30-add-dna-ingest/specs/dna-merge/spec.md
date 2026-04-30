## ADDED Requirements

### Requirement: `merge()` is exported from `@dna-codes/dna-core` as a pure function

The `@dna-codes/dna-core` package SHALL export a function `merge(dnas: OperationalDNA[]): { dna: OperationalDNA, conflicts: Conflict[] }`. The function MUST be pure: no I/O, no LLM calls, no global state. Given the same input array (in the same order), it MUST return deeply-equal output across calls.

#### Scenario: Pure function — same input yields same output
- **WHEN** `merge(dnas)` is called twice with the same input array
- **THEN** the two return values are deeply equal

#### Scenario: Empty input yields empty DNA
- **WHEN** `merge([])` is called
- **THEN** the result `dna` is an empty-but-valid Operational DNA (empty domains/persons/roles/operations/etc.) and `conflicts` is empty

### Requirement: Identity-by-name unifies primitives across chunks

For each Operational primitive type (Resource, Person, Role, Group, Membership, Operation, Trigger, Rule, Task, Process), `merge()` SHALL treat two entries with the same `name` (within the same type) as the same primitive and unify them into a single output entry.

#### Scenario: Two chunks describing Loan unify into one Resource
- **WHEN** chunk A declares `resources: [{ name: 'Loan', attributes: [{ name: 'amount', type: 'number' }] }]` and chunk B declares `resources: [{ name: 'Loan', attributes: [{ name: 'status', type: 'enum' }] }]`
- **THEN** the merged DNA contains a single `Loan` Resource with both `amount` and `status` attributes

#### Scenario: Same-named entries in different types do not unify
- **WHEN** one chunk declares a Resource named `Account` and another declares a Person named `Account`
- **THEN** the merged DNA contains both, distinct, in their respective collections

### Requirement: List-shaped fields union by name

`merge()` SHALL union list-shaped child fields (`attributes[]`, `actions[]`, `roles[]` within a Group, `memberships[]`, etc.) by their `name` key. Two entries with the same `name` within the same parent collection MUST be merged using the same rules recursively; entries unique to one chunk MUST be preserved.

#### Scenario: Attributes union by name
- **WHEN** chunk A's `Loan.attributes` contains `amount` and chunk B's `Loan.attributes` contains `status`
- **THEN** the merged `Loan.attributes` contains both `amount` and `status`

#### Scenario: Same-named attribute is merged recursively
- **WHEN** chunk A declares `{ name: 'amount', type: 'number' }` and chunk B declares `{ name: 'amount', type: 'number', required: true }`
- **THEN** the merged attribute is `{ name: 'amount', type: 'number', required: true }` with no conflict

### Requirement: Scalar field conflicts are reported with a recommendation

When two chunks set different scalar values for the same field path, `merge()` MUST record a `Conflict` entry containing the path, the list of competing values with their sources, and a `recommendation: { value, reason }`. The recommended value MUST also be written into the merged DNA so the result remains valid against the Operational schema.

The recommendation policy v1 SHALL be:
1. Prefer the value supported by the most distinct sources.
2. Tie-break by the most recent `loadedAt`.
3. Tie-break further by the value with the longest non-empty string representation.
4. Final tie-break: stable arbitrary ordering.

#### Scenario: Conflicting required flags produce a conflict and a pick
- **WHEN** chunk A says `Loan.amount.required: true` (sourced from `gdrive://abc` at T1) and chunk B says `Loan.amount.required: false` (sourced from `gdrive://def` at T2 > T1)
- **THEN** `conflicts[]` contains an entry with `path: 'resources.Loan.attributes.amount.required'`, both values listed with their sources, and `recommendation.value: false` because T2 > T1; the merged DNA reflects `required: false`; `recommendation.reason` cites the recency tie-break

#### Scenario: Multi-source agreement does not produce a conflict
- **WHEN** three chunks all declare `Loan.parent: 'FinancialProduct'` from different sources
- **THEN** `conflicts[]` contains no entry for that path and the merged DNA has `Loan.parent: 'FinancialProduct'`

#### Scenario: Single-source value does not produce a conflict
- **WHEN** only one chunk sets `Loan.description: 'Consumer loan'`
- **THEN** `conflicts[]` contains no entry for that path and the merged DNA has `Loan.description: 'Consumer loan'`

### Requirement: Cross-references resolve against the merged noun set; unresolved refs become warnings

After noun primitives (Resource, Person, Role, Group) are merged, `merge()` SHALL walk every reference field on Activity primitives (`Operation.target`, `Membership.person`, `Membership.role`, `Membership.group`, `Trigger.operation`, `Task.actor`, `Task.operation`, `Step.task`, `Rule.operation`) and verify each named reference resolves against the merged noun set. Unresolved references MUST be added to `conflicts[]` as warnings; the referencing primitive MUST still be emitted into the merged DNA.

#### Scenario: Operation.target resolves against merged Resources
- **WHEN** chunk A defines `resources: [{ name: 'Loan' }]` and chunk B defines `operations: [{ target: 'Loan', action: 'Approve' }]`
- **THEN** the merged DNA contains the `Loan.Approve` Operation with no warning, because `Loan` exists in the merged noun set

#### Scenario: Unresolved reference is reported as a warning, not dropped
- **WHEN** a chunk defines `operations: [{ target: 'Mortgage', action: 'Approve' }]` and no chunk defines a `Mortgage` Resource (or Person/Role/Group)
- **THEN** the merged DNA still contains the Operation; `conflicts[]` includes a warning entry naming the unresolved `target: 'Mortgage'` reference

### Requirement: Provenance map is built during merge

`merge()` SHALL accept per-DNA provenance metadata via a sidecar parameter or by tagging each input DNA, and SHALL produce a provenance map keyed by dotted primitive path. Each path MUST list every source URI that contributed to that primitive (with `loadedAt`).

#### Scenario: Provenance lists all contributing sources
- **WHEN** chunk A (from `file:///a.md`) and chunk B (from `gdrive://b`) both describe a `Loan` Resource
- **THEN** the provenance map contains `'resources.Loan'` with both entries listed

#### Scenario: Per-attribute provenance is granular
- **WHEN** only chunk A contributes `Loan.amount` and only chunk B contributes `Loan.status`
- **THEN** `provenance['resources.Loan.attributes.amount']` lists only A's source and `provenance['resources.Loan.attributes.status']` lists only B's source

### Requirement: Conflict shape is stable and typed

`merge()` SHALL emit each `Conflict` as an object of shape:
```ts
{
  path: string,
  values: Array<{ value: unknown, source: { uri: string, loadedAt: string } }>,
  recommendation: { value: unknown, reason: string }
}
```
The `path` MUST use dotted notation matching the structure of the merged DNA (e.g., `resources.Loan.attributes.amount.required`).

#### Scenario: Conflict path follows merged-DNA shape
- **WHEN** a conflict is reported on the `required` field of the `amount` attribute of the `Loan` Resource
- **THEN** the conflict `path` is exactly `resources.Loan.attributes.amount.required`
