import { NextRequest, NextResponse } from 'next/server'

// Use the same global business model data as other endpoints
declare global {
  var businessModelData: {
    workflows: any[]
    steps: any[]
    actors: any[]
    resources: any[]
    actions: any[]
    changes: any[]
  } | null
}

export async function POST(request: NextRequest) {
  try {
    const { workflowId, stepOrder } = await request.json()

    if (!workflowId || !stepOrder || !Array.isArray(stepOrder)) {
      return NextResponse.json(
        { error: 'workflowId and stepOrder array are required' },
        { status: 400 }
      )
    }

    if (!global.businessModelData) {
      return NextResponse.json(
        { error: 'Business model data not initialized' },
        { status: 500 }
      )
    }

    // Update the order of steps for the specified workflow
    stepOrder.forEach(({ id, order }) => {
      const stepIndex = global.businessModelData!.steps.findIndex(step => step.id === id)
      if (stepIndex >= 0) {
        global.businessModelData!.steps[stepIndex].order = order
      }
    })

    console.log(`Reordered ${stepOrder.length} steps for workflow ${workflowId}`)

    return NextResponse.json({ 
      success: true, 
      message: `Reordered ${stepOrder.length} steps`,
      workflowId,
      stepOrder
    })

  } catch (error) {
    console.error('Error reordering steps:', error)
    return NextResponse.json(
      { error: 'Failed to reorder steps' },
      { status: 500 }
    )
  }
}