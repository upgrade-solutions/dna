# DNA Schema Renderer - Quick Reference

## Component Hierarchy

```
FlowRenderer (Multi-step workflows)
  └── PageRenderer (Individual pages)
       ├── LayoutRenderer (Grid/Flex containers)
       │    └── ContainerRenderer (Individual containers)
       │         └── ComponentRenderer (Forms)
       │              └── FieldRenderer (Input fields)
       │                   ├── text input
       │                   ├── email input
       │                   ├── number input
       │                   ├── checkbox
       │                   └── select
       └── PageActions (Buttons)
```

## Quick Import

```tsx
import {
  // Components
  FlowRenderer,
  PageRenderer,
  LayoutRenderer,
  ComponentRenderer,
  FieldRenderer,
  FieldGroupRenderer,
  
  // Types
  UISchema,
  PageDefinition,
  ComponentDefinition,
  FieldDefinition,
  
  // Utilities
  resolveComponent,
  resolvePage,
  resolveFlow,
  validateField,
  validateComponentData,
} from '@/components/schema'
```

## Type Definitions at a Glance

### UISchema
```tsx
{
  id: string
  name: string
  key: string
  type: 'UI'
  pages: PageDefinition[]
  components: ComponentDefinition[]
  flows: FlowDefinition[]
}
```

### PageDefinition
```tsx
{
  id: string
  name: string
  key: string
  type: 'Page'
  description?: string
  resourceId?: string
  resourceName?: string
  layout: LayoutDefinition
  sections: SectionDefinition[]
  actions?: ActionDefinition[]
}
```

### ComponentDefinition
```tsx
{
  id: string
  name: string
  key: string
  type: 'Component'
  description?: string
  fields: FieldDefinition[]
  handlers?: EventHandlerDefinition[]
}
```

### FieldDefinition
```tsx
{
  id: string
  name: string
  key: string
  type: 'Field'
  dataType: 'string' | 'number' | 'integer' | 'boolean'
  required?: boolean
  validation?: {
    format?: 'email'
    minimum?: number
    maximum?: number
    enum?: unknown[]
  }
}
```

## Common Patterns

### Simple Form

```tsx
const form = {
  id: 'contact-form',
  name: 'Contact Form',
  key: 'contactForm',
  type: 'Component',
  fields: [
    {
      id: 'name',
      name: 'Full Name',
      key: 'name',
      type: 'Field',
      dataType: 'string',
      required: true
    },
    {
      id: 'email',
      name: 'Email',
      key: 'email',
      type: 'Field',
      dataType: 'string',
      required: true,
      validation: { format: 'email' }
    }
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
```

### Multi-Step Flow

```tsx
const flow = {
  id: 'checkout-flow',
  name: 'Checkout',
  key: 'checkout',
  type: 'Flow',
  startStep: 'shipping-info',
  steps: [
    {
      id: 'shipping-info',
      name: 'Shipping',
      key: 'shipping',
      type: 'Step',
      pageId: 'shipping-page',
      componentId: 'shipping-form',
      action: 'collectShipping',
      nextStep: 'payment-info'
    },
    {
      id: 'payment-info',
      name: 'Payment',
      key: 'payment',
      type: 'Step',
      pageId: 'payment-page',
      componentId: 'payment-form',
      action: 'collectPayment',
      isEnd: true
    }
  ],
  transitions: [
    {
      from: 'shipping-info',
      to: 'payment-info',
      trigger: 'next',
      condition: 'shippingValid'
    }
  ]
}
```

### Dropdown/Select Field

```tsx
{
  id: 'purpose',
  name: 'Loan Purpose',
  key: 'loanPurpose',
  type: 'Field',
  dataType: 'string',
  required: true,
  validation: {
    enum: ['home', 'auto', 'personal', 'business']
  }
}
```

### Number Field with Range

```tsx
{
  id: 'amount',
  name: 'Loan Amount',
  key: 'loanAmount',
  type: 'Field',
  dataType: 'number',
  required: true,
  validation: {
    minimum: 1000,
    maximum: 500000
  }
}
```

## Validation Errors

```tsx
const result = validateComponentData(component, data)

if (!result.valid) {
  result.errors.forEach(err => {
    console.log(`Field: ${err.field}`)
    err.errors.forEach(error => {
      console.log(`  - ${error}`)
    })
  })
}
```

## Layout Position

```tsx
{
  position: {
    row: 1,
    column: 1,
    columnSpan: 6,  // spans 6 columns
    rowSpan: 2      // spans 2 rows
  }
}
```

## Sample Demo

Access at: `http://localhost:3000/schema-demo`

Shows:
- 3-step loan application
- Form validation
- Progress indicator
- Step navigation
- Submission handling
