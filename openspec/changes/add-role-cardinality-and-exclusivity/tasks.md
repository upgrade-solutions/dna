## 1. Schema additions

- [x] 1.1 In `packages/schemas/operational/role.json`, add three optional fields:
  - `cardinality`: `enum ["one", "many"]`, default `"many"`. Description: per-scope-instance Person count limit; `"one"` requires a declared/inherited scope and is incompatible with `system: true`.
  - `required`: `boolean`, default `false`. Description: whether at least one Person must hold this Role per scope instance; requires a declared/inherited scope and is incompatible with `system: true`.
  - `excludes`: `array` of Role-name strings (`pattern: "^[A-Z][a-zA-Z0-9]*$"`, `uniqueItems: true`). Description: same Person SHALL NOT hold this Role and any named Role on the same scope instance; symmetric, same-scope, no self-reference, incompatible with `system: true`.
- [x] 1.2 Add at least one schema-level `examples[]` entry to `role.json` exercising each new field (e.g., extend the existing `LeadCounsel` example with `cardinality: "one", required: true`).

## 2. Validator: per-Role checks (extend existing `roles` block)

In `packages/core/src/validator.ts`, extend the per-Role iteration at `validator.ts:545-592`. All checks below run after `effectiveScope` is populated and use existing `quoteList` / `availability` helpers for messages.

- [x] 2.1 Add a `RoleShape` type extension in the same file: `cardinality?: 'one' | 'many'`, `required?: boolean`, `excludes?: string[]`.
- [x] 2.2 Compute `roleHasScope = (effectiveScope(role.name) ?? []).length > 0`. Reuse for cardinality, required, and excludes checks.
- [x] 2.3 If `role.cardinality === 'one'` and `!roleHasScope`, emit one error at path `roles/<name>/cardinality` whose message names the Role and explains that `cardinality: "one"` requires a declared or inherited scope.
- [x] 2.4 If `role.cardinality !== undefined` and `role.system === true`, emit one error at path `roles/<name>/cardinality` whose message names the Role and explains that cardinality does not apply to system Roles.
- [x] 2.5 If `role.required === true` and `!roleHasScope`, emit one error at path `roles/<name>/required` whose message names the Role and explains that `required: true` requires a declared or inherited scope.
- [x] 2.6 If `role.required === true` and `role.system === true`, emit one error at path `roles/<name>/required` whose message names the Role and explains that `required` does not apply to system Roles.
- [x] 2.7 For each entry `e` in `role.excludes ?? []`:
  - If `e === role.name`, emit one error at path `roles/<name>/excludes` ("a Role cannot exclude itself").
  - Else if `!primitives.roleNames.has(e)`, emit one error at path `roles/<name>/excludes` naming `"e"` and listing `availability('roles', primitives.roleNames)`.
- [x] 2.8 If `role.excludes && role.excludes.length > 0` and `role.system === true`, emit one error at path `roles/<name>/excludes` ("excludes does not apply to system Roles").

## 3. Validator: cross-Role exclusion pass (new, after the per-Role loop)

- [x] 3.1 Build the symmetric exclusion edge set: for every `role A` and every `B` in `A.excludes ?? []`, add the unordered pair `{A.name, B.name}` (deduped, sorted). Skip pairs where either side is a system Role, where either side is unresolved, or where `A === B` (those errors were already emitted in section 2).
- [x] 3.2 For each unordered pair `{A, B}`, compute `intersect = effectiveScope(A) ∩ effectiveScope(B)`. If `intersect` is empty, emit **one** error at path `roles/<lexicographically-smaller>/excludes` whose message names both Roles, both effective scopes (using `quoteList`), and explains that exclusion requires a shared scope. Use the lexicographically-smaller name to make the path deterministic regardless of which side declared the exclusion.

## 4. Validator tests

In `packages/core/src/validator.test.ts`:

- [x] 4.1 Positive: `cardinality: "one"` on a scoped Role validates.
- [x] 4.2 Positive: `cardinality: "one"` on a Role that inherits scope through `parent` validates.
- [x] 4.3 Positive: `required: true` + `cardinality: "one"` on a scoped Role validates.
- [x] 4.4 Positive: same-scope `excludes` (e.g., `AttendingPhysician.excludes = ["ConsultingSpecialist"]` both scoped to `Patient`) validates.
- [x] 4.5 Positive: declaring `excludes` on only one side is enough — the symmetric pair is not flagged as missing on the other side. (Covered by 4.4: only `AttendingPhysician` declares excludes; the test passes without an error on `ConsultingSpecialist`.)
- [x] 4.6 Negative: `cardinality: "one"` on a global Role fails with the documented message.
- [x] 4.7 Negative: `required: true` on a global Role fails.
- [x] 4.8 Negative: `cardinality`, `required`, or `excludes` on a `system: true` Role fails (one error per field).
- [x] 4.9 Negative: `excludes: ["NotARole"]` fails with the available-Roles list in the message.
- [x] 4.10 Negative: self-exclusion fails.
- [x] 4.11 Negative: cross-scope `excludes` fails with one error and both scopes in the message.
- [x] 4.12 Negative: symmetric declaration with cross-scope failure emits exactly one error (not two).
- [x] 4.13 Confirm baseline tests still pass: 174 tests pass (was 162 — exactly +12 new). Full repo-wide check deferred to wrap-up section 7.1.

## 5. Examples — encode the constraints already implied by READMEs

- [x] 5.1 `examples/healthcare/operational.json`:
  - Add `cardinality: "one"` to `AttendingPhysician`.
  - Add `cardinality: "one"` to `PrimaryNurse`.
  - Add `excludes: ["ConsultingSpecialist"]` to `AttendingPhysician`.
- [x] 5.2 `examples/mass-tort/operational.json`:
  - Add `cardinality: "one"` and `required: true` to `LeadCounsel`.
  - Add `cardinality: "one"` and `required: true` to `Judge`.
  - Add `excludes: ["CoCounsel"]` to `LeadCounsel`.
- [x] 5.3 `examples/marketplace/operational.json`:
  - Add `cardinality: "one"` and `required: true` to `Host`.
  - Add `cardinality: "one"` and `required: true` to `Guest`.
- [x] 5.4 `examples/education/operational.json`:
  - Add `cardinality: "one"` to `DepartmentChair`.
- [x] 5.5 `examples/manufacturing/operational.json`:
  - Add `cardinality: "one"` to `ShiftSupervisor`.
- [x] 5.6 Update each touched example's `README.md` so the prose ("primary responsibility", "Lead attorney owning a Case", etc.) cross-references the new declared constraints (one or two added sentences per example, not a rewrite).
- [x] 5.7 Confirm `examples.test.ts` (and any per-example fixtures in `@dna-codes/core` and `@dna-codes/output-*`) still pass; all 12 workspaces green, no snapshot diffs.

## 6. Docs

- [x] 6.1 In `packages/core/docs/operational.md`, under the existing `### Role hierarchy` section, add a new `#### Cardinality, required, and excludes` subsection covering: field shapes, defaults, the modeling-vs-runtime boundary, scope-and-system-Role compatibility, and `excludes` symmetry. ~10 lines.
- [x] 6.2 In the top-level `README.md`, expand the Role bullet under "Operational Layer" with one short sentence noting the new optional fields.
- [x] 6.3 In `ROADMAP.md`, shrink the "Membership constraints" entry: remove cardinality and exclusivity from the description (point at this change), keep tenure as the remaining deferred sub-item.

## 7. Wrap-up

- [x] 7.1 Run `npm test` from the repo root; confirm all workspaces green. (12 workspaces, 319 tests total — core jumps from 162 to 174 with the +12 new validator tests.)
- [x] 7.2 Run `npx openspec validate add-role-cardinality-and-exclusivity` — `Change 'add-role-cardinality-and-exclusivity' is valid`.
- [ ] 7.3 Commit schema, validator, tests, examples, and docs together with a single conventional message (`Add Role.cardinality, Role.required, and Role.excludes`).
