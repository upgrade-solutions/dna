# Operational Layer Agents

Agents scoped to the Operational DNA layer. Operational DNA is **organizational modeling** — the People (Person, Role, Group, Membership), Entities (Resource, Attribute, Relationship), and Activities (Operation, Task, Step, Process, Trigger, Rule, Outcome) that describe *what an organization is and does* — independent of how it's surfaced or deployed.

The layer is modeled around the **Actor > Action > Subject** triad. Roles act; Subjects (any noun primitive — Resource, Person, Role, or Group) receive actions. Each noun primitive shares the same base shape (`name`, `attributes[]`, `actions[]`, optional `parent`); Role adds `scope`/`system`/`resource`; Membership is a separate eligibility shape (`person`, `role`, optional `group`). An Operation is a `Target.Action` pair (the atomic unit of business activity). The Actor is supplied by Rule (access) and Task (assignment).

## Agent: `operational-dna-architect`

Owns authoring and evolving a domain's `operational.json`. Available as a Claude Code sub-agent type (`operational-dna-architect`) and invokable via `cba agent operational/AGENTS.md` once that CLI lands.

### Scope — what this agent owns

- Translating domain research (real-world processes, reference sources, stakeholder interviews) into Operational primitives
- Producing a single `operational.json` that passes `cba validate --layer operational`
- Iterating the primitive set as research reveals new Resources/Operations/Rules
- Ensuring the domain hierarchy in `Domain.hierarchy` correctly nests under the platform root

### Inputs

- A `prompt.md` or equivalent research brief for the domain (e.g. `dna/torts/marshall/prompt.md`)
- Any referenced external sources (URLs, PDFs, transcripts) — the agent is expected to fetch and read them
- Existing `operational.json` in the target directory, if one exists (agent edits in place)

### Outputs

- **`operational.json`** at the target domain directory (e.g. `dna/torts/marshall/operational.json`)
- Must validate against `@dna-codes/schemas/operational/operational.json`
- Must pass cross-layer validation (`cba validate`) against any existing product layer

### Primitives owned

All Operational primitives — see `@dna-codes/schemas/operational/*.json` for the canonical list. Organized in three categories plus the bounded-context wrapper:

- **People**: `Person`, `Role`, `Group`, `Membership`
- **Entities**: `Resource`, `Attribute`, `Relationship`
- **Activities**: `Operation`, `Task`, `Step`, `Process`, `Trigger`, `Rule`, `Outcome`
- **Cross-cutting**: `Domain`

History: `Lifecycle` was removed in favor of explicit Operation state transitions expressed through `Outcome.changes`. `Capability` was renamed to `Operation`; `Cause` was renamed to `Trigger`. `User` was dropped (instance-level identity is a Product/Technical concern). Person, Role, Group, and Membership were promoted from earlier structural-typing-on-Resource into first-class primitives. `Signal` and `Equation` were removed — Signals were emit-only with no consumer in any example, Equations were unused; see `openspec/changes/remove-signal-and-equation/`. State changes now live exclusively in `Outcome.changes`; there is no first-class event primitive.

### Why these primitives — characteristics

The five noun primitives (Resource, Person, Role, Group, Process) aren't differentiated by their schemas alone — they're differentiated by **which slots they can fill in the rest of the model**. Each is a well-known combination of characteristics:

| Characteristic | What it enables |
|---|---|
| **targetable** | Can be `Operation.target` — state mutates here |
| **actorable** | Can be `Task.actor` / `Rule.allow[].role` — it acts on others |
| **scopeable** | Can be `Role.scope` — Roles are exercised within it |
| **memberable** | Can be `Membership.role` — a position someone fills |
| **executable** | Has steps and orchestration (Process-like lifecycle) |

| Primitive | targetable | actorable | scopeable | memberable | executable |
|---|---|---|---|---|---|
| Resource | ✓ |  |  |  |  |
| Person | ✓ | ✓ | ✓ |  |  |
| Group | ✓ |  | ✓ |  |  |
| Role | ✓ | ✓ |  | ✓ |  |
| Process | ✓ |  |  |  | ✓ |

This is documentation of the validator's actual gate logic. Every noun is targetable; only Roles and Persons are actorable; Groups and Persons are scopeable (a Role can be scoped to a population — `Engineers` — or to a specific Person — `AttendingPhysician.scope = Patient`); only Roles are memberable; only Processes are executable. A future primitive earns its place by combining characteristics in a way the existing five don't cover. Vocabulary preferences (Position vs Role, Individual vs Person) are surface concerns — keep schema names canonical and let `output-*` adapters apply a `rename` map.

### Must not touch

- **Product layer** — `product.core.json`, `product.api.json`, `product.ui.json`. Surface decisions belong to the product-layer agents.
- **Technical layer** — cells, constructs, providers, environments. Stack decisions belong to `technical-stack-designer`.
- **Generated output** — `output/` is owned by per-cell agents during `cba develop`.

### Hand-off

When `operational.json` is settled and validates, hand off to **`product-core-materializer`** (see `product/AGENTS.md`). The materializer reads `operational.json` and produces `product.core.json` — a self-contained slice of operational DNA that downstream layers consume.

### Tools

- `cba validate --layer operational --dna <path>` — validates a single operational.json
- `cba validate --dna <domain-dir>` — cross-layer validation against any existing product/technical DNA
- Read/Write/Edit for `operational.json` itself
- WebFetch for reference sources named in the prompt

### Role hierarchy

`Role.parent` declares position hierarchy (e.g., `SeniorUnderwriter.parent = Underwriter`). Semantics:

- **Scope inheritance**: a child Role with no `scope` inherits its parent's effective scope (the validator walks the chain to root).
- **Narrower-or-equal subset rule**: if a child declares its own `scope`, every entry must be narrower-or-equal to some entry in the parent's effective scope. Group→Group narrows when the child's `Group.parent` chain reaches the parent Group; Person→Person passes only on equality; Person→Group never narrows.
- **No action inheritance**: each Role's `actions[]` is exactly what's declared on that Role. A child does NOT see the parent's actions.
- **No Membership widening**: a Membership for `Underwriter` does NOT cover `SeniorUnderwriter`. Memberships reference Roles by exact name.
- **Cycles rejected**: `A.parent = B`, `B.parent = A` (and longer cycles) fail validation; the cycle suppresses the subset check on its members to avoid cascading errors.

These semantics shipped via the `add-role-hierarchy` OpenSpec change.

### Invariants

1. **Single source of truth**. `operational.json` is authoritative for business logic. Product core is derived from it, not the other way around.
2. **No surface leakage**. Operational primitives never mention REST paths, React components, databases, or cloud resources.
3. **Every Operation pairs a Resource with an Action**; every Action belongs to a Resource; every Rule references a real Operation or Attribute. An Action without a Resource is invalid — the atomic unit of business activity is always `Resource.Action`. Cross-references must resolve.
