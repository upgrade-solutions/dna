# Sliding Animation for Item Insertion

This implementation adds smooth sliding animations when inserting new items in the middle of workflow step lists.

## Features

### 🎯 Smooth Sliding Animation
- When a new step is inserted at any position, existing steps below that position smoothly slide down
- Uses CSS transitions for 300ms smooth movement
- Items slide down by 64px (`translate-y-16`) to make room for the new item

### 🎨 Visual States
- **Inserting State**: New items fade in with scale animation
- **Sliding State**: Existing items translate down temporarily  
- **Hover States**: Insert buttons appear on workflow hover

### ⚡ Optimistic Updates
- UI updates immediately for responsive feel
- Server sync happens in background
- Graceful error handling with rollback

## Implementation Details

### Component Architecture

#### BusinessModelViewer Component
- Added `onInsertStep` prop for external insert handling
- Animation state management with `AnimationState` interface
- `handleInsertStep` function coordinates the animation sequence

#### Animation State Interface
```typescript
interface AnimationState {
  insertingAt: number | null          // Position being inserted at
  insertingWorkflowId: string | null  // Which workflow is being modified
  animatingSteps: Set<string>         // Step IDs that need to slide
}
```

### Animation Sequence

1. **Trigger**: User clicks "Insert Step" button
2. **Prepare**: Identify which steps need to slide down
3. **Animate**: Apply slide-down transforms to affected steps
4. **Insert**: Add new step to data with fade-in animation
5. **Cleanup**: Remove animation states after 300ms

### CSS Classes

#### Custom Animation Classes (in globals.css)
```css
.workflow-step {
  @apply transition-all duration-300 ease-in-out;
}

.step-inserting {
  @apply opacity-0 scale-95;
  animation: slideIn 300ms ease-out forwards;
}

.step-sliding {
  @apply transform translate-y-16;
}
```

#### Dynamic Class Application
```typescript
const getStepAnimationClasses = (stepId: string, stepIndex: number, workflowId: string) => {
  const isAnimating = animationState.animatingSteps.has(stepId)
  const isInserting = animationState.insertingWorkflowId === workflowId && 
                     animationState.insertingAt === stepIndex
  
  let classes = 'transition-all duration-300 ease-in-out '
  
  if (isAnimating) {
    classes += 'transform translate-y-16 '
  }
  
  if (isInserting) {
    classes += 'opacity-0 scale-95 '
  }
  
  return classes
}
```

### Data Flow

#### Hook Enhancement (use-business-model-data.ts)
Added `insertStepAt` function:
- Calculates new step orders
- Updates local state optimistically  
- Makes API call to persist changes
- Handles rollback on failure

#### API Endpoint (/api/data/steps/insert/route.ts)
- Generates unique step IDs
- Updates step orders for affected items
- Persists changes to steps.json
- Returns success confirmation

### User Experience

#### Insert Button Visibility
- Buttons only appear on workflow hover (`.group/workflow` class)
- Positioned between steps and at the end
- Clear visual hierarchy with primary color accent

#### Responsive Feedback
- Immediate visual feedback on click
- Smooth 300ms animations
- Success indicators for completed operations

## Usage Example

```tsx
<BusinessModelViewer
  refreshTrigger={refreshTrigger}
  onStepClick={handleStepClick}
  onInsertStep={(workflowId, position, step) => {
    console.log('Step inserted:', { workflowId, position, step })
    // Handle the insertion
  }}
  className="shadow-lg"
/>
```

## Demo Page

Access the interactive demo at `/sliding-demo` to see the animation in action:
- Hover over workflow sections to reveal insert buttons
- Click buttons to insert new steps at different positions
- Watch existing steps smoothly slide down

## Technical Considerations

### Performance
- Animations are hardware-accelerated using CSS transforms
- Minimal DOM manipulation during animations
- Cleanup prevents memory leaks

### Accessibility  
- Maintains focus management during insertions
- Keyboard navigation preserved
- Screen reader friendly with proper ARIA labels

### Browser Support
- CSS transforms and transitions (IE10+)
- Modern JavaScript features (ES2020+)
- Progressive enhancement approach