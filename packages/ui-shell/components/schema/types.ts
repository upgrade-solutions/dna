/**
 * DNA Schema Type Definitions
 * Central location for all schema-related types
 */

export interface FieldDefinition {
  id: string
  name: string
  key: string
  type: string
  dataType: string
  required?: boolean
  validation?: Record<string, unknown>
}

export interface ComponentDefinition {
  id: string
  name: string
  key: string
  type: string
  description?: string
  fields: FieldDefinition[]
  handlers?: EventHandlerDefinition[]
}

export interface EventHandlerDefinition {
  id: string
  name: string
  key: string
  type: string
  action: string
  validation?: boolean
}

export interface ContainerPosition {
  row: number
  column: number
  columnSpan?: number
  rowSpan?: number
}

export interface ContainerDefinition {
  id: string
  name: string
  key: string
  type: string
  position: ContainerPosition
  height?: string
  padding?: string
  components: Array<{
    componentId: string
    componentName: string
    order: number
  }>
}

export interface LayoutDefinition {
  id: string
  name: string
  key: string
  type: string
  structure: 'grid' | 'flexbox' | 'stack'
  gridColumns?: number
  containers: ContainerDefinition[]
}

export interface SectionDefinition {
  id: string
  containerId: string
  type: string
  attributes: string[]
}

export interface PageDefinition {
  id: string
  name: string
  key: string
  type: string
  description?: string
  resourceId?: string
  resourceName?: string
  layout: LayoutDefinition
  sections: SectionDefinition[]
  actions?: Array<{
    id: string
    name: string
    key: string
    type: string
  }>
}

export interface StepDefinition {
  id: string
  name: string
  key: string
  type: string
  description?: string
  pageId: string
  componentId: string
  action: string
  isEnd?: boolean
}

export interface TransitionDefinition {
  from: string
  to: string
  trigger: string
  condition?: string | null
}

export interface FlowDefinition {
  id: string
  name: string
  key: string
  type: string
  description?: string
  startStep: string
  steps: StepDefinition[]
  transitions: TransitionDefinition[]
}

export interface UISchema {
  id: string
  name: string
  key: string
  type: string
  description?: string
  pages: PageDefinition[]
  components: ComponentDefinition[]
  flows: FlowDefinition[]
}
