import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { GraphCanvas, LeftSidebar, RightSidebar } from './components'
import { perfectedClaimsTenant } from './data'
import { GraphModel } from './models'
import './App.css'

const App = observer(function App() {
  const tenant = perfectedClaimsTenant
  
  // Create MobX model instance (memoized to persist across renders)
  const graphModel = useMemo(() => new GraphModel(), [])
  
  const handleResourceClick = (resourceId: string) => {
    graphModel.zoomToResource(resourceId)
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* <Header 
        tenant={tenant} 
        onTenantChange={setTenant}
        tenantOptions={[dnaPlatformTenant, perfectedClaimsTenant]}
      /> */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar 
          resources={tenant.data.resources} 
          onResourceClick={handleResourceClick}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <GraphCanvas 
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
