import { dia } from '@joint/plus'
import { dnaPlatformTenant } from '../../../data'

export interface GraphCanvasProps {
  width?: number | string
  height?: number | string
  tenantConfig?: typeof dnaPlatformTenant
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
}

export interface EdgeData {
  id: string
  type: string
  source: string
  target: string
  label?: string
}

export interface GraphData {
  nodes: NodeData[]
  edges: EdgeData[]
}
