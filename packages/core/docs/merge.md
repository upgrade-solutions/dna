# `merge()` — composing Operational DNA from multiple chunks

`merge()` is the fan-in utility used by `@dna-codes/dna-ingest` (and any other consumer that needs to compose Operational DNA produced from multiple sources). It is a pure value transformation: same input array, same output, every time. No I/O, no LLM calls, no global state.

## Signature

```ts
export function merge(input: OperationalDNA[] | MergeChunk[]): MergeResult

interface MergeChunk {
  dna: OperationalDNA
  source?: Source
}

interface Source {
  uri: string
  loadedAt: string  // ISO 8601
}

interface MergeResult {
  dna: OperationalDNA
  conflicts: Conflict[]
  provenance: Provenance
}

interface Conflict {
  path: string
  values: Array<{ value: unknown; source: Source }>
  recommendation: { value: unknown; reason: string }
  kind?: 'scalar' | 'unresolved-reference'
}

type Provenance = Record<string, Source[]>
```

You can pass either bare DNA documents (a synthetic source is generated per chunk) or tagged `MergeChunk` objects when you want sources to flow through into provenance and conflicts.

## What it does

### 1. Identity-by-name unifies primitives across chunks

For each Operational primitive type — Resource, Person, Role, Group, Membership, Operation, Trigger, Rule, Task, Process — entries with the same `name` (within the same type) are unified. Same-named entries in *different* types stay distinct (a `Resource: Account` and a `Person: Account` are two separate primitives in the merged result).

Triggers, which have no `name`, are identified by `${operation||process}|${source}|${after}`. Rules without a `name` use `${operation}|${type}`.

### 2. List-shaped children union by name with recursive merge

`attributes[]`, `actions[]`, `roles[]` (within Group), `memberships[]`, etc. union by their `name` key. Same-named children merge recursively under the same rules. Children unique to one chunk are preserved as-is.

`Operation.changes[]` uses `attribute` as the natural key. `Process.steps[]` uses `id`. Lists whose items don't have a recognizable identity key fall back to deep-equality dedupe.

### 3. Scalar disagreements emit `Conflict` entries with a recommendation

When two chunks set different scalar values for the same field path, `merge()` records a `Conflict` containing the path, the list of competing values + sources, and a `recommendation: { value, reason }`. The recommended value is also written into the merged DNA so the result remains valid against the schema.

The v1 recommendation policy:

1. Prefer the value supported by the most distinct sources.
2. Tie-break by the most recent `loadedAt`.
3. Tie-break further by the value with the longest non-empty string representation (proxy for "more specific").
4. Final tie-break: stable input order.

The reason field cites which step picked the winner, so a reviewer can audit the heuristic.

### 4. Cross-references resolve against the merged noun set; unresolved refs become warnings

After noun primitives merge, the function walks every reference field on Activity primitives — `Operation.target`, `Membership.{person,role,group}`, `Trigger.operation`, `Task.{actor,operation}`, `Step.task`, `Rule.operation` — and verifies each named reference resolves against the merged noun/operation/task/process sets.

Unresolved references surface as `Conflict` entries with `kind: 'unresolved-reference'`. The referencing primitive is **still emitted** into the merged DNA so a human reviewer can see the partial picture and fix the source documents.

### 5. Provenance map is built during merge

Every primitive (and named sub-primitive) gets an entry in the `provenance` map keyed by dotted path:

```ts
provenance: {
  'resources.Loan': [{ uri: 'gdrive://abc', loadedAt: '...' }, { uri: 'file:///sop.md', loadedAt: '...' }],
  'resources.Loan.attributes.amount': [{ uri: 'gdrive://abc', loadedAt: '...' }],
  'roles.Underwriter': [{ uri: 'file:///sop.md', loadedAt: '...' }],
}
```

Provenance is a separate map, **not** embedded in the DNA. The merged `dna` matches the existing Operational schema exactly — no `_provenance` or `_source` fields anywhere in the tree. Callers who don't care about provenance can ignore the field; output adapters consume the merged DNA without changes.

## Determinism caveats

- The recency tie-break depends on input ordering for `loadedAt` ties. Two callers passing the same chunks in different order may produce different recommendations on tied conflicts. Sort input by `loadedAt` before merging if strict order-independence matters.
- Empty input (`merge([])`) yields `{ dna: { domain: { name: '' } }, conflicts: [], provenance: {} }`.

## v1 simplifications

- **Sub-domain hierarchy is not preserved.** Input chunks may nest noun primitives under arbitrary sub-domain trees; the merged DNA flattens them all to the top-level domain. The merged DNA still validates, but if your inputs encode sub-domain organization, that organization is lost. A future change may add sub-domain-aware merge.
- **Activity-collection identity is structural.** Triggers and unnamed Rules use synthetic identity. If two chunks declare the same trigger with subtly different scalar payloads (e.g. different `event` strings), the synthetic identity treats them as distinct entries.
- **Recommendation policy is fixed.** No pluggable `pickRecommendation` callback in v1. Future work may LLM-assist or otherwise customize.

## Usage example

```ts
import { merge, DnaValidator } from '@dna-codes/dna-core'

const result = merge([
  { dna: chunkFromDrive,   source: { uri: 'gdrive://abc',          loadedAt: '2025-01-01T00:00:00Z' } },
  { dna: chunkFromSopFile, source: { uri: 'file:///etc/sop.md',    loadedAt: '2025-06-01T00:00:00Z' } },
])

const validator = new DnaValidator()
const validation = validator.validate(result.dna, 'operational')
if (!validation.valid) console.warn('merged DNA failed schema validation', validation.errors)

if (result.conflicts.length > 0) {
  console.log('conflicts to review:')
  for (const c of result.conflicts) console.log(c.path, c.kind ?? 'scalar', c.recommendation)
}
```
