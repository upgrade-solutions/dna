# Queries API

The queries module is the canonical read side of `@dna-codes/dna-core` — the symmetric counterpart to the [builders](./builders.md). Every function is pure, read-only, and accepts an `OperationalDNA` document. No I/O, no mutation, no external dependencies.

## API surface

```ts
import {
  // Domain nouns (top-level domain)
  getResource, getResources,
  getPerson,   getPersons,
  getRole,     getRoles,
  getGroup,    getGroups,

  // People relationships
  getMembership,  getMemberships,

  // Activities
  getOperation,  getOperations,
  getProcess,    getProcesses,
  getTask,       getTasks,
  getTriggers,                     // no single-item getter (Trigger has no name field)
  getRule,       getRules,

  // Cross-reference resolvers
  getOperationsForResource,
  getTriggersForOperation,
  getTriggersForProcess,
  getTasksForOperation,
  getRulesForOperation,
  getActorsForOperation,
  getMembershipsForRole,
  getMembershipsForPerson,
} from '@dna-codes/dna-core'
```

## Null / empty semantics

| Pattern | Returns when not found |
|---|---|
| `get{Primitive}(dna, name)` | `null` (never `undefined`) |
| `get{Primitives}(dna)` | `[]` (never `null`) |
| `get{Primitives}For{Context}(dna, …)` | `[]` (never `null`) |

Single-item getters return `null` so callers can branch cleanly — `if (!op) return { error: 'not found' }` — without mixing error-handling concerns. List getters always return an array; an empty array is an honest answer.

## Per-primitive getters

Each primitive has a single-item getter (`T | null`) and a list getter (`T[]`). Both look up by the primitive's `name` field.

```ts
// single — null when not found
getResource(dna, 'Loan')         // Resource | null
getPerson(dna, 'Employee')       // Person | null
getRole(dna, 'Underwriter')      // Role | null
getGroup(dna, 'BankDepartment')  // Group | null
getMembership(dna, 'EmployeeUnderwriter')  // Membership | null
getOperation(dna, 'Loan.Approve')          // Operation | null
getProcess(dna, 'LoanApproval')            // Process | null
getTask(dna, 'approve-loan')               // Task | null
getRule(dna, 'LoanIsApproved')             // Rule | null  (only named/condition rules)

// list — [] when empty
getResources(dna)     // Resource[]
getPersons(dna)       // Person[]
getRoles(dna)         // Role[]
getGroups(dna)        // Group[]
getMemberships(dna)   // Membership[]
getOperations(dna)    // Operation[]
getProcesses(dna)     // Process[]
getTasks(dna)         // Task[]
getTriggers(dna)      // Trigger[]
getRules(dna)         // Rule[]
```

**Note on `Trigger`:** Triggers have no `name` field; there is no single-item `getTrigger`. Use `getTriggersForOperation` or `getTriggersForProcess` to look up triggers by their target.

**Note on `getRule`:** `Rule.name` is optional — only condition-type rules referenced by `Process.steps[].conditions` are required to be named. `getRule` only finds named rules; unnamed access rules are found via `getRulesForOperation`.

## Cross-reference resolvers

These traverse the string-based links between primitives and return resolved objects.

### `getRulesForOperation(dna, opName)`

All Rules (access and condition) whose `operation` field equals `opName`.

```ts
getRulesForOperation(dna, 'Loan.Approve')
// → Rule[]  (access rules + named condition rules for this operation)
```

### `getTriggersForOperation(dna, opName)`

All Triggers whose `operation` field equals `opName`.

```ts
getTriggersForOperation(dna, 'Loan.Apply')
// → Trigger[]
```

### `getTriggersForProcess(dna, processName)`

All Triggers whose `process` field equals `processName`.

```ts
getTriggersForProcess(dna, 'LoanApproval')
// → Trigger[]
```

### `getOperationsForResource(dna, resourceName)`

All Operations whose `target` field equals `resourceName`.

```ts
getOperationsForResource(dna, 'Loan')
// → Operation[]  (Loan.Apply, Loan.Approve, Loan.Disburse, …)
```

### `getTasksForOperation(dna, opName)`

All Tasks whose `operation` field equals `opName`.

```ts
getTasksForOperation(dna, 'Loan.Approve')
// → Task[]
```

### `getActorsForOperation(dna, opName)`

Resolves the actors permitted to perform an operation. Finds all access-type Rules for `opName`, then resolves each `allow[].role` string against `dna.domain.roles` and `dna.domain.persons`.

```ts
getActorsForOperation(dna, 'Loan.Approve')
// → Array<Role | Person>

getActorsForOperation(dna, 'WorkOrder.Cut')
// → [{ name: 'CncMachine', system: true, … }]  — system Roles included
```

Resolution rules:
- `allow[].role` is looked up first in `dna.domain.roles`, then in `dna.domain.persons`.
- System Roles (`role.system === true`) are included — callers filter by `role.system` if they need only human actors.
- Dangling references (a name that exists in no Rule-accessible domain collection) are silently omitted. `DnaValidator` is the place to catch those.
- Duplicate actor names across multiple Rules are de-duplicated.

### `getMembershipsForRole(dna, roleName)`

All Memberships whose `role` field equals `roleName`.

```ts
getMembershipsForRole(dna, 'Underwriter')
// → Membership[]  (all person↔role assignments for Underwriter)
```

### `getMembershipsForPerson(dna, personName)`

All Memberships whose `person` field equals `personName`.

```ts
getMembershipsForPerson(dna, 'Employee')
// → Membership[]  (all roles Employee holds)
```

## Relationship to builders

Builders are the write API — `addResource`, `addOperation`, etc. — pure functions that compose primitives into an `OperationalDNA`. Queries are the read API — `getResource`, `getOperation`, etc. — pure functions that look things up from a composed `OperationalDNA`. Both live in `@dna-codes/dna-core` because both are pure functions over DNA primitives with no transport or I/O concerns.

The typical lifecycle:

```
ingest → merge() → validate → queries → transport (MCP / API / CLI)
```

Queries are designed to be called **after** validation. If a DNA passes `DnaValidator`, cross-references are sound; the "silently omit dangling refs" behavior in `getActorsForOperation` is defense-in-depth, not the primary guard.

## Common patterns for transport wrappers

Transport wrappers (`dna-mcp`, `dna-api`, `dna-cli`) expose DNA through a transport layer. Use queries rather than traversing raw DNA directly.

**MCP tool — fetch operation with its actors and rules:**

```ts
async function describeOperation(dna: OperationalDNA, opName: string) {
  const op = getOperation(dna, opName)
  if (!op) return { error: `Operation "${opName}" not found` }

  return {
    operation: op,
    actors: getActorsForOperation(dna, opName),
    rules:  getRulesForOperation(dna, opName),
    tasks:  getTasksForOperation(dna, opName),
  }
}
```

**REST route — list operations for a resource:**

```ts
app.get('/resources/:name/operations', (req, res) => {
  const ops = getOperationsForResource(dna, req.params.name)
  res.json(ops)
})
```

**CLI subcommand — show who can perform an operation:**

```ts
const actors = getActorsForOperation(dna, args.operation)
if (actors.length === 0) {
  console.log('No actors defined for this operation.')
} else {
  for (const a of actors) {
    const tag = 'system' in a && a.system ? ' [system]' : ''
    console.log(`  ${a.name}${tag}`)
  }
}
```
