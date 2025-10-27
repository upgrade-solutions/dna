// Shared utility for loading organization-based data in API routes
import fs from 'fs'
import path from 'path'

export interface OrganizationData {
  organization: {
    id: string
    name: string
    description: string
  }
  products: any[]
  workflows: any[]
  steps: any[]
  projects: any[]
  resourceSchemas: Record<string, any>
}

// Global data cache
declare global {
  var organizationDataCache: {
    [orgId: string]: OrganizationData
  } | null
  var allWorkflows: any[] | null
  var allSteps: any[] | null
}

// Load all organization data and cache it
export async function initializeOrganizationData() {
  if (global.organizationDataCache) {
    return global.organizationDataCache
  }
  
  try {
    const configPath = path.join(process.cwd(), 'app/api/data/config.json')
    const configData = JSON.parse(await fs.promises.readFile(configPath, 'utf8'))
    
    const organizationDataCache: { [orgId: string]: OrganizationData } = {}
    
    // Load each organization's data
    for (const org of configData.organizations) {
      const orgFilePath = path.join(process.cwd(), 'app/api/data/organizations', org.dataFile)
      const orgData = JSON.parse(await fs.promises.readFile(orgFilePath, 'utf8'))
      organizationDataCache[org.id] = orgData
    }
    
    global.organizationDataCache = organizationDataCache
    
    // Build combined workflows and steps arrays for backward compatibility
    global.allWorkflows = []
    global.allSteps = []
    
    Object.values(organizationDataCache).forEach(orgData => {
      global.allWorkflows!.push(...orgData.workflows)
      global.allSteps!.push(...orgData.steps)
    })
    
    return organizationDataCache
  } catch (error) {
    console.error('Error initializing organization data:', error)
    global.organizationDataCache = {}
    global.allWorkflows = []
    global.allSteps = []
    return {}
  }
}

export async function getAllWorkflows() {
  if (!global.allWorkflows) {
    await initializeOrganizationData()
  }
  return global.allWorkflows || []
}

export async function getAllSteps() {
  if (!global.allSteps) {
    await initializeOrganizationData()
  }
  return global.allSteps || []
}

export async function getOrganizationData(orgId: string): Promise<OrganizationData | null> {
  if (!global.organizationDataCache) {
    await initializeOrganizationData()
  }
  return global.organizationDataCache?.[orgId] || null
}