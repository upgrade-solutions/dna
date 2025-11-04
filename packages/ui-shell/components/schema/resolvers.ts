/**
 * DNA Schema Resolvers
 * Utilities for finding and resolving schema definitions
 */

import {
  UISchema,
  ComponentDefinition,
  PageDefinition,
  FlowDefinition,
  StepDefinition,
  FieldDefinition,
} from './types'

/**
 * Resolves a component definition from the schema by ID
 */
export function resolveComponent(
  schema: UISchema,
  componentId: string
): ComponentDefinition | undefined {
  return schema.components.find((c) => c.id === componentId)
}

/**
 * Resolves a page definition from the schema by ID
 */
export function resolvePage(
  schema: UISchema,
  pageId: string
): PageDefinition | undefined {
  return schema.pages.find((p) => p.id === pageId)
}

/**
 * Resolves a flow definition from the schema by ID
 */
export function resolveFlow(
  schema: UISchema,
  flowId: string
): FlowDefinition | undefined {
  return schema.flows.find((f) => f.id === flowId)
}

/**
 * Gets all components used in a page
 */
export function getPageComponents(
  schema: UISchema,
  page: PageDefinition
): ComponentDefinition[] {
  const componentIds = new Set<string>()

  page.layout.containers.forEach((container) => {
    container.components.forEach((comp) => {
      componentIds.add(comp.componentId)
    })
  })

  return Array.from(componentIds)
    .map((id) => resolveComponent(schema, id))
    .filter((c): c is ComponentDefinition => c !== undefined)
}

/**
 * Gets the flow step for a given page
 */
export function getFlowStepForPage(
  flow: FlowDefinition,
  pageId: string
): StepDefinition | undefined {
  return flow.steps.find((step) => step.pageId === pageId)
}

/**
 * Gets the next step in a flow based on transitions
 */
export function getNextFlowStep(
  flow: FlowDefinition,
  currentStepId: string
): StepDefinition | undefined {
  // Find the transition from the current step
  const transition = flow.transitions.find((t) => t.from === currentStepId)
  if (!transition) return undefined
  // Return the target step
  return flow.steps.find((s) => s.id === transition.to)
}

/**
 * Gets previous steps in a flow (all steps that can transition to this one)
 */
export function getPreviousFlowSteps(
  flow: FlowDefinition,
  stepId: string
): StepDefinition[] {
  const transitionsTo = flow.transitions.filter((t) => t.to === stepId)
  return transitionsTo
    .map((t) => flow.steps.find((s) => s.id === t.from))
    .filter((s): s is StepDefinition => s !== undefined)
}
