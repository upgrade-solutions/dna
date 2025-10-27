// Data utilities for DNA Studio
import configData from "../app/api/data/config.json"

// Import all organization data from the barrel export
import { 
  audiobookDistributionData,
  financialServicesDivisionData, 
  perfectedClaimsData 
} from "../app/api/data/organizations"

// Types
export type ProjectStatus = "Discover" | "Design" | "Develop" | "Deliver"
export type WorkflowStatus = "Active" | "Planned" | "Deprecated" | "In Review"
export type VersionStatus = "Active" | "In Review" | "Planned" | "Deprecated" | "Draft"

export interface Organization {
  id: string
  name: string
  description: string
}

export interface Step {
  id: string
  actor: string
  action: string
  resource: string
  status?: WorkflowStatus
  versionHistory?: VersionHistory[]
  workflowId: string
  order: number
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: Step[]
  status: WorkflowStatus
  versionHistory?: VersionHistory[]
  productId: string
}

export interface VersionHistory {
  version: string
  status: VersionStatus
  releaseDate?: string
  description: string
  changes?: string[]
}

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  workflows: string[] // workflow IDs this project touches
  version?: string
  versionHistory?: VersionHistory[]
  workflowIds: string[]
  productId: string
}

export interface Product {
  id: string
  name: string
  description: string
  projectCount: number
  workflowCount: number
  status: "Active" | "Planning" | "Archived"
  version?: string
  versionHistory?: VersionHistory[]
  workflows: Workflow[]
  projects: Project[]
  organizationId: string
}

export interface OrganizationData {
  organization: Organization
  products: (Omit<Product, 'workflows' | 'projects'> & { organizationId: string })[]
  workflows: (Omit<Workflow, 'steps'> & { productId: string })[]
  steps: (Step & { workflowId: string, order: number })[]
  projects: (Omit<Project, 'workflows'> & { workflowIds: string[], productId: string })[]
  resourceSchemas: Record<string, any>
}

// Organization data mapping
const organizationDataMap: Record<string, OrganizationData> = {
  'org1': financialServicesDivisionData as OrganizationData,
  'org2': audiobookDistributionData as OrganizationData,
  'org3': perfectedClaimsData as OrganizationData
}

// Data access functions
export const getOrganizations = (): Organization[] => {
  return configData.organizations as Organization[]
}

export const getProducts = (): Product[] => {
  const allProducts: Product[] = []
  
  Object.values(organizationDataMap).forEach((orgData) => {
    orgData.products.forEach((product) => {
      // Find workflows for this product
      const productWorkflows = orgData.workflows
        .filter((wf) => wf.productId === product.id)
        .map((workflow) => ({
          ...workflow,
          steps: orgData.steps.filter((step) => step.workflowId === workflow.id)
        }))
      
      // Find projects for this product
      const productProjects = orgData.projects
        .filter((proj) => proj.productId === product.id)
        .map((project) => ({
          ...project,
          workflows: project.workflowIds
        }))
      
      allProducts.push({
        ...product,
        workflows: productWorkflows,
        projects: productProjects
      })
    })
  })
  
  return allProducts
}

export const getStatusColors = () => {
  return {
    projectStatus: configData.statusColors.projectStatus as Record<ProjectStatus, string>,
    productStatus: configData.statusColors.productStatus as Record<string, string>,
    workflowStatus: configData.statusColors.workflowStatus as Record<WorkflowStatus, string>
  }
}

export const getFormSchemas = () => {
  const allSchemas: Record<string, any> = {}
  
  Object.values(organizationDataMap).forEach((orgData) => {
    Object.assign(allSchemas, orgData.resourceSchemas)
  })
  
  return allSchemas
}

// Helper functions
export const getProductsByOrganization = (organizationId: string): Product[] => {
  return getProducts().filter(product => product.organizationId === organizationId)
}

export const getOrganizationData = (organizationId: string): OrganizationData | null => {
  return organizationDataMap[organizationId] || null
}

export const getWorkflowById = (productId: string, workflowId: string): Workflow | null => {
  const product = getProducts().find(p => p.id === productId)
  if (!product) return null
  return product.workflows.find(w => w.id === workflowId) || null
}

export const getStepById = (productId: string, workflowId: string, stepId: string): Step | null => {
  const workflow = getWorkflowById(productId, workflowId)
  if (!workflow) return null
  return workflow.steps.find(s => s.id === stepId) || null
}

// Version helper functions
export const getCurrentVersion = (versionHistory?: VersionHistory[]): VersionHistory | null => {
  if (!versionHistory || versionHistory.length === 0) return null
  return versionHistory.find(v => v.status === 'Active') || null
}

export const getLatestVersion = (versionHistory?: VersionHistory[]): VersionHistory | null => {
  if (!versionHistory || versionHistory.length === 0) return null
  // Sort by semantic version and return the latest
  const sorted = [...versionHistory].sort((a, b) => {
    const aVersion = a.version.split('.').map(Number)
    const bVersion = b.version.split('.').map(Number)
    
    for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
      const aPart = aVersion[i] || 0
      const bPart = bVersion[i] || 0
      if (aPart !== bPart) return bPart - aPart
    }
    return 0
  })
  return sorted[0] || null
}

export const getVersionStatusColor = (status: VersionStatus): string => {
  switch (status) {
    case 'Active':
      return 'bg-green-500/10 text-green-400 border-green-500/30'
    case 'In Review':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'Planned':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    case 'Draft':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    case 'Deprecated':
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  }
}

export const getProposedVersion = (versionHistory?: VersionHistory[]): VersionHistory | null => {
  if (!versionHistory || versionHistory.length === 0) return null
  return versionHistory.find(v => v.status === 'In Review' || v.status === 'Planned') || null
}

export const getVersionsByStatus = (versionHistory?: VersionHistory[], status?: VersionStatus): VersionHistory[] => {
  if (!versionHistory || versionHistory.length === 0) return []
  if (!status) return versionHistory
  return versionHistory.filter(v => v.status === status)
}