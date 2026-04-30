# Builders — composing Operational DNA programmatically

`@dna-codes/dna-core` ships a typed, schema-aware builder API for constructing Operational DNA documents one primitive at a time. Builders are pure, immutable functions: each takes a DNA + a primitive, returns a new DNA + any conflicts the composition produced.

The builders are the canonical way to construct DNA in code. They power the internal walkers in `@dna-codes/dna-input-json` and `@dna-codes/dna-input-text`'s layered constructor; consumers writing their own input adapters or programmatic DNA fixtures should use them too.

## Surface

```ts
import {
  createOperationalDna,
  addResource,
  addPerson,
  addRole,
  addGroup,
  addMembership,
  addOperation,
  addTrigger,
  addRule,
  addTask,
  addProcess,
  addRelationship,
} from '@dna-codes/dna-core'
```

Each `add*` builder has the same shape:

```ts
function addResource(
  dna: OperationalDNA,
  resource: Resource,
  opts?: { validate?: boolean }
): { dna: OperationalDNA; conflicts: Conflict[] }
```

The factory:

```ts
function createOperationalDna(opts: { domain: { name: string; description?: string; path?: string } }): OperationalDNA
```

## Behavior

### Pure & immutable

Builders never mutate their input. Calling the same builder with the same arguments returns deeply-equal output every time.

```ts
const dna1 = createOperationalDna({ domain: { name: 'lending' } })
const { dna: dna2 } = addResource(dna1, { name: 'Loan' })
// dna1 unchanged; dna2 is a new DNA
```

### Compose-on-duplicate

Adding a primitive whose `name` already exists in the same collection composes the new primitive into the existing one using the same rules `merge()` applies — list-shaped children union by name; scalar disagreements emit `Conflict` entries with the v1 recommendation policy. Builders **never throw** on a duplicate name.

```ts
let dna = createOperationalDna({ domain: { name: 'd' } })
;({ dna } = addResource(dna, { name: 'Loan', attributes: [{ name: 'amount', type: 'number' }] }))
;({ dna } = addResource(dna, { name: 'Loan', attributes: [{ name: 'status', type: 'enum', values: ['pending', 'active'] }] }))
// dna.domain.resources[0].attributes contains both 'amount' and 'status'

const result = addResource(dna, { name: 'Loan', description: 'Mortgage product' })
// If `Loan` already had description: 'Consumer loan',
// result.conflicts contains an entry for resources.Loan.description with both
// values listed and a recommendation written into result.dna.
```

### Default-on schema validation, opt-out

By default every builder validates its primitive input against `@dna-codes/dna-schemas` before composing — TypeScript types are an under-approximation of the real schema (patterns like `Operation.action`'s `^[A-Z][a-zA-Z0-9]*$` and `Attribute.values` requirement when `type === 'enum'` aren't expressible in plain TS).

```ts
addResource(dna, { name: 'Loan', attributes: [{ name: 'status', type: 'enum' }] })
// throws: "operational/resource input failed validation: /attributes/0 must have required property 'values'"

addResource(dna, primitive, { validate: false })
// skips runtime validation — used by `merge()`'s emit loop and other callers
// where inputs are already known to validate
```

### TypeScript types

Each builder accepts a TypeScript type derived from the JSON Schema:

```ts
import type { Resource, Operation, Membership } from '@dna-codes/dna-core'

addResource(dna, { name: 'Loan' })            // ok
addResource(dna, { name: 123 })                // ts error: name must be string
addOperation(dna, { target: 'Loan' })          // ts error: action is required
```

A contract test in `dna-core` re-validates each schema's `examples[]` against the corresponding TypeScript type — if a JSON Schema gains a field the TypeScript type doesn't know about, the build fails.

## Relationship to `merge()`

Builders and `merge()` share the same composition engine. `addResource(dna, r)` is implemented by wrapping `r` in a single-primitive DNA and calling `merge([dna, wrapper])`, then returning the result with the provenance map dropped (builders don't track provenance — that's `merge()`'s job for the multi-source case).

This means:

- A DNA built by repeated `addX` calls is structurally identical to one merged from equivalent single-primitive chunks.
- The compose-on-duplicate behavior is exactly merge's identity-by-name unification.
- `merge()` retains its N-way merge semantics (source-count → recency → length → stable order recommendation policy depends on seeing all chunks together; pairwise reduction would lose the source-count tie-break).

## v1 simplifications

- **Sub-domain hierarchy isn't preserved.** Builders flatten to the top-level `domain`, matching `merge()`. If your DNA needs nested sub-domains, you'll need to compose sub-domain DNAs separately and assemble them outside the builder API.
- **No fluent API.** `addResource(...).addPerson(...)` chaining isn't exported. Reassigning the result is the canonical pattern: `({ dna } = addX(dna, ...))`. A fluent layer can be built on top later if it's actually wanted.
- **No sub-builders for nested primitives.** `addAttribute(addResource(dna, ...))` isn't an API. Pass attributes inline to `addResource`. Same for actions, steps, allow entries, etc.

## Common patterns

### Build a DNA from scratch

```ts
import { createOperationalDna, addResource, addPerson, addOperation, addTask } from '@dna-codes/dna-core'

let dna = createOperationalDna({ domain: { name: 'lending', path: 'acme.lending' } })
;({ dna } = addResource(dna, {
  name: 'Loan',
  attributes: [{ name: 'amount', type: 'number', required: true }],
  actions: [{ name: 'Approve', type: 'write' }],
}))
;({ dna } = addPerson(dna, { name: 'Borrower' }))
;({ dna } = addOperation(dna, { name: 'Loan.Approve', target: 'Loan', action: 'Approve' }))
;({ dna } = addTask(dna, { name: 'approve-loan', actor: 'Underwriter', operation: 'Loan.Approve' }))
```

### Accumulate into a single DNA across many calls

```ts
function buildFromScalarKeys(keys: Record<string, unknown>, dna: OperationalDNA): OperationalDNA {
  for (const [name, value] of Object.entries(keys)) {
    const next = addResource(dna, {
      name: 'Sample',
      attributes: [{ name, type: typeof value === 'number' ? 'number' : 'string' }],
    })
    dna = next.dna  // attributes union by name on each call
  }
  return dna
}
```

### Audit conflicts before using the DNA

```ts
const accumulated: Conflict[] = []
let dna = createOperationalDna({ domain: { name: 'd' } })
for (const r of incomingResources) {
  const result = addResource(dna, r)
  dna = result.dna
  accumulated.push(...result.conflicts)
}
if (accumulated.length > 0) console.warn('compose-on-add disagreements:', accumulated)
```

## Versioning notes

- Builders shipped in `@dna-codes/dna-core@0.5.1` (additive within the 0.5.x line — no cascade required across siblings depending on `^0.5.0`).
