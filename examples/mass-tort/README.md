# Mass-tort — example DNA

Legal docket / mass-tort case management. Each Case is the scoping Group for the legal team; same Users hold different Roles across multiple Cases.

## What this example demonstrates

- **Resource as Group**: `Case` is both a tracked Resource (id, docket_number, status) AND a Group that scopes Role memberships. No `type` field needed — usage tells you.
- **Resource as Actor**: `Claimant` is a tracked structure with attributes AND the Actor that performs `Filing.Submit` (when accessible). Same Resource/Actor duality pattern as Customer in ecommerce.
- **Memberships pin Roles in Groups**: `JaneEsq` holds `LeadCounsel` in one Case AND `CoCounsel` in another. Same person, different Roles, different Groups — the 3-way relationship made concrete.
- **Role.scope enforcement**: `LeadCounsel.scope = Case` — the validator catches any Membership pinning LeadCounsel to anything other than a Case.
- **Per-Case Role constraints (modeling-layer declarations)**: `LeadCounsel` and `Judge` declare `cardinality: "one", required: true` (exactly one per Case); `LeadCounsel.excludes = ["CoCounsel"]` so the same Partner can't be both Lead and Co-counsel on the same Case. The validator checks well-formedness; runtime systems enforce assignment counts.
- **Two Process-targeted Triggers**: one `user`-source for `ClaimantIntake`, one `operation`-source (`after: Settlement.Accept`) for `SettlementDisbursement`. Demonstrates Process kickoff via both human action and Operation chaining.
- **Multi-Process domain**: two distinct Processes — `ClaimantIntake` and `SettlementDisbursement` — sharing the same `LeadCounsel` operator and Tasks across the same Case Group.

## Real-world reference

Modeled loosely on the Marshall Fire Justice (MFJ) docket — multiple parallel Cases against the same defendant, shared legal team, individualized Settlements per Claimant.
