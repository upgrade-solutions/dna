# Layout Examples

This directory contains JSON configuration files for various UI layout patterns that demonstrate the flexibility of the configuration-driven UI system.

## Available Examples

### 1. **Graph Editor** (`example-graph-editor.json`)
- **Use Case**: Node-based visual editors, workflow builders, system architecture diagrams
- **Layout**: Three-panel with left sidebar (tools), center canvas, right sidebar (inspector)
- **Features**: Interactive graph canvas with nodes and connections

### 2. **Dashboard** (`example-dashboard.json`)
- **Use Case**: Analytics dashboards, admin overviews, metric displays
- **Layout**: Grid-based with stat cards and content panels
- **Features**: Metric cards, recent activity, quick actions

### 3. **Form Layout** (`example-form.json`)
- **Use Case**: User profiles, settings forms, data entry
- **Layout**: Vertical form with sections and grouped fields
- **Features**: Text inputs, dropdowns, checkboxes, validation

### 4. **Split View** (`example-split-view.json`)
- **Use Case**: Code editors, document editors with preview, comparison views
- **Layout**: Three-panel with editor, preview, and console
- **Features**: Code editor with toolbar, preview pane, console output

### 5. **Data Table** (`example-table.json`)
- **Use Case**: User management, data grids, admin panels
- **Layout**: Table with filters and search
- **Features**: Sortable columns, filters, search, pagination

### 6. **Settings** (`example-settings.json`)
- **Use Case**: Application settings, preferences, configuration panels
- **Layout**: Sidebar navigation with main content area
- **Features**: Tabbed navigation, form fields, checkboxes

## Usage

The examples are managed through the `examples.ts` file which exports an array of `ExampleLayout` objects. Each example includes:

```typescript
interface ExampleLayout {
  id: string              // Unique identifier
  name: string            // Display name
  description: string     // Brief description
  icon: string            // Emoji icon
  config: AppConfig       // JSON configuration
}
```

## Adding New Examples

1. Create a new JSON file in `/src/app/` following the `AppConfig` schema
2. Import it in `examples.ts`
3. Add it to the `examples` array with metadata
4. The navigation menu will automatically include it

## Configuration Schema

All examples follow the same hierarchical structure:

```
App
└── Modules
    └── Pages
        └── Sections
            └── Blocks
```

- **App**: Top-level container with theme and metadata
- **Module**: Major functional areas (e.g., "Dashboard", "Settings")
- **Page**: Individual screens within a module
- **Section**: Layout containers (horizontal, vertical, grid, flex)
- **Block**: Individual UI components (button, text-field, panel, etc.)

## Layout Types

Sections support four layout types:

- `horizontal`: Row-based layout with items side-by-side
- `vertical`: Column-based layout with items stacked
- `grid`: CSS Grid layout for card-based UIs
- `flex`: Flexbox layout that fills available space

## Block Types

Common block types used in examples:

- `heading`: Text headings (h1-h6)
- `paragraph`: Text content
- `button`: Interactive buttons with variants (primary, secondary, ghost)
- `text-field`: Single-line text input
- `textarea`: Multi-line text input
- `select`: Dropdown selection
- `checkbox`: Boolean toggle
- `panel`: Container with optional title
- `data-table`: Tabular data with sorting/pagination
- `graph-canvas`: Interactive graph visualization

## Customization

Each block accepts a `props` object for customization:

```json
{
  "id": "my-button",
  "type": "button",
  "props": {
    "label": "Click Me",
    "variant": "primary",
    "icon": "✓"
  }
}
```

## Navigation Menu

The main App component renders a data-driven navigation menu that allows switching between examples. The menu is styled with:

- Dark theme matching the app
- Active state highlighting
- Icon + name + description display
- Smooth transitions

## Development

To add or modify examples:

1. Edit JSON files directly (hot reload in dev mode)
2. No rebuild required for configuration changes
3. TypeScript validation ensures schema compliance
4. CSS classes in `App.css` control styling
