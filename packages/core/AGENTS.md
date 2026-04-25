# @dna-codes/core — Agent Contract

This package is the canonical source of truth for **DNA** — a JSON description language for business systems. Every agent that authors, validates, transforms, or consumes DNA should treat the schemas in this package as the contract.

## What DNA is

DNA is a **description**, not a program. It describes a business at three intentionally decoupled layers:

| Layer | Scope | Aggregate file |
|-------|-------|----------------|
| **Operational** | What the business does — people, entities, rules, SOPs | `operational.json` |
| **Product** | What gets built — resources, operations, endpoints, pages | `product.{core,api,ui}.json` |
| **Technical** | How it gets built — cells, constructs, providers, environments | `technical.json` |

`Resource`, `Action`, and `Operation` appear at both the Operational and Product layers on purpose — Operational is the source of truth for the Actor > Action > Subject triad, and Product projects those same concepts onto API and UI surfaces. Operational has four noun primitives (Resource, Person, Role, Group), each in its own collection under Domain; `Memberships` are a separate top-level eligibility collection. Product Core currently surfaces only Resources; how People primitives project into Product Core is an open question (see `ROADMAP.md`). All other primitive names are unique per layer. If you're unsure which layer a concept belongs to, read [`docs/<layer>.md`](./docs/) before editing.

## When to invoke which agent

| Task | Delegate to |
|------|-------------|
| Author/modify Operational DNA | `docs/operational.md` (per-layer contract) |
| Author/modify Product DNA (core, api, or ui) | `docs/product.md` |
| Author/modify Technical DNA | `docs/technical.md` |
| Generate full DNA for a new domain | `dna/AGENTS.md` (the meta-agent one level up) |
| Validate a DNA document | Use `@dna-codes/core` — no agent needed |
| Generate code from DNA | The cell for the relevant layer (api-cell, ui-cell, db-cell, event-bus-cell) |

This package-level agent is the **dispatcher**: it holds the cross-layer picture and hands off to the layer agents for concrete edits.

## Rules of the contract

1. **Schemas are language-agnostic.** JSON Schema Draft 2020-12 only. Never embed TS/JS runtime behavior into a schema.
2. **Primitive names are unique per layer, except the Actor > Action > Subject triad.** Operational `Resource`, `Action`, and `Operation` intentionally share names across layers — the product layer projects the same concepts onto API and UI surfaces. Operational People primitives (Person, Role, Group, Membership) are first-class collections under Domain — they are NOT collapsed into Resource. Resource is strictly an entity template; Person is for individuals; Group is for work-units / containers; Role is for positions/capacities; Membership is template-level eligibility (Person × Role × optional-Group).
3. **Cross-layer references are strings, validated externally.** A `Product.Resource.resource` is a string referencing an `Operational.Resource.name`. Schemas don't enforce this; `@dna-codes/core` does. Don't introduce JSON-Schema-level refs across layers.
4. **`$id` URIs are stable.** `https://dna.codes/schemas/<layer>/<primitive>` identifiers survive renames and refactors. Never change one without a deprecation path.
5. **Layer boundaries are one-way downstream.** Operational → Product → Technical. Upper layers never read lower-layer DNA; lower layers read exactly what they need and no more.
6. **Cells belong outside this package.** `@dna-codes/core` defines the contract; cells consume it. If you feel tempted to add runtime logic here, you're building a cell — put it in its own package.

## How to ground yourself before editing

Any agent that touches DNA should first:

1. **Read the relevant layer doc** in `docs/` — it tells you which primitives are in scope and the authoring invariants.
2. **Read the JSON schemas** for the primitives you're editing: `schemas/<layer>/<primitive>.json`. They are the literal truth; layer docs describe the *why*, schemas describe the *what*.
3. **Inspect an existing DNA fixture** (e.g. `dna/lending/`, `dna/torts/marshall/`) to see the shape a valid document takes.
4. **Run `@dna-codes/core`** after every non-trivial edit. A passing cross-layer validation is a stronger correctness signal than a passing JSON-Schema validation alone.

## Programmatic access

```ts
import { schemas, documents, allSchemas, resolveSchemaFile } from '@dna-codes/core'

schemas.operational.resource       // schema for a single primitive
documents.productApi               // schema for an entire product.api.json
resolveSchemaFile('product', 'api/endpoint')  // → absolute filesystem path
allSchemas()                        // flat list — pass to ajv, etc.
```

See [`README.md`](./README.md) for the full API reference.

## Anti-patterns

- ❌ **Embedding business rules in schemas.** Schemas describe *shape*; rules live in Operational DNA `rules[]`.
- ❌ **Runtime code in this package.** No HTTP clients, no filesystem I/O beyond the pure-functional helpers already exposed. If you need behavior, it belongs in a cell or validator.
- ❌ **Inventing primitives ad-hoc.** Every primitive should earn its place with a clear separation of concerns from existing ones. Discuss before adding.
- ❌ **Cross-layer references enforced at the schema level.** Those break the one-way dependency and make layers impossible to evolve independently. Use string refs + `@dna-codes/core`.

## Handing off

After producing DNA that validates, the typical downstream flow is:

```
operational.json  →  product.{core,api,ui}.json  →  technical.json
                                                          ↓
                                                   cba develop <domain>
                                                          ↓
                                                   generated code
```

When your job is done, say which layer(s) you modified and whether cross-layer validation passes. The next agent (or human) can pick up from there.
