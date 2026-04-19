# DNA Codes (@dna-codes)
DNA is a description language for business systems — your digital DNA. Once defined, it can be used to generate documentation, workflows, and robust software automatically.

A DSL written in JSON/YAML, it describes a business at three intentionally decoupled layers — what the business does, what gets built, and how it gets built — and provides tooling to validate those descriptions and render them as documentation.

## The Three Layers

| Layer | What it captures | Analogous to |
|-------|-----------------|--------------|
| **Operational** | What the business does — entities, capabilities, rules, SOPs | Domain-Driven Design |
| **Product** | What gets built — resources, operations, endpoints, pages | OpenAPI + Atomic Design |
| **Technical** | How it gets built — cells, constructs, providers, environments | Terraform / AWS SAM |

Layers are one-way downstream: Operational → Product → Technical. Upper layers never depend on lower ones. Cross-layer references (e.g. a Product Resource pointing at an Operational Resource) are plain strings validated by `@dna-codes/core` rather than JSON Schema `$ref`s.

Operational DNA is modeled around the **Actor > Action > Resource** triad: Resources are the things the business tracks (Loan, Invoice, Post); Actions are what gets performed on them (Apply, Approve, Publish); Actors — the humans or systems that perform them — are expressed through Positions, Roles, and Tasks rather than declared on the Capability itself. A Capability is always a `Resource.Action` pair.

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
            "resources": [
              {
                "name": "Loan",
                "attributes": [
                  { "name": "amount", "type": "number", "required": true },
                  { "name": "status", "type": "enum", "values": ["pending", "active", "repaid"] }
                ],
                "actions": [
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
    { "resource": "Loan", "action": "Apply", "name": "Loan.Apply" },
    { "resource": "Loan", "action": "Approve", "name": "Loan.Approve" }
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
- **Resource** — a core entity of the domain (`Loan`, `Invoice`, `Order`). Has Attributes and Actions nested inside it.
- **Action** — an operation performed on a Resource (`Apply`, `Approve`, `Ship`). Every Action is paired with a Resource; there is no Action without a Resource.
- **Capability** — a Resource:Action pair; the atomic unit of business activity (`Loan.Approve`)
- **Attribute** — a typed property on a Resource; types: `string`, `text`, `number`, `boolean`, `date`, `datetime`, `enum`, `reference`
- **Domain** — a dot-separated hierarchy that organizes Resources into bounded contexts (`acme.finance.lending`)
- **Relationship** — a named, directed, typed connection between two Resources (cardinality + reference attribute)

**Behavior primitives:**
- **Cause** — what initiates a Capability; sources: `user`, `schedule`, `webhook`, `capability`
- **Rule** — constraints on a Capability: `access` (who may perform it — the Actor) or `condition` (what must be true first)
- **Outcome** — state changes and downstream triggers after a Capability executes
- **Signal** — a named domain event published after a Capability; carries a typed payload contract
- **Equation** — a named, technology-agnostic computation (implemented by a Technical Script)

**SOP primitives:**
- **Position** — an organizational job title — the Actor in the Actor > Action > Resource triad; carries Roles (defined in Product Core)
- **Person** — an individual filling a Position (the org roster)
- **Task** — a Position performing exactly one Capability
- **Process** — a named, owned DAG of Tasks (Standard Operating Procedure)

## Product Layer

Product DNA describes what gets built. It is split into three sub-layers that can be authored independently.

**Core** (`product.core.json`) — materializes Operational concepts into product primitives: `Resource`, `Action`, `Operation`, `Role`, `Field`. Product `Resource` and `Action` are surface projections of their Operational counterparts — the same vocabulary is reused intentionally.

**API** (`product.api.json`) — REST surface: `Endpoint`, `Namespace`, `Param`, `Schema`

**UI** (`product.ui.json`) — web surface: `Layout`, `Page`, `Route`, `Block`

## Technical Layer

Technical DNA (`technical.json`) describes how the system is deployed and wired together.

Primitives: `Cell`, `Construct`, `Environment`, `Node`, `Connection`, `Zone`, `Provider`, `Variable`, `Output`, `Script`, `View`

A **Cell** is the unit of deployment — it consumes DNA from upper layers and generates concrete artifacts (API code, database migrations, infrastructure templates).

## Packages

### Naming convention

The pipeline is `[integration] → input-* → DNA → output-* → [integration]`:

```
   +-------------+   +----------+   +----------+   +----------+   +-------------+
   |integration-*|   |          |   |          |   |          |   |integration-*|
-->|  (reader)   |-->| input-*  |-->|   DNA    |-->| output-* |-->|  (writer)   |-->
   |             |   |          |   |          |   |          |   |             |
   +-------------+   +----------+   +----------+   +----------+   +-------------+
        [1]              [2]            [3]             [4]             [5]

  [1]  Reads from an external system (Jira, GitHub, Notion). Owns auth, rate limits, webhooks.
  [2]  Parses a format into DNA. Deterministic (JSON, OpenAPI, DDL) or Probabilistic and LLM-backed (prose, transcripts, images).
  [3]  Canonical form. Three layers (operational -> product -> technical), validated by @dna-codes/core.
  [4]  Renders DNA into a format. Pure, no I/O (markdown, Mermaid, HTML).
  [5]  Writes to an external system. Field mapping, API writes, change detection.

  The same integration-* package typically fills both [1] and [5] roles for its system.
```

- **`input-*`** — converts a format into DNA. Same input always produces same output (deterministic), unless the package requires an LLM, in which case it is probabilistic. Each probabilistic package documents its dependencies explicitly: required LLM provider, expected API keys, and non-determinism implications.
- **`output-*`** — renders DNA into a format string. No system knowledge; pure and local.
- **`integration-*`** — connects to an external system bidirectionally. Owns auth, field mapping, rate limits, and API versioning for that system. May use `input-*` or `output-*` packages internally.

Full API reference and layer-specific authoring DNA contracts live in [`@dna-codes/core/docs/`](packages/core/docs/).

Packages are published to npm. Deno 2 can consume them directly via `npm:` specifiers (e.g. `import { validate } from "npm:@dna-codes/core"`); no JSR package is published.

### Input coverage by layer

Each `input-*` package has an authoritative scope — OpenAPI honestly knows about APIs, not deployment; a JSON sample knows about entities, not rules. That narrowness is a feature: it keeps deterministic adapters from inventing. `input-text` is the catch-all LLM path that can reach any layer.

| Layer | Deterministic source(s) | Probabilistic source(s) | Status |
|---|---|---|---|
| **Operational** | `input-json` ✅ · `input-ddl` 🚧 | `input-text` ✅ | **Covered** |
| **Product Core** | `input-prisma` 💡 | `input-text` ✅ | Probabilistic only |
| **Product API** | `input-openapi` ✅ | `input-text` ✅ | **Covered** |
| **Product UI** | `input-figma` 💡 · `input-nextjs-routes` 💡 | `input-text` ✅ | Probabilistic only |
| **Technical** | `input-terraform` 💡 · `input-cdk` 💡 | `input-text` ✅ | Probabilistic only |

Probabilistic-only layers rely on LLM inference from prose; they're the weakest link in the pipeline and the highest-leverage targets for new deterministic adapters.

Legend: ✅ shipped · 🚧 planned (listed below) · 💡 candidate (natural fit, not yet committed)

**Core**

| Package | Purpose |
|---------|---------|
| `@dna-codes/schemas` | Canonical JSON Schema (Draft 2020-12) definitions for all three layers — language-agnostic, zero deps |
| `@dna-codes/core` | TypeScript bindings + per-layer and cross-layer validator; wraps `@dna-codes/schemas` |

**Input — deterministic** (pure functions, no external dependencies)

| Package | Purpose |
|---------|---------|
| `@dna-codes/input-json` | Infers Resources, Attributes, and Relationships from a plain JSON data sample |
| `@dna-codes/input-openapi` | Parses an OpenAPI 3.x spec into a DNA Product API document |
| `@dna-codes/input-ddl` | Parses SQL DDL into DNA Resources and Attributes |

**Input — probabilistic** (requires an LLM provider and API key)

| Package | Purpose |
|---------|---------|
| `@dna-codes/input-text` | Converts freeform prose into DNA |
| `@dna-codes/input-transcript` | Converts a meeting or interview transcript into DNA |
| `@dna-codes/input-image` | Infers DNA from an image (screenshot, whiteboard, diagram) |

**Output**

| Package | Purpose |
|---------|---------|
| `@dna-codes/output-markdown` | Renders DNA as structured markdown documentation |
| `@dna-codes/output-mermaid` | Renders DNA as Mermaid diagrams (ERDs, flowcharts) |
| `@dna-codes/output-html` | Renders DNA as semantic HTML |
| `@dna-codes/output-text` | Renders DNA as plain prose — one combined document or one per unit (Capability/Resource/Process) for integration writers |

**Integrations**

| Package | Purpose |
|---------|---------|
| `@dna-codes/integration-jira` | Bidirectional Jira Cloud integration: Epic → `input-text` → DNA → `output-text` → Stories |
| `@dna-codes/integration-github` | Read/write DNA via GitHub Issues and Projects |
| `@dna-codes/integration-notion` | Read/write DNA via Notion pages and databases |

**Templates**

Reference implementations for engineers and AI agents. Each ships an `AGENTS.md` with fork instructions.

| Package | Purpose |
|---------|---------|
| `@dna-codes/input-example` | Template for a new `input-*` — shows deterministic and probabilistic modes side-by-side |
| `@dna-codes/output-example` | Template for a new `output-*` renderer with a sections pattern |
| `@dna-codes/integration-example` | Template for a new `integration-*` — outbound API, inbound webhook (HMAC), and a CLI |

See the root [`AGENTS.md`](AGENTS.md) for overall repo orientation.
