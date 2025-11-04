# DNA Schema Renderer - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    UI Shell Application                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Schema Definition (JSON)                       │
│  (Pages, Components, Fields, Flows from ui.json)               │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ Resolvers│        │Validators│        │ Renderers│
    ├──────────┤        ├──────────┤        ├──────────┤
    │ Find IDs │        │Validate  │        │Create    │
    │ in schema│        │Data      │        │React UI  │
    └──────────┘        └──────────┘        └──────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   React Components                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ FlowRenderer (Multi-Step Workflows)                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ PageRenderer (Individual Pages)                    │  │  │
│  │  ├────────────────────────────────────────────────────┤  │  │
│  │  │ ┌──────────────────────────────────────────────┐   │  │  │
│  │  │ │ LayoutRenderer (Grid/Flexbox)              │   │  │  │
│  │  │ ├──────────────────────────────────────────────┤   │  │  │
│  │  │ │ ┌────────────────────────────────────────┐   │   │  │  │
│  │  │ │ │ ComponentRenderer (Form)              │   │   │  │  │
│  │  │ │ ├────────────────────────────────────────┤   │   │  │  │
│  │  │ │ │ ┌──────────────────────────────────┐   │   │   │  │  │
│  │  │ │ │ │ FieldRenderer (Input Types)     │   │   │   │  │  │
│  │  │ │ │ │ • text, email, number, select   │   │   │   │  │  │
│  │  │ │ │ │ • validation, errors            │   │   │   │  │  │
│  │  │ │ │ └──────────────────────────────────┘   │   │   │  │  │
│  │  │ │ └────────────────────────────────────────┘   │   │  │  │
│  │  │ └──────────────────────────────────────────────┘   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Other Components:                                              │
│  • MultiComponentRenderer (Multiple forms on page)             │
│  • FieldGroupRenderer (Group of fields)                        │
│  • ContainerRenderer (Layout container)                        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Multi-Step Flow

```
User navigates to application
              │
              ▼
   FlowRenderer initialized
   startStep = 'borrower-info-step'
              │
              ▼
   Resolve page & component by step
   pageId → PageDefinition
   componentId → ComponentDefinition
              │
              ▼
   PageRenderer displays page
              │
              ▼
   LayoutRenderer creates containers
              │
              ▼
   ComponentRenderer renders form
   (borrower-form-component)
              │
              ▼
   FieldRenderer renders each field
   • firstName (text input)
   • lastName (text input)
   • email (email input)
   • phone (text input)
              │
              ▼
   User fills form & clicks Submit
              │
              ▼
   validateComponentData() checks all fields
   Each field validated against rules
              │
         ┌────┴─────┐
         │           │
        Valid       Invalid
         │           │
         ▼           ▼
   Store data   Show errors
        │           │
        └─────┬─────┘
              │
         Continue?
         │
         ├─ No: Show errors
         │
         └─ Yes
              │
              ▼
   getNextFlowStep() finds next step
   currentStepId = 'loan-details-step'
              │
              ▼
   FlowRenderer updates UI
   setCurrentStepId(nextStep.id)
              │
              ▼
   Progress bar updates
   Flow header updates
   New page loads
              │
              ▼
   Process repeats for next step
              │
              ├─ Borrower Info → Loan Details
              ├─ Loan Details → Review
              └─ Review → Complete
              │
              ▼
   Last step isEnd: true
              │
              ▼
   onFlowComplete() callback triggered
   Pass collected data
   Flow ends
```

## File Dependencies

```
┌─ types.ts (Core Types)
│  ├── UISchema
│  ├── PageDefinition
│  ├── ComponentDefinition
│  ├── FieldDefinition
│  └── etc.
│
├─ resolvers.ts ─────────────┐
│  ├── resolveComponent()    │
│  ├── resolvePage()         │
│  ├── getPageComponents()   └─────┐
│  └── getFlowStepForPage()        │
│                                  │
├─ validators.ts ──────────┐      │
│  ├── validateField()      │      │
│  ├── validateComponentData()     │
│  └── ValidationResult     │      │
│                           │      │
├─ field-renderer.tsx ◄────┤──────┘ types.ts
│  ├── FieldRenderer
│  └── FieldGroupRenderer
│
├─ component-renderer.tsx ◄─┤
│  ├── ComponentRenderer
│  └── MultiComponentRenderer
│
├─ layout-renderer.tsx ◄────┘
│  ├── LayoutRenderer
│  └── ContainerRenderer
│
├─ page-renderer.tsx ◄────────────────┐
│  └── PageRenderer                   │ uses many modules
│                                     │
├─ flow-renderer.tsx ◄────────────────┘
│  └── FlowRenderer
│
├─ index.ts
│  └── Re-exports everything
│
└─ README.md & QUICK_REFERENCE.md
```

## State Management

### FlowRenderer State
```
┌─────────────────────────────────┐
│ FlowRenderer State              │
├─────────────────────────────────┤
│ currentStepId: string           │
│ flowData: {                     │
│   [componentId]: {              │
│     firstName: 'John',          │
│     lastName: 'Doe',            │
│     email: 'john@example.com'   │
│   }                             │
│ }                               │
└─────────────────────────────────┘
```

### ComponentRenderer State
```
┌─────────────────────────────────┐
│ ComponentRenderer State         │
├─────────────────────────────────┤
│ formData: {                     │
│   firstName: 'John',            │
│   lastName: 'Doe',              │
│   ...                           │
│ }                               │
│ errors: {                       │
│   email: 'Invalid email format' │
│ }                               │
│ isSubmitting: boolean           │
└─────────────────────────────────┘
```

### FieldRenderer State
```
┌──────────────────────────┐
│ FieldRenderer State      │
├──────────────────────────┤
│ Props:                   │
│ • field: FieldDefinition │
│ • value: unknown         │
│ • error?: string         │
│ • disabled?: boolean     │
│                          │
│ Callbacks:               │
│ • onChange()             │
└──────────────────────────┘
```

## Component Render Tree Example

```
<FlowRenderer>
  currentStep = borrower-info-step
  
  ├─ Step Indicator
  │  └─ "Step 1 of 3: Borrower Information"
  │
  ├─ Progress Bar
  │  └─ 33% complete
  │
  ├─ <PageRenderer>
  │  └─ page = borrower-info-page
  │
  │   ├─ Page Title & Description
  │   │
  │   ├─ <LayoutRenderer>
  │   │  structure = "flexbox"
  │   │  
  │   │  └─ <ContainerRenderer>
  │   │     key = "form"
  │   │     
  │   │     └─ <ComponentRenderer>
  │   │        component = borrower-form
  │   │        
  │   │        └─ <FieldGroupRenderer>
  │   │           
  │   │           ├─ <FieldRenderer>
  │   │           │  field = firstName
  │   │           │  └─ <input type="text" />
  │   │           │
  │   │           ├─ <FieldRenderer>
  │   │           │  field = lastName
  │   │           │  └─ <input type="text" />
  │   │           │
  │   │           ├─ <FieldRenderer>
  │   │           │  field = email
  │   │           │  └─ <input type="email" />
  │   │           │
  │   │           └─ <FieldRenderer>
  │   │              field = phone
  │   │              └─ <input type="text" />
  │   │
  │   │        <button>Submit</button>
  │   │
  │   └─ Page Actions (if any)
  │
  └─ Navigation Buttons
     ├─ <button disabled>Previous</button>
     └─ "Next: Loan Details"
```

## Validation Flow

```
User submits form
        │
        ▼
ComponentRenderer.handleSubmit()
        │
        ├─ setIsSubmitting(true)
        │
        ▼
validateComponentData(component, formData)
        │
        ├─ For each field:
        │  │
        │  ▼
        │  validateField(field, value)
        │  │
        │  ├─ Check required
        │  ├─ Check type
        │  ├─ Check format (email)
        │  ├─ Check range (min/max)
        │  └─ Check enum
        │  │
        │  └─ Return: {valid, errors}
        │
        └─ Collect all field results
              │
              ├─ valid ─────────► Clear errors → onSubmit() callback
              │
              └─ invalid ──────► Format errors → setErrors() → Show errors
                                 
                                 setIsSubmitting(false)
```

## Type Relationships

```
UISchema
├── PageDefinition[]
│   ├── LayoutDefinition
│   │   └── ContainerDefinition[]
│   │       └── ComponentReference
│   │           └── references: ComponentDefinition
│   ├── SectionDefinition[]
│   └── ActionDefinition[]
│
├── ComponentDefinition[]
│   ├── FieldDefinition[]
│   │   └── validation?: Record<string, any>
│   └── EventHandlerDefinition[]
│
└── FlowDefinition[]
    ├── StepDefinition[]
    │   ├── pageId → PageDefinition
    │   └── componentId → ComponentDefinition
    └── TransitionDefinition[]
        ├── from → StepDefinition
        └── to → StepDefinition
```

---

This architecture provides:
- **Separation of Concerns** - Each module has a single responsibility
- **Composition** - Renderers compose smaller components
- **Reusability** - Schemas can be used in multiple ways
- **Type Safety** - Full TypeScript coverage
- **Extensibility** - Easy to add new renderer types or validation rules
