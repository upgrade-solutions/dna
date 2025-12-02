# PA Graph — File Structure

This document describes the organization of the codebase and the separation of concerns between different layers.

---

## Directory Overview

```
/src
  /data                 ← Account/tenant data and configuration
    default-config.ts   ← Default styles and settings template
    tenant-config.ts    ← TenantConfig interface and exports
    example-resources.ts ← Resource/Relationship type definitions
    index.ts            ← Data exports
    /accounts           ← Account-specific data folders
      /dna-platform     ← DNA Platform account
        config.ts       ← Visual styling configuration
        resources.ts    ← Platform architecture data
        index.ts        ← Combined tenant export
      /perfected-claims ← Perfected Claims account
        config.ts       ← Visual styling configuration
        resources.ts    ← Mass tort platform data
        index.ts        ← Combined tenant export
  
  /components           ← React components (functional with observer HOC)
    GraphCanvas.tsx     ← Main canvas component, JointJS Paper wrapper
    Toolbar.tsx         ← Tool selection UI (select, pan, connect, add node)
    Inspector.tsx       ← Properties panel for selected graph elements
    Sidebar.tsx         ← Element palette and navigation
    index.ts            ← Component exports
  
  /models               ← MobX observable stores (class-based with makeAutoObservable)
    GraphModel.ts       ← Core graph state (nodes, edges, selection)
    ViewportModel.ts    ← Canvas viewport state (zoom, pan, scroll)
    SelectionModel.ts   ← Selection state and multi-select logic
    index.ts            ← Model exports
  
  /workflows            ← XState state machines for tool modes and user flows
    toolMachine.ts      ← Tool mode state (select, pan, connect, add)
    saveMachine.ts      ← Save/load workflow orchestration
    undoMachine.ts      ← Undo/redo state management
    index.ts            ← Machine exports
  
  /graph                ← Graph data schemas and JointJS element definitions
    /schemas            ← Zod schemas for graph data validation
      node.schema.ts    ← Node data structure validation
      edge.schema.ts    ← Edge/link data structure validation
      graph.schema.ts   ← Complete graph serialization schema
    /elements           ← JointJS Plus custom element definitions
      TaskNode.ts       ← Custom task node shape
      ActorNode.ts      ← Custom actor node shape
      ResourceNode.ts   ← Custom resource node shape
    /styles             ← Element styling and theme configuration
      nodeStyles.ts     ← Node visual styles (colors, borders, fonts)
      linkStyles.ts     ← Link/edge visual styles (arrows, colors)
      theme.ts          ← Dark theme configuration
    /mappers            ← Data transformation between resources and JointJS
      resourceToGraph.ts ← Convert resources/relationships to graph nodes/edges
      graphToResource.ts ← Convert graph nodes/edges back to resources/relationships
  
  /services             ← External API clients and data persistence
    api.ts              ← REST API client for graph CRUD operations
    storage.ts          ← LocalStorage/IndexedDB persistence layer
  
  /types                ← TypeScript interfaces and type definitions
    graph.types.ts      ← Graph element type definitions
    dna.types.ts        ← DNA schema type definitions
    ui.types.ts         ← UI component prop types
  
  /utils                ← Helper functions and utilities
    layout.ts           ← Graph layout algorithms (dagre, force-directed)
    validation.ts       ← Validation helpers
    export.ts           ← Export utilities (JSON, PNG, SVG)
  
  /hooks                ← Custom React hooks
    useGraphModel.ts    ← Hook to access MobX graph model
    useToolMachine.ts   ← Hook to access XState tool machine
    useSelection.ts     ← Hook for selection state management
  
  main.tsx              ← App entry point, root providers
  App.tsx               ← Root component with layout
  App.css               ← Component-specific styles
  index.css             ← Global styles and CSS variables
```

---

## Architecture Layers

### 0. Data Layer (`/data`)
**Purpose**: Account/tenant-specific data and configuration with multi-tenancy support.

- **Account-based organization**: Each tenant in isolated folder (`/accounts/[tenant-name]/`)
- **Separated concerns**: Visual config (`config.ts`) separate from data (`resources.ts`)
- **Default templates**: Reusable base styles and settings (`default-config.ts`)
- **Resource-based model**: Business/technical entities (web-application, api, database, form-component, etc.)
- **Relationships**: Typed connections between resources (depends-on, contains, communicates-with, reads-from, writes-to, renders)
- **NO visual logic**: Pure business/technical data structures

**Account Structure**:
```
/accounts/[tenant-name]/
  config.ts     ← Visual styles (node colors, link styles, canvas settings)
  resources.ts  ← Platform architecture (resources & relationships)
  index.ts      ← Combined TenantConfig export
```

**Key Point**: Each tenant has completely isolated configuration and data, enabling true multi-tenancy.

---

### 2. JointJS Element Layer (`/graph/elements`, `/graph/styles`)
**Purpose**: Define visual representation and interaction of graph elements.

- **`/elements`**: Custom JointJS shapes (TaskNode, ActorNode, ResourceNode)
- **`/styles`**: Visual styling (colors, borders, fonts, themes)
- **`/mappers`**: Bidirectional transformation between resources and JointJS cells
  - `resourceToGraph.ts`: Resources → Graph Nodes, Relationships → Graph Edges
  - `graphToResource.ts`: Reverse mapping for save/export
- **Interaction**: Event handlers for clicks, drags, hovers

**Key Point**: This layer bridges pure data (resources/relationships) and visual rendering (JointJS).

---

### 2. JointJS Element Layer (`/graph/elements`, `/graph/styles`)
**Purpose**: Define visual representation and interaction of graph elements.

- **`/elements`**: Custom JointJS shapes (TaskNode, ActorNode, ResourceNode)
- **`/styles`**: Visual styling (colors, borders, fonts, themes)
- **`/mappers`**: Bidirectional transformation between DNA schemas and JointJS cells
- **Interaction**: Event handlers for clicks, drags, hovers

**Key Point**: This layer bridges pure data (schemas) and visual rendering (JointJS).

---

### 3. State Management Layer (`/models`, `/workflows`)
**Purpose**: Observable state and workflow orchestration.

#### `/models` — MobX Stores
- **Class-based** with `makeAutoObservable()`
- **GraphModel**: Core graph state (nodes, edges, selection)
- **ViewportModel**: Canvas viewport (zoom, pan, scroll)
- **SelectionModel**: Multi-select logic

#### `/workflows` — XState Machines
- **Tool modes**: Select, pan, connect, add node
- **User flows**: Save/load, undo/redo
- **NOT graph data**: Tool state only

**Key Point**: MobX manages "what's in the diagram," XState manages "what tool is active."

---

### 4. Component Layer (`/components`)
### Account Data vs. Resource Data vs. Graph Data vs. Visual Representation
```
/data/accounts/[tenant]/config.ts       ← Tenant visual configuration (styles, settings)
/data/accounts/[tenant]/resources.ts    ← Business model (Resources + Relationships)
/graph/mappers/resourceToGraph.ts       ← Data transformation layer
/graph/schemas/node.schema.ts           ← Graph data structure (Zod)
/graph/elements/TaskNode.ts             ← Visual shape (JointJS)
```
**Key Point**: Components react to MobX store changes automatically.
## Key Separation Patterns

### Resource Data vs. Graph Data vs. Visual Representation
```
/data/example-resources.ts              ← Business model (Resources + Relationships)
/graph/mappers/resourceToGraph.ts       ← Data transformation layer
/graph/schemas/node.schema.ts           ← Graph data structure (Zod)
/graph/elements/TaskNode.ts             ← Visual shape (JointJS)
```*Storage**: LocalStorage/IndexedDB for drafts
- **Async operations**: Managed by XState workflows

**Key Point**: Services handle I/O, not business logic.

---

## Key Separation Patterns

### Graph Data vs. Visual Representation
```
/graph/schemas/node.schema.ts     ← Data structure (Zod)
/graph/elements/TaskNode.ts       ← Visual shape (JointJS)
/graph/mappers/dnaToGraph.ts      ← Transformation layer
```

### State vs. Workflow
```
/models/GraphModel.ts             ← What's in the graph (MobX)
/workflows/toolMachine.ts         ← What tool is active (XState)
```

### Business Logic vs. Presentation
```
/models/GraphModel.ts             ← Graph operations (class)
/components/GraphCanvas.tsx       ← Visual rendering (functional + observer)
```

---

## Code Patterns

### MobX Store (Class-Based)
```typescript
// models/GraphModel.ts
import { makeAutoObservable } from 'mobx'

class GraphModel {
  graph: joint.dia.Graph
  selection: joint.dia.Cell[] = []
  
  constructor() {
    makeAutoObservable(this)
  }
  
  addNode(type: string, position: { x: number, y: number }) {
    // Business logic
  }
}
```

### React Component (Functional + Observer)
```typescript
// components/GraphCanvas.tsx
import { observer } from 'mobx-react-lite'

export const GraphCanvas = observer(() => {
  const model = useGraphModel()
  return <div>{/* Auto re-renders on model changes */}</div>
})
```

### XState Machine
```typescript
// workflows/toolMachine.ts
import { createMachine } from 'xstate'

export const toolMachine = createMachine({
  id: 'tools',
  initial: 'select',
  states: {
    select: { on: { SWITCH_TO_PAN: 'pan' } },
    pan: { on: { SWITCH_TO_SELECT: 'select' } }
  }
})
## Data Flow

1. **Account Selection** → Load tenant config + resources
2. **Tenant Config** → Apply visual styles and settings to canvas
3. **Resource Data** → `resourceToGraph()` mapper → Graph Nodes/Edges → JointJS rendering with tenant styles
4. **User Interaction** → JointJS event → MobX model update → React re-render
5. **Tool Change** → XState transition → Canvas mode update → UI feedback
6. **Save Operation** → `graphToResource()` mapper → XState workflow → API service → Success/error state
4. **Save Operation** → `graphToResource()` mapper → XState workflow → API service → Success/error state
1. **User Interaction** → JointJS event → MobX model update → React re-render
2. **Tool Change** → XState transition → Canvas mode update → UI feedback
3. **Save Operation** → XState workflow → API service → Success/error state

---

For state management patterns and architectural philosophy, see `STATE_ARCHITECTURE.md`.

---

## Multi-Tenancy

Each account/tenant has complete isolation:

- **Visual Identity**: Custom color schemes, line styles, canvas settings
- **Data Isolation**: Separate resource graphs per tenant
- **Extensibility**: Add new tenants by creating `/accounts/[tenant-name]/` folder
- **Default Fallbacks**: Inherit from `default-config.ts` for consistency

**Example Tenants**:
- `dna-platform`: DNA Platform architecture (11 resources, 16 relationships)
- `perfected-claims`: Mass tort case management platform (11 resources, 16 relationships)

**Usage**:
```typescript
import { dnaPlatformTenant, perfectedClaimsTenant } from './data'

// Use default tenant (DNA Platform)
<GraphCanvas />

// Use specific tenant
<GraphCanvas tenantConfig={perfectedClaimsTenant} />
```

````
