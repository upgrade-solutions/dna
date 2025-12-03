# PA Graph — Layers Architecture

This document outlines the **layer system architecture** for visualizing different aspects of graph resources (resource type, language, runtime) as overlays.

---

## 1. Concept Overview

The layer system enables **visual highlighting of resource properties** rather than hiding/showing entire cells. Think of layers as **visualization modes** that emphasize different aspects of your resources:

- **Resource Type Layer**: Highlights what the resource is (API, Database, Service)
- **Language Layer**: Highlights what language it's written in (TypeScript, Python, Go)
- **Runtime Layer**: Highlights what platform it runs on (Node.js, Deno, PostgreSQL)

### **Key Insight**
Layers are **not about visibility** (all resources remain visible). Layers are **visual decorations** applied on top of resources to highlight specific properties.

---

## 2. Layer Visualization Strategy

### **Visual Layer Patterns**

Each layer can apply visual treatments to resources:

1. **Icon Badges** (Primary)
   - Small overlay icons in corners
   - Language icon top-right
   - Runtime icon bottom-right
   - Resource type icon centered (default, always visible)

2. **Border/Glow Effects** (Secondary)
   - Colored borders or glows
   - Language: border color
   - Runtime: glow effect
   - Combine both for multi-layer view

3. **Background Patterns** (Tertiary)
   - Subtle patterns or textures
   - Diagonal stripes for language
   - Dots for runtime
   - Solid for resource type

4. **Labels/Tags** (Alternative)
   - Text labels attached to nodes
   - Floating badges with counts
   - Inline property displays

---

## 3. Architecture Design

### **Layer Manager Role**

The LayerManager doesn't control cell visibility—it controls **what visual decorations are active**:

```typescript
export class LayerManager {
  private activeVisualizationModes: Set<'resource-type' | 'language' | 'runtime'>
  private visualDecorators: Map<string, CellDecorator>
  
  // Toggle which properties are visually emphasized
  toggleVisualizationMode(mode: 'resource-type' | 'language' | 'runtime') {
    if (this.activeVisualizationModes.has(mode)) {
      this.activeVisualizationModes.delete(mode)
      this.removeDecorations(mode)
    } else {
      this.activeVisualizationModes.add(mode)
      this.applyDecorations(mode)
    }
  }
  
  // Apply visual decorations to cells based on active modes
  applyDecorations(mode: string) {
    this.graph.getCells().forEach(cell => {
      if (cell.isLink()) return
      
      const decorator = this.getDecoratorForMode(mode, cell)
      decorator.apply(cell)
    })
  }
}
```

### **Cell Decorator Pattern**

Decorators apply visual treatments without modifying core cell data:

```typescript
interface CellDecorator {
  apply(cell: dia.Cell): void
  remove(cell: dia.Cell): void
}

class LanguageBadgeDecorator implements CellDecorator {
  apply(cell: dia.Cell) {
    const language = cell.get('dna')?.language
    if (!language) return
    
    // Add language icon badge to top-right corner
    cell.attr('languageBadge/xlink:href', getLanguageIcon(language))
    cell.attr('languageBadge/x', '85%')
    cell.attr('languageBadge/y', '5%')
  }
  
  remove(cell: dia.Cell) {
    cell.removeAttr('languageBadge')
  }
}

class RuntimeGlowDecorator implements CellDecorator {
  apply(cell: dia.Cell) {
    const runtime = cell.get('dna')?.runtime
    if (!runtime) return
    
    // Add colored glow based on runtime
    const color = getRuntimeColor(runtime)
    cell.attr('body/filter', {
      name: 'dropShadow',
      args: { dx: 0, dy: 0, blur: 8, color, opacity: 0.6 }
    })
  }
  
  remove(cell: dia.Cell) {
    cell.removeAttr('body/filter')
  }
}
```

---

## 4. Updated Shape Definition

Shapes need markup for decoration elements:

```typescript
export class ResourceNode extends shapes.standard.Rectangle {
  defaults() {
    return {
      ...super.defaults,
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'image', selector: 'icon' },          // Resource type (always visible)
        { tagName: 'image', selector: 'languageBadge' }, // Language layer
        { tagName: 'image', selector: 'runtimeBadge' },  // Runtime layer
        { tagName: 'text', selector: 'label' }
      ],
      attrs: {
        body: { /* ... */ },
        icon: { /* resource type icon */ },
        languageBadge: { width: 20, height: 20, opacity: 0 }, // Hidden by default
        runtimeBadge: { width: 20, height: 20, opacity: 0 },  // Hidden by default
        label: { /* ... */ }
      }
    }
  }
}
```

---

## 5. Layer Control UI Design

The layers dropdown becomes a **visualization mode selector**:

```
┌────────────────────────────────┐
│ 🔲 Visualization Layers ▾     │
├────────────────────────────────┤
│ Base View                      │
│  ✓ Resource Types              │  ← Always active
├────────────────────────────────┤
│ Property Overlays              │
│  ☐ Language (22 resources)     │  ← Toggleable
│  ☐ Runtime (18 resources)      │  ← Toggleable
├────────────────────────────────┤
│ [Apply All] [Clear All]        │
└────────────────────────────────┘
```

### **Toggle Behavior**

- **Resource Type**: Always visible (baseline view)
- **Language**: When enabled, adds language badges to top-right corners
- **Runtime**: When enabled, adds runtime badges to bottom-right corners
- **Both**: When both enabled, shows both sets of badges simultaneously

---

## 6. Implementation Phases

### **Phase 1: Foundation**
- ✅ LayerManager class structure
- ✅ Layer configuration system
- ✅ UI controls in toolbar

### **Phase 2: Decorator System** (Current Focus)
- [ ] Define CellDecorator interface
- [ ] Implement LanguageBadgeDecorator
- [ ] Implement RuntimeBadgeDecorator
- [ ] Create decorator registry

### **Phase 3: Shape Integration**
- [ ] Update ResourceNode markup with badge selectors
- [ ] Position badge elements in corners
- [ ] Add icon mappers for languages and runtimes

### **Phase 4: Interactive Toggling**
- [ ] Connect UI controls to decorator system
- [ ] Animate badge appearance/disappearance
- [ ] Handle multi-layer combinations

### **Phase 5: Advanced Visualizations**
- [ ] Add border/glow effects
- [ ] Implement color coding
- [ ] Add filtering by property (show only TypeScript resources)

---

## 7. Data Flow

### **Enabling a Layer**
1. User clicks "Language" toggle in layers dropdown
2. LayerManager adds 'language' to active visualization modes
3. LayerManager creates LanguageBadgeDecorator
4. Decorator iterates all cells and applies language badges
5. Graph re-renders with new visual elements

### **Disabling a Layer**
1. User clicks "Language" toggle again
2. LayerManager removes 'language' from active modes
3. Decorator removes language badge attributes from cells
4. Graph re-renders without language badges

### **Multi-Layer View**
1. User enables both Language and Runtime layers
2. Two decorators are active simultaneously
3. Language badges appear in top-right corners
4. Runtime badges appear in bottom-right corners
5. Both are visible on each resource

---

## 8. Technical Considerations

### **Performance**
- Decorators batch attribute updates to minimize redraws
- Use JointJS `silent: true` for bulk updates, then trigger single render
- Cache decorator instances to avoid recreation

### **State Management**
- Active layers stored in GraphModel (MobX observable)
- Layer toggles trigger MobX reactions
- React components observe and re-render layer controls

### **Backward Compatibility**
- Existing cells work without modification
- Layers are opt-in decorations
- Default view shows only resource type icons

---

## 9. Color & Icon Standards

### **Language Colors**
- TypeScript: `#3178c6`
- JavaScript: `#f7df1e`
- Python: `#3776ab`
- Go: `#00add8`
- Rust: `#ce422b`

### **Runtime Colors**
- Node.js: `#339933`
- Deno: `#000000`
- PostgreSQL: `#336791`
- Docker: `#2496ed`
- Kubernetes: `#326ce5`

### **Badge Positioning**
- Resource type: Center (32x32px)
- Language: Top-right (20x20px, offset 10px from corner)
- Runtime: Bottom-right (20x20px, offset 10px from corner)

---

## 10. Example Use Cases

### **Scenario 1: Language Audit**
Enable Language layer to see which resources need migration from JavaScript to TypeScript.

### **Scenario 2: Infrastructure View**
Enable Runtime layer to visualize deployment platforms and identify Docker vs Kubernetes workloads.

### **Scenario 3: Full Stack View**
Enable both Language and Runtime to see complete technology stack at a glance—what's written in what language and where it runs.

---

## 11. Future Enhancements

### **Filtering Integration**
- Click a language badge to filter to only that language
- Dim resources that don't match filter criteria
- Combine with search functionality

### **Legend Display**
- Show active layers legend in corner
- Display color/icon key
- Toggle visibility of legend

### **Custom Layers**
- User-defined property layers
- Custom badge positions
- Configurable visual treatments

### **Analytics Integration**
- Count resources by language
- Show runtime distribution
- Identify technology gaps

---

## 12. Key Principles

1. **Layers are visual decorations, not filters**  
   All resources remain visible; layers add emphasis

2. **Multiple layers can be active simultaneously**  
   Badges stack in designated positions without overlap

3. **Resource type is always visible**  
   The baseline view shows what each resource is

4. **Decorators are non-destructive**  
   Enabling/disabling layers doesn't modify cell data

5. **Performance through batching**  
   Bulk attribute updates minimize render cycles

6. **Progressive enhancement**  
   Works with existing graph without migration

---

This architecture transforms layers from a visibility system into a **visual analytics tool** that helps users understand resource properties at a glance through strategic placement of badges, colors, and icons.
