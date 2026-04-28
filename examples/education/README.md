# Education — example DNA

University CS department academics. Stress-tests time-bounded Group memberships (a course-in-a-semester is a distinct Group from the same course in a different semester) and multi-Group memberships of the same User in the same time period.

## What this example demonstrates

- **Course vs CourseOffering**: stable catalog `Course` (CS101 "Intro to Programming") separate from time-bound `CourseOffering` (CS101 Spring 2026 Section 1). The CourseOffering is the Group; the Course is just a tracked structure. Demonstrates that "the time-bound thing" is the right scoping unit, not the catalog entry.
- **Same User, different Roles in different CourseOfferings, same semester**: `DrPatel` is `Instructor` of two CourseOfferings AND `Student` (auditing) in a third — all spring-2026, all simultaneously valid memberships. The 3-way model handles this without any "primary role" or temporal disambiguator.
- **Mixed Group scopes**: most Roles scope to `CourseOffering`, but `DepartmentChair.scope = Department` and `Registrar` is unscoped (global). Three different scoping tiers in one domain.
- **Per-Department Role constraint (modeling-layer declaration)**: `DepartmentChair` declares `cardinality: "one"` (at most one chair per Department). Records the convention in the model rather than as prose only.
- **Calendar-driven Triggers**: `CourseOffering.Begin` fires on a January cron (`0 0 * 1 *`); `SemesterFinalization` Process fires mid-May (`0 0 15 5 *`). Demonstrates real-world scheduling against the academic calendar.
- **Process gated by ownership semantics**: `Coursework.Submit` is restricted to `{ role: Student, ownership: true }` — students can only submit their own assignments. Same Role, instance-level enforcement.
- **Sibling rule patterns**: `OfferingIsOpen`, `SeatsAvailable`, `OfferingInSession`, `AllCourseworkGraded` — a richer condition-Rule library showing how named, reusable Rules accumulate as a domain matures.

## What this example deliberately omits

- Grade-letter calculation — DNA does not currently model named computations; this would belong in a downstream cell, not Operational DNA.
- Prerequisites (modelable as `Relationship`s between Courses + a condition Rule on Enrollment.Request — out of scope here).
- Major/program/degree-audit primitives — would expand the domain past what this example aims to exercise.
