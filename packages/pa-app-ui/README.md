# PA App UI - Configuration-Driven Rendering Engine

## Project Philosophy

**PA App UI is a pure rendering runtime**—not a specific graph editor, but a generic engine that renders UIs from JSON/YAML configuration. Think of it as "React for DNA schemas" where the entire application structure, layout, and behavior is defined declaratively.

**Core Principle**: Data in, UI out. Components don't contain business logic—they render whatever configuration they receive.

## Technology Stack

- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4 (fast HMR, ES modules)
- **Bundler**: `@vitejs/plugin-react` (Fast Refresh enabled)
- **Workflow Engine**: XState 5.x (navigation, multi-step flows, save workflows)
- **State Management**: MobX (optional, for derived state only)
- **Validation**: Zod schemas for configuration validation
- **Styling**: CSS modules + global styles (dark theme)
- **Diagram Library**: JointJS Plus 4.1.1 (as a block type, not core architecture)
- **Package Manager**: npm (use `npm install`, not pnpm)

## Architecture: Rendering Hierarchy

The rendering engine follows a strict hierarchy:

```
App → Module → Page → Section → Block
```

Each level reads configuration and renders the next level down. The entire UI is defined by composing these layers.

## Project Structure

```
pa-app-ui/
├── docs/
│   └── STATE_ARCHITECTURE.md    # Architecture philosophy & patterns
├── src/
│   ├── runtime/                 # Core rendering engine
│   │   ├── app/                 # AppRenderer (root level)
│   │   ├── module/              # ModuleRenderer (feature modules)
│   │   ├── page/                # PageRenderer (individual pages)
│   │   ├── section/             # SectionRenderer (page sections)
│   │   └── block/               # BlockRenderer + BlockRegistry
│   │
│   ├── blocks/                  # Concrete block implementations
│   │   ├── text/                # Heading, Paragraph, RichText
│   │   ├── input/               # TextField, Select, Checkbox, etc.
│   │   ├── data/                # Table, List, Chart, Tree
│   │   ├── layout/              # Container, Grid, Flex, Tabs
│   │   ├── diagram/             # GraphCanvas, FlowDiagram (JointJS)
│   │   └── index.ts             # Block registry exports
│   │
│   ├── templates/               # Pre-configured page templates
│   │   ├── dashboard.json       # Dashboard layout template
│   │   ├── form.json            # Form page template
│   │   ├── graph-editor.json   # Graph editor template
│   │   ├── table-view.json     # Data table template
│   │   └── wizard.json         # Multi-step wizard template
│   │
│   ├── workflows/               # XState workflow machines
│   │   ├── navigation.machine.ts # Module/page navigation
│   │   ├── wizard.machine.ts    # Multi-step form flows
│   │   ├── save.machine.ts      # Auto-save workflows
│   │   └── index.ts
│   │
│   ├── ui/                      # Generic UI components (shadcn-style)
│   │   ├── button/
│   │   ├── card/
│   │   ├── dialog/
│   │   ├── dropdown/
│   │   ├── panel/
│   │   └── index.ts
│   │
│   ├── foundation/              # Infrastructure layer
│   │   ├── config/              # Config loading, validation, resolution
│   │   ├── state/               # Global state management & persistence
│   │   ├── routing/             # Navigation & routing logic
│   │   └── api/                 # HTTP client & WebSocket integration
│   │
│   ├── schemas/                 # Zod validation schemas
│   │   ├── app.schema.ts
│   │   ├── module.schema.ts
│   │   ├── page.schema.ts
│   │   ├── section.schema.ts
│   │   ├── block.schema.ts
│   │   └── index.ts
│   │
│   ├── app/                     # Application bootstrap
│   │   ├── config.json          # App-level configuration
│   │   └── example-configs/     # Example DNA configurations
│   │
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root AppRenderer wrapper
│   ├── App.css                  # Component styles
│   ├── index.css                # Global styles
│   └── assets/                  # Static assets
│
├── public/                      # Public static files
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript project references
├── tsconfig.app.json            # App TypeScript config
├── tsconfig.node.json           # Node/Vite TypeScript config
├── eslint.config.js             # ESLint flat config
├── package.json                 # Dependencies and scripts
└── joint-plus.tgz               # JointJS Plus library (local)
```

## Core Concepts

### 1. Renderers (The Engine)
Each renderer reads configuration and renders children:
- `AppRenderer`: Loads app config, provides global context
- `ModuleRenderer`: Handles navigation between pages
- `PageRenderer`: Applies templates, renders sections
- `SectionRenderer`: Layouts blocks within a section
- `BlockRenderer`: Looks up block type in registry and renders

### 2. Blocks (The Lego Pieces)
Blocks are pure presentational components that accept props from configuration:
- **Text blocks**: Display content (`Heading`, `Paragraph`, `RichText`)
- **Input blocks**: Capture data (`TextField`, `Select`, `Checkbox`)
- **Data blocks**: Visualize data (`Table`, `List`, `Chart`)
- **Layout blocks**: Organize other blocks (`Container`, `Grid`, `Flex`)
- **Diagram blocks**: Specialized visualizations (`GraphCanvas` with JointJS)

### 3. Templates (Reusable Patterns)
Templates are pre-configured page structures that can be reused:
```json
{
  "id": "graph-editor",
  "layout": "three-column",
  "sections": [
    { "id": "toolbar", "position": "top" },
    { "id": "canvas", "position": "center" },
    { "id": "inspector", "position": "right" }
  ]
}
```

### 4. Workflows (User Journeys)
XState machines orchestrate user interactions:
- Navigation between modules and pages
- Multi-step wizards with validation
- Auto-save and manual save flows
- Load/import workflows

### 5. Configuration = DNA
The configuration files ARE the DNA. Change the JSON, the UI changes:
```json
{
  "app": {
    "id": "product-architect",
    "modules": [
      {
        "id": "graph-editor",
        "pages": [
          {
            "id": "canvas",
            "template": "graph-editor",
            "sections": [...]
          }
        ]
      }
    ]
  }
}
```

## Development Commands

```bash
# Start dev server with HMR (port 5173 by default)
npm run dev

# Type-check and build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Validate configuration schemas
npm run validate-config
```

## Development Patterns

### Adding a New Block Type
1. Create component in `blocks/[category]/YourBlock.tsx`
2. Register in `blocks/index.ts` → `BlockRegistry`
3. Add to block schema in `schemas/block.schema.ts`
4. Use in configurations via `{ "type": "your-block", "props": {...} }`

### Creating a New Template
1. Create JSON file in `templates/your-template.json`
2. Define sections with positioning and default blocks
3. Reference in page configs: `"template": "your-template"`

### Adding a Workflow
1. Create XState machine in `workflows/your-workflow.machine.ts`
2. Export from `workflows/index.ts`
3. Use in modules or pages that need the workflow

### Loading Configurations
```typescript
import { loadConfig, validateConfig } from '@/foundation/config'

const appConfig = await loadConfig('/api/config')
const validated = validateConfig(appConfig, appSchema)
```

## Key Principles

1. **Configuration Over Code**: Never hardcode UI structure—define in JSON
2. **Composition Over Inheritance**: Build complex UIs by composing blocks
3. **Pure Rendering**: Components receive props, return JSX—no side effects
4. **Workflows for Interaction**: Use XState for complex user journeys
5. **Templates for Reusability**: Define patterns once, reuse everywhere
6. **Schemas as Contracts**: Validate all configs with Zod schemas

## What This Enables

- **Product Architect**: Graph editor is just a configuration of the engine
- **Form Builder**: Multi-step forms = wizard template + input blocks
- **Dashboards**: Grid layouts + chart blocks + data sources
- **Documentation**: Text blocks + code blocks + diagrams
- **Any UI**: As long as you can define it in JSON, it renders

The rendering engine is **domain-agnostic**—it doesn't know about graphs, forms, or dashboards. It just knows how to render App → Module → Page → Section → Block hierarchies from configuration.
