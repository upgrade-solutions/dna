import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

// Initialize business model data from files on first request
async function initializeBusinessModelData() {
  if (global.businessModelData) return global.businessModelData
  
  try {
    const workflowsPath = path.join(process.cwd(), 'app/api/data/workflows.json')
    const stepsPath = path.join(process.cwd(), 'app/api/data/steps.json')
    
    const [workflowsData, stepsData] = await Promise.all([
      fs.promises.readFile(workflowsPath, 'utf8'),
      fs.promises.readFile(stepsPath, 'utf8')
    ])
    
    global.businessModelData = {
      workflows: JSON.parse(workflowsData),
      steps: JSON.parse(stepsData),
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