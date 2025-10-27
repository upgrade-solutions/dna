import { NextResponse } from 'next/server'
import { getAllSteps, getAllWorkflows } from '../shared/data-loader'

// Import the shared business model data from the conversation API
// In a real app, this would be in a shared module or database
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

// Initialize business model data from organization files
async function initializeBusinessModelData() {
  if (global.businessModelData) return global.businessModelData
  
  try {
    const workflows = await getAllWorkflows()
    const steps = await getAllSteps()
    
    global.businessModelData = {
      workflows,
      steps,
      actors: [],
      resources: [],
      actions: [],
      changes: []
    }
    
    return global.businessModelData
  } catch (error) {
    console.error('Error initializing business model data:', error)
    global.businessModelData = {
      workflows: [],
      steps: [],
      actors: [],
      resources: [],
      actions: [],
      changes: []
    }
    return global.businessModelData
  }
}

export async function GET() {
  try {
    await initializeBusinessModelData()
    
    console.log('[Steps API] Returning steps:', {
      count: global.businessModelData?.steps?.length || 0,
      stepIds: global.businessModelData?.steps?.map((s: any) => s.id) || [],
      lastStep: global.businessModelData?.steps?.[global.businessModelData.steps.length - 1]
    })
    
    return NextResponse.json(global.businessModelData?.steps || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error reading steps data:', error)
    return NextResponse.json({ error: 'Failed to load steps data' }, { status: 500 })
  }
}