# PA Graph — Layout Architecture

This document defines the **hierarchical layout strategy** for visualizing complex nested resource structures with intelligent zoom-based visibility controls.

---

## 1. Problem Statement

Currently, the graph visualization displays all resources flatly in a simple grid layout, resulting in:
- **Visual chaos**: Lines flowing everywhere without clear hierarchy
- **No containment**: Child resources appear disconnected from parents
- **Flat structure**: Platform > Application > Module > Page > Section > Block hierarchy not visually apparent
- **Information overload**: All levels visible simultaneously, obscuring relationships

### **Requirements**
1. **Hierarchical containment**: Nodes within nodes (containers/parent-child)
2. **Same-level organization**: Swimlanes or axis-based grouping for siblings
3. **Zoom-based visibility**: Show node + hint of children, hide grandchildren to reduce clutter
4. **Cohesive connections**: Links should follow logical flow, not cross containers chaotically

---

## 2. Hierarchy Definition

### **Resource Type Hierarchy**
```
Platform (L0)
└── Application (L1)
    └── Module (L2)
        └── Page (L3)
            └── Section (L4)
                └── Block (L5)
```

### **Containment Rules**
- **Level 0 (Platform)**: Top-level container, typically one per tenant
- **Level 1 (Application)**: Multiple apps within a platform
- **Level 2 (Module)**: Feature groupings within an app
- **Level 3 (Page)**: Individual routes/views
- **Level 4 (Section)**: Layout regions within a page
- **Level 5 (Block)**: Atomic UI components

**Key Insight**: Current data structure already supports this via `children` property on resources.

---

## 3. Layout Strategy

### **3.1 JointJS Embedding & Grouping**

**Use JointJS native parent-child embedding** instead of fighting against it.

#### **Embedding API**
```typescript
// Embed child within parent
parent.embed(child)

// Check if embedded
parent.isEmbedded()

// Get parent
child.getParentCell()

// Get all embedded children
parent.getEmbeddedCells()

// Unembed
parent.unembed(child)
```

#### **Visual Implications**
- **Automatic containment**: Children move with parent when dragged
- **Bounding box**: Parent automatically sizes to contain children (with padding)
- **Z-index**: Parents render behind children (proper layering)
- **Selection**: Can configure parent vs. child selection priority

#### **Container Shape Requirements**
Parents need different visual treatment than leaf nodes:
- **Expanded state**: Shows children, larger size, semi-transparent fill
- **Collapsed state**: Hides children, compact size, solid fill
- **Resize handles**: Allow manual adjustment of container bounds
- **Header bar**: Title area at top (like swimlane header)

---

### **3.2 Hierarchical Layout Algorithm**

**Replace simple grid layout with recursive hierarchical layout:**

```typescript
interface LayoutConfig {
  nodeSpacing: number       // Space between sibling nodes
  levelSpacing: number      // Vertical space between hierarchy levels
  containerPadding: number  // Padding inside container nodes
  swimlaneWidth: number     // Width of each vertical swimlane
  direction: 'TB' | 'LR'   // Top-to-bottom or Left-to-right
}

function layoutHierarchical(
  resources: Resource[],
  config: LayoutConfig
): Map<string, Position> {
  // Recursive layout:
  // 1. Identify root nodes (no parent)
  // 2. Layout roots horizontally (swimlanes)
  // 3. For each root, recursively layout children within container
  // 4. Calculate container size based on children bounds
  // 5. Position children relative to container position
}
```

#### **Layout Modes**

**Mode A: Vertical Swimlanes** (Recommended)
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Application │  │ Application │  │ Application │
│      1      │  │      2      │  │      3      │
│             │  │             │  │             │
│ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │
│ │ Module  │ │  │ │ Module  │ │  │ │ Module  │ │
│ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │
│ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │
│ │ Module  │ │  │ │ Module  │ │  │ │ Module  │ │
│ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Benefits**:
- Clear separation of parallel branches
- Vertical scrolling feels natural
- Easy to add new applications (new swimlane)
- Links stay within or between adjacent lanes

**Mode B: Tree Layout** (Alternative)
```
            Platform
         /      |      \
    App1      App2      App3
    /  \       |       /  \
 Mod1 Mod2   Mod3   Mod4 Mod5
```

**Benefits**:
- Traditional org-chart feel
- Shows relationships clearly
- Works well for smaller hierarchies
- Good for overview/minimap

---

### **3.3 Zoom-Based Visibility (Level of Detail)**

**Core Principle**: Only show the **currently focused level + one level down (children)**, hide grandchildren and deeper.

#### **Visibility Rules by Zoom Level**

| Zoom Level | Visible Nodes | Hidden Nodes | Use Case |
|------------|---------------|--------------|----------|
| **0.2-0.5x** (Far Out) | Platforms, Applications | Modules, Pages, Sections, Blocks | Architecture overview |
| **0.5-1.0x** (Medium) | Applications, Modules | Pages, Sections, Blocks | Feature mapping |
| **1.0-2.0x** (Standard) | Modules, Pages, Sections | Blocks | Workflow design |
| **2.0-3.0x** (Close Up) | Sections, Blocks | None | Component detail |

#### **Implementation Approach**

**Option 1: Dynamic Filtering** (Recommended)
```typescript
class ZoomVisibilityManager {
  private graph: dia.Graph
  private paper: dia.Paper
  private currentZoom: number
  
  updateVisibility(zoomLevel: number) {
    const visibleLevels = this.calculateVisibleLevels(zoomLevel)
    
    this.graph.getElements().forEach(element => {
      const level = element.get('hierarchyLevel')
      const shouldShow = visibleLevels.includes(level)
      
      // Fade out instead of hide for smoother transitions
      element.attr('body/opacity', shouldShow ? 1 : 0.1)
      element.attr('label/opacity', shouldShow ? 1 : 0)
      
      // Optionally collapse containers when zoomed out
      if (!shouldShow && element.get('isContainer')) {
        this.collapseContainer(element)
      }
    })
    
    this.updateLinks(visibleLevels)
  }
  
  calculateVisibleLevels(zoom: number): number[] {
    if (zoom < 0.5) return [0, 1]      // Platform, Application
    if (zoom < 1.0) return [1, 2]      // Application, Module
    if (zoom < 2.0) return [2, 3, 4]   // Module, Page, Section
    return [3, 4, 5]                   // Page, Section, Block
  }
  
  updateLinks(visibleLevels: number[]) {
    this.graph.getLinks().forEach(link => {
      const source = link.getSourceElement()
      const target = link.getTargetElement()
      
      const sourceLevel = source?.get('hierarchyLevel') ?? 0
      const targetLevel = target?.get('hierarchyLevel') ?? 0
      
      // Only show links where both ends are visible
      const shouldShow = visibleLevels.includes(sourceLevel) 
        && visibleLevels.includes(targetLevel)
      
      link.attr('line/opacity', shouldShow ? 1 : 0.1)
      link.attr('line/strokeDasharray', shouldShow ? 'none' : '5,5')
    })
  }
}
```

**Option 2: Container Expand/Collapse**
```typescript
class ContainerManager {
  expandContainer(container: dia.Element) {
    const children = container.getEmbeddedCells()
    children.forEach(child => {
      child.set('visible', true)
      child.attr('body/display', 'block')
    })
    container.set('expanded', true)
    this.resizeToFitChildren(container)
  }
  
  collapseContainer(container: dia.Element) {
    const children = container.getEmbeddedCells()
    children.forEach(child => {
      child.set('visible', false)
      child.attr('body/display', 'none')
    })
    container.set('expanded', false)
    this.resizeToCompact(container)
  }
}
```

---

### **3.4 Link Routing & Organization**

**Problem**: Links currently flow everywhere, creating visual spaghetti.

#### **Solution: Smart Router with Hierarchy Awareness**

```typescript
const linkDefaults = {
  router: {
    name: 'orthogonal',  // Right-angle routing (Manhattan)
    args: {
      padding: 20,
      step: 10,
      // Custom router that prefers routing along container edges
      preferredSides: ['bottom', 'top'], // Exit bottom, enter top
      avoidEmbeddedCells: true
    }
  },
  connector: {
    name: 'rounded',  // Smooth rounded corners
    args: { radius: 10 }
  }
}

// Apply hierarchy-specific routing rules
function routeHierarchicalLink(link: dia.Link): void {
  const source = link.getSourceElement()
  const target = link.getTargetElement()
  
  const sourceParent = source?.getParentCell()
  const targetParent = target?.getParentCell()
  
  // Same parent: route within container
  if (sourceParent === targetParent) {
    link.router('metro', {
      startDirections: ['bottom'],
      endDirections: ['top']
    })
  }
  // Different parents: route between containers
  else {
    link.router('orthogonal', {
      padding: 30,
      avoidEmbeddedCells: true
    })
  }
}
```

#### **Link Types by Relationship**

| Relationship | Visual Style | Routing |
|--------------|--------------|---------|
| `contains` | Dotted, thin, gray | Inside container, straight |
| `depends-on` | Solid, blue, arrow | Between containers, orthogonal |
| `communicates-with` | Solid, green, double arrow | Between containers, shortest path |
| `reads-from` / `writes-to` | Dashed, orange, arrow | Database to component, curved |

---

## 4. Container Shape Design

### **4.1 New Shape: ContainerNode**

```typescript
export const ContainerNode = dia.Element.define('dna.ContainerNode', {
  size: { width: 300, height: 400 },
  markup: [
    {
      tagName: 'rect',
      selector: 'body'
    },
    {
      tagName: 'rect',
      selector: 'header'
    },
    {
      tagName: 'text',
      selector: 'label'
    },
    {
      tagName: 'path',
      selector: 'expandIcon'  // Chevron up/down
    },
    {
      tagName: 'rect',
      selector: 'contentArea'  // Where children render
    }
  ],
  attrs: {
    body: {
      fill: 'rgba(31, 41, 55, 0.3)',  // Semi-transparent
      stroke: '#4b5563',
      strokeWidth: 2,
      rx: 12,
      ry: 12
    },
    header: {
      width: 'calc(w)',
      height: 40,
      fill: '#374151',
      rx: 12,
      ry: 12
    },
    label: {
      text: 'Container',
      fill: '#ffffff',
      fontSize: 14,
      fontWeight: '700',
      x: 15,
      y: 25,
      textAnchor: 'start'
    },
    expandIcon: {
      d: 'M 270 15 L 280 25 L 290 15',  // Chevron
      stroke: '#9ca3af',
      strokeWidth: 2,
      fill: 'none'
    },
    contentArea: {
      y: 40,
      width: 'calc(w)',
      height: 'calc(h - 40)',
      fill: 'transparent',
      pointerEvents: 'none'
    }
  }
})
```

### **4.2 Shape Factory Updates**

```typescript
class ShapesFactory {
  createNodes(nodes: GraphNode[]): dia.Element[] {
    return nodes.map(node => {
      const hasChildren = node.metadata?.hasChildren || false
      
      if (hasChildren) {
        // Use container shape for nodes with children
        return new ContainerNode({
          id: node.id,
          position: node.position,
          attrs: {
            label: { text: node.label },
            body: { fill: this.getContainerColor(node.type) }
          },
          hierarchyLevel: this.calculateLevel(node),
          isContainer: true,
          expanded: true  // Start expanded
        })
      } else {
        // Use regular ResourceNode for leaf nodes
        return new ResourceNode({
          id: node.id,
          position: node.position,
          attrs: {
            label: { text: node.label },
            icon: { 'xlink:href': this.getIconUrl(node.type) }
          },
          hierarchyLevel: this.calculateLevel(node),
          isContainer: false
        })
      }
    })
  }
  
  private calculateLevel(node: GraphNode): number {
    const levelMap: Record<string, number> = {
      'platform': 0,
      'web-application': 1,
      'module': 2,
      'page': 3,
      'section': 4,
      'block': 5
    }
    return levelMap[node.type] || 0
  }
}
```

---

## 5. Data Model Updates

### **5.1 Enhance resourceToGraph Mapper**

```typescript
export function resourceToGraph(
  resourceGraph: ResourceGraph,
  config: LayoutConfig
): GraphData {
  // Build hierarchy tree
  const hierarchy = buildHierarchyTree(resourceGraph.resources)
  
  // Calculate positions recursively
  const positions = layoutHierarchical(hierarchy, config)
  
  // Create nodes with hierarchy metadata
  const nodes: GraphNode[] = flattenHierarchy(hierarchy).map(resource => ({
    id: resource.id,
    type: resource.type,
    label: resource.name,
    position: positions.get(resource.id) || { x: 0, y: 0 },
    metadata: {
      ...resource.metadata,
      description: resource.description,
      resourceType: resource.type,
      hierarchyLevel: calculateLevel(resource.type),
      hasChildren: (resource.children?.length || 0) > 0,
      parentId: findParentId(resource, hierarchy)
    }
  }))
  
  // Create edges (links)
  const edges: GraphEdge[] = [
    ...createRelationshipEdges(resourceGraph.relationships),
    ...createContainmentEdges(hierarchy)  // Add parent-child edges
  ]
  
  return { nodes, edges }
}

function buildHierarchyTree(resources: Resource[]): HierarchyNode {
  // Recursively build tree from flat resource list
  // Root node is typically the Platform
  const root = resources.find(r => r.type === 'platform')
  return buildNode(root!, resources)
}

function layoutHierarchical(
  node: HierarchyNode,
  config: LayoutConfig,
  depth: number = 0
): Map<string, Position> {
  const positions = new Map<string, Position>()
  
  // Layout current node
  const x = depth * config.levelSpacing
  const y = calculateYPosition(node, depth)
  positions.set(node.id, { x, y })
  
  // Recursively layout children
  node.children?.forEach((child, index) => {
    const childPositions = layoutHierarchical(
      child,
      config,
      depth + 1
    )
    // Merge child positions
    childPositions.forEach((pos, id) => positions.set(id, pos))
  })
  
  return positions
}
```

### **5.2 Add Hierarchy Support to GraphModel**

```typescript
class GraphModel {
  // ... existing properties
  
  private zoomVisibilityManager: ZoomVisibilityManager
  private containerManager: ContainerManager
  
  setupHierarchy() {
    // After graph is populated, establish parent-child relationships
    this.graph.getElements().forEach(element => {
      const parentId = element.get('metadata')?.parentId
      if (parentId) {
        const parent = this.graph.getCell(parentId)
        if (parent && parent.isElement()) {
          parent.embed(element)
        }
      }
    })
  }
  
  handleZoomChange(scale: number) {
    this.scale = scale
    this.zoomVisibilityManager.updateVisibility(scale)
  }
  
  toggleContainer(containerId: string) {
    const container = this.graph.getCell(containerId)
    if (!container) return
    
    const isExpanded = container.get('expanded')
    if (isExpanded) {
      this.containerManager.collapseContainer(container as dia.Element)
    } else {
      this.containerManager.expandContainer(container as dia.Element)
    }
  }
}
```

---

## 6. Implementation Phases

### **Phase 1: Foundation** (Week 1)
- [ ] Create `ContainerNode` shape with header and expand/collapse
- [ ] Implement hierarchy detection in mapper (`hasChildren`, `parentId`)
- [ ] Add `hierarchyLevel` metadata to all nodes
- [ ] Update `ShapesFactory` to use containers vs. leaf nodes

### **Phase 2: Layout Engine** (Week 2)
- [ ] Implement hierarchical layout algorithm (vertical swimlanes)
- [ ] Replace grid layout with recursive positioning
- [ ] Establish parent-child embedding in `GraphModel.setupHierarchy()`
- [ ] Test with inaudio data (6 levels deep)

### **Phase 3: Zoom Visibility** (Week 3)
- [ ] Create `ZoomVisibilityManager` class
- [ ] Connect to zoom events from `ZoomHandler`
- [ ] Implement level-based filtering logic
- [ ] Add smooth fade transitions (opacity changes)
- [ ] Update links to match node visibility

### **Phase 4: Container Interactions** (Week 4)
- [ ] Create `ContainerManager` class
- [ ] Implement expand/collapse functionality
- [ ] Add click handler for expand icon
- [ ] Animate expand/collapse transitions
- [ ] Auto-resize containers to fit children

### **Phase 5: Smart Link Routing** (Week 5)
- [ ] Implement hierarchy-aware link router
- [ ] Apply relationship-specific routing rules
- [ ] Configure orthogonal routing for cross-container links
- [ ] Add link smoothing and corner rounding
- [ ] Test with complex multi-level relationships

### **Phase 6: Polish & Optimization** (Week 6)
- [ ] Add minimap with hierarchy overview (tree layout)
- [ ] Implement keyboard shortcuts (Expand All, Collapse All)
- [ ] Add breadcrumb navigation for deep hierarchies
- [ ] Performance optimization for large graphs (>100 nodes)
- [ ] Accessibility improvements (keyboard navigation, screen readers)

---

## 7. Configuration & Settings

### **7.1 Layout Configuration**

```typescript
// Add to TenantConfig
interface TenantConfig {
  // ... existing properties
  layout: {
    mode: 'swimlanes' | 'tree' | 'force-directed'
    swimlaneWidth: number
    nodeSpacing: number
    levelSpacing: number
    containerPadding: number
    direction: 'TB' | 'LR'  // Top-to-bottom or Left-to-right
  }
  visibility: {
    enableZoomFiltering: boolean
    zoomThresholds: {
      platform: number    // 0.2
      application: number // 0.5
      module: number      // 1.0
      page: number        // 1.5
      section: number     // 2.0
      block: number       // 2.5
    }
  }
}
```

### **7.2 User Controls (Toolbar Additions)**

```typescript
// Add to GraphToolbar
<Select value={layoutMode} onChange={setLayoutMode}>
  <option value="swimlanes">Swimlanes (Vertical)</option>
  <option value="tree">Tree (Hierarchical)</option>
  <option value="force">Force-Directed</option>
</Select>

<Toggle 
  enabled={zoomFiltering} 
  onChange={toggleZoomFiltering}
  label="Auto-hide Grandchildren"
/>

<ButtonGroup>
  <Button onClick={expandAll}>Expand All</Button>
  <Button onClick={collapseAll}>Collapse All</Button>
</ButtonGroup>
```

---

## 8. Edge Cases & Considerations

### **8.1 Circular References**
**Problem**: Child resource references parent (e.g., Block calls API at Application level)

**Solution**: 
- Allow links to exit containers and route externally
- Use different visual style for "upward" links (dashed, different color)
- Router ensures links don't cross container boundaries unnecessarily

### **8.2 Orphan Nodes**
**Problem**: Resource without explicit parent in hierarchy

**Solution**:
- Create implicit "Uncategorized" container at root level
- Allow drag-and-drop to reparent nodes
- Highlight orphans with warning indicator

### **8.3 Deep Nesting (>6 levels)**
**Problem**: Too many levels to visualize effectively

**Solution**:
- Collapse intermediate levels automatically
- Show only "active path" (selected node + ancestors + children)
- Provide breadcrumb trail for navigation
- Minimap shows full tree structure

### **8.4 Large Sibling Groups**
**Problem**: 20+ modules in one application container

**Solution**:
- Implement virtual scrolling within containers
- Auto-collapse containers with >10 children
- Add filter/search within container
- Pagination for large groups

### **8.5 Cross-Hierarchy Relationships**
**Problem**: Section in App A depends on API in App B

**Solution**:
- Route links outside containers at top level
- Use distinct visual style (different color, thicker line)
- Show tooltip with full path on hover
- Minimap highlights cross-application dependencies

---

## 9. Performance Optimization

### **Large Graphs (>100 nodes)**

1. **Lazy Loading**: Only render visible viewport cells
2. **Level-of-Detail (LOD)**: Simplified shapes when zoomed out
3. **Virtual Scrolling**: For long container child lists
4. **Frozen Containers**: Don't recalculate layout for collapsed containers
5. **Link Culling**: Don't render links outside viewport
6. **Debounced Zoom**: Wait 100ms after zoom before updating visibility

```typescript
class PerformanceManager {
  private renderQueue: Set<dia.Cell> = new Set()
  private rafId: number | null = null
  
  scheduleRender(cell: dia.Cell) {
    this.renderQueue.add(cell)
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.batchRender())
    }
  }
  
  private batchRender() {
    this.renderQueue.forEach(cell => cell.attr('body/display', 'block'))
    this.renderQueue.clear()
    this.rafId = null
  }
}
```

---

## 10. Testing Strategy

### **Unit Tests**
- Hierarchy tree building from flat resource list
- Layout algorithm position calculations
- Visibility filtering by zoom level
- Container expand/collapse state management

### **Integration Tests**
- Full graph rendering with 6-level hierarchy
- Zoom in/out updates visibility correctly
- Links route correctly between containers
- Drag-and-drop maintains hierarchy

### **Visual Regression Tests**
- Screenshot comparison at different zoom levels
- Container expand/collapse animations
- Link routing visual correctness
- Theme consistency across hierarchy levels

---

## 11. Success Metrics

### **Visual Clarity**
- ✅ User can identify parent-child relationships at a glance
- ✅ Links don't cross unnecessarily (>80% clean routing)
- ✅ At most 20 nodes visible simultaneously (zoom filtering)

### **Performance**
- ✅ <100ms layout calculation for 200-node graph
- ✅ 60fps zoom and pan with visibility updates
- ✅ <1s full graph render for typical tenant (50-100 nodes)

### **Usability**
- ✅ New users understand hierarchy without documentation
- ✅ Power users can navigate 6 levels efficiently
- ✅ Collapse/expand interaction feels natural (like file tree)

---

## 12. Future Enhancements

### **12.1 Fisheye Zoom**
Keep focused node at normal size, fade/shrink surrounding nodes progressively

### **12.2 Semantic Zoom**
Show different information at different zoom levels (e.g., icons only when far out, full details when close)

### **12.3 Path Highlighting**
When hovering a node, highlight the full path from root to that node

### **12.4 Relationship Filtering**
Toggle visibility of specific relationship types (e.g., hide all "contains" links)

### **12.5 Timeline View**
Animate the graph to show how hierarchy evolved over time

### **12.6 Compare Mode**
Show two tenants side-by-side with synchronized zoom/pan

---

## 13. Migration Path

### **From Current (Flat Grid) to Hierarchical**

1. **Backward Compatible**: Keep flat layout as option (`layout.mode = 'flat'`)
2. **Gradual Rollout**: Enable per-tenant via config flag
3. **Data Migration**: No changes to resource data structure (already has `children`)
4. **User Preference**: Remember user's preferred layout mode
5. **Documentation**: Update README with layout modes comparison

---

## Summary

This architecture transforms the graph from a **flat collection of disconnected boxes** into a **cohesive hierarchical structure** that:

1. **Visually groups related resources** using JointJS embedding
2. **Organizes parallel branches** using vertical swimlanes
3. **Reduces cognitive load** by hiding grandchildren based on zoom level
4. **Routes links intelligently** to minimize crossing and confusion
5. **Scales to 6+ levels** while maintaining clarity

**Key Trade-offs**:
- **Complexity**: More sophisticated layout algorithm, container management
- **Performance**: Must optimize for large hierarchies (100+ nodes)
- **Learning Curve**: Users need to understand expand/collapse interactions

**Biggest Win**: Users can finally **see the structure** of their architecture instead of visual chaos.

---

For implementation details on state management, see `STATE_ARCHITECTURE.md`.
For layer-based visualization patterns, see `LAYERS_ARCHITECTURE.md`.
For graph interaction conventions, see `GRAPH_CONVENTIONS.md`.
