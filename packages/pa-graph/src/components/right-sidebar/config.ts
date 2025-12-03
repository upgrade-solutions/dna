import { ui } from '@joint/plus'

/**
 * Inspector Configuration Groups
 */

export const dnaMetadataGroups = {
  dna: { label: 'Schema', index: 1, closed: false },
  data: { label: 'Data', index: 2, closed: true }
}

export const nodePropertiesGroups = {
  basic: { label: 'Basic Properties', index: 1, closed: false },
  style: { label: 'Style', index: 2, closed: false },
  advanced: { label: 'Advanced', index: 3, closed: true }
}

/**
 * DNA Field Options
 */

export const dnaNodeTypeOptions = [
  { value: '', content: '' },
  { value: 'task', content: 'Task' },
  { value: 'resource', content: 'Resource' },
  { value: 'actor', content: 'Actor' },
  { value: 'workflow', content: 'Workflow' },
  { value: 'action', content: 'Action' },
  { value: 'metric', content: 'Metric' }
]

export const dnaResourceTypeOptions = [
  { value: 'web-application', content: 'Web Application' },
  { value: 'api', content: 'API' },
  { value: 'database', content: 'Database' },
  { value: 'service', content: 'Service' },
  { value: 'file', content: 'File' },
  { value: 'queue', content: 'Queue' },
  { value: 'cache', content: 'Cache' },
  { value: 'storage', content: 'Storage' },
  { value: 'other', content: 'Other' }
]

export const dnaPriorityOptions = [
  { value: '', content: '' },
  { value: 'low', content: 'Low Priority' },
  { value: 'medium', content: 'Medium Priority' },
  { value: 'high', content: 'High Priority' },
  { value: 'critical', content: 'Critical' }
]

export const dnaLanguageOptions = [
  { value: '', content: '' },
  { value: 'typescript', content: 'TypeScript' },
  { value: 'javascript', content: 'JavaScript' },
  { value: 'python', content: 'Python' },
  { value: 'go', content: 'Go' },
  { value: 'rust', content: 'Rust' },
  { value: 'java', content: 'Java' },
  { value: 'csharp', content: 'C#' },
  { value: 'php', content: 'PHP' },
  { value: 'ruby', content: 'Ruby' },
  { value: 'other', content: 'Other' }
]

export const dnaRuntimeOptions = [
  { value: '', content: '' },
  { value: 'deno', content: 'Deno' },
  { value: 'nodejs', content: 'Node.js' },
  { value: 'bun', content: 'Bun' },
  { value: 'python', content: 'Python' },
  { value: 'go', content: 'Go' },
  { value: 'docker', content: 'Docker' },
  { value: 'kubernetes', content: 'Kubernetes' },
  { value: 'postgresql', content: 'PostgreSQL' },
  { value: 'mysql', content: 'MySQL' },
  { value: 'mongodb', content: 'MongoDB' },
  { value: 'redis', content: 'Redis' },
  { value: 'rabbitmq', content: 'RabbitMQ' },
  { value: 'kafka', content: 'Kafka' },
  { value: 'other', content: 'Other' }
]

/**
 * DNA Metadata Inputs
 */

export const dnaMetadataInputs = {
  'attrs/label/text': {
    type: 'text',
    label: 'Name',
    group: 'dna',
    index: 1
  },
  'dna/resourceType': {
    type: 'select',
    label: 'Resource Type',
    group: 'dna',
    index: 2,
    options: dnaResourceTypeOptions
  },
  'dna/language': {
    type: 'select',
    label: 'Language',
    group: 'dna',
    index: 3,
    options: dnaLanguageOptions
  },
  'dna/runtime': {
    type: 'select',
    label: 'Runtime',
    group: 'dna',
    index: 4,
    options: dnaRuntimeOptions
  },
  'dna/type': {
    type: 'select',
    label: 'Node Type',
    group: 'dna',
    index: 5,
    options: dnaNodeTypeOptions
  },
  'dna/description': {
    type: 'textarea',
    label: 'Description',
    group: 'dna',
    index: 6,
    attrs: { textarea: { rows: 4, placeholder: 'Enter description...' } }
  },
  'dna/priority': {
    type: 'select',
    label: 'Priority',
    group: 'dna',
    index: 7,
    options: dnaPriorityOptions
  },
  'dna/tags': {
    type: 'list',
    label: 'Tags',
    group: 'dna',
    index: 8,
    item: { type: 'text', placeholder: 'Add tag...' },
    addButtonLabel: '+ Add Tag',
    removeButtonLabel: '×'
  },
  'dna/assignee': {
    type: 'text',
    label: 'Assignee',
    group: 'dna',
    index: 9,
    placeholder: 'Assign to...'
  },
  'dna/status': {
    type: 'select',
    label: 'Status',
    group: 'dna',
    index: 10,
    options: [
      { value: 'draft', content: 'Draft' },
      { value: 'active', content: 'Active' },
      { value: 'completed', content: 'Completed' },
      { value: 'archived', content: 'Archived' }
    ],
    defaultValue: 'draft'
  },
  'data/id': {
    type: 'text',
    label: 'ID',
    group: 'data',
    index: 1,
    attrs: { input: { disabled: true, style: 'opacity: 0.6; cursor: not-allowed;' } }
  },
  'data/createdAt': {
    type: 'text',
    label: 'Created At',
    group: 'data',
    index: 2,
    attrs: { input: { disabled: true } }
  },
  'data/updatedAt': {
    type: 'text',
    label: 'Updated At',
    group: 'data',
    index: 3,
    attrs: { input: { disabled: true } }
  }
}

/**
 * Node Properties Inputs
 */

export const nodePropertiesInputs = {
  attrs: {
    label: {
      text: {
        type: 'content-editable',
        label: 'Label',
        group: 'basic',
        index: 1
      },
      fontSize: {
        type: 'range',
        label: 'Font Size',
        group: 'basic',
        index: 2,
        min: 8,
        max: 32,
        unit: 'px',
        defaultValue: 13
      }
    },
    body: {
      fill: {
        type: 'color',
        label: 'Fill Color',
        group: 'style',
        index: 1
      },
      stroke: {
        type: 'color',
        label: 'Stroke Color',
        group: 'style',
        index: 2
      },
      strokeWidth: {
        type: 'range',
        label: 'Stroke Width',
        group: 'style',
        index: 3,
        min: 0,
        max: 10,
        unit: 'px',
        defaultValue: 2
      },
      rx: {
        type: 'number',
        label: 'Corner Radius',
        group: 'style',
        index: 4,
        min: 0,
        max: 50,
        defaultValue: 8
      },
      opacity: {
        type: 'range',
        label: 'Opacity',
        group: 'style',
        index: 5,
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 1
      }
    }
  },
  position: {
    x: { type: 'number', label: 'X Position', group: 'basic', index: 3 },
    y: { type: 'number', label: 'Y Position', group: 'basic', index: 4 }
  },
  size: {
    width: { type: 'number', label: 'Width', group: 'basic', index: 5, min: 50, max: 500, defaultValue: 160 },
    height: { type: 'number', label: 'Height', group: 'basic', index: 6, min: 30, max: 300, defaultValue: 80 }
  },
  z: {
    type: 'number',
    label: 'Z-Index (Layer)',
    group: 'advanced',
    index: 1,
    min: 0,
    max: 999,
    defaultValue: 1
  },
  angle: {
    type: 'range',
    label: 'Rotation',
    group: 'advanced',
    index: 2,
    min: 0,
    max: 360,
    unit: '°',
    defaultValue: 0
  }
}

/**
 * Inspector Config Creators
 */

export function createNodeInspectorConfig(tab: 'dna' | 'properties'): Partial<ui.Inspector.Options> {
  const groups = tab === 'dna' ? dnaMetadataGroups : nodePropertiesGroups
  const inputs = tab === 'dna' ? dnaMetadataInputs : nodePropertiesInputs
  
  return {
    live: true,
    groups,
    inputs
  }
}

export function createLinkInspectorConfig(): Partial<ui.Inspector.Options> {
  return {
    live: true,
    groups: {
      basic: { label: 'Link Properties', index: 1, closed: false },
      style: { label: 'Style', index: 2, closed: false },
      dna: { label: 'Schema', index: 3, closed: true }
    },
    inputs: {
      labels: {
        0: {
          attrs: {
            text: {
              text: { type: 'text', label: 'Label', group: 'basic', index: 1 }
            }
          }
        }
      },
      attrs: {
        line: {
          stroke: { type: 'color', label: 'Line Color', group: 'style', index: 1 },
          strokeWidth: {
            type: 'range',
            label: 'Line Width',
            group: 'style',
            index: 2,
            min: 1,
            max: 10,
            unit: 'px',
            defaultValue: 2
          },
          strokeDasharray: {
            type: 'select',
            label: 'Line Style',
            group: 'style',
            index: 3,
            options: [
              { value: '0', content: 'Solid' },
              { value: '5,5', content: 'Dashed' },
              { value: '2,2', content: 'Dotted' },
              { value: '10,5,2,5', content: 'Dash-Dot' }
            ],
            defaultValue: '0'
          }
        }
      },
      'dna/relationType': {
        type: 'select',
        label: 'Relationship Type',
        group: 'dna',
        index: 1,
        options: [
          { value: 'requires', content: 'Requires' },
          { value: 'produces', content: 'Produces' },
          { value: 'consumes', content: 'Consumes' },
          { value: 'triggers', content: 'Triggers' },
          { value: 'blocks', content: 'Blocks' }
        ],
        defaultValue: 'requires'
      },
      'dna/description': {
        type: 'textarea',
        label: 'Description',
        group: 'dna',
        index: 2
      }
    }
  }
}

export function getInspectorConfigForCell(cell: any, tab: 'dna' | 'properties'): Partial<ui.Inspector.Options> {
  if (cell.isLink && cell.isLink()) {
    return createLinkInspectorConfig()
  }
  return createNodeInspectorConfig(tab)
}
