import { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { GraphCanvas, LeftSidebar, RightSidebar, Header } from './components'
import { dnaPlatformTenant, perfectedClaimsTenant, inAudioTenant } from './data'
import { GraphModel } from './models'
import './App.css'

const App = observer(function App() {
  const [tenant, setTenant] = useState(perfectedClaimsTenant)
  
  // Create MobX model instance (memoized to persist across renders)
  const graphModel = useMemo(() => new GraphModel(), [])
  
  const handleResourceClick = (resourceId: string) => {
    graphModel.zoomToResource(resourceId)
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header 
        tenant={tenant} 
        onTenantChange={setTenant}
        tenantOptions={[dnaPlatformTenant, perfectedClaimsTenant, inAudioTenant]}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar 
          resources={tenant.data.resources} 
          onResourceClick={handleResourceClick}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <GraphCanvas 
            key={tenant.id}
            model={graphModel}
            tenantConfig={tenant}
          />
        </div>
        <RightSidebar cellView={graphModel.selectedCellView} />
      </div>
    </div>
  )
})

export default App
