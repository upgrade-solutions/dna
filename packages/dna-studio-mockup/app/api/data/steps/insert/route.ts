import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { workflowId, position, step } = await request.json()
    
    // Read current steps data
    const stepsFilePath = path.join(process.cwd(), 'app/api/data/steps.json')
    const stepsData = JSON.parse(fs.readFileSync(stepsFilePath, 'utf8'))
    
    // Generate a proper ID for the new step
    const newStep = {
      ...step,
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      order: position + 1
    }
    
    // Update orders for existing steps in the same workflow that need to shift down
    const updatedSteps = stepsData.map((existingStep: any) => {
      if (existingStep.workflowId === workflowId && (existingStep.order || 0) > position) {
        return { ...existingStep, order: (existingStep.order || 0) + 1 }
      }
      return existingStep
    })
    
    // Add the new step
    updatedSteps.push(newStep)
    
    // Write back to file
    fs.writeFileSync(stepsFilePath, JSON.stringify(updatedSteps, null, 2))
    
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