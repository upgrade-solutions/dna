import type { SectionConfig } from '@/schemas'
import { BlockRenderer } from '../block/BlockRenderer'
import styles from './SectionRenderer.module.css'

interface SectionRendererProps {
  config: SectionConfig
  data?: Record<string, unknown>
}

export function SectionRenderer({ config, data }: SectionRendererProps) {
  const layoutClass = `${styles.section} ${styles[`section-layout-${config.layout}`]}`
  
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
        <BlockRenderer key={block.id} config={block} data={data} />
      ))}
    </section>
  )
}
