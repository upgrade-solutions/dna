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

### Membership constraints
Membership-level fields beyond `person`/`role`/`group`: cardinality limits ("at most one Underwriter per BankDepartment"), tenure ("temporary" vs "permanent"), exclusivity. Defer until a real example needs them.
