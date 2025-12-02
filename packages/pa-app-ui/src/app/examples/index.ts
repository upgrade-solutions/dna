import type { AppConfig } from '@/schemas'
import graphEditor from './example-graph-editor.json'
import dashboard from './example-dashboard.json'
import form from './example-form.json'
import splitView from './example-split-view.json'
import table from './example-table.json'
import settings from './example-settings.json'
import resourceData from '../data/resources.json'
import graphLayout from '../data/graph-layout.json'
import { transformToGraphData } from '@/lib/graph-transform'

// Transform pure resource data into graph visualization data
const graphData = transformToGraphData(resourceData, graphLayout)

export interface ExampleLayout {
  id: string
  name: string
  description: string
  icon: string
  config: AppConfig
}

// Export graph data separately
export { graphData }

export const examples: ExampleLayout[] = [
  {
    id: 'graph-editor',
    name: 'Graph Editor',
    description: 'Interactive node-based graph editor with canvas',
    icon: '🕸️',
    config: graphEditor as AppConfig
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Metrics and overview cards in a grid layout',
    icon: '📊',
    config: dashboard as AppConfig
  },
  {
    id: 'form',
    name: 'Form Layout',
    description: 'Multi-section form with validation',
    icon: '📝',
    config: form as AppConfig
  },
  {
    id: 'split-view',
    name: 'Split View',
    description: 'Three-panel editor with preview and console',
    icon: '⚡',
    config: splitView as AppConfig
  },
  {
    id: 'table',
    name: 'Data Table',
    description: 'Sortable table with filters and pagination',
    icon: '📋',
    config: table as AppConfig
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Sidebar navigation with tabbed settings',
    icon: '⚙️',
    config: settings as AppConfig
  }
]

export function getExampleById(id: string): ExampleLayout | undefined {
  return examples.find(example => example.id === id)
}
