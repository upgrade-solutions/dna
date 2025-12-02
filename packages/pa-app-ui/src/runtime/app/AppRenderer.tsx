import { useState } from 'react'
import type { AppConfig } from '@/schemas'
import { ModuleRenderer } from '../module/ModuleRenderer'

interface AppRendererProps {
  config: AppConfig
}

export function AppRenderer({ config }: AppRendererProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const currentModule = config.modules[currentModuleIndex]
  
  return (
    <div className="app-container" data-theme={config.theme}>
      <aside className="app-sidebar">
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
      <main className="app-main">
        {currentModule && <ModuleRenderer config={currentModule} />}
      </main>
    </div>
  )
}
