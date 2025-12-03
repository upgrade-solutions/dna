import { dia } from '@joint/plus'
import type { TenantConfig } from '../../../data/tenant-config'

export interface GraphCanvasProps {
  width?: number | string
  height?: number | string
  tenantConfig?: TenantConfig
  onCellViewSelected?: (cellView: dia.CellView | null) => void
}

export interface GraphInstance {
  graph: dia.Graph
  paper: dia.Paper
}

export interface NodeData {
  id: string
  type: string
  label: string
  position: { x: number; y: number }
  metadata?: Record<string, unknown>
}

export interface EdgeData {
  id: string
  type: string
  source: string
  target: string
  label?: string
  metadata?: Record<string, unknown>
}

export interface GraphData {
  nodes: NodeData[]
  edges: EdgeData[]
}
