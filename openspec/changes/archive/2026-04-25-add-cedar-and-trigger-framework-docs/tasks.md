## 1. Cedar comparison doc

- [x] 1.1 Create `docs/frameworks/cedar.md` following the four-section structure (concept mapping table → "Where DNA intentionally differs" → concrete translation example → "See also").
- [x] 1.2 Mapping table covers Cedar's `principal`, `action`, `resource`, `when`/`unless` conditions, `permit`/`forbid` effects, and entity/schema concepts. Note in the row that DNA has no schema/entity-store analog.
- [x] 1.3 "Intentionally differs" section covers at least: Cedar's `forbid` policies (DNA only has positive `Rule.allow`), Cedar's policy-evaluation engine (DNA is a description language, not a runtime), Cedar's entity store (DNA leaves identity to product/technical layers).
- [x] 1.4 Translation example: a Cedar `permit (principal in Role::"Underwriter", action == Action::"Approve", resource is Loan)` policy → DNA `Rule.allow` on `Loan.Approve`. Reference `examples/lending/operational.json` so a reader can cross-check.
- [x] 1.5 "See also" links: at least the framework README, plus DDD (closest semantic neighbor) and Event Storming (since both speak about commands/events).
- [x] 1.6 Length cap: target 150–250 lines. If approaching 300, trim by deferring fine-grained Cedar features to a footnote.

## 2. Triggers and events comparison doc

- [x] 2.1 Create `docs/frameworks/triggers-and-events.md` covering n8n, Zapier, GitHub Actions, and EventBridge in one file.
- [x] 2.2 Per-tool mini-mapping-tables: one table per tool, each row showing how DNA's `Trigger.source` values (`user | schedule | webhook | operation`) map to that tool's equivalent. Use one explicit "no equivalent" cell when a tool genuinely lacks an equivalent (e.g., EventBridge has no concept of "user-initiated").
- [x] 2.3 n8n table: map to Manual / Schedule / Webhook / App-Trigger nodes and to chained-Operation analogs (no exact equivalent — n8n chains via execution data, not a Trigger primitive).
- [x] 2.4 Zapier table: map to "Run Zap" / Schedule / Webhook / "New X in service Y" templates.
- [x] 2.5 GitHub Actions table: map to `workflow_dispatch` / `schedule` / `repository_dispatch` / `push`/`pull_request`/etc.
- [x] 2.6 EventBridge table: map to API Destinations / scheduled rules / event-pattern rules (note the gap with DNA's coarser model). Mark the "user" source as "no equivalent" — EventBridge isn't human-initiated.
- [x] 2.7 Single "Where DNA intentionally differs" section covers: EventBridge's expressive event-pattern filtering (DNA has none), Zapier's per-app trigger templates (DNA is tool-agnostic), n8n's data-flow between nodes (DNA stops at Trigger declaration; orchestration is via Process). One paragraph per omission.
- [x] 2.8 Single concrete translation example: a GitHub Actions `on: push` block → DNA `Trigger { source: "webhook", operation: "Code.Push" }` (or similar). Show both in code blocks.
- [x] 2.9 "See also" links: framework README, plus BPMN (Process orchestration sibling), Event Storming (Trigger ≈ Policy sticky).

## 3. Framework README update

- [ ] 3.1 In `docs/frameworks/README.md`, add a row to the index table for Cedar: `| [Cedar](./cedar.md) | Authorization policy that you'd write next to DNA, not instead of | Cedar's `permit (principal, action, resource)` ≈ DNA's Rule.allow + Operation triple; Cedar's entity/schema concept has no DNA analog (DNA leaves identity to product/technical layers) |`. Adjust the wording to match the surrounding cell tone.
- [ ] 3.2 Add a row for triggers-and-events: `| [Triggers and events](./triggers-and-events.md) | Picking a tool to fire DNA Triggers — n8n, Zapier, GitHub Actions, EventBridge | DNA's `Trigger.source: user \| schedule \| webhook \| operation` lines up cleanly with all four tools' entry-point primitives; tool-specific filtering (e.g., EventBridge event patterns) is intentionally outside DNA |`. Same wording-check.
- [ ] 3.3 If the README's "Deferred" or "Coverage status" section mentions Cedar or any of these trigger tools, remove those mentions.
- [ ] 3.4 Don't restructure the README beyond the table additions and minor "Deferred" cleanup.

## 4. Wrap-up

- [ ] 4.1 Render-check both new docs by opening them in a markdown viewer (or `cat`/visual inspection) — confirm no broken syntax, missing closing tags, or table misalignment.
- [ ] 4.2 Run `npx openspec validate add-cedar-and-trigger-framework-docs` to confirm the OpenSpec artifacts pass.
- [ ] 4.3 Commit the three files (cedar.md, triggers-and-events.md, README.md) with one conventional message focused on "add framework comparisons".
