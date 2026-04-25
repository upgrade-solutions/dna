# Lending — example DNA

Consumer lending domain. The "default" example most readers will see first — covers the standard end-to-end flow without exotic shapes.

## What this example demonstrates

- **Operations**: Resource.Action atomic units (`Loan.Apply`, `Loan.Approve`, `Loan.Disburse`).
- **Triggers** at both granularities: an Operation-level trigger (Borrower invokes `Loan.Apply` directly) AND a Process-level trigger (the full `LoanOrigination` SOP fires from a CRM webhook). Same first-step Operation, two distinct entry points.
- **System actor**: `NightlyDelinquencySweep` is a Resource referenced from a `schedule`-source Trigger and the `Loan.Default` access rule. No special primitive needed — system actors are Resources like any other.
- **Role with scope**: `Underwriter.scope = BankDepartment` — the Underwriter Role can only be exercised within a BankDepartment Group.
- **Step-level conditions referencing Rules**: `step.conditions: ["ApplicationIsPending"]` instead of inline expressions.
- **Step-level `else` routing**: `disburse` aborts the Process if `LoanIsApproved` doesn't hold.
- **Process with explicit `startStep`**.
- **Signal published from an Outcome**: `lending.Loan.Disbursed` carries a typed payload contract.

## What this example deliberately omits

- Memberships (no User-Resources are declared — see `mass-tort` and `marketplace` for that).
- Resource/Role duality (see `marketplace` — Customer is both).
- Multi-Group scoping (see `marketplace` — same User in multiple Groups).
