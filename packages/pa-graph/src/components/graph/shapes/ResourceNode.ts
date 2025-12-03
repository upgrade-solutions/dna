import { dia } from '@joint/plus'

/**
 * Custom rectangle shape for resource nodes with built-in badge support.
 * 
 * This shape extends the standard rectangle to include additional markup
 * for language and runtime badges that can be toggled via the layers system.
 * 
 * Markup structure:
 * - body: Main rectangle
 * - icon: Resource type icon (center, always visible)
 * - languageBadge: Language icon (top-right corner, layer-controlled)
 * - runtimeBadge: Runtime icon (bottom-right corner, layer-controlled)
 * - label: Resource name (top edge)
 */
export const ResourceNode = dia.Element.define('dna.ResourceNode', {
  size: { width: 160, height: 80 },
  markup: [
    {
      tagName: 'rect',
      selector: 'body'
    },
    {
      tagName: 'image',
      selector: 'icon',
      attributes: {
        'preserveAspectRatio': 'xMidYMid'
      }
    },
    {
      tagName: 'image',
      selector: 'languageBadge',
      attributes: {
        'preserveAspectRatio': 'xMidYMid'
      }
    },
    {
      tagName: 'image',
      selector: 'runtimeBadge',
      attributes: {
        'preserveAspectRatio': 'xMidYMid'
      }
    },
    {
      tagName: 'text',
      selector: 'label'
    }
  ],
  attrs: {
    body: {
      width: 'calc(w)',
      height: 'calc(h)',
      fill: '#1f2937',
      stroke: '#374151',
      strokeWidth: 1,
      rx: 8,
      ry: 8
    },
    icon: {
      // Resource type icon (center, 24x24px)
      width: 24,
      height: 24,
      x: 68, // (160 - 24) / 2
      y: 35,
      'xlink:href': ''
    },
    languageBadge: {
      // Language badge (top-right, 20x20px)
      width: 20,
      height: 20,
      x: 130, // 160 - 20 - 10 (10px from edge)
      y: 10,
      opacity: 0, // Hidden by default
      'xlink:href': ''
    },
    runtimeBadge: {
      // Runtime badge (bottom-right, 20x20px)
      width: 20,
      height: 20,
      x: 130, // 160 - 20 - 10
      y: 50, // 80 - 20 - 10
      opacity: 0, // Hidden by default
      'xlink:href': ''
    },
    label: {
      text: '',
      fill: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
      x: 80, // Center of 160px width
      y: 10,
      textAnchor: 'middle',
      textVerticalAnchor: 'top'
    }
  }
})
