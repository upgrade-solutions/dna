import type { PageConfig } from '@/schemas'
import { SectionRenderer } from '../section/SectionRenderer'
import styles from './PageRenderer.module.css'

interface PageRendererProps {
  config: PageConfig
  data?: Record<string, unknown>
}

export function PageRenderer({ config, data }: PageRendererProps) {
  const showHeader = config.showHeader ?? true
  
  return (
    <div className={styles['page-container']} data-page-id={config.id}>
      {showHeader && (
        <header className={styles['page-header']}>
          <h1>{config.title}</h1>
        </header>
      )}
      <main className={styles['page-content']}>
        {config.sections.map((section) => (
          <SectionRenderer key={section.id} config={section} data={data} />
        ))}
      </main>
    </div>
  )
}
