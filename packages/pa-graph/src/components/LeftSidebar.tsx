interface LeftSidebarProps {
  width?: number
}

export function LeftSidebar({ width = 280 }: LeftSidebarProps) {
  return (
    <div
      style={{
        width,
        minWidth: width,
        height: '100%',
        backgroundColor: '#1e1e1e',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#fff' }}>
          Navigation
        </h3>
        
        {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarItem label="Dashboard" />
          <SidebarItem label="Tenants" />
          <SidebarItem label="Products" />
          <SidebarItem label="Workflows" />
          <SidebarItem label="Resources" />
          <SidebarItem label="Settings" />
        </div> */}
      </div>
    </div>
  )
}

function SidebarItem({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        backgroundColor: '#2a2a2a',
        borderRadius: '6px',
        color: '#ccc',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#333'
        e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#2a2a2a'
        e.currentTarget.style.color = '#ccc'
      }}
    >
      {label}
    </div>
  )
}
