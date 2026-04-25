## Context

Role gained `parent` (and v2 inheritance semantics) in the prior `add-role-hierarchy` change. The validator now exposes an `effectiveScope(name) → string[] | null` cache (`packages/core/src/validator.ts:522-543`) and the `roles` per-Role pass at `validator.ts:545-592` already knows each Role's resolved scope. Cardinality / required / excludes attach to the same pass — they all key off effective scope.

The six example domains describe per-scope constraints in prose today (healthcare's `ConsultingSpecialist` description literally says "multiple may exist per Patient") but the model has no fields to declare them. Two consequences: (a) renderers can't surface the intent, and (b) any downstream codegen (auth middleware, admin UI, seed scripts) has to re-derive the constraint from English. This change closes the gap on the modeling layer; runtime enforcement is downstream.

## Goals / Non-Goals

**Goals:**
- One way to declare "how many Persons may hold this Role per scope instance" (`cardinality: one | many`, default `many`).
- One way to declare "must at least one Person hold this Role per scope instance" (`required: boolean`, default `false`), composing orthogonally with cardinality.
- One way to declare "the same Person can't hold both of these Roles on the same scope instance" (`excludes: RoleName[]`).
- All five examples that have prose constraints today encode those constraints in their `operational.json`.
- Validator catches misuse: per-scope constraints on global Roles, on system Roles, with self-references, with cross-scope `excludes`, and with unresolved Role references.
- All existing tests pass; new behavior covered by ~10 validator cases.

**Non-Goals:**
- **Runtime enforcement.** The validator only checks the *model*; counting actual assignments belongs in runtime systems. This boundary is documented in the spec and the operational-layer doc.
- **Tenure** ("temporary" vs "permanent"). No example currently forces it. ROADMAP keeps tenure as a deferred sub-item.
- **Numeric min/max bounds** (`{min: 2, max: 5}`). Every example need is covered by `{cardinality, required}`; numeric bounds add expressive surface area no example justifies.
- **Excludes between Roles in different Domains.** Out of scope until cross-domain Role parentage is also addressed.
- **Membership-level overrides** (different cardinality per Membership row pointing at the same Role). Cardinality is a property of the Role's relationship to its scope, not a property of one binding; no example needs the override.

## Decisions

### 1. `cardinality` as a two-value enum, not numeric bounds

`cardinality: "one" | "many"` covers every example, reads naturally, and keeps invalid states (negative or zero max) unrepresentable. Pairing with `required: boolean` gives the four cells {0..1, 1..1, 0..∞, 1..∞} — which is the entire space the examples need.

**Rejected alternative:** `{min: number, max: number | "unbounded"}`. More flexible, but no example needs values other than 0/1/∞, and the validator would have to reject (or normalize) silly combinations. We'd be importing complexity for hypothetical future need.

**Rejected alternative:** single enum `"one" | "at_most_one" | "exactly_one" | "many" | "at_least_one"`. Five values is a closed set but harder to extend, and the orthogonal split (`cardinality` × `required`) maps cleaner to UI/admin tooling that wants to ask the two questions separately.

### 2. `required` and `cardinality` both require a scope

A "required" or "cardinality-constrained" global Role has no instance to attach the constraint to ("at least one SuperAdmin per…what?"). Validator rejects `required: true` or `cardinality: "one"` on Roles whose effective scope is empty (i.e., neither declared nor inherited). The error message names the Role, the field, and notes that a `scope` is required.

### 3. `excludes` is symmetric and same-scope

The constraint "the same Person can't hold both Roles on the same scope instance" is inherently symmetric — declaring it once on either side is enough. The validator treats `A.excludes` and `B.excludes` as a single undirected edge set: dedupe by sorted pair when emitting errors, and treat a one-sided declaration as if the other side declared it too.

`excludes` requires the two Roles to share at least one effective-scope entry. Different scopes mean different per-instance worlds — there's no shared "same scope instance" for the constraint to land on. Cross-scope `A.excludes B` is rejected at validation time with a message that names both effective scopes.

Person-scoped Roles (`AttendingPhysician.scope = Patient`) work transparently here: they share scope `["Patient"]`, so `AttendingPhysician.excludes = ["ConsultingSpecialist"]` validates.

### 4. System Roles can't carry these constraints

System Roles (`system: true`) aren't filled by Persons, so per-Person cardinality and `excludes` are nonsensical on them. The validator rejects any of the three new fields on a system Role with a single error per field.

### 5. Where the new checks live

All three checks attach to the same iteration as the existing scope/parent checks (`validator.ts:545-592`), running after `effectiveScope` is populated. Order:

1. **Per-Role validation** (added to existing loop):
   a. `cardinality === "one"` requires non-empty effective scope.
   b. `required === true` requires non-empty effective scope.
   c. Any of the three fields on a `system: true` Role → error.
   d. `excludes` self-reference → error.
   e. Each `excludes` name resolves to a declared Role.
2. **Cross-Role exclusion pass** (new, after the loop): walk every ordered pair `(A, B)` where `B ∈ A.excludes` ∪ `A ∈ B.excludes`; check that `effectiveScope(A) ∩ effectiveScope(B) ≠ ∅`; emit one error per *unordered* pair if not. Symmetric union de-duplication keeps error count clean.

### 6. Schema shape

Three additive optional fields on `role.json`:

```json
"cardinality": {
  "type": "string",
  "enum": ["one", "many"],
  "default": "many",
  "description": "..."
},
"required": {
  "type": "boolean",
  "default": false,
  "description": "..."
},
"excludes": {
  "type": "array",
  "items": { "type": "string", "pattern": "^[A-Z][a-zA-Z0-9]*$" },
  "uniqueItems": true,
  "description": "..."
}
```

No structural change to existing fields. Existing documents continue to validate.

### 7. Examples already imply the constraints — encode them

The change is grounded only because we update the examples. Each example gets the minimum number of constraints to match its prose:

| Example | Role | cardinality | required | excludes |
|---|---|---|---|---|
| healthcare | AttendingPhysician | one | — | [ConsultingSpecialist] |
| healthcare | PrimaryNurse | one | — | — |
| mass-tort | LeadCounsel | one | true | [CoCounsel] |
| mass-tort | Judge | one | true | — |
| marketplace | Host | one | true | — |
| marketplace | Guest | one | true | — |
| education | DepartmentChair | one | — | — |
| manufacturing | ShiftSupervisor | one | — | — |

Lending stays untouched (its `Underwriter`, `LendingManager`, and `SeniorUnderwriter` are not described as singular in the README).

## Risks / Trade-offs

- **Risk:** Modeling-only constraints invite the question "is the validator going to enforce this?" → Mitigation: the spec opens with a paragraph stating the modeling/runtime boundary; the operational-doc subsection repeats it in user-facing language.
- **Risk:** Cross-scope `excludes` rejection could surprise authors who think of exclusion as Person-level. → Mitigation: the error message names both scopes and explains why the same Person on disjoint scopes isn't a conflict; add a scenario demonstrating it.
- **Risk:** Existing examples might already conflict (e.g., a Membership the validator now considers cross-scope-incompatible). → Mitigation: change-time grep — none currently declare `cardinality`/`required`/`excludes`, so no migration needed; only the additions in this change exercise the new checks.
- **Trade-off:** Picking `cardinality: "one" | "many"` over numeric bounds means any future need for `min: 2` is a schema extension. Accepted: every current example fits 0/1/∞; we'd rather wait for a real example to force min=2 than design for it now.
- **Trade-off:** Symmetric `excludes` means authors only write the constraint on one side, but readers have to remember it might be implicit on the other. → Mitigation: doc subsection includes a "symmetry" callout, and renderers (when they grow Role sections) can show the resolved set.
