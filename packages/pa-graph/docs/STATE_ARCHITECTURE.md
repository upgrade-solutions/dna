# PA Graph — State Architecture

This document outlines the **state management patterns** for the Product Architect Graph editor application.

---

## 1. Architecture Philosophy

PA Graph is a **graph editing application** focused on visualizing and manipulating business models and workflows using JointJS Plus. The architecture follows these principles:

- **Graph-First**: The graph model is the central source of truth
- **Direct Manipulation**: Users interact directly with graph elements
- **Workflow Management**: XState manages user journeys and tool modes
- **Observable State**: MobX tracks graph model changes for reactive updates

---

## 2. State Architecture Overview

PA Graph uses a **three-layer state model**:

### **1. Graph Model State (MobX)**
- Graph nodes (cells) and edges (links)
- Element properties (position, size, styles, metadata)
- Selection state and active elements
- Canvas viewport (zoom, pan, scroll position)
- Observable and reactive via MobX

### **2. XState — Workflow / Tool State**
- Tool modes (select, pan, connect, add node)
- Save/load workflows
- Import/export workflows  
- Modal user journeys (idle → loading → done → error)
- Undo/redo state management

### **3. Local UI State**
- Transient UI state (hover, focus, open panels)
- Inspector panel visibility
- Toolbar active states
- Modal dialogs and popovers

---

## 3. Graph Model Architecture

The graph model is built on JointJS and wrapped in MobX observables. Use **class-based stores** for the model with **functional React components** that observe the model:

```typescript
// models/GraphModel.ts
import { makeAutoObservable } from 'mobx'
import * as joint from 'jointjs'

class GraphModel {
  graph: joint.dia.Graph
  paper: joint.dia.Paper
  selection: joint.dia.Cell[] = []
  
  constructor() {
    makeAutoObservable(this)
    this.graph = new joint.dia.Graph()
  }
  
  addNode(type: string, position: { x: number, y: number }) {
    // Add node to graph
  }
  
  addLink(source: string, target: string) {
    // Add edge between nodes
  }
  
  updateElement(id: string, attrs: Record<string, unknown>) {
    // Update element properties
  }
  
  get selectedElement() {
    return this.selection[0]
  }
}

// components/GraphCanvas.tsx (functional component with observer)
import { observer } from 'mobx-react-lite'

export const GraphCanvas = observer(({ model }: { model: GraphModel }) => {
  const handleAddNode = () => {
    model.addNode('task', { x: 100, y: 100 })
  }
  
  return (
    <div className="graph-canvas">
      <button onClick={handleAddNode}>Add Node</button>
      {/* Canvas renders here */}
    </div>
  )
})
```

**Key Pattern**: MobX stores use classes with `makeAutoObservable()`, but React components are functional with the `observer()` HOC for reactivity.

---

## 4. Tool State Machine Pattern

XState machines manage tool modes and workflows:

```typescript
import { createMachine } from 'xstate'

export const toolMachine = createMachine({
  id: 'tools',
  initial: 'select',
  states: {
    select: {
      on: {
        SWITCH_TO_PAN: 'pan',
        SWITCH_TO_CONNECT: 'connect',
        SWITCH_TO_ADD: 'add'
      }
    },
    pan: {
      on: {
        SWITCH_TO_SELECT: 'select',
        SWITCH_TO_CONNECT: 'connect',
        SWITCH_TO_ADD: 'add'
      }
    },
    connect: {
      on: {
        SWITCH_TO_SELECT: 'select',
        SWITCH_TO_PAN: 'pan'
      }
    },
    add: {
      on: {
        NODE_ADDED: 'select',
        CANCEL: 'select'
      }
    }
  }
})
```

---

## 5. Data Flow Rules

### **User Interaction with Graph**
1. User interacts with canvas (click, drag, etc.)
2. JointJS emits event
3. Event handler updates MobX graph model
4. React components observe model and re-render
5. Inspector panel shows updated properties

### **Tool Mode Changes**
1. User clicks toolbar button
2. Event sent to XState tool machine
3. Machine transitions to new tool state
4. Canvas interaction handlers adapt to new mode
5. UI updates to reflect active tool

### **Data Persistence**
1. User triggers save action
2. XState save workflow activates
3. Graph model serialized to JSON
4. Data sent to API endpoint
5. Success/error state displayed to user

---

## 6. Folder Structure

```
/src
  /components     ← Graph canvas, toolbar, inspector, UI components
  /models         ← MobX graph model and business logic
  /workflows      ← XState machines for tools and save/load flows
  /services       ← API client for persistence
  /types          ← TypeScript interfaces for graph elements
  /utils          ← Helper functions and utilities
```

---

## 7. Core Principles

1. **Graph model is the source of truth**  
   All graph state lives in the MobX model—components react to changes.

2. **XState for tool modes and workflows**  
   Tool selection, save flows, undo/redo—not graph data itself.

3. **JointJS handles rendering**  
   Graph visualization delegated to JointJS—React manages the container.

4. **Observable pattern for reactivity**  
   MobX observables enable automatic UI updates when graph changes.

5. **Direct manipulation paradigm**  
   Users interact directly with visual elements, not forms or configuration.

6. **Separation of concerns**  
   Graph logic (MobX) separate from tool logic (XState) separate from rendering (JointJS).

---

## 8. Technology Integration

- **React 19**: Functional components with hooks (no class components)
- **JointJS Plus 4.1.1**: Graph rendering, interaction, layout algorithms
- **MobX 6+**: Observable graph model state with `makeAutoObservable()` and `mobx-react-lite`
- **XState 5.x**: Tool mode state machines and workflow orchestration with `useMachine` hook
- **Zod**: Schema validation for serialized graph data

**Component Pattern**: Use functional components with `observer()` from `mobx-react-lite` to react to MobX store changes. Stores themselves are classes with `makeAutoObservable()`.

---

This architecture provides a clear separation between graph state (what's in the diagram), workflow state (what tool is active, what operation is in progress), and UI state (what's visible, what's focused), enabling a robust and maintainable graph editor application.
