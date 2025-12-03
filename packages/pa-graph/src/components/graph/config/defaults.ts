/**
 * Default configuration for graph canvas
 */

export const ZOOM_MIN = 0.2
export const ZOOM_MAX = 3
export const ZOOM_STEP = 0.2
export const PADDING = 50

export const DEFAULT_PAPER_CONFIG = {
  gridSize: 10,
  drawGrid: true,
  background: {
    color: '#1a1a2e'
  },
  interactive: true,
  defaultLink: {
    attrs: {
      '.connection': { stroke: '#4a5568' },
      '.marker-target': { fill: '#4a5568', d: 'M 10 0 L 0 5 L 10 10 z' }
    }
  }
}

export const DEFAULT_GRAPH_CONFIG = {
  async: true,
  frozen: false
}
