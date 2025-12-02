import type { BlockConfig } from '@/schemas'
import BlockRegistry from '@/blocks'
import styles from './BlockRenderer.module.css'

interface BlockRendererProps {
  config: BlockConfig
  data?: Record<string, unknown>
}

export function BlockRenderer({ config, data }: BlockRendererProps) {
  const Component = BlockRegistry.get(config.type)
  
  if (!Component) {
    console.error(`Unknown block type: ${config.type}`)
    return (
      <div className={styles['block-error']}>
        <span>Unknown block type: {config.type}</span>
      </div>
    )
  }
  
  // Inject graph data if this is a graph-canvas
  const props = config.type === 'graph-canvas' && data?.['graph-data']
    ? { ...config.props, data: data['graph-data'] }
    : config.props
  
  return <Component {...props} />
}
