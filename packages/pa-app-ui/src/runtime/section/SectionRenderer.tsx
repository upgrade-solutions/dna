import type { SectionConfig } from '@/schemas'
import { BlockRenderer } from '../block/BlockRenderer'

interface SectionRendererProps {
  config: SectionConfig
}

export function SectionRenderer({ config }: SectionRendererProps) {
  const layoutClass = `section-layout-${config.layout}`
  
  return (
    <section
      id={config.id}
      className={layoutClass}
      style={{
        width: config.width,
        height: config.height,
      }}
    >
      {config.blocks.map((block) => (
        <BlockRenderer key={block.id} config={block} />
      ))}
    </section>
  )
}
