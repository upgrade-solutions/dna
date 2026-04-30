# `@dna-codes/dna-core`

DNA is a JSON description language for business systems. This package ships typed bindings for the DNA schemas, a cross-layer validator (`DnaValidator`), and layer docs. The raw JSON schemas themselves live in [`@dna-codes/dna-schemas`](../schemas/) and are pulled in as a dependency.

| Layer | What it captures | Analogous to |
|-------|------------------|--------------|
| **Operational DNA** | What the business does | Domain-Driven Design |
| **Product DNA** | What gets built | OpenAPI + Atomic Design |
| **Technical DNA** | How it gets built | Terraform / AWS SAM |

DNA is a *contract*, not a runtime. Producers (authoring agents, humans) emit JSON that conforms to these schemas; consumers (validators, viewers, code-generation cells) read the JSON and do something useful with it.

- [`docs/operational.md`](./docs/operational.md) — authoring contract for operational DNA
- [`docs/product.md`](./docs/product.md) — authoring contract for product DNA (core + api + ui)
- [`docs/technical.md`](./docs/technical.md) — authoring contract for technical DNA
- [`docs/merge.md`](./docs/merge.md) — `merge()` reference for composing DNA from multiple chunks
- [`AGENTS.md`](./AGENTS.md) — agent contract for working with DNA at large

## Installation

```bash
npm install @dna-codes/dna-core
```

## API

### `schemas`

Nested object of every per-primitive JSON schema, keyed by layer:

```ts
import { schemas } from '@dna-codes/dna-core'

schemas.operational.resource       // 15 operational primitives
schemas.product.core.role          // 5 product-core primitives
schemas.product.api.endpoint       // 4 product-api primitives
schemas.product.web.page           // 4 product-web (UI) primitives
schemas.technical.cell             // 11 technical primitives
```

Each schema is a JSON Schema Draft 2020-12 document with a stable `$id`:

```ts
schemas.operational.resource.$id
// → 'https://dna.codes/schemas/operational/resource'
```

### `documents`

Aggregate schemas describing the shape of a full DNA document per layer:

```ts
import { documents } from '@dna-codes/dna-core'

documents.operational              // shape of operational.json
documents.productCore              // shape of product.core.json
documents.productApi               // shape of product.api.json
documents.productUi                // shape of product.ui.json
documents.technical                // shape of technical.json
```

### `allSchemas()`

Flat array of every schema (primitives + aggregates). Convenient for bulk-registering with a JSON Schema validator:

```ts
import Ajv from 'ajv'
import { allSchemas } from '@dna-codes/dna-core'

const ajv = new Ajv({ strict: false, allErrors: true })
for (const s of allSchemas()) ajv.addSchema(s)

const validate = ajv.getSchema('https://dna.codes/schemas/operational/resource')
validate({ name: 'Loan' })         // → true
```

### `resolveSchemaFile(family, name)`

Returns the on-disk path of a schema file, or `null` if it doesn't exist. Useful for dev servers or tooling that needs to serve raw schema files:

```ts
import { resolveSchemaFile } from '@dna-codes/dna-core'

resolveSchemaFile('operational', 'resource')
// → '/abs/.../node_modules/@dna-codes/dna-schemas/operational/resource.json'

resolveSchemaFile('product', 'api/endpoint')      // nested path
// → '/abs/.../schemas/product/api/endpoint.json'

resolveSchemaFile('operational', 'ghost')         // missing
// → null
```

### `SCHEMA_ROOT`, `layerDirs`

Filesystem roots for consumers that walk the tree themselves:

```ts
import { SCHEMA_ROOT, layerDirs } from '@dna-codes/dna-core'

SCHEMA_ROOT                        // .../node_modules/@dna-codes/dna-schemas
layerDirs.operational              // .../schemas/operational
layerDirs.product                  // .../schemas/product
layerDirs.technical                // .../schemas/technical
```

### Raw JSON schemas

To import an individual schema directly, depend on [`@dna-codes/dna-schemas`](../schemas/):

```ts
import resourceSchema from '@dna-codes/dna-schemas/operational/resource.json'
```

## `DnaValidator`

AJV-backed validator with per-layer and cross-layer checks. All DNA schemas are pre-registered — no setup needed beyond `new DnaValidator()`.

```ts
import { DnaValidator } from '@dna-codes/dna-core'
import operational from './dna/lending/operational.json'

const validator = new DnaValidator()
const result = validator.validate(operational, 'operational/operational')
if (!result.valid) {
  for (const err of result.errors) console.error(err.instancePath, err.message)
}

// Cross-layer: verify Product references valid Operational Resources, etc.
const cross = validator.validateCrossLayer({ operational, productApi })
if (!cross.valid) for (const err of cross.errors) console.error(err)
```

## `merge()`

Compose multiple Operational DNA chunks into one. Pure, deterministic, no I/O — designed for the multi-source ingest case (`@dna-codes/dna-ingest` calls this as its fan-in step) but usable on its own.

```ts
import { merge } from '@dna-codes/dna-core'

const result = merge([
  { dna: chunkA, source: { uri: 'file:///sop.md',  loadedAt: '2025-01-01T00:00:00.000Z' } },
  { dna: chunkB, source: { uri: 'gdrive://policy', loadedAt: '2025-06-01T00:00:00.000Z' } },
])

result.dna          // merged OperationalDNA — validates against the operational schema
result.conflicts    // Conflict[] — scalar disagreements + unresolved-ref warnings
result.provenance   // dotted-path → contributing sources, e.g. 'resources.Loan' → [...]
```

Identity is by `name` within each primitive type; same-named entries unify across chunks. List-shaped children (`attributes[]`, `actions[]`, `roles[]`, etc.) union by name with recursive merge. Scalar disagreements emit a `Conflict` with the v1 recommendation policy:

1. value backed by the most distinct sources wins
2. tie-break by most recent `loadedAt`
3. tie-break by longest non-empty string representation
4. final tie-break: stable input order

The recommendation is also written into the merged DNA so the result remains schema-valid; the full list of competing values + sources rides along in `Conflict.values` for review.

Cross-references (`Operation.target`, `Membership.{person,role,group}`, `Trigger.operation`, `Task.{actor,operation}`, `Step.task`, `Rule.operation`) are resolved against the merged noun set. Unresolved references surface as `Conflict` entries with `kind: 'unresolved-reference'` — the referencing primitive is still emitted so a reviewer can fix the source documents.

**Determinism caveat:** the recency tie-break depends on input ordering. Two callers passing the same chunks in different order may pick differently on tied conflicts. Sort by `loadedAt` before merging if strict order-independence matters.

**v1 simplification:** sub-domain hierarchy is not preserved — every input chunk's nouns flatten into the merged top-level domain. If your sources nest by sub-domain, that nesting is dropped (the merged DNA still validates).

## Using schemas from non-JS languages

Install [`@dna-codes/dna-schemas`](../schemas/) directly — it's a zero-dependency package that ships only the JSON files:

```
node_modules/@dna-codes/dna-schemas/
  operational/*.json              # 15 primitive + 1 aggregate
  product/core/*.json             # 5 primitives
  product/api/*.json              # 4 primitives
  product/web/*.json              # 4 primitives
  product/product.{core,api,ui}.json   # 3 aggregates
  technical/*.json                # 11 primitives + 1 aggregate
```

Schemas cross-reference each other by absolute URI (e.g. `https://dna.codes/schemas/operational/attribute`), so your validator must register **all** schemas before validating any one of them. The `allSchemas()` helper does this for you in JS; see the corresponding pattern in your target language's validator.

## Primitive vocabulary

| Layer | Primitives |
|-------|-----------|
| Operational | `Resource`, `Action`, `Operation`, `Attribute`, `Domain`, `Relationship`, `Trigger`, `Rule`, `Person`, `Role`, `Group`, `Membership`, `Task`, `Process` |
| Product | `Resource`, `Action`, `Operation`, `Layout`, `Page`, `Route`, `Block`, `Field`, `Namespace`, `Endpoint`, `Schema`, `Param` |
| Technical | `Environment`, `Cell`, `Construct`, `Provider`, `Variable`, `Output`, `Script`, `View`, `Node`, `Connection`, `Zone` |

Operational is modeled around the **Actor > Action > Subject** triad. `Resource` and `Action` appear at both the Operational and Product layers by design — a Product `Resource` is the surface projection of an Operational `Resource`, and likewise for `Action`. The Actor is a `Role` (or `Person`) referenced by `Rule` (access), `Task` (assignment), `Membership` (eligibility), and `Process` (operator), rather than declared on the Operation itself. State mutations live on `Operation.changes`; there is no separate Outcome primitive. See each layer's doc in [`docs/`](./docs/) for full semantics.

## What this package does *not* include

- **The raw JSON schemas.** Those live in [`@dna-codes/dna-schemas`](../schemas/) (core depends on it).
- **A CLI.** See [`@cell/cba`](../cba) (command: `cba`) for the full authoring lifecycle.
- **Cell runtimes.** Cells are separate consumers of DNA — see `technical/cells/*`.

## Versioning

DNA schemas are the contract; breaking changes require a major version bump. `$id` URIs (`https://dna.codes/schemas/<layer>/<primitive>`) are stable identifiers and will not change without a deprecation path.

## License

MIT.
