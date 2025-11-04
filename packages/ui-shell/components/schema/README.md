# DNA Schema Renderers for UI Shell

A comprehensive system for dynamically rendering UI components, pages, and flows based on DNA schema definitions. This enables building complex forms and multi-step workflows without hand-coding individual components.

## Overview

The schema renderer system is organized in `/components/schema/` with the following key modules:

### Core Modules

- **`types.ts`** - TypeScript interfaces and types for all schema definitions
- **`resolvers.ts`** - Utilities for finding and resolving schema definitions by ID
- **`validators.ts`** - Field and form validation against schema definitions
- **`field-renderer.tsx`** - Dynamic field components (text, number, email, select, etc.)
- **`component-renderer.tsx`** - Form components with validation and submission
- **`layout-renderer.tsx`** - Layout containers (grid, flexbox, stack)
- **`page-renderer.tsx`** - Complete page rendering with components and layout
- **`flow-renderer.tsx`** - Multi-step workflows with navigation
- **`index.ts`** - Central export point

## Architecture

```
┌─────────────────────────────────────┐
│      FlowRenderer                   │  Multi-step workflows
│  (handles step navigation)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      PageRenderer                   │  Individual pages
│  (combines layout + components)     │
└──────────┬───────────────────────┬──┘
           │                       │
    ┌──────▼──────┐         ┌──────▼──────────┐
    │LayoutRenderer│        │ComponentRenderer │  Form handling
    │(grid/flex)   │        │(validation)      │
    └──────────────┘        └───────┬──────────┘
                                    │
                        ┌───────────▼──────────┐
                        │  FieldRenderer       │
                        │  (input types)       │
                        └──────────────────────┘
```

## Usage Examples

### Basic Field Rendering

```tsx
import { FieldRenderer, FieldDefinition } from '@/components/schema'

const emailField: FieldDefinition = {
  id: 'email-field',
  name: 'Email Address',
  key: 'email',
  type: 'Field',
  dataType: 'string',
  required: true,
  validation: { format: 'email' }
}

export function EmailForm() {
  const [email, setEmail] = useState('')

  return (
    <FieldRenderer
      field={emailField}
      value={email}
      onChange={setEmail}
    />
  )
}
```

### Component (Form) Rendering

```tsx
import { ComponentRenderer, ComponentDefinition } from '@/components/schema'

const borrowerForm: ComponentDefinition = {
  id: 'borrower-form',
  name: 'Borrower Form',
  key: 'borrowerForm',
  type: 'Component',
  fields: [
    // ... field definitions
  ],
  handlers: [
    {
      id: 'submit',
      name: 'On Submit',
      key: 'onSubmit',
      type: 'EventHandler',
      action: 'submit',
      validation: true
    }
  ]
}

export function BorrowerStep() {
  return (
    <ComponentRenderer
      component={borrowerForm}
      onSubmit={(data) => console.log('Submitted:', data)}
    />
  )
}
```

### Page Rendering

```tsx
import { PageRenderer, PageDefinition } from '@/components/schema'

export function LoanApplicationPage() {
  const schema = useLoanSchema()
  const page = schema.pages[0]

  return (
    <PageRenderer
      schema={schema}
      page={page}
      onComponentSubmit={(componentId, data) => {
        console.log(`Component ${componentId} submitted:`, data)
      }}
    />
  )
}
```

### Flow (Multi-Step) Rendering

```tsx
import { FlowRenderer } from '@/components/schema'

export function ApplicationFlow() {
  const schema = useLoanSchema()
  const flow = schema.flows[0]

  return (
    <FlowRenderer
      schema={schema}
      flow={flow}
      onFlowComplete={(data) => {
        console.log('Flow completed with data:', data)
        submitApplication(data)
      }}
      onStepChange={(stepId) => {
        console.log('Changed to step:', stepId)
      }}
    />
  )
}
```

## Supported Field Types

The `FieldRenderer` component automatically determines input type based on field definition:

| dataType | validation | HTML Type | Example |
|----------|-----------|-----------|---------|
| `string` | - | `<input type="text">` | Name, address |
| `string` | `format: "email"` | `<input type="email">` | Email |
| `number` | - | `<input type="number">` | Price |
| `integer` | - | `<input type="number" step="1">` | Quantity |
| `boolean` | - | `<input type="checkbox">` | Agree to terms |
| any | `enum: [...]` | `<select>` | Dropdown |

## Validation

### Field Validation

```tsx
import { validateField } from '@/components/schema'

const field: FieldDefinition = {
  id: 'amount',
  name: 'Loan Amount',
  key: 'amount',
  type: 'Field',
  dataType: 'number',
  required: true,
  validation: {
    minimum: 1000,
    maximum: 500000
  }
}

const result = validateField(field, 50000)
// { valid: true, errors: [] }

const result2 = validateField(field, 100) // too low
// { valid: false, errors: ['Loan Amount must be at least 1000'] }
```

### Component Validation

```tsx
import { validateComponentData } from '@/components/schema'

const component: ComponentDefinition = {
  id: 'borrower-form',
  name: 'Borrower Form',
  key: 'borrowerForm',
  type: 'Component',
  fields: [
    /* field definitions */
  ]
}

const formData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'invalid-email'
}

const result = validateComponentData(component, formData)
if (!result.valid) {
  result.errors.forEach(err => {
    console.log(`${err.field}: ${err.errors.join(', ')}`)
  })
}
```

## Resolver Utilities

### Finding Definitions

```tsx
import {
  resolveComponent,
  resolvePage,
  resolveFlow,
  getPageComponents,
  getFlowStepForPage
} from '@/components/schema'

const schema = useLoanSchema()

// Find a component by ID
const component = resolveComponent(schema, 'borrower-form-component')

// Find a page by ID
const page = resolvePage(schema, 'borrower-info-page')

// Get all components used on a page
const pageComps = getPageComponents(schema, page)

// Get the flow step for a page
const step = getFlowStepForPage(flow, page.id)
```

## Layout Systems

The renderer supports three layout structures:

### Grid Layout

```json
{
  "layout": {
    "structure": "grid",
    "gridColumns": 12,
    "containers": [
      {
        "id": "header",
        "position": {
          "row": 1,
          "column": 1,
          "columnSpan": 12
        }
      }
    ]
  }
}
```

### Flexbox Layout

```json
{
  "layout": {
    "structure": "flexbox",
    "containers": [...]
  }
}
```

### Stack Layout

```json
{
  "layout": {
    "structure": "stack",
    "containers": [...]
  }
}
```

## Event Handlers

Components can define event handlers that trigger on specific actions:

```tsx
const component = {
  handlers: [
    {
      id: 'submit-handler',
      name: 'On Submit',
      key: 'onSubmit',
      type: 'EventHandler',
      action: 'submitForm',
      validation: true
    }
  ]
}
```

Handlers trigger when:
- Form is submitted (if `key: 'onSubmit'`)
- Validation passes (if `validation: true`)
- Component's `onSubmit` callback is called

## Demo

A demo is available at `/schema-demo` that showcases:

- Multi-step loan application flow
- Dynamic form rendering
- Validation and error handling
- Progress indication
- Step navigation

Run the dev server and navigate to `http://localhost:3000/schema-demo` to see it in action.

## File Structure

```
components/schema/
├── types.ts                 # Type definitions
├── resolvers.ts            # Schema resolution utilities
├── validators.ts           # Validation utilities
├── field-renderer.tsx      # Field component
├── component-renderer.tsx  # Form component
├── layout-renderer.tsx     # Layout component
├── page-renderer.tsx       # Page component
├── flow-renderer.tsx       # Flow component
└── index.ts               # Central exports

app/schema-demo/
├── page.tsx                # Demo page
└── sample-schema.ts        # Sample schema
```

## Best Practices

1. **Define schemas separately** - Keep schema definitions in separate files for reusability
2. **Use resolvers** - Always use resolver functions instead of manually searching arrays
3. **Validate early** - Validate fields before submission using validators
4. **Handle errors** - Display validation errors to users for better UX
5. **Type safety** - Use TypeScript types for all schema work
6. **Testing** - Test validators and resolvers independently from components

## Future Enhancements

- [ ] Conditional field display based on form state
- [ ] Custom field type support
- [ ] Field dependencies and relationships
- [ ] Async validation support
- [ ] Custom layout components
- [ ] State persistence for multi-step flows
- [ ] Analytics and telemetry
- [ ] Accessibility improvements (ARIA, keyboard nav)
- [ ] Internationalization (i18n) support
