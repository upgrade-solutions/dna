import { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { GraphCanvas, LeftSidebar, RightSidebar, Header } from './components'
import { dnaPlatformTenant, perfectedClaimsTenant, inAudioTenant, type TenantConfig } from './data'
import { getAccountTheme } from './data/themes/brand-mapper'
import { GraphModel } from './models'
import './App.css'

const App = observer(function App() {
  const [tenantId, setTenantId] = useState<string>('dna-platform')
  const [isDarkMode, setIsDarkMode] = useState(true)
  
  // Create MobX model instance (memoized to persist across renders)
  const graphModel = useMemo(() => new GraphModel(), [])
  
  // Get the base tenant config
  const baseTenants = {
    'dna-platform': dnaPlatformTenant,
    'perfected-claims': perfectedClaimsTenant,
    'inaudio': inAudioTenant,
  }
  
  const baseTenant = baseTenants[tenantId as keyof typeof baseTenants]
  
  // Apply the theme based on dark/light mode preference with account brand colors
  const tenant: TenantConfig = {
    ...baseTenant,
    theme: getAccountTheme(tenantId, isDarkMode)
  }
  
  const handleResourceClick = (resourceId: string) => {
    graphModel.zoomToResource(resourceId)
  }
  
  const handleTenantChange = (newTenant: TenantConfig) => {
    setTenantId(newTenant.id)
  }
  
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header 
        tenant={tenant} 
        onTenantChange={handleTenantChange}
        tenantOptions={[dnaPlatformTenant, perfectedClaimsTenant, inAudioTenant]}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar 
          resources={tenant.data.resources} 
          onResourceClick={handleResourceClick}
          theme={tenant.theme}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <GraphCanvas 
            key={tenant.id}
            model={graphModel}
            tenantConfig={tenant}
          />
        </div>
        <RightSidebar 
          cellView={graphModel.selectedCellView} 
          theme={tenant.theme}
        />
      </div>
    </div>
  )
})

export default App
