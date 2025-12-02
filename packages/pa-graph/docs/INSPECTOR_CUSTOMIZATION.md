# Inspector Customization Guide

## Quick Reference: How to Modify the Inspector

### 1. Add a New Group (Tab/Section)

**File**: `src/components/inspector-config.ts`

```typescript
export const inspectorGroups = {
  myNewGroup: { 
    label: 'My New Section',  // Display name
    index: 10,                 // Order (lower = appears first)
    closed: true              // Start collapsed?
  }
}
```

### 2. Add Properties to a Group

```typescript
inputs: {
  'myCustomProperty': {
    type: 'text',              // Input type (see below)
    label: 'My Property',      // Display label
    group: 'myNewGroup',       // Which group it belongs to
    index: 1,                  // Order within group
    defaultValue: 'default'    // Optional default
  }
}
```

### 3. Available Input Types

| Type | Description | Common Options |
|------|-------------|----------------|
| `text` | Single-line text | `placeholder` |
| `textarea` | Multi-line text | `rows`, `placeholder` |
| `number` | Number input | `min`, `max` |
| `range` | Slider | `min`, `max`, `step`, `unit` |
| `color` | Color picker | - |
| `toggle` | Checkbox | - |
| `select` | Dropdown | `options: [{value, content}]` |
| `select-box` | Rich dropdown | `options`, `previewMode` |
| `list` | Dynamic array | `item`, `addButtonLabel`, `min`, `max` |
| `content-editable` | Rich text | `html`, `readonly` |

### 4. Rearrange Properties

Change the `index` values:
```typescript
'myProperty': {
  type: 'text',
  group: 'basic',
  index: 1  // Lower = appears first
}
```

### 5. Move Property to Different Group

Just change the `group` value:
```typescript
'size/width': {
  type: 'number',
  group: 'advanced',  // Was 'basic', now 'advanced'
  index: 1
}
```

### 6. Conditional Visibility

Show/hide fields based on other field values:
```typescript
'dna/assignee': {
  type: 'text',
  label: 'Assignee',
  when: {
    eq: { 'dna/status': 'active' }  // Only show if status is 'active'
  }
}

// More operators:
// eq: equals
// ne: not equals
// gt/lt: greater/less than
// in: value in array
// and/or/not: logical operators
```

### 7. Custom Field Options

**Select dropdown with options:**
```typescript
'dna/priority': {
  type: 'select',
  label: 'Priority',
  options: [
    { value: 'low', content: 'Low Priority' },
    { value: 'high', content: 'High Priority' }
  ]
}
```

**Dynamic lists (tags, array properties):**
```typescript
'dna/tags': {
  type: 'list',
  label: 'Tags',
  item: {
    type: 'text',
    placeholder: 'Add tag...'
  },
  addButtonLabel: '+ Add Tag',
  removeButtonLabel: '×',
  min: 0,
  max: 10
}
```

**Range slider with units:**
```typescript
'attrs/label/fontSize': {
  type: 'range',
  label: 'Font Size',
  min: 8,
  max: 32,
  unit: 'px',    // Shows "14px" next to slider
  step: 1
}
```

### 8. Read-Only Fields

For display-only fields (like IDs, timestamps):
```typescript
'data/id': {
  type: 'text',
  label: 'ID',
  attrs: {
    input: {
      disabled: true,
      style: 'opacity: 0.6; cursor: not-allowed;'
    }
  }
}
```

### 9. Different Configs for Nodes vs Links

The system automatically detects cell type and loads appropriate config:

```typescript
// Edit inspector-config.ts
export function getInspectorConfigForCell(cell: any) {
  if (cell.isLink && cell.isLink()) {
    return createLinkInspectorConfig()  // Different fields for links
  }
  return createNodeInspectorConfig()    // Fields for nodes
}
```

### 10. Access Custom DNA Properties

Store custom data in the `dna/` namespace:
```typescript
'dna/productId': {
  type: 'text',
  label: 'Product ID',
  group: 'dna'
}
```

Access in code:
```typescript
const productId = cell.prop('dna/productId')
cell.prop('dna/productId', 'new-value')
```

## Common Patterns

### Nested Object Properties
```typescript
'attrs/body/fill': {  // Path: attrs → body → fill
  type: 'color',
  label: 'Fill Color'
}
```

### Multiple Groups Example
```typescript
groups: {
  identification: { label: 'Identification', index: 1 },
  appearance: { label: 'Appearance', index: 2 },
  behavior: { label: 'Behavior', index: 3 },
  metadata: { label: 'Metadata', index: 4 }
}
```

### Complex Conditional Logic
```typescript
when: {
  and: [
    { eq: { 'dna/type': 'task' } },
    { in: { 'dna/priority': ['high', 'critical'] } }
  ]
}
```

## File Structure

```
src/components/
├── RightSidebar.tsx         ← Wrapper component, where everything currently lives
```

## Tips

1. **Keep groups organized**: Use index values spaced by 10 (10, 20, 30) so you can insert new groups easily
2. **Use meaningful paths**: Prefix custom properties with `dna/` to avoid conflicts with JointJS internals
3. **Test incrementally**: Add one field at a time and test
4. **Check console**: Inspector validation errors appear in browser console
5. **Use defaultValue**: Prevents undefined errors and provides good UX

## Need More?

- Full API docs: https://docs.jointjs.com/api/ui/Inspector/
- Input types: https://docs.jointjs.com/learn/features/property-editor-and-viewer#built-in-input-field-types
- Conditional expressions: https://docs.jointjs.com/learn/features/property-editor-and-viewer#conditional-expressions
