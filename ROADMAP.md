# DNA Roadmap

Forward-looking only. This file lists what *might* land next.

For other questions:
- **Current behavior** of any primitive or rule → `openspec/specs/`
- **Active proposals** in flight → `openspec/changes/<name>/`
- **What shipped and why** → `openspec/changes/archive/` and `git log`
- **Language reference** → `README.md` and `packages/core/docs/operational.md`

Anything below should become an `/opsx:propose` change before it lands.

## Future enhancements

### Optional Resource `uses` config
An **optional** declaration on Resource that names how it's intended to be used (`uses: [actor]`, `uses: [target]`, etc.). Stays opt-in; addresses any validator-strictness loss without re-introducing mandatory metadata. Defer until a real example forces the question.

### Membership constraints — tenure
Cardinality (`Role.cardinality` + `Role.required`) and exclusivity (`Role.excludes`) shipped via the `add-role-cardinality-and-exclusivity` OpenSpec change. The remaining sub-item is **tenure** — distinguishing "temporary" (shift-bounded, term-bounded) from "permanent" Memberships. Defer until a real example forces it; runtime/scheduling concerns can stand in for now.
