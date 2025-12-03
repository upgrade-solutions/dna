import type { Resource } from '../../data/example-resources'

export interface LeftSidebarProps {
  width?: number
  resources?: Resource[]
  onResourceClick?: (resourceId: string) => void
}

export interface ResourceNodeProps {
  resource: Resource
  level: number
  onResourceClick?: (resourceId: string) => void
  selectedResourceId: string | null
}
