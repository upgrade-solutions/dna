# Healthcare — example DNA

Hospital inpatient ward with Patient-centered care teams. Stress-tests the Patient-as-Group pattern and multi-condition Rules.

## What this example demonstrates

- **Patient is both a Resource AND a Group**: tracked entity (id, mrn, ward, status, attributes) AND a scoping unit for the care team's Roles. `AttendingPhysician.scope = Patient`, `PrimaryNurse.scope = Patient`, `ConsultingSpecialist.scope = Patient` — all per-Patient memberships. The same Group-Resource carries clinical attributes alongside its Group role.
- **Same User across many Patient Groups**: `DrAdams` is `AttendingPhysician` on three distinct Patients AND `ConsultingSpecialist` on a fourth — four memberships, three distinct Roles, all into the same Group-Resource type. `NurseRivera` is `PrimaryNurse` on two Patients.
- **Mixed scoping in one domain**: most Roles scope to `Patient`, but `Pharmacist.scope = Pharmacy` (a different Group-Resource entirely). One Resource's Memberships can pin Roles to *different* Group types.
- **Multi-condition Rules**: `DoseWithinSafeRange` carries two predicates joined by AND on a single condition Rule (dose > 0 AND dose < 1000). Demonstrates condition compositionality at the Rule level (separate from the Step-level composition over multiple Rules).
- **Branching in the Process**: `MedicationOrderFlow.approve` either continues or routes to `reject` based on `DoseWithinSafeRange` — Step.else as named-sibling routing, not abort.
- **Process gated by aggregate state**: `DischargeFlow.discharge` requires `AllOrdersResolved` (a count check) — exercises a non-status condition and sibling Process pattern.

## What this example deliberately omits

- HIPAA / regulatory metadata (out of scope for the operational vocabulary; would belong as `description` annotations or supplementary docs).
- Time-of-day scheduling (no `schedule`-source Triggers — the hospital's MAR/eMAR clocks are runtime concerns).
- Cross-domain event emission to billing/scheduling (DNA does not currently model first-class events — see `openspec/changes/remove-signal-and-equation/`).
