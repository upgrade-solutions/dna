# Manufacturing — example DNA

Discrete-manufacturing assembly line with multiple system actors (machines) and parallel-step orchestration. Stress-tests system actor density and DAG fan-out/fan-in.

## What this example demonstrates

- **System actors as first-class Resources**: `CncMachine`, `StampingPress`, `PaintRobot`, `MaintenanceScheduler` — all Resources, all referenced as actors on Operations. No `system: true` flag, no separate primitive — usage tells you.
- **Parallel Steps converging at a Step**: `stamp` and `paint` both `depends_on: ["cut"]`, then `inspect` `depends_on: ["stamp", "paint"]` — fan-out and fan-in expressed by the depends_on graph alone. AND-join semantics fall out of multiple predecessors. No explicit gateway primitive needed.
- **Schedule-source Trigger on a system actor's Operation**: `WorkOrder.Cut` has a `*/15 * * * *` Trigger because the CncMachine polls the queue. Same Operation also has an `access` Rule restricting it to CncMachine — Trigger and access stay independent, both required.
- **Operation-chain Trigger**: filing a `DefectReport` automatically fires `WorkOrder.Reject` (`source: operation, after: DefectReport.File`). Demonstrates Operation → Operation chaining alongside Process kickoff via `source: operation`.
- **One human, two memberships in two Shifts**: `AlexFirstShift` is `ShiftSupervisor` on day shift AND `QualityInspector` on overnight — same person playing different Roles in different temporal Groups.
- **Step.else as terminal abort**: `complete` requires `InspectionPassed`; if not, the Process aborts (no sibling step routing).

## What this example deliberately omits

- Material/inventory primitives (BoM, raw materials) — would multiply Resources without exercising new model features.
- Real-time machine telemetry (out of scope for the operational vocabulary; runtime cell concern).
- Bin packing / queue prioritization on the cut step — DNA does not currently model named computations; this would belong in a downstream cell, not Operational DNA.
