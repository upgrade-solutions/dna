# PA Graph — Layout Architecture

This document defines the **layout management strategy** for visualizing the DNA structure of applications, enabling users to arrange diagrams using various automatic layout algorithms.

---

## 1. Overview

PA Graph is a specialized diagramming tool for visualizing application DNA—the structural hierarchy of digital platforms:

```
Platform (L0)
└── Application (L1)
    └── Module (L2)
        └── Page (L3)
            └── Section (L4)
                └── Block (L5)
```

### Purpose

Unlike general-purpose diagramming tools, PA Graph focuses on:
- **Hierarchical visualization**: Showing parent-child containment relationships
- **DNA structure**: Encoding business operations into machine-readable schemas
- **Multiple perspectives**: Allowing different layout modes to reveal different insights
- **Automatic organization**: Applying layout algorithms to reduce manual positioning

---

## 2. Critical Design Constraint: Layout Re-rendering

### 2.1 Why Full Re-renders Are Necessary

**Fundamental Issue**: Different layouts require different node types in JointJS.

- **Nested Layout**: Uses JointJS containers (`dia.Element` with embedding)
  - Parents must be container-capable shapes
  - Children are embedded cells, not linked
  - No hierarchy links in graph
  
- **Tree/Dagre Layouts**: Uses standard nodes with links
  - All nodes are standard shapes
  - Hierarchy shown via explicit links
  - No embedding relationships

**Consequence**: Switching between nested and other layouts requires:
1. Clearing the graph completely
2. Recreating all nodes with appropriate types
3. Re-establishing relationships (embedding OR links)
4. Applying the new layout algorithm

### 2.2 When Re-render is Triggered

| From Layout | To Layout | Re-render Required? | Reason |
|-------------|-----------|---------------------|---------|
| Nested | Tree | ✅ Yes | Need to unembed + create links |
| Nested | Grid | ✅ Yes | Need to unembed, remove containers |
| Nested | Dagre | ✅ Yes | Need to unembed + create directed links |
| Tree | Grid | ❌ No | Same node types, just reposition |
| Tree | Dagre | ❌ No | Same structure, different algorithm |
| Grid | Tree | ❌ No | Just apply tree algorithm |

**Rule of Thumb**: Any switch involving nested layout requires full re-render. Switches between non-nested layouts only need re-positioning.

### 2.3 User Experience Impact

**What Users Will Experience**:
- Brief loading state during rebuild (typically <500ms for 100 nodes)
- Potential loss of manual node adjustments
- Reset of viewport position (mitigated by state restoration)
- Animation of new layout being applied

**Mitigation Strategies**:
1. **Warning Dialog**: Show confirmation before re-rendering
2. **State Preservation**: Save and restore viewport, selections where possible
3. **Loading Indicator**: Clear visual feedback during rebuild
4. **Undo Support**: Allow reverting to previous layout
5. **Layout Preview**: Optional preview mode before committing

### 2.4 Toolbar Implementation Requirements

**Toolbar must**:
- Detect when layout switch requires re-render (`requiresRerender()` method)
- Show warning indicator when hovering over re-render-triggering layouts
- Provide confirmation dialog for destructive operations
- Display loading state during graph rebuild
- Update layout dropdown to reflect current state

**Example Toolbar Flow**:
```
User clicks "Nested Layout" → 
Toolbar detects re-render needed →
Shows warning: "This will rebuild the graph. Continue?" →
User confirms →
Shows loading spinner →
LayoutManager clears graph →
LayoutManager rebuilds with containers →
Applies nested layout algorithm →
Hides loading spinner →
Updates toolbar dropdown
```

---

## 3. Layout Philosophy

### 3.1 Core Principles

1. **Configuration over code**: Layouts are user-selectable, not hardcoded
2. **Preserve hierarchy**: All layouts must respect parent-child relationships
3. **Progressive disclosure**: Support zoom-based visibility management
4. **Context-appropriate**: Different layouts serve different analysis needs

### Layout Requirements

Any layout algorithm integrated into PA Graph must:
- Support hierarchical/nested structures (parents containing children)
- Handle 6+ levels of depth gracefully
- Preserve logical relationship flows (links between nodes)
- Scale to 100+ nodes without performance degradation
- Provide consistent, deterministic results

---

## 4. Available Layouts

### 4.1 Nested Layout (New) ⭐

**Purpose**: Visual containment layout showing resources embedded within their parent containers

**When to use**:
- Visualizing organizational hierarchies (Accounts → Applications → Modules)
- Understanding physical containment relationships
- Exploring multi-level nested structures
- Viewing parent-child relationships spatially (inside/outside)

**Implementation**:
- Uses JointJS container/embedding features (`parent.embed(child)`)
- Renders parent nodes as resizable containers
- Children positioned inside parent boundaries
- Automatic container sizing based on children
- No hierarchy links needed (spatial containment shows relationships)

**Data Source**: Account resources from `data/accounts/{account}/resources.ts`

**Account Structure**:
```
Account (L0) - Container
└── Application (L1) - Container
    └── Module (L2) - Container
        └── Page (L3) - Container
            └── Section (L4) - Container
                └── Block (L5) - Node
```

**Key Features**:
- **Full Graph Re-render**: Switching to/from nested layout rebuilds entire graph
- **Container Nodes**: Parents are rendered as JointJS containers (different cell type)
- **Spatial Hierarchy**: Parent-child shown through visual containment, not links
- **Auto-sizing**: Containers automatically resize to fit embedded children
- **Layout Algorithm**: Custom positioning algorithm places children within parent bounds

**JointJS API**: 
- `element.embed(child)` - Embed child within parent
- `element.fitToChildren(padding)` - Resize container to fit children
- Container cell types with custom rendering

**Characteristics**:
- Natural representation of organizational structure
- No need for hierarchy links (spatial containment is self-documenting)
- Supports unlimited nesting depth
- Best for account/org visualization
- Requires graph rebuild when switching layouts (different node types)

**Toolbar Integration**:
- Layout switcher includes "Nested (Containers)" option
- Switching to nested triggers full graph re-render
- Layout manager coordinates rebuild with account data
- Previous layout state preserved for quick switching back

**Re-render Strategy**:
```typescript
// When switching to nested layout:
1. Clear existing graph (remove all cells)
2. Load account resources from data/accounts
3. Create container nodes for each parent resource
4. Create child nodes and embed in parents
5. Apply nested positioning algorithm
6. Auto-resize containers to fit children
7. Update layout manager state
```

**Future Enhancements**:
- Zoom-level based container expansion/collapse
- Interactive drag-to-reparent
- Container style customization per level
- Minimap navigation for deeply nested views

---

### 4.2 Tree Layout (Primary)

**Purpose**: Hierarchical top-down organization showing clear parent-child relationships with links

**When to use**:
- Exploring organizational structure with explicit connections
- Understanding module/page hierarchies with flow arrows
- Analyzing dependency flows
- When link routing and direction matter

**Configuration**:
- Direction: Left-to-right, top-to-bottom, or diagonal variants
- Parent-child gap: Vertical spacing between levels
- Sibling gap: Horizontal spacing between nodes at same level
- First child gap: Distance from parent to first child (diagonal only)

**JointJS API**: `layout.TreeLayout`

**Characteristics**:
- Best for strict hierarchies (single parent per node)
- Handles mixed directions (different subtrees can have different orientations)
- Supports sibling ranking for custom ordering
- Uses links to show parent-child relationships

---

### 4.3 Grid Layout

**Purpose**: Regular grid arrangement for consistent visual rhythm

**When to use**:
- Comparing similar entities (all apps, all modules)
- Portfolio overviews
- Initial exploration of flat structures

**Configuration**:
- Columns: Number of columns in grid
- Column width: Auto, compact, or fixed
- Row height: Auto, compact, or fixed
- Gaps: Spacing between cells

**JointJS API**: `layout.GridLayout`

**Characteristics**:
- Predictable, uniform spacing
- Good for presentations and reports
- Works best with same-sized nodes

---

### 4.4 Directed Graph (Future)

**Purpose**: Layered layout optimized for directed flows

**When to use**:
- Analyzing data flows
- API dependency chains
- Process workflows

**Configuration**:
- Rank direction: TB, BT, LR, RL
- Rank separation: Spacing between layers
- Node separation: Spacing within layers
- Edge routing: Polyline or spline

**JointJS API**: `layout.DirectedGraph` (Dagre-based)

**Characteristics**:
- Minimizes edge crossings
- Groups nodes into logical layers
- Handles cyclic graphs

---

### 4.5 Force-Directed (Future)

**Purpose**: Physics-based organic layout

**When to use**:
- Discovering clusters/communities
- Exploring unknown structures
- Identifying hub nodes

**Configuration**:
- Link distance: Ideal edge length
- Link strength: Spring stiffness
- Charge force: Node repulsion
- Gravity: Center attraction

**JointJS API**: `layout.ForceDirected`

**Characteristics**:
- Emergent, data-driven structure
- Reveals natural groupings
- Requires simulation time

---

### 4.6 MSAGL (Future)

**Purpose**: Microsoft Automatic Graph Layout (Sugiyama algorithm)

**When to use**:
- Complex layered hierarchies
- Need for advanced edge routing
- Nested subgraph visualization

**Configuration**:
- Direction: Top-to-bottom or left-to-right
- Layer gap: Spacing between layers
- Edge routing: Rectilinear or spline bundling

**JointJS API**: `@joint/layout-msagl`

**Characteristics**:
- Production-quality edge routing
- Supports nested containers
- Advanced optimization

---

## 5. Layout Manager Architecture

### 5.1 Responsibility

The `LayoutManager` class:
- Stores current layout configuration
- Applies selected layout algorithm to graph
- **Coordinates full graph re-renders when switching layout types**
- Preserves layout settings in tenant config
- Provides unified API for all layout types
- Handles layout-specific options
- Manages container vs. node rendering modes

### 5.2 Re-render Strategy for Layout Switching

**Critical Design Decision**: Different layouts may require different node types (containers vs. standard nodes), necessitating full graph rebuilds.

**When Re-render is Required**:
- Switching TO nested layout (requires container nodes)
- Switching FROM nested layout (requires standard nodes)
- Changing between layouts with incompatible node types

**Re-render Process**:
```typescript
// 1. Save current state (selection, zoom, pan)
const state = saveGraphState()

// 2. Clear existing graph
graph.clear()

// 3. Rebuild based on layout type
if (newLayout === 'nested') {
  // Create container nodes from account resources
  buildNestedGraph(accountResources)
} else {
  // Create standard nodes with hierarchy links
  buildTreeGraph(accountResources)
}

// 4. Apply layout algorithm
applyLayout(newLayout)

// 5. Restore state where possible
restoreGraphState(state)
```

**Optimization Strategies**:
- Cache resource data to avoid re-fetching
- Maintain node ID consistency across rebuilds
- Preserve user selections and viewport where possible
- Animate transitions for visual continuity
- Debounce rapid layout switches

### 5.3 API Design

```typescript
interface LayoutManager {
  // Current layout state
  getCurrentLayout(): LayoutType
  
  // Apply layout (may trigger re-render)
  applyLayout(type: LayoutType, options?: LayoutOptions): void
  
  // Check if layout switch requires re-render
  requiresRerender(fromType: LayoutType, toType: LayoutType): boolean
  
  // Full graph rebuild with new layout
  rebuildGraphWithLayout(type: LayoutType, resources: ResourceGraph): void
  
  // Layout-specific configuration
  getLayoutConfig(type: LayoutType): LayoutOptions
  setLayoutConfig(type: LayoutType, options: LayoutOptions): void
  
  // Reset to defaults
  resetLayout(): void
}

type LayoutType = 
  | 'nested'        // Container embedding (NEW)
  | 'tree'          // TreeLayout with links
  | 'grid'          // GridLayout
  | 'dagre'         // DirectedGraph (future)
  | 'force'         // ForceDirected (future)
  | 'msagl'         // MSAGL (future)
  | 'none'          // Manual positioning only

interface LayoutOptions {
  // Common options
  animated?: boolean
  duration?: number
  
  // Layout-specific
  nested?: NestedLayoutOptions
  tree?: TreeLayoutOptions
  grid?: GridLayoutOptions
  // ... etc
}

interface NestedLayoutOptions {
  containerPadding?: number      // Padding inside containers
  levelSpacing?: number          // Vertical space between levels
  siblingSpacing?: number        // Horizontal space between siblings
  autoResize?: boolean           // Auto-resize containers to fit children
  collapsible?: boolean          // Allow container collapse/expand
  minContainerSize?: { width: number; height: number }
}
```

### 5.4 Integration Points

**Toolbar Control**: 
- Dropdown selector for layout type
- Secondary panel for layout options
- Preview mode before applying
- **Warning UI when re-render is required** (e.g., "Switching layouts will rebuild the graph")

**Tenant Config**:
- Default layout per tenant
- Layout-specific defaults
- Persisted layout state
- Account-to-layout associations (e.g., nested view for organizational accounts)

**Graph Model**:
- Trigger layout on demand
- Auto-layout on graph changes (optional)
- Layout invalidation on structure changes
- **Re-render coordination** with resource loader

**Resource Loader**:
- Provides account resources for nested layout
- Caches resource data for performance
- Supports lazy loading of deep hierarchies
- Validates resource structure before rendering

---

## 5. Zoom-Based Visibility

### 5.1 Strategy

**Core Principle**: Show parent nodes and their immediate children only. Hide grandchildren and deeper descendants.

**Why**: Reduces visual clutter while maintaining context. Users see current level + one level down.

### 5.2 Implementation

Managed by `HierarchyVisibilityManager` (existing):
- Tracks current zoom level
- Calculates visible depth based on zoom
- Shows/hides nodes dynamically
- Updates link visibility accordingly

**Visibility Rules**:
- Root nodes always visible
- Direct children of visible parents are shown
- Grandchildren (2+ levels deep) are hidden
- Links only shown when both endpoints visible

### 5.3 User Control

- Automatic mode: Zoom level controls visibility
- Manual mode: Expand/collapse specific nodes
- Layers: Show/hide entire layers

---

## 6. JointJS Container Implementation

### 6.1 Container API Overview

**Key JointJS Methods for Nested Layout**:

```typescript
// Embedding children
parent.embed(child)              // Add child to parent's embedded list
parent.unembed(child)            // Remove child from parent
parent.getEmbeddedCells()        // Get all embedded children

// Auto-sizing containers
parent.fitToChildren({
  padding: 50,                   // Internal padding
  deep: true                     // Include grandchildren in calculation
})

// Parent-child queries
child.getParentCell()            // Get immediate parent
element.isEmbeddedIn(parent)     // Check if embedded
```

**Container Rendering**:
```typescript
// Container node with custom appearance
const container = new shapes.standard.Rectangle({
  markup: [{
    tagName: 'rect',
    selector: 'body',
  }, {
    tagName: 'text',
    selector: 'label',
  }, {
    tagName: 'rect',
    selector: 'headerBackground',
  }, {
    tagName: 'text',
    selector: 'headerLabel',
  }],
  attrs: {
    body: {
      fill: 'rgba(255, 255, 255, 0.05)',
      stroke: '#6366f1',
      strokeWidth: 2,
      strokeDasharray: '5 5',  // Dashed border for containers
      rx: 8,
      ry: 8,
    },
    headerBackground: {
      fill: '#6366f1',
      height: 30,
      width: 'calc(w)',
    },
    headerLabel: {
      text: 'Container Name',
      fill: '#ffffff',
      fontSize: 14,
      fontWeight: 'bold',
      refX: '50%',
      refY: 15,
      textAnchor: 'middle',
    },
    label: {
      text: 'Description',
      fontSize: 12,
      fill: '#9ca3af',
      refX: '50%',
      refY: '100%',
      refY2: -10,
      textAnchor: 'middle',
    }
  }
})
```

### 6.2 Hierarchy Traversal

**Building Nested Structure from Account Resources**:

```typescript
function buildNestedGraph(resources: Resource[], graph: dia.Graph): void {
  const nodeMap = new Map<string, dia.Element>()
  
  // Create all nodes first (breadth-first)
  resources.forEach(resource => {
    const isContainer = resource.children && resource.children.length > 0
    const node = createNode(resource, isContainer)
    graph.addCell(node)
    nodeMap.set(resource.id, node)
  })
  
  // Establish parent-child relationships (depth-first)
  resources.forEach(resource => {
    if (resource.children) {
      const parent = nodeMap.get(resource.id)!
      resource.children.forEach(child => {
        buildNestedGraph([child], graph) // Recursive
        const childNode = nodeMap.get(child.id)!
        parent.embed(childNode)
      })
      
      // Auto-resize after all children embedded
      parent.fitToChildren({ padding: 50, deep: true })
    }
  })
}
```

### 6.3 Positioning Algorithm

**Nested Layout Strategy**:

```typescript
function layoutNestedContainers(
  element: dia.Element, 
  options: NestedLayoutOptions
): void {
  const children = element.getEmbeddedCells() as dia.Element[]
  if (children.length === 0) return
  
  // Sort children by hierarchy level or custom order
  children.sort((a, b) => {
    const levelA = a.get('hierarchyLevel') || 0
    const levelB = b.get('hierarchyLevel') || 0
    return levelA - levelB
  })
  
  const { containerPadding, siblingSpacing } = options
  let currentX = containerPadding
  let currentY = containerPadding + 40 // Account for header
  let rowHeight = 0
  
  children.forEach((child, index) => {
    const size = child.size()
    
    // Simple grid-like positioning within container
    child.position(currentX, currentY, { parentRelative: true })
    
    // Track row height
    rowHeight = Math.max(rowHeight, size.height)
    
    // Move to next position
    currentX += size.width + siblingSpacing
    
    // Wrap to next row if exceeds container width
    const parentSize = element.size()
    if (currentX + size.width > parentSize.width - containerPadding) {
      currentX = containerPadding
      currentY += rowHeight + siblingSpacing
      rowHeight = 0
    }
    
    // Recursively layout nested children
    if (child.get('isContainer')) {
      layoutNestedContainers(child, options)
    }
  })
  
  // Resize container to fit all positioned children
  element.fitToChildren({ 
    padding: containerPadding,
    deep: false  // We already laid out children recursively
  })
}
```

### 6.4 Container Types by Level

**Account Hierarchy Mapping**:

| Level | Resource Type | Container Type | Visual Style |
|-------|---------------|----------------|--------------|
| L0 | Account | Large Container | Thick border, distinct color |
| L1 | Application | Medium Container | Solid border, brand color |
| L2 | Module | Medium Container | Dashed border |
| L3 | Page | Small Container | Thin border |
| L4 | Section | Small Container | Dotted border |
| L5 | Block | Standard Node | No container, solid shape |

**Rendering Rules**:
- Levels 0-4: Render as containers (can embed children)
- Level 5 (Block): Render as standard nodes (no embedding)
- Container size increases with hierarchy level
- Header height/style varies by level
- Border style distinguishes container types

### 6.5 Interactive Features

**Planned Container Interactions**:

```typescript
// Collapse/Expand
container.set('collapsed', true)
// Hides children, shows collapse indicator
// Updates size to collapsed dimensions

// Drag-to-Reparent
paper.on('element:pointerup', (elementView) => {
  const element = elementView.model
  const newParent = findContainerUnder(element.position())
  
  if (newParent && newParent !== element.getParentCell()) {
    const oldParent = element.getParentCell()
    oldParent?.unembed(element)
    newParent.embed(element)
    
    // Re-layout both containers
    layoutNestedContainers(oldParent, options)
    layoutNestedContainers(newParent, options)
  }
})

// Zoom-based Detail Levels
paper.on('scale', (sx, sy) => {
  const zoomLevel = sx // Assuming uniform scaling
  
  if (zoomLevel < 0.5) {
    // Hide deep nesting, show only top 2 levels
    hideDeepContainers(3)
  } else if (zoomLevel > 1.5) {
    // Show all details
    showAllContainers()
  }
})
```

### 6.6 Performance Considerations

**Optimization for Nested Layout**:

- **Virtual Rendering**: Only render containers in viewport
- **Lazy Expansion**: Load children on-demand when expanding collapsed containers
- **Level-of-Detail (LOD)**: Simplify container rendering at low zoom levels
- **Batch Updates**: Use `graph.startBatch()` / `graph.stopBatch()` during layout
- **Container Caching**: Cache computed container sizes to avoid recalculation

```typescript
// Efficient batch updates
graph.startBatch('layout')

// Perform all positioning and embedding
resources.forEach(buildContainer)

graph.stopBatch('layout')  // Single re-render
```

---

## 7. Hierarchy Relationships

### 7.1 Parent-Child Encoding

**Data Model**: Resources have `children` array property

**Graph Representation (varies by layout)**:

**Nested Layout**:
- JointJS embedding: `parent.embed(child)` (visual containment)
- Custom property: `child.set('parentId', parent.id)`
- Hierarchy level: `node.set('hierarchyLevel', level)`
- No hierarchy links (containment shows relationship)

**Tree/Dagre Layouts**:
- JointJS links: Parent → Child edges
- Custom property: `child.set('parentId', parent.id)`
- Hierarchy level: `node.set('hierarchyLevel', level)`
- Links show explicit parent-child connections

### 7.2 Link Routing (Tree/Dagre Layouts Only)

**Note**: Nested layout doesn't use links for hierarchy—spatial containment replaces them.

**Intra-container links**: Routes stay within parent bounds (for nested mode future enhancement)
**Inter-container links**: Routes between containers, avoiding overlaps

**Router Options**:
- Orthogonal: Right-angle turns (Manhattan routing)
- Metro: Rounded corners, aligned paths
- Straight: Direct lines (minimal, can overlap)

### 7.3 Switching Between Representations

**Key Challenge**: Hierarchy can be shown two ways:
1. **Spatial (Nested)**: Children literally inside parent boxes
2. **Explicit (Tree)**: Children connected by arrows/links

**Conversion Process**:
```typescript
// Tree → Nested: Remove links, create embeddings
treeToNested(graph) {
  graph.getLinks()
    .filter(link => link.get('isHierarchyLink'))
    .forEach(link => link.remove())
  
  graph.getElements().forEach(element => {
    const parentId = element.get('parentId')
    if (parentId) {
      const parent = graph.getCell(parentId) as dia.Element
      parent.embed(element)
    }
  })
}

// Nested → Tree: Remove embeddings, create links
nestedToTree(graph) {
  graph.getElements().forEach(element => {
    const parent = element.getParentCell()
    if (parent) {
      parent.unembed(element)
      
      // Create hierarchy link
      const link = new shapes.standard.Link({
        source: { id: parent.id },
        target: { id: element.id },
        attrs: { /* hierarchy link style */ }
      })
      link.set('isHierarchyLink', true)
      graph.addCell(link)
    }
  })
}
```

---

## 8. Implementation Phases

### Phase 1: Nested Layout Foundation (Week 1)
- [ ] Update `LayoutManager` to support nested layout type
- [ ] Add `requiresRerender()` method to detect layout type changes
- [ ] Create `NestedLayoutOptions` interface
- [ ] Add nested layout to toolbar dropdown
- [ ] Implement re-render warning UI

### Phase 2: Container Node Creation (Week 2)
- [ ] Create `ContainerNode` shape class extending JointJS Element
- [ ] Implement custom rendering for container boundaries
- [ ] Add auto-resize logic (`fitToChildren()` wrapper)
- [ ] Create container factory from resource data
- [ ] Handle 6-level hierarchy (Account → Application → Module → Page → Section → Block)

### Phase 3: Nested Layout Algorithm (Week 3)
- [ ] Build recursive layout algorithm for embedded children
- [ ] Position children within parent bounds
- [ ] Apply padding and spacing rules
- [ ] Handle variable container sizes
- [ ] Implement level-based spacing

### Phase 4: Graph Rebuild Coordination (Week 4)
- [ ] Implement `rebuildGraphWithLayout()` method
- [ ] Save/restore graph state (viewport, selections)
- [ ] Clear and rebuild logic
- [ ] Resource data integration
- [ ] Transition animations

### Phase 5: Polish & Optimization (Week 5)
- [ ] Container collapse/expand interactions
- [ ] Drag-to-reparent functionality
- [ ] Performance optimization (virtual rendering for deep nests)
- [ ] Persist nested layout preferences
- [ ] Add nested layout preview mode

### Phase 6: Existing Layouts (Ongoing)
- [ ] Ensure tree/grid layouts work after refactor
- [ ] Test layout switching (nested ↔ tree ↔ grid)
- [ ] DirectedGraph (Dagre) integration (future)
- [ ] ForceDirected layout (future)
- [ ] MSAGL adapter (future)

---

## 9. Configuration & Settings

### 9.1 Tenant Config

```typescript
interface TenantConfig {
  // ... existing properties
  layout: {
    defaultType: LayoutType
    nested: {
      containerPadding: number
      levelSpacing: number
      siblingSpacing: number
      autoResize: boolean
      collapsible: boolean
      minContainerSize: { width: number; height: number }
      defaultExpanded: boolean
    }
    tree: {
      direction: 'L' | 'R' | 'T' | 'B' | 'TL' | 'TR' | 'BL' | 'BR'
      parentGap: number
      siblingGap: number
      firstChildGap?: number
      symmetrical: boolean
    }
    grid: {
      columns: number
      columnWidth: 'auto' | 'compact' | number
      rowHeight: 'auto' | 'compact' | number
      columnGap: number
      rowGap: number
    }
    // ... other layout configs
  }
  visibility: {
    enableZoomFiltering: boolean
    autoExpand: boolean
    defaultCollapsedLevels: number[]
  }
}
```

### 9.2 Toolbar UI

```tsx
<Select 
  value={currentLayout} 
  onChange={handleLayoutChange}
>
  <option value="nested">Nested (Containers)</option>
  <option value="tree">Tree (Hierarchical)</option>
  <option value="grid">Grid (Uniform)</option>
  <option value="dagre">Directed Graph</option>
  <option value="force">Force-Directed</option>
  <option value="none">Manual</option>
</Select>

{requiresRerender && (
  <Alert severity="info">
    Switching layouts will rebuild the graph
  </Alert>
)}

<Button onClick={openLayoutOptions}>
  Configure Layout
</Button>

<Button onClick={applyLayout}>
  Apply Layout
</Button>
```

---

## 10. Edge Cases & Considerations

### 10.1 Circular References
**Problem**: Child references ancestor (e.g., Block calls Platform API)

**Solution**: 
- Layout treats as external link
- Route outside container boundaries (nested mode)
- Different visual style (dashed, different color)
- Tree layout handles naturally with back-edges

### 10.2 Orphan Nodes
**Problem**: Resource without explicit parent

**Solution**:
- Create implicit root container (nested mode)
- Allow drag-and-drop to reparent
- Highlight orphans visually
- Tree mode shows at root level

### 10.3 Deep Nesting (>6 levels)
**Problem**: Too many levels to visualize effectively

**Solution**:
- Automatic intermediate level collapsing (nested mode)
- Breadcrumb navigation for deep paths
- Minimap shows full tree structure
- Zoom-based visibility filtering

### 10.4 Mixed Structures
**Problem**: Some branches deeper than others

**Solution**:
- TreeLayout handles naturally
- Nested containers auto-size per branch
- Visibility manager adapts per branch
- No forced symmetry

### 10.5 Container Sizing Conflicts
**Problem**: Children too large to fit in parent bounds (nested mode)

**Solution**:
- Auto-resize parent container (default behavior)
- Set minimum container sizes in config
- Allow container overflow with scroll indicators
- Warn user about oversized nested structures

### 10.6 Layout Switching Performance
**Problem**: Re-rendering entire graph can be slow for large accounts

**Solution**:
- Show loading indicator during rebuild
- Use web workers for layout calculation (future)
- Implement progressive rendering (render visible nodes first)
- Cache pre-computed layouts per account
- Debounce rapid layout switches

---

## 11. Performance Considerations

### 11.1 Large Graphs (>100 nodes)

**Strategies**:
- Virtual rendering (render visible nodes only)
- Level-of-detail (LOD): Simplified shapes when zoomed out
- Lazy loading: Load children on expansion
- Viewport culling: Don't render off-screen nodes

### 11.2 Layout Calculation

**Optimization**:
- Incremental layout (only affected nodes)
- Layout caching (memoize results)
- Web Worker offloading (for force-directed)
- Debounced re-layout (batch changes)

---

## 12. Testing Strategy

### 12.1 Unit Tests
- Layout manager state transitions
- Layout option validation
- Hierarchy traversal algorithms

### 12.2 Integration Tests
- TreeLayout with 6-level hierarchy
- GridLayout with variable node sizes
- Layout switching preserves graph state

### 12.3 Visual Regression Tests
- Screenshot comparison at standard zoom levels
- Link routing correctness
- Node positioning consistency

---

## 13. Success Metrics

### Visual Clarity
- ✅ Users identify parent-child relationships at a glance
- ✅ Links don't cross unnecessarily (>80% clean routing)
- ✅ Layouts converge in <2 seconds

### Performance
- ✅ <200ms layout calculation for 200-node graph
- ✅ 60fps during layout animations
- ✅ <1s full graph render for typical tenant

### Usability
- ✅ New users understand layout options without docs
- ✅ Layout changes feel responsive and predictable
- ✅ Preferred layout persists across sessions

---

## 14. References

### JointJS Documentation
- [Layout Overview](https://docs.jointjs.com/api/layout/)
- [TreeLayout API](https://docs.jointjs.com/api/layout/TreeLayout/)
- [GridLayout API](https://docs.jointjs.com/api/layout/GridLayout/)
- [MSAGL Layout](https://docs.jointjs.com/api/layout/MSAGL/)
- [Release Notes 4.2.0](https://docs.jointjs.com/learn/release-notes/4.2.0)

### Related DNA Docs
- [State Architecture](./STATE_ARCHITECTURE.md)
- [Layers Architecture](./LAYERS_ARCHITECTURE.md)
- [Graph Conventions](./GRAPH_CONVENTIONS.md)

---

## Summary

PA Graph's layout system enables users to visualize application DNA through multiple lenses:

1. **Nested Layout** (NEW): Container-based visualization with spatial hierarchy—children literally inside parents. Ideal for organizational/account views. Requires full graph re-render when switching.

2. **TreeLayout**: Hierarchical visualization with explicit links showing parent-child relationships across the 6-level DNA structure.

3. **GridLayout**: Uniform presentation for comparison and overview of flat structures.

4. **Advanced layouts** (future): Dagre, Force-Directed, MSAGL for specialized analysis needs.

The `LayoutManager` provides a unified API for selecting and configuring layouts, with preferences persisted in tenant configuration. **Critical architectural decision**: Different layouts may require different node types (containers vs. standard nodes), necessitating full graph rebuilds when switching between certain layout types.

Combined with zoom-based visibility management, this creates a powerful system for navigating complex application structures.

**Key Philosophy**: Layouts are tools for revealing different aspects of the same underlying DNA structure—not rigid constraints but flexible lenses. The nested layout adds a **spatial dimension** to hierarchy visualization, complementing the traditional tree-based approach.

**JointJS Container Reference**: 
- [Containers & Grouping Guide](https://docs.jointjs.com/learn/features/containers-and-grouping/#adding-an-embedded-child)
- [Element.embed() API](https://docs.jointjs.com/api/dia/Element#dia.Element.prototype.embed)
- [Element.fitToChildren() API](https://docs.jointjs.com/api/dia/Element#dia.Element.prototype.fitToChildren)
