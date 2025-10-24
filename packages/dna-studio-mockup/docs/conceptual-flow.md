# Product Architect

Discover → Design → Develop → Deliver is a timeline or context, and Build / Connect / Coordinate as the types of work you do within each phase. So every phase can involve all three workspaces, just with different focus:

```
+----------------+----------------+----------------+----------------+
|    Discover    |     Design     |     Develop    |     Deliver    |
+----------------+----------------+----------------+----------------+
| ✏️ Build       | ✏️ Build       | ✏️ Build       | ✏️ Build       |
| - Define early | - Refine models| - Implement    | - Finalize     |
|   concepts &   |   & schemas    |   schemas &    |   versions &   |
|   schemas      |                |   logic        |   diffs        |
+----------------+----------------+----------------+----------------+
| 🔗 Connect     | 🔗 Connect     | 🔗 Connect     | 🔗 Connect     |
| - Set up       | - Sync systems | - Connect APIs | - Automate     |
|   integrations| - Automate     | - Automate     |   release      |
|   & collect    |   workflows    |   deployment  |   pipelines    |
|   data         |                |                |                |
+----------------+----------------+----------------+----------------+
| 📊 Coordinate  | 📊 Coordinate  | 📊 Coordinate  | 📊 Coordinate  |
| - Plan early   | - Track        | - Track       | - Monitor &    |
|   milestones   |   progress &   |   deliverables|   approve      |
| - Approvals    |   dependencies | - Handoffs    | - Completion   |
+----------------+----------------+----------------+----------------+

```

## Statuses

### Discover → Design → Develop → Deliver
* Describes how you build
* These are workflow stages, reflecting creation/production.

### Planned → Active → Deprecated
* Describes how what you built lives.
* These are state stages, reflecting existence.

## Framework

### Ontology
What is, the state of being
```
Portfolio
 └─ Product (version)
     └─ Feature (version)
```

### Operations
What will be, the process of becoming
```
Program
 └─ Project
     └─ Task
```

### Combined
```
Product v1.1 → (Project executes Discover→Deliver) → Product v1.2

```

## Versioning
Semantic Versioning is used on ontological elements, on the `version` attribute. For example:
* `1.0.0` - Base
* `1.0.1` - Patch
* `1.1.0` - Minor
* `2.0.0` - Major

| Change Type | Child Impact                                 | Parent Impact                                                                                                                           |
| ----------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **PATCH**   | Bug fix, minor tweak, no breaking changes    | Usually **no change to parent MAJOR/MINOR**; parent may increment PATCH if parent wants to signal “updated child dependency”            |
| **MINOR**   | New child functionality, backward compatible | Parent may increment MINOR if new child capabilities are meaningful at the parent level; MAJOR only if parent behavior depends on child |
| **MAJOR**   | Breaking change, incompatible child          | Parent **must increment at least MINOR or MAJOR**, because child’s change could break or alter parent behavior                          |

### Example

#### Initial State
- Portfolio: `Analytics Suite v2.1.0`
- Product: `Pricing Engine v1.2.0`
- Feature: `Tiered Pricing v1.1.0`

#### Scenario A: Patch in Feature
- Feature: `Tiered Pricing v1.1.1` (fixed bug)
- Product: remains `v1.2.0` (or optionally `v1.2.1` to signal child update)
- Portfolio: remains `v2.1.0`

---

#### Scenario B: Minor Feature Added
- Feature: `Tiered Pricing v1.2.0` (new optional pricing tiers)
- Product: increments to `v1.3.0` (MINOR)
- Portfolio: increments to `v2.2.0` (if parent tracks meaningful new functionality)

---

#### Scenario C: Major Feature Change
- Feature: `Tiered Pricing v2.0.0` (breaking change)
- Product: increments to `v2.0.0` (MAJOR)
- Portfolio: increments to `v3.0.0` (MAJOR to reflect breaking change in child product)

### Version Status
Product and Project concerns are reflected in `version_status`:
  - Backlog
  - Planned/Discovering
  - Planned/Designing
  - Planned/Developing
  - Planned/Delivering
  - Active/Completed
  - Deprecated

```
### Feature Version Lifecycle with Backlog

| Version | version_status         | Change Type | Meaning |
|---------|-----------------------|------------|---------|
| v1.1.0  | Active/Completed       | Patch      | Existing version, fully delivered and stable. |
| v1.2.0  | Backlog               | Minor      | Candidate version created to supersede v1.1.0; work not yet started. |
| v1.2.0  | Planned/Discovering    | Minor      | Backlog version activated; Discover phase started. |
| v1.2.0  | Planned/Designing      | Minor      | Designing new features or updates. |
| v1.2.0  | Planned/Developing     | Minor      | Developing changes for v1.2.0. |
| v1.2.0  | Planned/Delivering     | Minor      | Preparing deployment/release. |
| v1.2.0  | Active/Completed       | Minor      | Version fully released, superseding v1.1.0. |
| v2.0.0  | Backlog               | Major      | Candidate for breaking changes, superseding previous version. |
| v2.0.0  | Planned/Discovering    | Major      | Discover phase started for major changes. |
| v2.0.0  | Planned/Delivering     | Major      | Development in progress. |
| v2.0.0  | Active/Completed       | Major      | Version released, previous minor versions deprecated. |
| v1.0.0  | Deprecated             | Patch/Major| Historical version, no operational work ongoing. |
```



