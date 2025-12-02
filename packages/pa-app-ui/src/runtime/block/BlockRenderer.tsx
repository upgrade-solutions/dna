import type { BlockConfig } from '@/schemas'
import BlockRegistry from '@/blocks'

interface BlockRendererProps {
  config: BlockConfig
}

export function BlockRenderer({ config }: BlockRendererProps) {
  const Component = BlockRegistry.get(config.type)
  
  if (!Component) {
    console.error(`Unknown block type: ${config.type}`)
    return (
      <div className="block-error">
        <span>Unknown block type: {config.type}</span>
      </div>
    )
  }
  
  return <Component {...config.props} />
}
