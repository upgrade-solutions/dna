````markdown
# Graph Module

Modular architecture for the JointJS-based graph canvas component, following the joint-plus pattern.

## Structure

```
graph/
├── canvas/                  # Canvas components
│   ├── GraphCanvas.tsx
│   ├── GraphCanvasWithRef.tsx
│   └── index.ts
├── toolbar/                 # Toolbar components
│   ├── GraphToolbar.tsx
│   └── index.ts
├── config/                  # Configuration files
│   ├── defaults.ts         # Default settings (zoom, padding, etc.)
│   └── index.ts
├── shapes/                  # Shape factory
│   ├── shapes-factory.ts   # Cell creation (nodes and links)
│   └── index.ts
├── features/                # Feature implementations
│   ├── event-handler.ts    # User interaction handling
│   └── index.ts
├── utils/                   # Graph utilities
│   ├── graph-init.ts       # Graph and paper initialization
│   ├── graph-utils.ts      # Graph utilities and helpers
│   ├── types.ts            # TypeScript interfaces and types
│   └── index.ts
├── actions.ts               # Centralized action functions
└── index.ts                 # Public exports
```

## Modules

### `config/`
Configuration constants and defaults:
- `ZOOM_MIN`, `ZOOM_MAX`, `ZOOM_STEP` - Zoom constraints
- `PADDING` - Default padding for fit operations
- `DEFAULT_PAPER_CONFIG` - Paper initialization settings
- `DEFAULT_GRAPH_CONFIG` - Graph initialization settings

### `utils/types.ts`
Core TypeScript interfaces:
- `GraphCanvasProps` - Component props
- `GraphInstance` - Graph and paper wrapper
- `NodeData` - Node definition
- `EdgeData` - Edge/link definition
- `GraphData` - Complete graph data structure

### `utils/graph-init.ts`
Graph and paper initialization:
- `initializeGraph()` - Create JointJS graph and paper instances
- `cleanupGraph()` - Cleanup resources on unmount

### `shapes/shapes-factory.ts`
Factory for creating visual elements:
- `ShapesFactory` - Main factory class
  - `createNode()` - Create single node element with tenant styling
  - `createNodes()` - Create multiple nodes
  - `createLink()` - Create single link element with tenant styling
  - `createLinks()` - Create multiple links

### `features/event-handler.ts`
Event handling and user interactions:
- `GraphEventHandler` - Event management class
  - `setupEvents()` - Initialize all event listeners
  - `getSelectedCellView()` - Get current selection
  - `deselectCell()` - Programmatically clear selection
  - `cleanup()` - Remove event listeners

### `utils/graph-utils.ts`
Graph manipulation utilities:
- `populateGraph()` - Add nodes and links to graph
- `clearGraph()` - Remove all cells
- `getCellById()` - Find cell by ID
- `removeCellById()` - Delete cell
- `getAllNodes()` - Get all nodes
- `getAllLinks()` - Get all links
- `centerGraph()` - Center and fit content

### `actions.ts`
Centralized reusable action functions:
- **Selection**: `setSelection()`, `clearSelection()`, `removeSelection()`
- **Zoom**: `zoomIn()`, `zoomOut()`, `resetZoom()`, `zoomToFit()`
- **Paper**: `centerGraph()`, `updateLinksRouting()`
- **Graph Data**: `clearGraph()`, `getAllNodes()`, `getAllLinks()`, `getCellById()`, `removeCellById()`

## Usage Examples

### Basic Component Usage
```tsx
import { GraphCanvas } from './components/graph'

<GraphCanvas 
  tenantConfig={myTenant} 
  onCellViewSelected={(cellView) => console.log(cellView)}
/>
```

### Using Actions Directly
```typescript
import { zoomIn, zoomToFit, setSelection } from './components/graph'

// Zoom in
const newScale = zoomIn(paper)

// Fit to content
zoomToFit(paper)

// Set selection
setSelection(paper, [cell1, cell2])
```

### Using Modules Directly

#### Initialize Graph
```typescript
import { initializeGraph, cleanupGraph } from './components/graph'

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
import { ShapesFactory } from './components/graph'

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
import { GraphEventHandler } from './components/graph'

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
import { populateGraph, centerGraph } from './components/graph'

// Add data to graph
populateGraph(graph, graphData, shapesFactory)

// Center the view
centerGraph(paper)
```

## Extending Functionality

### Adding Custom Actions
Add new actions to `actions.ts`:

```typescript
// actions.ts
export function customAction(paper: dia.Paper, options: CustomOptions): void {
  // Your custom logic
}
```

### Adding New Shapes
Extend `ShapesFactory` in `shapes/shapes-factory.ts`:

```typescript
createCustomNode(node: NodeData, customConfig: any) {
  // Custom shape creation logic
  return new shapes.custom.MyShape({ ... })
}
```

### Adding New Features
Create new feature modules in `features/`:

```typescript
// features/virtual-rendering.ts
export function setupVirtualRendering(paper: dia.Paper): void {
  // Virtual rendering logic
}
```

## Benefits

1. **Separation of Concerns**: Each module has a single responsibility
2. **Testability**: Each module can be unit tested independently
3. **Reusability**: Actions and utilities can be used anywhere
4. **Extensibility**: Easy to add new features without touching core code
5. **Maintainability**: Clear structure makes code easier to understand
6. **Consistent Pattern**: Follows proven joint-plus architecture

## Migration from Old Structure

Files were reorganized from `canvas/` folder into specialized folders:
- `types.ts`, `graph-init.ts`, `utils.ts` → `utils/`
- `shapes-factory.ts` → `shapes/`
- `event-handler.ts` → `features/`
- Created new `config/` for configuration constants
- Created new `actions.ts` for centralized reusable functions

````