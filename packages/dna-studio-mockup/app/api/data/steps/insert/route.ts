import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { workflowId, position, step } = await request.json()
    
    // Ensure global data is initialized
    if (!global.businessModelData?.steps) {
      return NextResponse.json(
        { error: 'Global business model data not initialized' },
        { status: 500 }
      )
    }
    
    // Generate a proper ID for the new step
    const newStep = {
      ...step,
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      order: position + 1,
      status: 'Draft'
    }
    
    // Update orders for existing steps in the same workflow that need to shift down
    global.businessModelData.steps = global.businessModelData.steps.map((existingStep: any) => {
      if (existingStep.workflowId === workflowId && (existingStep.order || 0) > position) {
        return { ...existingStep, order: (existingStep.order || 0) + 1 }
      }
      return existingStep
    })
    
    // Add the new step to global memory
    global.businessModelData.steps.push(newStep)
    
    console.log('[Insert API] Step inserted into global memory:', newStep.id)
    console.log('[Insert API] Total steps now:', global.businessModelData.steps.length)
    
    return NextResponse.json({ 
      success: true, 
      step: newStep,
      message: 'Step inserted successfully' 
    })
  } catch (error) {
    console.error('Error inserting step:', error)
    return NextResponse.json(
      { error: 'Failed to insert step' },
      { status: 500 }
    )
  }
}