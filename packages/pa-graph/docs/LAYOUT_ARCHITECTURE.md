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

## 2. Layout Philosophy

### Core Principles

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

## 3. Available Layouts

### 3.1 Tree Layout (Primary)

**Purpose**: Hierarchical top-down organization showing clear parent-child relationships

**When to use**:
- Exploring organizational structure
- Understanding module/page hierarchies
- Analyzing dependency flows

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

---

### 3.2 Grid Layout

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

### 3.3 Directed Graph (Future)

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

### 3.4 Force-Directed (Future)

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

### 3.5 MSAGL (Future)

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

## 4. Layout Manager Architecture

### 4.1 Responsibility

The `LayoutManager` class:
- Stores current layout configuration
- Applies selected layout algorithm to graph
- Preserves layout settings in tenant config
- Provides unified API for all layout types
- Handles layout-specific options

### 4.2 API Design

```typescript
interface LayoutManager {
  // Current layout state
  getCurrentLayout(): LayoutType
  
  // Apply layout
  applyLayout(type: LayoutType, options?: LayoutOptions): void
  
  // Layout-specific configuration
  getLayoutConfig(type: LayoutType): LayoutOptions
  setLayoutConfig(type: LayoutType, options: LayoutOptions): void
  
  // Reset to defaults
  resetLayout(): void
}

type LayoutType = 
  | 'tree'          // TreeLayout (primary)
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
  tree?: TreeLayoutOptions
  grid?: GridLayoutOptions
  // ... etc
}
```

### 4.3 Integration Points

**Toolbar Control**: 
- Dropdown selector for layout type
- Secondary panel for layout options
- Preview mode before applying

**Tenant Config**:
- Default layout per tenant
- Layout-specific defaults
- Persisted layout state

**Graph Model**:
- Trigger layout on demand
- Auto-layout on graph changes (optional)
- Layout invalidation on structure changes

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

## 6. Hierarchy Relationships

### 6.1 Parent-Child Encoding

**Data Model**: Resources have `children` array property

**Graph Representation**:
- JointJS embedding: `parent.embed(child)`
- Custom property: `child.set('parentId', parent.id)`
- Hierarchy level: `node.set('hierarchyLevel', level)`

### 6.2 Link Routing

**Intra-container links**: Routes stay within parent bounds
**Inter-container links**: Routes between containers, avoiding overlaps

**Router Options**:
- Orthogonal: Right-angle turns (Manhattan routing)
- Metro: Rounded corners, aligned paths
- Straight: Direct lines (minimal, can overlap)

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create `LayoutManager` class
- [ ] Add TreeLayout integration
- [ ] Build layout dropdown in toolbar
- [ ] Wire up apply layout action

### Phase 2: Tree Layout (Week 2)
- [ ] Configure TreeLayout for DNA hierarchy
- [ ] Test with inaudio data (6 levels)
- [ ] Add direction options (LR, TB, diagonal)
- [ ] Implement layout options panel

### Phase 3: Grid Fallback (Week 3)
- [ ] Integrate GridLayout as alternative
- [ ] Add grid configuration options
- [ ] Handle flat structures gracefully

### Phase 4: Polish (Week 4)
- [ ] Add layout animations
- [ ] Persist layout preferences
- [ ] Add layout preview mode
- [ ] Performance optimization

### Phase 5: Advanced Layouts (Future)
- [ ] DirectedGraph (Dagre)
- [ ] ForceDirected
- [ ] MSAGL adapter
- [ ] Custom layout algorithms

---

## 8. Configuration & Settings

### 8.1 Tenant Config

```typescript
interface TenantConfig {
  // ... existing properties
  layout: {
    defaultType: LayoutType
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

### 8.2 Toolbar UI

```tsx
<Select 
  value={currentLayout} 
  onChange={handleLayoutChange}
>
  <option value="tree">Tree (Hierarchical)</option>
  <option value="grid">Grid (Uniform)</option>
  <option value="dagre">Directed Graph</option>
  <option value="force">Force-Directed</option>
  <option value="none">Manual</option>
</Select>

<Button onClick={openLayoutOptions}>
  Configure Layout
</Button>

<Button onClick={applyLayout}>
  Apply Layout
</Button>
```

---

## 9. Edge Cases & Considerations

### 9.1 Circular References
**Problem**: Child references ancestor (e.g., Block calls Platform API)

**Solution**: 
- Layout treats as external link
- Route outside container boundaries
- Different visual style (dashed, different color)

### 9.2 Orphan Nodes
**Problem**: Resource without explicit parent

**Solution**:
- Create implicit root container
- Allow drag-and-drop to reparent
- Highlight orphans visually

### 9.3 Deep Nesting (>6 levels)
**Problem**: Too many levels to visualize effectively

**Solution**:
- Automatic intermediate level collapsing
- Breadcrumb navigation for deep paths
- Minimap shows full tree structure

### 9.4 Mixed Structures
**Problem**: Some branches deeper than others

**Solution**:
- TreeLayout handles naturally
- Visibility manager adapts per branch
- No forced symmetry

---

## 10. Performance Considerations

### 10.1 Large Graphs (>100 nodes)

**Strategies**:
- Virtual rendering (render visible nodes only)
- Level-of-detail (LOD): Simplified shapes when zoomed out
- Lazy loading: Load children on expansion
- Viewport culling: Don't render off-screen nodes

### 10.2 Layout Calculation

**Optimization**:
- Incremental layout (only affected nodes)
- Layout caching (memoize results)
- Web Worker offloading (for force-directed)
- Debounced re-layout (batch changes)

---

## 11. Testing Strategy

### 11.1 Unit Tests
- Layout manager state transitions
- Layout option validation
- Hierarchy traversal algorithms

### 11.2 Integration Tests
- TreeLayout with 6-level hierarchy
- GridLayout with variable node sizes
- Layout switching preserves graph state

### 11.3 Visual Regression Tests
- Screenshot comparison at standard zoom levels
- Link routing correctness
- Node positioning consistency

---

## 12. Success Metrics

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

## 13. References

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

1. **TreeLayout** (primary): Hierarchical visualization of the 6-level structure
2. **GridLayout**: Uniform presentation for comparison and overview
3. **Advanced layouts** (future): Dagre, Force-Directed, MSAGL for specialized needs

The `LayoutManager` provides a unified API for selecting and configuring layouts, with preferences persisted in tenant configuration. Combined with zoom-based visibility management, this creates a powerful system for navigating complex application structures.

**Key Philosophy**: Layouts are tools for revealing different aspects of the same underlying DNA structure—not rigid constraints but flexible lenses.
