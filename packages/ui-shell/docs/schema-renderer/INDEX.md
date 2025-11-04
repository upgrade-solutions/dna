# DNA Schema Renderer System - Complete Index

Welcome to the DNA Schema Renderer system! This document provides an overview and navigation guide to all available resources.

## 📍 Quick Navigation

### For Quick Start
→ Start here: **[QUICK_REFERENCE.md](../../components/schema/QUICK_REFERENCE.md)** (2 min read)

### For Understanding the System
→ Read: **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Visual diagrams and data flow (5 min read)

### For Building with Schemas
→ Follow: **[README.md](../../components/schema/README.md)** - Complete guide with examples (10 min read)

### For Migrating Your Schema
→ Use: **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - How to use ui.json (5 min read)

### For Testing
→ Reference: **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Unit & integration tests (10 min read)

### For Project Summary
→ Overview: **[SUMMARY.md](./SUMMARY.md)** - What was created (5 min read)

## 📁 File Structure

```
ui-shell/
├── components/schema/              # All renderer code
│   ├── types.ts                   # Type definitions
│   ├── resolvers.ts               # Schema resolution
│   ├── validators.ts              # Validation logic
│   ├── field-renderer.tsx         # Field components
│   ├── component-renderer.tsx     # Form components
│   ├── layout-renderer.tsx        # Layout containers
│   ├── page-renderer.tsx          # Page rendering
│   ├── flow-renderer.tsx          # Multi-step flows
│   ├── index.ts                   # Central exports
│   ├── README.md                  # Full documentation
│   └── QUICK_REFERENCE.md         # Quick lookup
│
├── app/schema-demo/               # Demo application
│   ├── page.tsx                   # Demo page
│   └── sample-schema.ts           # Sample schema
│
├── docs/schema-renderer/          # Documentation
│   ├── INDEX.md                  # Navigation guide
│   ├── ARCHITECTURE.md           # System design
│   ├── MIGRATION_GUIDE.md        # Schema migration
│   ├── TESTING_GUIDE.md          # Testing guide
│   └── SUMMARY.md                # Project summary
│
└── README.md                       # Main README
```

## 🚀 Getting Started

### 1. View the Demo
```bash
npm run dev
# Navigate to: http://localhost:3000/schema-demo
```

### 2. Import Components
```tsx
import {
  FlowRenderer,
  PageRenderer,
  ComponentRenderer,
} from '@/components/schema'
```

### 3. Create Your First Schema
```tsx
import { UISchema } from '@/components/schema'

const mySchema: UISchema = {
  id: 'my-schema',
  name: 'My Application',
  key: 'myApp',
  type: 'UI',
  pages: [/* ... */],
  components: [/* ... */],
  flows: [/* ... */]
}
```

### 4. Render a Flow
```tsx
<FlowRenderer
  schema={mySchema}
  flow={mySchema.flows[0]}
  onFlowComplete={handleComplete}
/>
```

## 📚 Documentation Overview

### Quick Reference (~2 min)
**File:** `components/schema/QUICK_REFERENCE.md`

Quick lookup for:
- Component hierarchy
- Common patterns
- Type definitions
- Validation examples

### README (~10 min)
**File:** `components/schema/README.md`

Complete guide including:
- Architecture overview
- Usage examples
- Supported field types
- Validation details
- Layout systems
- Event handlers
- Best practices

### Architecture (~5 min)
**File:** `docs/schema-renderer/ARCHITECTURE.md`

Visual explanations of:
- System architecture diagrams
- Data flow diagrams
- Component render trees
- State management
- File dependencies

### Migration Guide (~5 min)
**File:** `docs/schema-renderer/MIGRATION_GUIDE.md`

How to:
- Load your ui.json schema
- Map schema components
- Display specific pages
- Create flows
- Extend schemas
- Common patterns

### Testing Guide (~10 min)
**File:** `docs/schema-renderer/TESTING_GUIDE.md`

Testing examples for:
- Unit tests (validators, resolvers)
- Component tests
- Integration tests
- Manual testing checklist
- Performance testing
- Accessibility testing

### Project Summary (~5 min)
**File:** `docs/schema-renderer/SUMMARY.md`

Overview of:
- What was created
- Why things are organized this way
- Next steps and enhancements
- Integration points

## 🎯 Common Tasks

### I want to...

#### Display a form
```tsx
import { ComponentRenderer } from '@/components/schema'

const myForm = schema.components[0]
<ComponentRenderer component={myForm} onSubmit={handleSubmit} />
```
→ See: `components/schema/README.md` → "Component Rendering"

#### Create a multi-step flow
```tsx
import { FlowRenderer } from '@/components/schema'

const myFlow = schema.flows[0]
<FlowRenderer schema={schema} flow={myFlow} onFlowComplete={done} />
```
→ See: `components/schema/README.md` → "Flow Rendering"

#### Validate form data
```tsx
import { validateComponentData } from '@/components/schema'

const result = validateComponentData(component, data)
if (!result.valid) console.log(result.errors)
```
→ See: `components/schema/QUICK_REFERENCE.md` → "Validation Errors"

#### Find a component in schema
```tsx
import { resolveComponent } from '@/components/schema'

const comp = resolveComponent(schema, componentId)
```
→ See: `components/schema/README.md` → "Resolver Utilities"

#### Add a new field to a form
```tsx
const newField: FieldDefinition = {
  id: 'new-field',
  name: 'My Field',
  key: 'myField',
  type: 'Field',
  dataType: 'string'
}
component.fields.push(newField)
```
→ See: `docs/schema-renderer/MIGRATION_GUIDE.md` → "Extending the Schema"

#### Test a validator
```tsx
import { validateField } from '@/components/schema'

const result = validateField(field, value)
```
→ See: `docs/schema-renderer/TESTING_GUIDE.md` → "Unit Tests"

## 🔍 Type Lookup

All types are exported from `@/components/schema`:

```tsx
// Page types
UISchema
PageDefinition
LayoutDefinition
ContainerDefinition

// Component types
ComponentDefinition
FieldDefinition
EventHandlerDefinition

// Flow types
FlowDefinition
StepDefinition
TransitionDefinition

// Utility types
ValidationResult
ValidationError
```

→ Full reference: `components/schema/types.ts`

## 🛠️ Utilities Overview

### Resolvers
- `resolveComponent(schema, id)` - Find component by ID
- `resolvePage(schema, id)` - Find page by ID
- `resolveFlow(schema, id)` - Find flow by ID
- `getPageComponents(schema, page)` - Get all components on page
- `getFlowStepForPage(flow, pageId)` - Get step for page
- `getNextFlowStep(flow, stepId)` - Get next step
- `getPreviousFlowSteps(flow, stepId)` - Get previous steps

→ See: `components/schema/resolvers.ts`

### Validators
- `validateField(field, value)` - Validate single field
- `validateComponentData(component, data)` - Validate form

→ See: `components/schema/validators.ts`

## 🎨 Component API

### FlowRenderer
Multi-step workflow with navigation
```tsx
<FlowRenderer
  schema={UISchema}
  flow={FlowDefinition}
  onFlowComplete={(data) => {}}
  onStepChange={(stepId) => {}}
/>
```

### PageRenderer
Single page with layout and components
```tsx
<PageRenderer
  schema={UISchema}
  page={PageDefinition}
  onComponentSubmit={(componentId, data) => {}}
/>
```

### ComponentRenderer
Form with validation
```tsx
<ComponentRenderer
  component={ComponentDefinition}
  data={Record}
  onChange={(data) => {}}
  onSubmit={(data) => {}}
/>
```

### FieldRenderer
Individual input field
```tsx
<FieldRenderer
  field={FieldDefinition}
  value={unknown}
  onChange={(value) => {}}
  error={string}
/>
```

### LayoutRenderer
Grid or flexbox layout
```tsx
<LayoutRenderer
  layout={LayoutDefinition}
  containers={Map<string, ReactNode>}
/>
```

## 📊 Data Flow Summary

```
Schema Definition (JSON/TS)
    ↓
Resolver (Find what you need)
    ↓
React Component (FlowRenderer/PageRenderer/etc)
    ↓
FieldRenderer (Individual inputs)
    ↓
Form Submission
    ↓
Validator (Check data)
    ↓
onSubmit Callback (Handle result)
```

## 💡 Key Concepts

### Schema
Declarative definition of UI structure, components, and flows in JSON/TypeScript

### Component
Reusable form with fields and validation rules

### Page
Container for layout and components with resource context

### Flow
Multi-step wizard with step navigation and data collection

### Field
Individual input (text, email, number, select, checkbox)

### Layout
Grid or flexbox container system

### Resolver
Utility to find definitions by ID in schema

### Validator
Utility to check data against schema rules

## 🔗 Related Files

- **ui.json** - Source schema example at `/packages/schemas/json/platform/application/ui/ui.json`
- **sample-schema.ts** - Loan application example at `/app/schema-demo/sample-schema.ts`
- **package.json** - Dependencies at `/ui-shell/package.json`

## ✅ Checklist

- [ ] Read QUICK_REFERENCE.md (2 min)
- [ ] View demo at `/schema-demo` (5 min)
- [ ] Read SCHEMA_ARCHITECTURE.md (5 min)
- [ ] Study README.md (10 min)
- [ ] Try importing components (5 min)
- [ ] Create first schema (10 min)
- [ ] Read SCHEMA_MIGRATION_GUIDE.md (5 min)
- [ ] Review SCHEMA_TESTING_GUIDE.md (10 min)

Total time: ~1 hour to full mastery

## 🆘 Troubleshooting

**Component not rendering?**
→ See: `components/schema/README.md` → "Common Issues"

**Validation not working?**
→ See: `docs/schema-renderer/TESTING_GUIDE.md` → "Troubleshooting"

**Not sure how to structure schema?**
→ See: `docs/schema-renderer/MIGRATION_GUIDE.md` → "Common Patterns"

**Performance issues?**
→ See: `docs/schema-renderer/TESTING_GUIDE.md` → "Performance Testing"

## 🚀 Next Steps

1. **Short term:**
   - [ ] Use demo to understand system
   - [ ] Create your first schema
   - [ ] Build a simple form

2. **Medium term:**
   - [ ] Build multi-step flow
   - [ ] Add custom validation
   - [ ] Integrate with backend

3. **Long term:**
   - [ ] Add conditional fields
   - [ ] Create custom field types
   - [ ] Implement analytics
   - [ ] Add i18n support

## 📞 Questions?

See the relevant documentation file above for detailed answers.

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Status:** Production Ready
