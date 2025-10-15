// Data utilities for DNA Studio
import organizationsData from "../app/api/data/organizations.json"
import productsData from "../app/api/data/products.json"
import workflowsData from "../app/api/data/workflows.json"
import stepsData from "../app/api/data/steps.json"
import projectsData from "../app/api/data/projects.json"
import formSchemasData from "../app/api/data/form-schemas.json"
import statusColorsData from "../app/api/data/status-colors.json"

// Types
export type ProjectStatus = "Discover" | "Design" | "Develop" | "Deliver"
export type WorkflowStatus = "Active" | "Planned" | "Deprecated" | "In Review"

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
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: Step[]
  status: WorkflowStatus
}

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  workflows: string[] // workflow IDs this project touches
}

export interface Product {
  id: string
  name: string
  description: string
  projectCount: number
  workflowCount: number
  status: "Active" | "Planning" | "Archived"
  workflows: Workflow[]
  projects: Project[]
  organizationId: string
}

// Data access functions
export const getOrganizations = (): Organization[] => {
  return organizationsData as Organization[]
}

export const getProducts = (): Product[] => {
  return (productsData as any[]).map((product) => {
    // Find workflows for this product
    const productWorkflows = (workflowsData as any[])
      .filter((wf) => wf.productId === product.id)
      .map((workflow) => ({
        ...workflow,
        steps: (stepsData as any[]).filter((step) => step.workflowId === workflow.id)
      }))
    
    // Find projects for this product
    const productProjects = (projectsData as any[])
      .filter((proj) => proj.productId === product.id)
      .map((project) => ({
        ...project,
        workflows: project.workflowIds
      }))
    
    return {
      ...product,
      workflows: productWorkflows,
      projects: productProjects
    }
  })
}

export const getStatusColors = () => {
  return {
    projectStatus: statusColorsData.statusColors.projectStatus as Record<ProjectStatus, string>,
    productStatus: statusColorsData.statusColors.productStatus as Record<string, string>,
    workflowStatus: statusColorsData.statusColors.workflowStatus as Record<WorkflowStatus, string>
  }
}

export const getFormSchemas = () => {
  return formSchemasData.resourceTypes
}

// Helper functions
export const getProductsByOrganization = (organizationId: string): Product[] => {
  return getProducts().filter(product => product.organizationId === organizationId)
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