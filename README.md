# DNA Codes (@dna-codes)
DNA is a description language for business systems — your digital DNA. Once defined, it can be used to generate documentation, workflows, and robust software automatically.

A DSL written in JSON/YAML, it describes a business at three intentionally decoupled layers — what the business does, what gets built, and how it gets built — and provides tooling to validate those descriptions and render them as documentation.

## The Three Layers

| Layer | What it captures | Analogous to |
|-------|-----------------|--------------|
| **Operational** | What the business does — entities, capabilities, rules, SOPs | Domain-Driven Design |
| **Product** | What gets built — resources, operations, endpoints, pages | OpenAPI + Atomic Design |
| **Technical** | How it gets built — cells, constructs, providers, environments | Terraform / AWS SAM |

Layers are one-way downstream: Operational → Product → Technical. Upper layers never depend on lower ones. Cross-layer references (e.g. a Product Resource pointing at an Operational Noun) are plain strings validated by `@dna-codes/core` rather than JSON Schema `$ref`s.

Here's a minimal Operational DNA document in a lending context:

```json
{
  "domain": {
    "name": "acme",
    "path": "acme",
    "domains": [
      {
        "name": "finance",
        "path": "acme.finance",
        "domains": [
          {
            "name": "lending",
            "path": "acme.finance.lending",
            "nouns": [
              {
                "name": "Loan",
                "attributes": [
                  { "name": "amount", "type": "number", "required": true },
                  { "name": "status", "type": "enum", "values": ["pending", "active", "repaid"] }
                ],
                "verbs": [
                  { "name": "Apply" },
                  { "name": "Approve" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "capabilities": [
    { "noun": "Loan", "verb": "Apply", "name": "Loan.Apply" },
    { "noun": "Loan", "verb": "Approve", "name": "Loan.Approve" }
  ],
  "causes": [
    { "capability": "Loan.Apply", "source": "user" },
    { "capability": "Loan.Approve", "source": "user" }
  ],
  "rules": [
    { "capability": "Loan.Apply", "type": "access", "allow": [{ "role": "borrower" }] },
    { "capability": "Loan.Approve", "type": "access", "allow": [{ "role": "underwriter" }] },
    { "capability": "Loan.Approve", "type": "condition", "conditions": [{ "attribute": "loan.status", "operator": "eq", "value": "pending" }] }
  ],
  "outcomes": [
    { "capability": "Loan.Apply", "changes": [{ "attribute": "loan.status", "set": "pending" }] },
    { "capability": "Loan.Approve", "changes": [{ "attribute": "loan.status", "set": "active" }] }
  ]
}
```

## Operational Layer

Operational DNA captures the pure business-logic layer — independent of any UI, API, or deployment technology.

**Structure primitives:**
- **Noun** — a core entity of the domain (`Loan`, `Invoice`, `Order`). Has Attributes and Verbs nested inside it.
- **Verb** — an action that can be performed on a Noun (`Apply`, `Approve`, `Ship`)
- **Capability** — a Noun:Verb pair; the atomic unit of business activity (`Loan.Approve`)
- **Attribute** — a typed property on a Noun; types: `string`, `text`, `number`, `boolean`, `date`, `datetime`, `enum`, `reference`
- **Domain** — a dot-separated hierarchy that organizes Nouns into bounded contexts (`acme.finance.lending`)
- **Relationship** — a named, directed, typed connection between two Nouns (cardinality + reference attribute)

**Behavior primitives:**
- **Cause** — what initiates a Capability; sources: `user`, `schedule`, `webhook`, `capability`
- **Rule** — constraints on a Capability: `access` (who may perform it) or `condition` (what must be true first)
- **Outcome** — state changes and downstream triggers after a Capability executes
- **Signal** — a named domain event published after a Capability; carries a typed payload contract
- **Equation** — a named, technology-agnostic computation (implemented by a Technical Script)

**SOP primitives:**
- **Position** — an organizational job title; carries Roles (defined in Product Core)
- **Person** — an individual filling a Position (the org roster)
- **Task** — a Position performing exactly one Capability
- **Process** — a named, owned DAG of Tasks (Standard Operating Procedure)

## Product Layer

Product DNA describes what gets built. It is split into three sub-layers that can be authored independently.

**Core** (`product.core.json`) — materializes Operational concepts into product primitives: `Resource`, `Action`, `Operation`, `Role`, `Field`

**API** (`product.api.json`) — REST surface: `Endpoint`, `Namespace`, `Param`, `Schema`

**UI** (`product.ui.json`) — web surface: `Layout`, `Page`, `Route`, `Block`

## Technical Layer

Technical DNA (`technical.json`) describes how the system is deployed and wired together.

Primitives: `Cell`, `Construct`, `Environment`, `Node`, `Connection`, `Zone`, `Provider`, `Variable`, `Output`, `Script`, `View`

A **Cell** is the unit of deployment — it consumes DNA from upper layers and generates concrete artifacts (API code, database migrations, infrastructure templates).

## Packages

| Package | Purpose |
|---------|---------|
| [`packages/schemas`](packages/schemas) (`@dna-codes/schemas`) | Canonical JSON Schema (Draft 2020-12) definitions for all three layers — language-agnostic, zero deps |
| [`packages/core`](packages/core) (`@dna-codes/core`) | TypeScript bindings + per-layer and cross-layer validator; wraps `@dna-codes/schemas` |
| [`packages/input-json`](packages/input-json) (`@dna-codes/input-json`) | Infers Nouns, Attributes, and Relationships from a plain JSON data sample |
| [`packages/input-openapi`](packages/input-openapi) (`@dna-codes/input-openapi`) | Parses an OpenAPI 3.x spec (JSON) into a DNA Product API document |
| [`packages/output-markdown`](packages/output-markdown) (`@dna-codes/output-markdown`) | Renders DNA documents as structured markdown documentation |
| [`packages/output-html`](packages/output-html) (`@dna-codes/output-html`) | Renders DNA documents as semantic HTML (same sections as output-markdown) |
| [`packages/output-mermaid`](packages/output-mermaid) (`@dna-codes/output-mermaid`) | Renders DNA as Mermaid diagrams (ERDs from Nouns + Relationships, flowcharts from Processes) |

### Naming convention

Adapters follow the pipeline `[source] → input format → DNA → output format → [destination]`:

- **`input-<format>`** / **`output-<format>`** — format converters (DNA ↔ JSON, YAML, markdown, …). Pure, deterministic, local — no credentials or network.
- **`source-<system>`** / **`destination-<system>`** — system integrations (Google Meet, Notion, GitHub, …). Talk to external APIs; carry auth, rate limits, and their own release cadence. Lives outside `@dna-codes/*` for now.

Rule of thumb: if you point it at a string or file, it's a format adapter; if it needs credentials or a network round-trip, it's a system adapter.

Full API reference and layer-specific authoring contracts live in [`packages/core/docs/`](packages/core/docs/).
