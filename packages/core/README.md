# `@dna-codes/core`

DNA is a JSON description language for business systems. This package ships typed bindings for the DNA schemas, a cross-layer validator (`DnaValidator`), and layer docs. The raw JSON schemas themselves live in [`@dna-codes/schemas`](../schemas/) and are pulled in as a dependency.

| Layer | What it captures | Analogous to |
|-------|------------------|--------------|
| **Operational DNA** | What the business does | Domain-Driven Design |
| **Product DNA** | What gets built | OpenAPI + Atomic Design |
| **Technical DNA** | How it gets built | Terraform / AWS SAM |

DNA is a *contract*, not a runtime. Producers (authoring agents, humans) emit JSON that conforms to these schemas; consumers (validators, viewers, code-generation cells) read the JSON and do something useful with it.

- [`docs/operational.md`](./docs/operational.md) — authoring contract for operational DNA
- [`docs/product.md`](./docs/product.md) — authoring contract for product DNA (core + api + ui)
- [`docs/technical.md`](./docs/technical.md) — authoring contract for technical DNA
- [`AGENTS.md`](./AGENTS.md) — agent contract for working with DNA at large

## Installation

```bash
npm install @dna-codes/core
```

## API

### `schemas`

Nested object of every per-primitive JSON schema, keyed by layer:

```ts
import { schemas } from '@dna-codes/core'

schemas.operational.resource       // 15 operational primitives
schemas.product.core.role          // 5 product-core primitives
schemas.product.api.endpoint       // 4 product-api primitives
schemas.product.web.page           // 4 product-web (UI) primitives
schemas.technical.cell             // 11 technical primitives
```

Each schema is a JSON Schema Draft 2020-12 document with a stable `$id`:

```ts
schemas.operational.resource.$id
// → 'https://dna.local/operational/resource'
```

### `documents`

Aggregate schemas describing the shape of a full DNA document per layer:

```ts
import { documents } from '@dna-codes/core'

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
import { allSchemas } from '@dna-codes/core'

const ajv = new Ajv({ strict: false, allErrors: true })
for (const s of allSchemas()) ajv.addSchema(s)

const validate = ajv.getSchema('https://dna.local/operational/resource')
validate({ name: 'Loan' })         // → true
```

### `resolveSchemaFile(family, name)`

Returns the on-disk path of a schema file, or `null` if it doesn't exist. Useful for dev servers or tooling that needs to serve raw schema files:

```ts
import { resolveSchemaFile } from '@dna-codes/core'

resolveSchemaFile('operational', 'resource')
// → '/abs/.../node_modules/@dna-codes/schemas/operational/resource.json'

resolveSchemaFile('product', 'api/endpoint')      // nested path
// → '/abs/.../schemas/product/api/endpoint.json'

resolveSchemaFile('operational', 'ghost')         // missing
// → null
```

### `SCHEMA_ROOT`, `layerDirs`

Filesystem roots for consumers that walk the tree themselves:

```ts
import { SCHEMA_ROOT, layerDirs } from '@dna-codes/core'

SCHEMA_ROOT                        // .../node_modules/@dna-codes/schemas
layerDirs.operational              // .../schemas/operational
layerDirs.product                  // .../schemas/product
layerDirs.technical                // .../schemas/technical
```

### Raw JSON schemas

To import an individual schema directly, depend on [`@dna-codes/schemas`](../schemas/):

```ts
import resourceSchema from '@dna-codes/schemas/operational/resource.json'
```

## `DnaValidator`

AJV-backed validator with per-layer and cross-layer checks. All DNA schemas are pre-registered — no setup needed beyond `new DnaValidator()`.

```ts
import { DnaValidator } from '@dna-codes/core'
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

## Using schemas from non-JS languages

Install [`@dna-codes/schemas`](../schemas/) directly — it's a zero-dependency package that ships only the JSON files:

```
node_modules/@dna-codes/schemas/
  operational/*.json              # 15 primitive + 1 aggregate
  product/core/*.json             # 5 primitives
  product/api/*.json              # 4 primitives
  product/web/*.json              # 4 primitives
  product/product.{core,api,ui}.json   # 3 aggregates
  technical/*.json                # 11 primitives + 1 aggregate
```

Schemas cross-reference each other by absolute URI (e.g. `https://dna.local/operational/attribute`), so your validator must register **all** schemas before validating any one of them. The `allSchemas()` helper does this for you in JS; see the corresponding pattern in your target language's validator.

## Primitive vocabulary

| Layer | Primitives |
|-------|-----------|
| Operational | `Resource`, `Action`, `Capability`, `Attribute`, `Domain`, `Relationship`, `Cause`, `Rule`, `Outcome`, `Signal`, `Equation`, `Position`, `Person`, `Task`, `Process` |
| Product | `Resource`, `Action`, `Operation`, `Role`, `Layout`, `Page`, `Route`, `Block`, `Field`, `Namespace`, `Endpoint`, `Schema`, `Param` |
| Technical | `Environment`, `Cell`, `Construct`, `Provider`, `Variable`, `Output`, `Script`, `View`, `Node`, `Connection`, `Zone` |

Operational is modeled around the **Actor > Action > Resource** triad. `Resource` and `Action` appear at both the Operational and Product layers by design — a Product `Resource` is the surface projection of an Operational `Resource`, and likewise for `Action`. The Actor is expressed via `Position`, `Role`, and `Task` rather than declared on the Capability itself. See each layer's doc in [`docs/`](./docs/) for full semantics.

## What this package does *not* include

- **The raw JSON schemas.** Those live in [`@dna-codes/schemas`](../schemas/) (core depends on it).
- **A CLI.** See [`@cell/cba`](../cba) (command: `cba`) for the full authoring lifecycle.
- **Cell runtimes.** Cells are separate consumers of DNA — see `technical/cells/*`.

## Versioning

DNA schemas are the contract; breaking changes require a major version bump. `$id` URIs (`https://dna.local/<layer>/<primitive>`) are stable identifiers and will not change without a deprecation path.

## License

MIT.
