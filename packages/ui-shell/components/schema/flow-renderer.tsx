'use client'

import React, { useState } from 'react'
import { UISchema, FlowDefinition } from './types'
import { PageRenderer } from './page-renderer'
import { resolvePage, getFlowStepForPage, getNextFlowStep, getPreviousFlowSteps } from './resolvers'

interface FlowRendererProps {
  schema: UISchema
  flow: FlowDefinition
  onFlowComplete?: (data: Record<string, Record<string, unknown>>) => void
  onStepChange?: (stepId: string) => void
}

/**
 * Renders a multi-step flow based on schema definition
 * Handles step navigation and data collection
 */
export function FlowRenderer({
  schema,
  flow,
  onFlowComplete,
  onStepChange,
}: FlowRendererProps) {
  const [currentStepId, setCurrentStepId] = useState(flow.startStep)
  const [flowData, setFlowData] = useState<Record<string, Record<string, unknown>>>({})

  const currentStep = flow.steps.find((s) => s.id === currentStepId)
  const currentPage = currentStep ? resolvePage(schema, currentStep.pageId) : null
  const nextStep = currentStep ? getNextFlowStep(flow, currentStepId) : null
  const previousSteps = currentStep ? getPreviousFlowSteps(flow, currentStepId) : []

  const handleStepComplete = (componentId: string, data: Record<string, unknown>) => {
    if (!currentStep) return

    // Store component data
    setFlowData((prev) => ({
      ...prev,
      [componentId]: data,
    }))

    // Check for completion
    if (currentStep.isEnd) {
      onFlowComplete?.(flowData)
      return
    }

    // Move to next step
    if (nextStep) {
      setCurrentStepId(nextStep.id)
      onStepChange?.(nextStep.id)
    }
  }

  const handlePreviousStep = () => {
    if (previousSteps.length > 0) {
      const prevStep = previousSteps[previousSteps.length - 1]
      setCurrentStepId(prevStep.id)
      onStepChange?.(prevStep.id)
    }
  }

  if (!currentPage || !currentStep) {
    return <div className="text-destructive">Flow configuration error</div>
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Step {flow.steps.findIndex((s) => s.id === currentStepId) + 1} of {flow.steps.length}
          </h2>
          <p className="text-base text-muted-foreground mt-1">{currentStep.name}</p>
        </div>
        {currentStep.description && (
          <div className="text-sm text-muted-foreground md:text-right max-w-xs">
            {currentStep.description}
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2">
        {flow.steps.map((step, index) => {
          const isCurrentStep = step.id === currentStepId
          const isCompletedStep = flow.steps.indexOf(step) < flow.steps.indexOf(currentStep)

          return (
            <div
              key={step.id}
              className={`
                flex-1 h-2 rounded-full transition-all duration-300
                ${isCurrentStep ? 'bg-primary shadow-md' : isCompletedStep ? 'bg-primary/50' : 'bg-muted'}
              `}
              title={`${index + 1}. ${step.name}`}
            />
          )
        })}
      </div>

      {/* Current page */}
      <div className="py-4">
        <PageRenderer
          schema={schema}
          page={currentPage}
          onComponentSubmit={handleStepComplete}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between pt-6 border-t border-border">
        <button
          onClick={handlePreviousStep}
          disabled={previousSteps.length === 0}
          className={`
            px-6 py-3 rounded-lg text-base font-semibold
            ${previousSteps.length === 0
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70'
            }
            transition-all duration-200
          `}
        >
          ← Previous
        </button>

        {nextStep && (
          <div className="text-sm text-muted-foreground self-center italic">
            Next: {nextStep.name}
          </div>
        )}

        {nextStep && (
          <button
            disabled
            className="px-6 py-3 rounded-lg text-base font-semibold text-muted-foreground bg-muted cursor-not-allowed transition-all duration-200"
          >
            Next (Complete to continue) →
          </button>
        )}
      </div>
    </div>
  )
}
