import type { PageConfig } from '@/schemas'
import { SectionRenderer } from '../section/SectionRenderer'

interface PageRendererProps {
  config: PageConfig
}

export function PageRenderer({ config }: PageRendererProps) {
  return (
    <div className="page-container" data-page-id={config.id}>
      <header className="page-header">
        <h1>{config.title}</h1>
      </header>
      <main className="page-content">
        {config.sections.map((section) => (
          <SectionRenderer key={section.id} config={section} />
        ))}
      </main>
    </div>
  )
}
