import { useState } from 'react'
import type { AppConfig } from '@/schemas'
import { ModuleRenderer } from '../module/ModuleRenderer'
import styles from './AppRenderer.module.css'

interface AppRendererProps {
  config: AppConfig
  data?: Record<string, unknown>
}

export function AppRenderer({ config, data }: AppRendererProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const currentModule = config.modules[currentModuleIndex]
  const showSidebar = config.showModuleSidebar ?? true
  
  return (
    <div className={styles['app-container']} data-theme={config.theme}>
      {showSidebar && (
        <aside className={styles['app-sidebar']}>
          <h1>{config.name}</h1>
          <nav>
            {config.modules.map((module, index) => (
              <button
                key={module.id}
                onClick={() => setCurrentModuleIndex(index)}
                className={currentModuleIndex === index ? 'active' : ''}
              >
                {module.icon && <span className={`icon-${module.icon}`} />}
                {module.name}
              </button>
            ))}
          </nav>
        </aside>
      )}
      <main className={styles['app-main']}>
        {currentModule && <ModuleRenderer config={currentModule} data={data} />}
      </main>
    </div>
  )
}
