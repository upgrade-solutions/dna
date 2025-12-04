# PA Graph — Layers Architecture

This document outlines the **layer system architecture** for visualizing different aspects of graph resources using **4-corner overlay badges** with categories and concerns.

---

## 1. Concept Overview

The layer system enables **visual highlighting of resource properties** using **corner-positioned overlay badges**. Each corner represents a **category**, and each category contains multiple **concerns** from which to choose.

### **Core Model: Categories → Concerns**

**Categories** are fixed positions (4 corners), and **concerns** are the specific properties you can display in that position:

1. **Top-Left Corner** → **Process** category
2. **Top-Right Corner** → **Technology** category  
3. **Bottom-Left Corner** → **People** category
4. **Bottom-Right Corner** → **Security** category

Each category can display **one concern at a time** from its set of available concerns, or be **turned off** entirely (hiding all badges in that corner).

### **Key Insights**
- **One corner per category**: 4 corners = 4 categories maximum
- **One concern visible per category**: Select from dropdown, toggle on/off
- **All nodes get the same treatment**: When a concern is active, all applicable nodes show that badge
- **Layers are visual decorations**: Nodes remain visible; overlays add context

---

## 2. Categories and Concerns

### **Category Definitions**

#### **1. Process (Top-Left Corner)**
Operational and workflow concerns:
- **Status**: up, degraded, down
- **Version**: current version number
- **Lifecycle**: design, build, run

#### **2. Technology (Top-Right Corner)**  
Technical implementation details:
- **Language**: TypeScript, Python, Go, etc.
- **Runtime**: Node.js, Deno, Kubernetes, etc.
- **Infrastructure**: Database, Queue, Service type

#### **3. People (Bottom-Left Corner)**
Human ownership and responsibility:
- **Owner**: Primary maintainer/owner
- **Team**: Department or team name  
- **RACI**: Responsible, Accountable role

#### **4. Security (Bottom-Right Corner)**
Security and compliance information:
- **Data Classification**: PII, PCI, Internal
- **Compliance**: SOC2, HIPAA flags
- **Risk Level**: High, Medium, Low

### **Visual Strategy**

- **Icon Badges**: 20x20px icons in corners with opacity control
- **Color Coding**: Category-specific colors for quick identification
- **Tooltip Context**: Hover reveals full property details
- **Central Icon**: Resource type remains centered (always visible)

---

## 3. Architecture Design

### **Layer Manager Role**

The LayerManager now manages **categories and their active concerns** rather than simple on/off layers:

**Core Responsibilities:**
- Maintain registry of categories (4 fixed: Process, Technology, People, Security)
- Track which concern is active for each category (or if category is disabled)
- Apply/remove concern decorators when selections change
- Coordinate between category state and visual rendering

**State Model:**
```typescript
interface CategoryState {
  id: string               // 'process', 'technology', 'people', 'security'
  name: string            // Display name
  corner: Corner          // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  enabled: boolean        // Is this category visible?
  activeConcern: string | null  // Which concern is currently shown
  concerns: ConcernConfig[]     // Available concerns
}

interface ConcernConfig {
  id: string              // 'status', 'language', 'owner', etc.
  name: string           // Display name
  icon: string           // Icon identifier
  getValue: (dna: any) => string | null  // Extract value from DNA
}
```

### **Cell Decorator Pattern**

Each concern has a decorator that:
- Extracts the concern value from cell DNA data
- Maps the value to an appropriate icon/color
- Applies visual treatment to the correct corner
- Removes visual treatment cleanly when concern is deselected

**Decorator Interface:**
```typescript
interface ConcernDecorator {
  apply(cell: dia.Cell, corner: Corner): void
  remove(cell: dia.Cell, corner: Corner): void
  getValue(cell: dia.Cell): string | null
  getIcon(value: string): string
}
```

---

## 4. Updated Shape Definition

Shapes need markup for **4 corner badge positions**. The ResourceNode shape includes:

**Markup Elements:**
- `body`: Main rectangle background
- `icon`: Resource type icon (center, always visible)
- `topLeftBadge`: Process category badge (top-left corner)
- `topRightBadge`: Technology category badge (top-right corner)
- `bottomLeftBadge`: People category badge (bottom-left corner)
- `bottomRightBadge`: Security category badge (bottom-right corner)
- `label`: Resource name text

**Key Attributes:**
- All badge elements start with `opacity: 0` (hidden)
- Positioned 10px from edges to avoid overlap
- Use `xlink:href` for icon images
- Standardized 20x20px sizing for all badges
- Resource type icon remains 24x24px centered

**Position Calculations (for 160x80px node):**
- Top-Left: x=10, y=10
- Top-Right: x=130 (160-20-10), y=10
- Bottom-Left: x=10, y=50 (80-20-10)
- Bottom-Right: x=130, y=50

---

## 5. Layer Control UI Design

The layers dropdown becomes a **category-concern selector**:

```
┌────────────────────────────────────┐
│ 🔲 Layers ▾                       │
├────────────────────────────────────┤
│ ⬉ Process (Top-Left)              │
│   ☑ Enabled                        │
│   ○ Status                         │  
│   ⦿ Version      ← selected        │
│   ○ Lifecycle                      │
├────────────────────────────────────┤
│ ⬈ Technology (Top-Right)          │
│   ☐ Enabled                        │  ← category off
│   ○ Language                       │
│   ○ Runtime                        │
│   ○ Infrastructure                 │
├────────────────────────────────────┤
│ ⬋ People (Bottom-Left)            │
│   ☑ Enabled                        │
│   ○ Owner                          │
│   ⦿ Team         ← selected        │
│   ○ RACI                           │
├────────────────────────────────────┤
│ ⬊ Security (Bottom-Right)         │
│   ☑ Enabled                        │
│   ⦿ Data Classification            │  ← selected
│   ○ Compliance                     │
│   ○ Risk Level                     │
└────────────────────────────────────┘
```

### **Interaction Flow**

1. **Enable/Disable Category**: Checkbox toggles entire category visibility
2. **Select Concern**: Radio button selects which concern shows in that corner
3. **Only one concern active per category** at any time
4. **Category disabled** = no badge in that corner for any nodes
5. **Visual Feedback**: Active concerns show count of affected nodes

---

## 6. Implementation Phases

### **Phase 1: Type Definitions** ✅ (Next)
- Define CategoryState and ConcernConfig interfaces
- Create Corner type union
- Define ConcernDecorator interface

### **Phase 2: Shape Updates** 
- Update ResourceNode with 4-corner badge markup
- Position badges correctly (10px from edges)
- Add selectors: topLeftBadge, topRightBadge, bottomLeftBadge, bottomRightBadge

### **Phase 3: Decorator System**
- Implement base ConcernDecorator class
- Create decorators for each concern type:
  - StatusDecorator, VersionDecorator, LifecycleDecorator (Process)
  - LanguageDecorator, RuntimeDecorator, InfrastructureDecorator (Technology)
  - OwnerDecorator, TeamDecorator, RACIDecorator (People)
  - DataClassificationDecorator, ComplianceDecorator, RiskLevelDecorator (Security)

### **Phase 4: LayerManager Refactor**
- Replace simple layer visibility with category-concern state
- Implement setActiveConcern(category, concern)
- Implement toggleCategory(category)
- Apply decorators to correct corners based on category

### **Phase 5: UI Updates**
- Refactor LayersControl to show category groups
- Add enable/disable checkbox per category
- Add radio buttons for concern selection within categories
- Show node counts per concern

### **Phase 6: Data Integration**
- Extend DNA interface with new concern properties
- Map sample data to include status, owner, team, risk, etc.
- Test with real graph data

---

## 7. Data Flow

### **Selecting a Concern**
1. User enables "Process" category and selects "Status" concern
2. LayerManager sets `processCategory.activeConcern = 'status'`
3. LayerManager retrieves StatusDecorator from registry
4. Decorator iterates all cells, extracts status value from DNA
5. Status badges appear in top-left corner of applicable nodes

### **Switching Concerns**
1. User selects "Version" concern (same Process category)
2. LayerManager removes previous StatusDecorator from top-left badges
3. LayerManager applies VersionDecorator to top-left badges
4. Graph re-renders with version badges replacing status badges

### **Disabling a Category**
1. User unchecks "Process" category checkbox
2. LayerManager sets `processCategory.enabled = false`
3. Active decorator removes all top-left badges
4. Top-left corners become empty on all nodes

### **Multi-Category View**
1. User enables all 4 categories with different concerns selected
2. All 4 decorators are active simultaneously in different corners
3. Each node shows up to 4 badges (one per corner)
4. Empty corners (no data) remain transparent

---

## 8. Technical Considerations

### **Performance**
- Decorators batch attribute updates to minimize redraws
- Use JointJS `silent: true` for bulk updates, then trigger single render
- Cache decorator instances per concern type
- Only update affected corners when switching concerns

### **State Management**
- Category states stored in GraphModel (MobX observable)
- Category enable/disable triggers MobX reactions
- Concern selection triggers decorator swap
- React components observe and re-render layer controls

### **Backward Compatibility**
- Existing cells work without DNA properties (badges just don't show)
- Resource type icon remains centered and always visible
- Layers are opt-in visual overlays

### **Data Requirements**
Each concern requires specific DNA properties. **All layer/concern data should be sourced from the accounts data** in the graph data model.

```typescript
interface ResourceDNA {
  // Process concerns
  status?: 'up' | 'degraded' | 'down'
  version?: string
  lifecycle?: 'design' | 'build' | 'run'
  
  // Technology concerns
  language?: string
  runtime?: string
  infrastructure?: 'database' | 'queue' | 'service'
  
  // People concerns
  owner?: string
  team?: string
  raci?: 'responsible' | 'accountable' | 'consulted' | 'informed'
  
  // Security concerns
  dataClassification?: 'pii' | 'pci' | 'internal'
  compliance?: string[]  // ['soc2', 'hipaa']
  riskLevel?: 'high' | 'medium' | 'low'
}
```

**Important**: These properties must be populated from the accounts data structure when creating/updating graph nodes. The layer system reads from the `dna` attribute on each cell, which should be hydrated with account-specific data.

---

## 9. Color & Icon Standards

### **Process Category Colors (Top-Left)**
- Status Up: `#10b981` (green)
- Status Degraded: `#f59e0b` (amber)
- Status Down: `#ef4444` (red)
- Version: `#3b82f6` (blue)
- Lifecycle: `#8b5cf6` (purple)

### **Technology Category Colors (Top-Right)**
- TypeScript: `#3178c6`
- Python: `#3776ab`
- Go: `#00add8`
- Node.js: `#339933`
- Deno: `#000000`
- Database: `#336791`

### **People Category Colors (Bottom-Left)**
- Owner: `#ec4899` (pink)
- Team: `#06b6d4` (cyan)
- RACI: `#84cc16` (lime)

### **Security Category Colors (Bottom-Right)**
- PII: `#dc2626` (red)
- PCI: `#ea580c` (orange)
- Internal: `#65a30d` (green)
- SOC2: `#0284c7` (blue)
- HIPAA: `#7c3aed` (violet)

### **Badge Positioning Standards**
- All badges: 20x20px
- Top-left: x=10, y=10
- Top-right: x=130, y=10 (for 160px width)
- Bottom-left: x=10, y=50 (for 80px height)
- Bottom-right: x=130, y=50
- Resource type: Center (24x24px), always visible

---

## 10. Example Use Cases

### **Scenario 1: Production Health Monitoring**
Enable **Process → Status** in top-left corner to see which resources are up/degraded/down at a glance.

### **Scenario 2: Technology Stack Audit**
Enable **Technology → Language** (top-right) and **Technology → Runtime** (switch concerns) to understand the technology landscape.

### **Scenario 3: Ownership Visibility**
Enable **People → Team** in bottom-left to identify which team owns each resource for collaboration.

### **Scenario 4: Security Compliance View**
Enable **Security → Data Classification** in bottom-right to identify resources handling sensitive data (PII, PCI).

### **Scenario 5: Multi-Faceted Dashboard**
Enable all 4 categories simultaneously:
- Process → Version (top-left)
- Technology → Language (top-right)
- People → Owner (bottom-left)
- Security → Risk Level (bottom-right)

Creates a comprehensive "health card" view with 4 data points per resource.

---

## 11. Future Enhancements

### **Phase-Aware Categories**
Categories and concerns will adapt based on the current phase:
- **Design Phase**: Emphasize ownership, planned tech stack, compliance requirements
- **Build Phase**: Emphasize version, language, build environment, review status
- **Run Phase**: Emphasize status, runtime, on-call contacts, performance metrics

### **Custom Concerns**
- User-defined concerns via configuration
- Custom icon mappings
- Formula-based badge colors

### **Filtering Integration**
- Click a badge to filter graph to only nodes with that value
- Multi-select filtering across categories
- Visual dimming of non-matching nodes

### **Analytics Dashboard**
- Distribution charts per concern (e.g., "23% TypeScript, 45% Python")
- Health scores based on status concerns
- Team workload based on ownership concerns

### **Animated Transitions**
- Smooth badge appearance/disappearance
- Color transitions when switching concerns
- Badge pulse on real-time status changes

---

## 12. Key Principles

1. **One corner per category, one concern per corner**  
   4 categories mapped to 4 corners, each showing one selected concern at a time

2. **Categories can be toggled on/off**  
   Disable entire category to hide all badges in that corner

3. **Concerns are mutually exclusive per category**  
   Only one concern active per category; selecting another replaces the first

4. **Resource type icon remains central**  
   The baseline "what is this" icon is always visible in the center

5. **Decorators are non-destructive**  
   Enabling/disabling concerns doesn't modify cell DNA data

6. **Performance through batching**  
   Bulk attribute updates minimize render cycles

7. **Progressive enhancement**  
   Works with partial DNA data—badges only appear when data exists

8. **Visual consistency**  
   Same corner always represents same category across all nodes

---

This architecture transforms layers into a **contextual overlay system** that provides multi-dimensional visibility into resource properties through strategic corner-positioned badges. The category-concern model ensures scalability while maintaining visual clarity.
