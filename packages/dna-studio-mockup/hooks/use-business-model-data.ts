import { useState, useEffect } from 'react'

export interface WorkflowStep {
  id: string
  actor: string
  action: string
  resource: string
  status: string
  workflowId: string
  order?: number
  description?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  status: string
  productId: string
}

export interface BusinessModelData {
  workflows: Workflow[]
  steps: WorkflowStep[]
}

export function useBusinessModelData(refreshTrigger?: number) {
  const [data, setData] = useState<BusinessModelData>({ workflows: [], steps: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastDataHash, setLastDataHash] = useState<string>('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [workflowsRes, stepsRes] = await Promise.all([
        fetch('/api/data/workflows', { 
          cache: 'no-store'
        }),
        fetch('/api/data/steps', { 
          cache: 'no-store'
        })
      ])

      if (!workflowsRes.ok || !stepsRes.ok) {
        throw new Error('Failed to fetch business model data')
      }

      const [workflows, steps] = await Promise.all([
        workflowsRes.json(),
        stepsRes.json()
      ])

      const newData = { workflows, steps }
      const newDataHash = JSON.stringify(newData)
      
      // Only update if data actually changed
      if (newDataHash !== lastDataHash) {
        setData(newData)
        setLastDataHash(newDataHash)
        console.log('[BusinessModelData] Data updated with', steps.length, 'steps', 'workflows:', workflows.length)
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  const refreshData = () => {
    fetchData()
  }

  const getStepsForWorkflow = (workflowId: string) => {
    const steps = data.steps.filter(step => step.workflowId === workflowId)
    
    // If steps don't have order, assign based on their current array position
    const stepsWithOrder = steps.map((step, index) => ({
      ...step,
      order: step.order ?? index + 1
    }))
    
    return stepsWithOrder.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  const getWorkflowById = (workflowId: string) => {
    return data.workflows.find(w => w.id === workflowId)
  }

  const reorderSteps = async (workflowId: string, newStepOrder: {id: string, order: number}[]) => {
    try {
      const response = await fetch('/api/data/steps/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflowId,
          stepOrder: newStepOrder
        })
      })
      
      if (response.ok) {
        // Refresh data after reordering
        await fetchData()
      }
    } catch (error) {
      console.error('Error reordering steps:', error)
    }
  }

  const insertStepAt = async (workflowId: string, position: number, newStep: Partial<WorkflowStep>) => {
    try {
      // Get current steps for the workflow
      const currentSteps = getStepsForWorkflow(workflowId)
      
      // Create the new step with a temporary ID
      const stepToInsert: WorkflowStep = {
        id: `temp-${Date.now()}`,
        workflowId,
        order: position + 1,
        actor: newStep.actor || 'New Actor',
        action: newStep.action || 'New Action',
        resource: newStep.resource || 'New Resource',
        status: newStep.status || 'draft',
        description: newStep.description
      }
      
      // Update orders for existing steps that need to shift down
      const updatedSteps = currentSteps.map(step => {
        if ((step.order || 0) > position) {
          return { ...step, order: (step.order || 0) + 1 }
        }
        return step
      })
      
      // Optimistically update local state
      const allSteps = [...data.steps]
      
      // Remove old steps for this workflow
      const otherSteps = allSteps.filter(step => step.workflowId !== workflowId)
      
      // Add updated steps and new step
      const newStepsData = [...otherSteps, ...updatedSteps, stepToInsert]
      
      setData(prev => ({
        ...prev,
        steps: newStepsData
      }))
      
      // Make API call to persist the change
      const response = await fetch('/api/data/steps/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflowId,
          position,
          step: stepToInsert
        })
      })
      
      if (response.ok) {
        // Refresh data to get the real ID from the server
        await fetchData()
      } else {
        // Revert optimistic update on failure
        setData(prev => ({
          ...prev,
          steps: allSteps
        }))
        throw new Error('Failed to insert step')
      }
    } catch (error) {
      console.error('Error inserting step:', error)
      throw error
    }
  }

  return {
    data,
    loading,
    error,
    refreshData,
    getStepsForWorkflow,
    getWorkflowById,
    reorderSteps,
    insertStepAt
  }
}