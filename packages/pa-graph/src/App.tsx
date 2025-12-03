import { useState } from 'react'
import { dia } from '@joint/plus'
import { GraphCanvas, Header, LeftSidebar, RightSidebar } from './components'
import { dnaPlatformTenant, perfectedClaimsTenant } from './data'
import './App.css'

function App() {
  const [tenant, setTenant] = useState(perfectedClaimsTenant)
  const [selectedCellView, setSelectedCellView] = useState<dia.CellView | null>(null)
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* <Header 
        tenant={tenant} 
        onTenantChange={setTenant}
        tenantOptions={[dnaPlatformTenant, perfectedClaimsTenant]}
      /> */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar resources={tenant.data.resources} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <GraphCanvas 
            tenantConfig={tenant} 
            onCellViewSelected={setSelectedCellView}
          />
        </div>
        <RightSidebar cellView={selectedCellView} />
      </div>
    </div>
  )
}

export default App
