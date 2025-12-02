# PA App UI — Configuration-Driven Architecture

This document outlines the **core principles and patterns** for building a configuration-driven rendering engine where **data defines structure** and **components execute rendering**.

---

## 1. Architecture Philosophy

PA App UI is a **pure rendering runtime**, not a feature-specific application. The architecture follows these principles:

- **Configuration Over Code**: UI structure lives in JSON/YAML, not hardcoded in components
- **Composition Over Inheritance**: Complex UIs built by composing simple blocks
- **Pure Rendering**: Components are stateless—they receive config, return JSX
- **Workflows for Interaction**: XState manages user journeys, not domain logic
- **Templates for Reusability**: Pre-configured patterns that can be instantiated

---

## 2. State Architecture Overview

PA App UI uses a **three-layer state model**:

### **1. Configuration State (Authoritative Source)**
- App, Module, Page, Section, Block configurations
- Templates and schema definitions
- Loaded from JSON/YAML files or API
- Validated against Zod schemas
- Immutable once loaded (changes = new config)

### **2. XState — Workflow / Interaction State**
- Navigation between modules and pages
- Multi-step wizard flows with validation
- Save/auto-save workflows
- Load/import/export workflows
- Modal user journeys (idle → loading → done → error)

### **3. Derived & Local State**
- Computed values from configuration (MobX optional)
- Transient UI state (hover, focus, open popovers)
- Block-level local state (form input values before submit)
- Canvas transforms and viewport state

---

## 3. Rendering Hierarchy Pattern

PA App UI follows a strict **top-down rendering hierarchy**:

```
App → Module → Page → Section → Block
```

Each level:
1. Receives configuration as props
2. Validates config against schema (optional)
3. Renders its children based on config
4. Passes down relevant context

### **Example Flow**

```typescript
// App level
<AppRenderer config={appConfig}>
  {/* Renders modules from config.modules */}
</AppRenderer>

// Module level
<ModuleRenderer config={moduleConfig}>
  {/* Navigation + current page */}
  <PageRenderer config={currentPageConfig} />
</ModuleRenderer>

// Page level
<PageRenderer config={pageConfig} template={template}>
  {/* Applies template, renders sections */}
  {config.sections.map(section => 
    <SectionRenderer config={section} />
  )}
</PageRenderer>

// Section level
<SectionRenderer config={sectionConfig}>
  {/* Layout wrapper + blocks */}
  {config.blocks.map(block => 
    <BlockRenderer config={block} />
  )}
</SectionRenderer>

// Block level
<BlockRenderer config={blockConfig}>
  {/* Looks up component in registry */}
  <TextField {...blockConfig.props} />
</BlockRenderer>
```

---

## 4. Configuration Schema Pattern

All configuration follows a consistent schema pattern:

```typescript
interface BaseConfig {
  id: string
  type: string
  metadata?: Record<string, unknown>
}

interface AppConfig extends BaseConfig {
  type: 'app'
  theme: 'light' | 'dark'
  modules: ModuleConfig[]
}

interface ModuleConfig extends BaseConfig {
  type: 'module'
  name: string
  icon?: string
  pages: PageConfig[]
}

interface PageConfig extends BaseConfig {
  type: 'page'
  title: string
  template?: string  // Reference to template
  sections: SectionConfig[]
}

interface SectionConfig extends BaseConfig {
  type: 'section'
  layout: 'horizontal' | 'vertical' | 'grid' | 'flex'
  blocks: BlockConfig[]
}

interface BlockConfig extends BaseConfig {
  type: string  // 'text-field', 'button', 'graph-canvas', etc.
  props: Record<string, unknown>  // Block-specific props
}
```

---

## 5. Block Registry Pattern

Blocks are registered in a central registry that maps type strings to React components:

```typescript
// blocks/index.ts
import { TextField } from './input/TextField'
import { Button } from './input/Button'
import { GraphCanvas } from './diagram/GraphCanvas'

export const BlockRegistry = new Map<string, React.ComponentType<any>>([
  ['text-field', TextField],
  ['button', Button],
  ['graph-canvas', GraphCanvas],
  // ... more blocks
])

// runtime/block/BlockRenderer.tsx
export function BlockRenderer({ config }: { config: BlockConfig }) {
  const Component = BlockRegistry.get(config.type)
  
  if (!Component) {
    console.error(`Unknown block type: ${config.type}`)
    return <div>Unknown block: {config.type}</div>
  }
  
  return <Component {...config.props} />
}
```

---

## 6. Template Pattern

Templates are pre-configured page structures that can be reused:

```json
// templates/graph-editor.json
{
  "id": "graph-editor",
  "layout": "three-column",
  "sections": [
    {
      "id": "toolbar",
      "position": "top",
      "height": "64px",
      "layout": "horizontal",
      "blocks": [
        { "type": "button", "props": { "label": "Select" } },
        { "type": "button", "props": { "label": "Pan" } },
        { "type": "button", "props": { "label": "Connect" } }
      ]
    },
    {
      "id": "canvas",
      "position": "center",
      "layout": "fill",
      "blocks": [
        { 
          "type": "graph-canvas",
          "props": { 
            "editable": true,
            "zoom": true,
            "dataSource": null
          }
        }
      ]
    },
    {
      "id": "inspector",
      "position": "right",
      "width": "320px",
      "layout": "vertical",
      "blocks": [
        { "type": "property-inspector", "props": {} }
      ]
    }
  ]
}
```

Templates can be instantiated with overrides:

```json
{
  "id": "my-graph-page",
  "template": "graph-editor",
  "overrides": {
    "sections.canvas.blocks[0].props.dataSource": "/api/graphs/123"
  }
}
```

---

## 7. Workflow State Machine Pattern

XState machines manage user journeys, not domain data:

```typescript
// workflows/navigation.machine.ts
import { createMachine } from 'xstate'

export const navigationMachine = createMachine({
  id: 'navigation',
  initial: 'idle',
  context: {
    currentModuleId: null,
    currentPageId: null,
    history: []
  },
  states: {
    idle: {
      on: {
        NAVIGATE: {
          target: 'loading',
          actions: 'pushToHistory'
        },
        BACK: {
          target: 'loading',
          actions: 'popFromHistory'
        }
      }
    },
    loading: {
      invoke: {
        src: 'loadPageConfig',
        onDone: {
          target: 'idle',
          actions: 'setCurrentPage'
        },
        onError: 'error'
      }
    },
    error: {
      on: {
        RETRY: 'loading',
        CANCEL: 'idle'
      }
    }
  }
})
```

Use in components:

```typescript
function ModuleRenderer({ config }: { config: ModuleConfig }) {
  const [state, send] = useMachine(navigationMachine)
  
  const handlePageChange = (pageId: string) => {
    send({ type: 'NAVIGATE', pageId })
  }
  
  const currentPage = config.pages.find(p => p.id === state.context.currentPageId)
  
  return (
    <div>
      <Navigation pages={config.pages} onPageChange={handlePageChange} />
      {state.matches('loading') && <Spinner />}
      {state.matches('error') && <ErrorMessage />}
      {state.matches('idle') && currentPage && (
        <PageRenderer config={currentPage} />
      )}
    </div>
  )
}
```

---

## 8. Data Flow Rules

### **Configuration Loading**
1. Load configuration from file/API
2. Validate against Zod schema
3. Resolve templates and references
4. Pass to root AppRenderer

### **User Interaction**
1. User interacts with block (e.g., clicks button)
2. Block emits event via callback prop
3. Parent handles event (may trigger XState transition)
4. XState machine updates workflow state
5. UI re-renders based on new state

### **Data Persistence**
1. Block collects user input (local state)
2. On submit/save, data sent to API
3. API returns updated configuration
4. Configuration reloaded/merged
5. UI re-renders with new config

---

## 9. Recommended Folder Structure

```
/src
  /runtime       ← App, Module, Page, Section, Block renderers
  /blocks        ← Concrete block implementations by category
  /templates     ← JSON templates for reusable page patterns
  /workflows     ← XState machines for user journeys
  /ui            ← Generic UI components (buttons, cards, panels)
  /foundation    ← Config loading, validation, routing, API
  /schemas       ← Zod schemas for configuration validation
  /app           ← Bootstrap and example configs
```

---

## 10. Core Principles

1. **Configuration is authoritative**  
   The config defines what renders—components just execute.

2. **XState for workflows only**  
   Navigation, multi-step forms, save flows—not domain data.

3. **Blocks are pure presentational**  
   Accept props, return JSX. No side effects, no business logic.

4. **Templates enable reusability**  
   Define patterns once, instantiate many times with overrides.

5. **Composition over inheritance**  
   Build complex UIs by composing simple blocks, not extending classes.

6. **Schemas as contracts**  
   Validate all configurations at load time. Fail fast, fail clearly.

7. **Domain-agnostic rendering**  
   The engine doesn't know about "graphs" or "forms"—just App/Module/Page/Section/Block.

---

## 11. What This Enables

- **Product Architect**: Graph editor = `graph-editor.json` template + JointJS block
- **Form Builder**: Multi-step wizard = `wizard.json` template + input blocks
- **Dashboards**: Grid layout + chart blocks + data source bindings
- **Documentation**: Text blocks + code blocks + diagram blocks
- **Custom Apps**: Any UI expressible as App → Module → Page → Section → Block

The architecture is **fully declarative**—change the JSON, the entire UI changes. No code deploys required for structural changes.
