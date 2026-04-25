## Why

`docs/frameworks/` already covers BPMN 2.0, DDD, ArchiMate 3, C4, Event Storming, and TOGAF — but two of the most-cited cousins are missing:

- **AWS Cedar**: nearest semantic neighbor. Cedar's `permit (principal, action, resource) when { ... }` is essentially DNA's Actor.Action.Resource triple as an authorization policy. Teams already running Cedar will ask "isn't this just Cedar?" — answering inline saves a recurring conversation.
- **Trigger / event-driven workflow tools** (n8n, Zapier, GitHub Actions, EventBridge): the `Trigger` primitive's design lineage. Without a comparison page, the four `Trigger.source` values (`user | schedule | webhook | operation`) read as arbitrary instead of as a reflection of how every popular workflow tool models event entry points.

Both gaps were identified in the recent examples-and-frameworks audit. Pure docs change — no schema or code touch.

## What Changes

- **New**: `docs/frameworks/cedar.md` — concept-by-concept mapping table for Cedar's policy primitives, where DNA intentionally differs (no schemas/principals as separate concept, no entity-store concept), and a small "permit Underwriter to Approve a Loan" → DNA Rule translation example
- **New**: `docs/frameworks/triggers-and-events.md` — single combined doc covering n8n, Zapier, GitHub Actions, and EventBridge. One mapping mini-table per tool showing how DNA's four `Trigger.source` values map to that tool's equivalent, then a single "Where DNA intentionally differs" section and a single concrete example
- **Update**: `docs/frameworks/README.md` — add two rows to the index table; remove `cedar` and trigger systems from any "Deferred" list; keep the rest of the README intact

## Capabilities

### New Capabilities
<!-- None — `docs/frameworks/` is reference documentation, not a versioned capability of the DNA language itself. -->

### Modified Capabilities
<!-- None. -->

## Impact

- **Files**: 2 new markdown files + 1 updated index → no code, no schema, no tests
- **Risk**: low — docs only; no behavior change. Worst case is a phrasing edit later
- **Reviewability**: each doc follows the existing `docs/frameworks/*.md` structure (mapping table → intentional differences → concrete example → see also), so the diff matches established convention
