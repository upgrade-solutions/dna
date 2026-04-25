## Context

`docs/frameworks/` follows a consistent per-framework pattern: each file covers one source framework (BPMN, DDD, ArchiMate, C4, Event Storming, TOGAF), shares a four-section structure (mapping table → intentional differences → translation example → see-also), and is linked from the framework README's index table.

This change adds two more pages, but the second one (triggers/events) intentionally breaks the "one tool per page" pattern. That's the only meaningful design decision.

## Goals / Non-Goals

**Goals:**
- Cover Cedar with the same structure and depth as existing per-framework docs (~150–250 lines)
- Cover the four major trigger/event tools (n8n, Zapier, GitHub Actions, EventBridge) in a single combined doc that's still useful to someone fluent in any one of them
- Keep the framework README readable — no new sections, just two rows added to the existing table
- Zero code/schema/test impact

**Non-Goals:**
- Comprehensive coverage of Cedar's full policy language (entity stores, schemas, JSON syntax variants) — focus on the primitives that map to DNA
- A doc per trigger tool — would be 4 files of mostly-redundant content
- Defending DNA's choices against framework features it doesn't have — the "intentionally differs" section is for explaining tradeoffs, not for advocacy
- Touching the Trigger schema or semantics — comparison only

## Decisions

### 1. One combined `triggers-and-events.md`, not four per-tool files

Per-tool would mean four files with ~80% identical content (every doc would explain DNA's `Trigger.source` enum and its four values, then map their tool's equivalents in turn). Combined keeps the explanation in one place and lets readers compare tools side-by-side.

The combined doc trades against the existing convention of "one file per source framework" — accepted because:
1. n8n / Zapier / GHA / EventBridge are *implementations* of the same idea (event-driven workflow triggers), not different conceptual frameworks
2. Side-by-side comparison is more useful for the "which trigger tool maps to DNA?" question
3. The framework README can still link the doc once with a clear "covers four tools" note

**Rejected alternative:** Four per-tool files. Rejected on the redundancy ground above.

**Rejected alternative:** Add only one tool (e.g., n8n alone). Rejected because the value is in the comparison — picking one tool would feel arbitrary.

### 2. Cedar gets its own page

Cedar isn't a workflow trigger system — it's an authorization policy language. It maps to DNA's `Rule.allow` and the underlying Operation triple, not to `Trigger`. Different conceptual neighborhood, different page. Same structure as the other per-framework docs.

### 3. Mapping-table shape

Existing docs use a single concept-by-concept table. The triggers doc breaks this into one mini-table per tool because each tool has a different vocabulary for the same concepts (n8n "Trigger nodes", Zapier "Triggers", GHA `on:` blocks, EventBridge "rules with event patterns"). Forcing them into a single combined table would either bloat the rows (one row per concept × four tool columns) or lose the per-tool grouping that makes each tool's mapping legible.

Cedar's doc uses the standard single-table shape since there's only one source vocabulary.

### 4. Concrete examples

Each doc gets exactly one concrete translation example. Cedar's example is `permit Underwriter to Approve Loan when ...` → DNA Rule + Operation. The triggers doc's example is "GitHub Action that runs on a push to main" → DNA Trigger with `source: webhook`. Both examples should be ~10–20 lines each, no more.

### 5. README index update is mechanical

Add two rows to the existing framework table. Match the existing row format exactly: `| [Name](./file.md) | When you'd reach for it | DNA mapping |`. No restructuring of the README beyond that.

## Risks / Trade-offs

- **Risk**: Cedar's surface area is large; it's tempting to over-document. → Mitigation: scope cap of ~250 lines for the doc; if it grows past that during apply, trim by deferring fine-grained features (entity stores, schema validation) to a "see Cedar's docs" footnote.
- **Risk**: The four trigger tools evolve quickly; the doc could go stale. → Mitigation: keep mappings to *primitives* (e.g., "n8n Webhook Trigger node" rather than "n8n's specific HTTP path conventions"). Stable primitives age better than tool-specific syntax.
- **Risk**: A reader interprets the comparison as "DNA is competing with Cedar / EventBridge". → Mitigation: lead each doc's intro with what DNA *is* (a description language) versus what the source is (a policy engine, an event router). The "see also" section can point to where these compose, not compete.
