import { dia } from '@joint/plus'

/**
 * Custom rectangle shape for resource nodes with 4-corner badge support.
 * 
 * This shape extends the standard rectangle to include additional markup
 * for category badges that can be toggled via the layers system.
 * 
 * Markup structure:
 * - body: Main rectangle
 * - icon: Resource type icon (center, always visible)
 * - topLeftBadgeCircle/topLeftBadge: Process category badge (top-left corner)
 * - topRightBadgeCircle/topRightBadge: Technology category badge (top-right corner)
 * - bottomLeftBadgeCircle/bottomLeftBadge: People category badge (bottom-left corner)
 * - bottomRightBadgeCircle/bottomRightBadge: Security category badge (bottom-right corner)
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
      tagName: 'text',
      selector: 'label'
    },
    {
      tagName: 'image',
      selector: 'icon',
      attributes: {
        'preserveAspectRatio': 'xMidYMid'
      }
    },
    // Top-left badge (Process) - rendered last for highest z-index
    {
      tagName: 'circle',
      selector: 'topLeftBadgeCircle'
    },
    {
      tagName: 'image',
      selector: 'topLeftBadge',
      attributes: {
        'preserveAspectRatio': 'xMidYMid'
      }
    },
    {
      tagName: 'text',
      selector: 'topLeftBadgeText'
    },
    // Top-right badge (Technology)
    {
      tagName: 'circle',
      selector: 'topRightBadgeCircle'
    },
    {
      tagName: 'image',
      selector: 'topRightBadge',
      attributes: {
        'preserveAspectRatio': 'xMidYMid'
      }
    },
    {
      tagName: 'text',
      selector: 'topRightBadgeText'
    },
    // Bottom-left badge (People)
    {
      tagName: 'defs',
      children: [{
        tagName: 'clipPath',
        attributes: { id: 'bottomLeftAvatarClip' },
        children: [{
          tagName: 'circle',
          attributes: { cx: 0, cy: 80, r: 14 }
        }]
      }]
    },
    {
      tagName: 'circle',
      selector: 'bottomLeftBadgeCircle'
    },
    {
      tagName: 'image',
      selector: 'bottomLeftBadge',
      attributes: {
        'preserveAspectRatio': 'xMidYMid slice',
        'clip-path': 'url(#bottomLeftAvatarClip)'
      }
    },
    {
      tagName: 'text',
      selector: 'bottomLeftBadgeText'
    },
    // Bottom-right badge (Security)
    {
      tagName: 'circle',
      selector: 'bottomRightBadgeCircle'
    },
    {
      tagName: 'image',
      selector: 'bottomRightBadge',
      attributes: {
        'preserveAspectRatio': 'xMidYMid'
      }
    },
    {
      tagName: 'text',
      selector: 'bottomRightBadgeText'
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
    // Top-left badge (Process) - circle centered at corner
    topLeftBadgeCircle: {
      r: 14, // Radius 14px = 28px diameter
      cx: 0, // Circle center at corner
      cy: 0,
      fill: '#3b82f6', // Blue theme for Process
      stroke: '#1f2937',
      strokeWidth: 2,
      opacity: 0 // Hidden by default
    },
    topLeftBadge: {
      width: 16,
      height: 16,
      x: -8, // Center icon within circle (-8 to 8)
      y: -8,
      opacity: 0, // Hidden by default
      'xlink:href': ''
    },
    topLeftBadgeText: {
      text: '',
      fill: '#ffffff',
      fontSize: 10,
      fontWeight: '700',
      x: 0,
      y: 0,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
      opacity: 0
    },
    // Top-right badge (Technology) - circle centered at corner
    topRightBadgeCircle: {
      r: 14,
      cx: 160, // Circle center at right edge
      cy: 0,
      fill: '#8b5cf6', // Purple theme for Technology
      stroke: '#1f2937',
      strokeWidth: 2,
      opacity: 0
    },
    topRightBadge: {
      width: 16,
      height: 16,
      x: 152, // 160 - 8
      y: -8,
      opacity: 0,
      'xlink:href': ''
    },
    topRightBadgeText: {
      text: '',
      fill: '#ffffff',
      fontSize: 10,
      fontWeight: '700',
      x: 160,
      y: 0,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
      opacity: 0
    },
    // Bottom-left badge (People) - circle centered at corner
    bottomLeftBadgeCircle: {
      r: 14,
      cx: 0,
      cy: 80, // Circle center at bottom edge
      fill: '#10b981', // Green theme for People
      stroke: '#1f2937',
      strokeWidth: 2,
      opacity: 0
    },
    bottomLeftBadge: {
      width: 16,
      height: 16,
      x: -8,
      y: 72, // 80 - 8
      opacity: 0,
      'xlink:href': ''
    },
    bottomLeftBadgeText: {
      text: '',
      fill: '#ffffff',
      fontSize: 10,
      fontWeight: '700',
      x: 0,
      y: 80,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
      opacity: 0
    },
    // Bottom-right badge (Security) - circle centered at corner
    bottomRightBadgeCircle: {
      r: 14,
      cx: 160, // Circle center at right edge
      cy: 80, // Circle center at bottom edge
      fill: '#ef4444', // Red theme for Security
      stroke: '#1f2937',
      strokeWidth: 2,
      opacity: 0
    },
    bottomRightBadge: {
      width: 16,
      height: 16,
      x: 152, // 160 - 8
      y: 72, // 80 - 8
      opacity: 0,
      'xlink:href': ''
    },
    bottomRightBadgeText: {
      text: '',
      fill: '#ffffff',
      fontSize: 10,
      fontWeight: '700',
      x: 160,
      y: 80,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
      opacity: 0
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
