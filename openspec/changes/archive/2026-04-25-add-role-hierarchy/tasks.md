## 1. Schema description

- [x] 1.1 In `packages/schemas/operational/role.json`, rewrite the `parent` field's `description` to document the v2 semantics: child inherits parent's effective scope when own `scope` is omitted; declared child scope must be narrower-or-equal; cycles rejected. Drop the "Inheritance semantics deferred to v2" line.

## 2. Validator: effective-scope resolution

- [x] 2.1 In `packages/core/src/validator.ts`, add a per-`validate()` cache keyed by Role name that returns `string[] | null` for the Role's effective scope. Return the Role's own normalized scope when declared, otherwise recurse into the parent. Return `null` for any chain that ends in a cycle.
- [x] 2.2 Build the cache before the existing per-Role pass at `validator.ts:488-516` so the subset check (3.2) can read it.

## 3. Validator: cycle detection and subset check

- [x] 3.1 Walk each Role's parent chain once. On revisiting a Role, emit one error per cycle (deduped by sorted member set) at path `roles/<root>/parent` whose message names every member in walk order using the existing `quoteList` helper.
- [x] 3.2 In the per-Role pass, if a child declares its own `scope` and the parent's effective scope is non-null, verify every entry in the child's normalized scope is narrower-or-equal to some entry in the parent's effective scope. On failure, emit one error at path `roles/<child>/scope` naming the offending entry and explaining the rule. Skip the check when the parent's effective scope is `null` (cycle/upstream error).
- [x] 3.3 Subset rule: Group→Group passes when child equals parent or child's `Group.parent` chain reaches parent; Person→Person passes only on equality; Person→Group always fails with a message that distinguishes Person from Group narrowing.

## 4. Validator tests

- [x] 4.1 In `packages/core/src/validator.test.ts`, add: positive case (child inherits scope from parent through a 3-step chain).
- [x] 4.2 Add: 2-Role cycle case asserts one error naming both members.
- [x] 4.3 Add: 3-Role cycle case asserts one error naming all three in walk order.
- [x] 4.4 Add: subset failure cases — unrelated Group, child array wider than parent, Person scope under Group parent.
- [x] 4.5 Add: cycle suppresses the subset error on members of the cycle.
- [x] 4.6 Confirm `npm test --workspaces --if-present` reports all 309 prior tests still pass plus the new ones. (317 total now: 309 baseline + 8 new.)

## 5. Lending example

- [x] 5.1 In `examples/lending/operational.json`, add `SeniorUnderwriter` with `parent: "Underwriter"`, no own `scope`, and one Action of its own (e.g. `Promote`). Confirm `cba validate --dna examples/lending` passes. (Verified via `examples.test.ts` in `@dna-codes/core` — passes.)

## 6. Docs

- [x] 6.1 In `packages/core/docs/operational.md`, under the Role section, add a short paragraph describing parent semantics: scope inheritance, narrower-or-equal rule, and the explicit non-goals (no action inheritance, no Membership widening). (Added a dedicated "Role hierarchy" section before Invariants — there was no per-Role section previously.)
- [x] 6.2 In `ROADMAP.md`, remove the "Role hierarchy" entry from "Future enhancements (post-reorg)" and note in the change history (or appropriate landed-features section) that hierarchy shipped via the `add-role-hierarchy` OpenSpec change. (Created a new "Landed post-reorg" section that points back at this change.)

## 7. Adapter polish (optional, low-risk) — DEFERRED

Discovered during apply: neither `output-markdown` nor `output-html` currently render any Role section (they cover Resources, Operations, SOPs, Process Flows). Surfacing `Role.parent` would require first introducing a full Role rendering section to each adapter — out of scope for "low-risk polish." Defer to a follow-up change focused on Role rendering as a whole.

- [~] 7.1 ~~In `packages/output-markdown/src/sections/`, surface the parent link on the rendered Role.~~ Deferred; no Role section exists today.
- [~] 7.2 ~~Same for `packages/output-html/src/sections/`.~~ Deferred for the same reason.
- [~] 7.3 ~~Update their `index.test.ts`.~~ Not applicable until 7.1/7.2 land.

## 8. Wrap-up

- [x] 8.1 Run `npm test` from the repo root; confirm green. (12/12 workspaces passing; 317 tests total.)
- [x] 8.2 Run `npx openspec validate add-role-hierarchy` to confirm the OpenSpec artifacts still pass. (`Change 'add-role-hierarchy' is valid`.)
- [x] 8.3 Commit the schema, validator, tests, example, and docs together with a single conventional message; defer adapter polish (section 7) to a separate commit if it lands. (Landed as `ec5589c`. OpenSpec scaffolding committed separately as `7151a9d`.)
