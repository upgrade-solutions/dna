# `@dna-codes/dna-schemas`

Canonical JSON Schema (Draft 2020-12) definitions for DNA. Zero dependencies, no JS runtime — just JSON files that any JSON-Schema-aware tool in any language can validate against.

## Install

```bash
npm install @dna-codes/dna-schemas
```

## Layout

```
operational/*.json              # 13 primitives + 1 aggregate
product/core/*.json             # 4 primitives
product/api/*.json              # 4 primitives
product/web/*.json              # 4 primitives
product/product.{core,api,ui}.json   # 3 aggregates
technical/*.json                # 11 primitives + 1 aggregate
```

Every schema has a stable `$id` of the form `https://dna.codes/schemas/<layer>/<primitive>`. Schemas cross-reference each other by absolute URI, so your validator must register **all** schemas before validating any one of them.

## Usage from JavaScript

```ts
import resource from '@dna-codes/dna-schemas/operational/resource.json'
```

For a batteries-included JS/TS experience (typed bindings + a cross-layer validator), use [`@dna-codes/dna-core`](../core/), which depends on this package.

## Usage from other languages

Point any JSON-Schema validator (Python `jsonschema`, Ruby `json-schema`, Rust `jsonschema` crate, Go `gojsonschema`, etc.) at the installed package root:

```
node_modules/@dna-codes/dna-schemas/
```

Register every file before validating — URIs cross-reference each other.

## Versioning

Breaking schema changes require a major version bump. `$id` URIs are stable identifiers and will not change without a deprecation path.

## License

MIT.
