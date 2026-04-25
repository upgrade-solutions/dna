# DNA ↔ Event Storming

How **Event Storming** workshop output translates into DNA. Event Storming (Alberto Brandolini, 2013) is a collaborative discovery technique — teams cover a wall with colored sticky notes representing what happens in their domain. The output is structurally close to DNA: the colors map almost 1:1.

> Unlike the [BPMN](./bpmn.md), [DDD](./ddd.md), and [ArchiMate](./archimate.md) docs in this folder, this one isn't a notation comparison — Event Storming has no formal notation. It's a workshop. This doc explains how to take a wall full of stickies and produce a valid Operational DNA document.

## The sticky-note color → DNA mapping

The "Big Picture" + "Process Modeling" levels of Event Storming use a stable color vocabulary across most facilitators:

| Sticky | Workshop name | DNA primitive |
|---|---|---|
| 🟧 Orange | **Domain Event** ("OrderPlaced", "PaymentReceived") | `Signal` (when cross-domain) + `Outcome.emits` (the publish point); the Operation that *produced* the event becomes an `Operation` |
| 🟦 Blue | **Command** ("PlaceOrder", "ApprovePayment") | `Operation` (Resource.Action) — the verb side becomes `Action`, paired with a Resource |
| 🟨 Yellow | **Actor** / **User** ("Customer", "Underwriter") | `Resource` referenced as actor — typically used as a Role on `Task.actor` and `Rule.allow[].role` |
| 🟪 Lavender / Purple | **Policy** ("Whenever X happens, then Y is initiated") | `Trigger` (`source: signal` or `source: operation`) targeting the downstream Operation/Process |
| 🟩 Light green | **Read Model** / **Information** ("Pending Orders dashboard") | Not in Operational DNA — surface as a Product UI Page or a Product API Endpoint at the next layer down |
| 🟫 Tan / Brown | **Aggregate** ("Order", "Account") | `Resource` (with attributes and actions) |
| 🟥 Red / Pink | **Hot spot / Question** ("not sure who owns this") | Not modeled — a workshop artifact, not a DNA primitive. Resolve before authoring DNA. |
| 🌐 Wide-light-blue | **External system** ("Stripe", "Salesforce") | `Resource` representing the external system + `Trigger` (`source: webhook`) for inbound events; or a separate `Domain` for the integration |

## Mapping a finished wall

A fully-Stormed slice of a domain reads left-to-right as a *narrative* — Actor places a Command, an Aggregate handles it, a Domain Event is published, a Policy reacts and triggers the next Command. That narrative collapses into DNA pieces in a deterministic way:

```
[Yellow Actor] —issues→ [Blue Command] —against→ [Tan Aggregate] —emits→ [Orange Event]
                                                                                 ↓
                                                                       [Purple Policy]
                                                                                 ↓
                                                                       [Blue Command]
```

becomes:

```
Resource (the Aggregate) {
  attributes: [...]
  actions: [Command verb]
}
Operation { resource: <Aggregate>, action: <Command verb>, name: "Aggregate.Verb" }
Resource (the Actor) — referenced from Rule.allow + Task.actor
Rule { operation: "Aggregate.Verb", type: "access", allow: [{role: <Actor>}] }
Outcome { operation: "Aggregate.Verb", changes: [...], emits: ["domain.Aggregate.PastTenseVerb"] }
Signal { name: "domain.Aggregate.PastTenseVerb", operation: "Aggregate.Verb", payload: [...] }
Trigger { operation: <next-Command's Operation>, source: "signal", signal: "domain.Aggregate.PastTenseVerb" }
```

Every Storming chain across the wall produces one of these blocks; multiple chains compose into a full `operational.json`.

## Where the workshop output exceeds DNA

- **🟥 Hot spots** — questions, parking-lot items, contested ownership. These are the most valuable artifacts of the workshop and have no place in the resulting DNA. Resolve them with the team before authoring; the DNA is the post-decision artifact.
- **🟩 Read models** — "we need a dashboard of pending orders" is a UI/API requirement, not Operational. It maps to Product UI `Page` or Product API `Endpoint` at the next layer, not to anything in `operational.json`.
- **Bounded-context boundaries** — the wall typically gets divided into bounded contexts late in the workshop. These become DNA `Domain` nodes (`acme.finance.lending`); the boundary itself isn't a primitive but a path-prefix convention.
- **Chronological order** — the wall is laid out left-to-right by *when* things happen. DNA is unordered (collections are sets) — Triggers and Outcome.emits/initiates encode the chronology where it matters; the rest is graph-shaped, not timeline-shaped.

## Where DNA exceeds the workshop output

- **Scoping (Memberships + Role.scope)** — Event Storming captures Actors but not their *Group context*. "Underwriter" on a sticky doesn't tell you Underwriter-of-what. DNA forces you to declare Group-Resources and pin Memberships through them; the workshop typically discovers this implicitly and never writes it down.
- **Step-level orchestration (Process)** — Storming chains Commands via Policies, which is graph-shaped. DNA's `Process` introduces explicit `startStep`, `depends_on`, `conditions`, and `else` — useful for the SOPs you'll generate runnable workflows from. If your wall has a clear linear/branching flow, lift it into a Process; otherwise leave it as a chain of Policies (Triggers).
- **Typed Signal payloads** — Event Storming events carry an implicit "what data does this carry" question. DNA's `Signal.payload` is mandatory typed contracts. Workshop teams often leave this as "we'll figure it out" — DNA forces the answer.

## Recommended workflow

1. **Run Event Storming as you normally would.** Don't try to bake DNA structure into the workshop — that interferes with the discovery purpose.
2. **At workshop end, take photos of the wall.** Resolve hot spots offline.
3. **Translate the wall into DNA in one pass**, color by color:
   - Tan stickies → declare `Resource` with the attributes and actions called out.
   - Blue stickies → declare `Operation` (Resource.Action) for each.
   - Orange stickies → declare `Signal` (with payload — go back to the team for any unclear contract) and add to the producing Operation's `Outcome.emits`.
   - Yellow stickies → declare `Resource` (acting as Role); set `scope` if a Group context is implied.
   - Purple stickies → declare `Trigger` linking the producing Signal to the consuming Operation.
   - Light-green stickies → defer to the Product layer (UI Pages, API Endpoints).
4. **Validate with `@dna-codes/core`.** Cross-layer validation catches reference errors (a Trigger pointing at an undeclared Signal, etc.).
5. **Iterate.** The first DNA pass usually surfaces gaps in the wall (un-scoped Roles, missing payload fields). Run a short follow-up with the team.

## Concrete translation example

A small Event Storming chain:

```
[Customer 🟨] —places→ [PlaceOrder 🟦] → [Order 🟫] —emits→ [OrderPlaced 🟧]
                                                                    ↓
                                                          [Whenever order placed,
                                                           charge payment 🟪]
                                                                    ↓
                                                       [ChargePayment 🟦] → [Payment 🟫]
                                                                    ↓
                                                            [PaymentCharged 🟧]
```

Translates to:

```json
{
  "domain": { "name": "checkout", "path": "shop.checkout", "resources": [
    { "name": "Order", "attributes": [...], "actions": [{ "name": "Place" }] },
    { "name": "Payment", "attributes": [...], "actions": [{ "name": "Charge" }] },
    { "name": "Customer" }
  ]},
  "operations": [
    { "resource": "Order", "action": "Place", "name": "Order.Place" },
    { "resource": "Payment", "action": "Charge", "name": "Payment.Charge" }
  ],
  "rules": [
    { "operation": "Order.Place", "type": "access", "allow": [{ "role": "Customer" }] }
  ],
  "outcomes": [
    { "operation": "Order.Place",   "changes": [...], "emits": ["checkout.Order.Placed"] },
    { "operation": "Payment.Charge","changes": [...], "emits": ["checkout.Payment.Charged"] }
  ],
  "signals": [
    { "name": "checkout.Order.Placed",     "operation": "Order.Place",   "payload": [{"name":"order_id","type":"string"}] },
    { "name": "checkout.Payment.Charged",  "operation": "Payment.Charge","payload": [{"name":"payment_id","type":"string"}] }
  ],
  "triggers": [
    { "operation": "Order.Place",    "source": "user" },
    { "operation": "Payment.Charge", "source": "signal", "signal": "checkout.Order.Placed" }
  ]
}
```

The Policy ("whenever order placed, charge payment") becomes a `Trigger` with `source: signal` on the downstream Operation. The Aggregate, the Command, and the Domain Event all map deterministically.

## See also

- [DDD](./ddd.md) — Event Storming was developed within the DDD community; the Aggregate / Bounded Context language carries over directly.
- [BPMN](./bpmn.md) — for converting the linear-narrative parts of a wall into a workflow notation.
