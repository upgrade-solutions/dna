# Graph Canvas Module

Modular architecture for the JointJS-based graph canvas component.

## Structure

```
graph-canvas/
├── index.ts              # Public exports
├── types.ts              # TypeScript interfaces and types
├── graph-init.ts         # Graph and paper initialization
├── shapes-factory.ts     # Cell creation (nodes and links)
├── event-handler.ts      # User interaction handling
└── utils.ts              # Graph utilities and helpers
```

## Modules

### `types.ts`
Core TypeScript interfaces for the graph canvas:
- `GraphCanvasProps` - Component props
- `GraphInstance` - Graph and paper wrapper
- `NodeData` - Node definition
- `EdgeData` - Edge/link definition
- `GraphData` - Complete graph data structure

### `graph-init.ts`
Graph and paper initialization:
- `initializeGraph()` - Create JointJS graph and paper instances
- `cleanupGraph()` - Cleanup resources on unmount

### `shapes-factory.ts`
Factory for creating visual elements:
- `ShapesFactory` - Main factory class
  - `createNode()` - Create single node element with tenant styling
  - `createNodes()` - Create multiple nodes
  - `createLink()` - Create single link element with tenant styling
  - `createLinks()` - Create multiple links

### `event-handler.ts`
Event handling and user interactions:
- `GraphEventHandler` - Event management class
  - `setupEvents()` - Initialize all event listeners
  - `getSelectedCellView()` - Get current selection
  - `deselectCell()` - Programmatically clear selection
  - `cleanup()` - Remove event listeners

### `utils.ts`
Graph manipulation utilities:
- `populateGraph()` - Add nodes and links to graph
- `clearGraph()` - Remove all cells
- `getCellById()` - Find cell by ID
- `removeCellById()` - Delete cell
- `getAllNodes()` - Get all nodes
- `getAllLinks()` - Get all links
- `centerGraph()` - Center and fit content

## Usage Examples

### Basic Component Usage
```tsx
import { GraphCanvas } from './components/graph-canvas'

<GraphCanvas 
  tenantConfig={myTenant} 
  onCellViewSelected={(cellView) => console.log(cellView)}
/>
```

### Using Modules Directly

#### Initialize Graph
```typescript
import { initializeGraph, cleanupGraph } from './components/graph-canvas'

const { graph, paper } = initializeGraph({
  container: document.getElementById('canvas'),
  width: 800,
  height: 600,
  tenantConfig: myTenant
})

// Later...
cleanupGraph({ graph, paper })
```

#### Create Shapes
```typescript
import { ShapesFactory } from './components/graph-canvas'

const factory = new ShapesFactory(tenantConfig)

const node = factory.createNode({
  id: 'node-1',
  type: 'api',
  label: 'My API',
  position: { x: 100, y: 100 }
})

const link = factory.createLink({
  id: 'link-1',
  type: 'uses',
  source: 'node-1',
  target: 'node-2'
})
```

#### Handle Events
```typescript
import { GraphEventHandler } from './components/graph-canvas'

const eventHandler = new GraphEventHandler(
  paper, 
  tenantConfig,
  (cellView) => {
    console.log('Selected:', cellView)
  }
)

eventHandler.setupEvents()

// Later...
eventHandler.cleanup()
```

#### Graph Utilities
```typescript
import { populateGraph, centerGraph } from './components/graph-canvas'

// Add data to graph
populateGraph(graph, graphData, shapesFactory)

// Center the view
centerGraph(paper)
```

## Extending Functionality

### Adding Toolbars
The modular structure makes it easy to add toolbar controls:

```typescript
// toolbar.tsx
import { useRef } from 'react'
import { GraphEventHandler, centerGraph } from './graph-canvas'

export function GraphToolbar({ graphInstance }) {
  const handleCenter = () => {
    if (graphInstance) {
      centerGraph(graphInstance.paper)
    }
  }

  return (
    <div className="toolbar">
      <button onClick={handleCenter}>Center</button>
      {/* More tools... */}
    </div>
  )
}
```

### Adding Pan/Zoom
JointJS paper supports panning and zooming:

```typescript
// Add to event-handler.ts or create pan-zoom.ts
export function setupPanZoom(paper: dia.Paper) {
  paper.on('blank:pointerdown', (evt, x, y) => {
    // Pan logic
  })
  
  paper.on('blank:mousewheel', (evt, x, y, delta) => {
    // Zoom logic
    evt.preventDefault()
    const scale = paper.scale()
    const newScale = delta > 0 ? scale.sx * 1.1 : scale.sx * 0.9
    paper.scale(newScale, newScale)
  })
}
```

### Custom Shape Types
Extend `ShapesFactory` to support new shapes:

```typescript
// In shapes-factory.ts
createCustomNode(node: NodeData, customConfig: any) {
  // Custom shape creation logic
  return new shapes.custom.MyShape({ ... })
}
```

## Benefits

1. **Separation of Concerns**: Each module has a single responsibility
2. **Testability**: Each module can be unit tested independently
3. **Reusability**: Modules can be used outside the main component
4. **Extensibility**: Easy to add new features (toolbars, pan/zoom, etc.)
5. **Maintainability**: Clear structure makes code easier to understand and modify
