import { useState } from 'react'
import type { ModuleConfig } from '@/schemas'
import { PageRenderer } from '../page/PageRenderer'

interface ModuleRendererProps {
  config: ModuleConfig
}

export function ModuleRenderer({ config }: ModuleRendererProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const currentPage = config.pages[currentPageIndex]
  
  return (
    <div className="module-container" data-module-id={config.id}>
      <nav className="module-navigation">
        <h2>{config.name}</h2>
        <ul>
          {config.pages.map((page, index) => (
            <li key={page.id}>
              <button
                onClick={() => setCurrentPageIndex(index)}
                className={currentPageIndex === index ? 'active' : ''}
              >
                {page.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {currentPage && <PageRenderer config={currentPage} />}
    </div>
  )
}
