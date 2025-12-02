import { useState } from 'react'
import type { ModuleConfig } from '@/schemas'
import { PageRenderer } from '../page/PageRenderer'
import styles from './ModuleRenderer.module.css'

interface ModuleRendererProps {
  config: ModuleConfig
  data?: Record<string, unknown>
}

export function ModuleRenderer({ config, data }: ModuleRendererProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const currentPage = config.pages[currentPageIndex]
  const showNavigation = config.showNavigation ?? true
  
  return (
    <div className={styles['module-container']} data-module-id={config.id}>
      {showNavigation && (
        <nav className={styles['module-navigation']}>
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
      )}
      {currentPage && <PageRenderer config={currentPage} data={data} />}
    </div>
  )
}
