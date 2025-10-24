# DNA + Product Architect
DNA is the core technology and open standard. It defines how products are described, validated, and generated.
It is the Product Definition Layer — a machine-readable, language-agnostic schema describing what a product is and how it behaves. It encompasses the language (specs) and engine (parser, validator, generator).

Product Architect is the applied suite built on top of DNA. It’s how users author, visualize, and deploy using DNA. It is the Experience Layer — a creative and operational environment that leverages DNA internally. It encompasses the platform () and UI.


| Layer                      | Who Owns It             | Description                              | Example                            |
| -------------------------- | ----------------------- | ---------------------------------------- | ---------------------------------- |
| **Specification**          | **DNA.codes**           | The language itself (.dna.json/.yaml)    | JSON Schema / GraphQL SDL          |
| **Engine**                 | **DNA.codes**           | Parser, validator, generator             | TypeScript compiler, Prisma engine |
| **Tooling SDK/CLI**        | **DNA.codes**           | Developer utilities for validation/build | `dna validate`, `dna build`        |
| **Visual Interface**       | **ProductArchitect.io** | No-code/low-code UI for defining DNA     | Figma, Retool                      |
| **Collaboration Platform** | **ProductArchitect.io** | Workspaces, permissions, integrations    | Linear, Notion, Vercel             |
| **AI + Automation**        | **ProductArchitect.io** | DNA-based assistants and auto-generators | Copilot, Replit Ghostwriter        |

```
+====================================================================================+
|                              Product Architect Suite                               |
|====================================================================================|
|                                                                                    |
|   PHASES →      Discover           Design             Develop           Deliver    |
|------------------------------------------------------------------------------------|
|                                                                                    |
|   BUILD: Construct the Product Blueprint                                           |
|   -----------------------------------------------------------------------------    |
|   ✏️ Editor     (Define YAML / JSON)        →   Draft structures & schemas          |
|   🧠 Generator  (AI-based creation)         →   Auto-create definitions from text    |
|   🧭 Modeler    (Visual modeling)          →   Map entities, flows, and UI visually |
|   📜 History    (Versions / Diffs)         →   Compare & evolve definitions          |
|                                                                                    |
|   CONNECT: Integrate and Automate                                                  |
|   -----------------------------------------------------------------------------    |
|   - Link external systems (e.g., GitHub, Jira, Notion)                             |
|   - Sync data between environments (Design ↔ Dev)                                  |
|   - Automate transitions (e.g., “Schema validated → Ready for API Generation”)     |
|   - Enable live feedback loops across teams                                        |
|                                                                                    |
|   COORDINATE: Plan, Track, Deliver                                                 |
|   -----------------------------------------------------------------------------    |
|   - Orchestrate phases & releases                                                  |
|   - Track deliverables and dependencies                                            |
|   - Manage approval workflows and handoffs                                         |
|   - Support adaptive delivery (continuous or milestone-based)                      |
|                                                                                    |
|------------------------------------------------------------------------------------|
|                                                                                    |
|   ↑ Every workspace (Build / Connect / Coordinate) reads and writes from the       |
|     same universal product definition:                                             |
|                                                                                    |
+------------------------------------------------------------------------------------+
|                                     DNA.codes                                      |
|------------------------------------------------------------------------------------|
|  🧬 The Foundation: The Product’s Living Blueprint                                  |
|  • Structure  → Defines entities, relationships, hierarchies                       |
|  • Style      → Defines UI, UX, and visual patterns                                |
|  • Schema     → Defines data models, APIs, and logic                               |
|  • Semantics  → Defines intent, rules, and ontology                                |
|                                                                                    |
|  ⚙️ The Engine: Executes, validates, and generates                                 |
|  • Validates DNA consistency across phases                                         |
|  • Generates artifacts (schemas, APIs, docs, UIs)                                  |
|  • Powers automation & synchronization logic                                       |
+------------------------------------------------------------------------------------+

FLOW SUMMARY:
  DNA (Foundation + Engine)
      ↓
  Build (Create & Model)
      ↓
  Connect (Integrate & Automate)
      ↓
  Coordinate (Plan & Deliver)
```