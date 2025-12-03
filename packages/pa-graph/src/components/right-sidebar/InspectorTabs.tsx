import type { Theme } from '../../types/theme'
import { getThemedColors } from '../../types/theme'

interface InspectorTabsProps {
  activeTab: 'dna' | 'properties'
  onTabChange: (tab: 'dna' | 'properties') => void
  theme: Theme
}

export function InspectorTabs({ activeTab, onTabChange, theme }: InspectorTabsProps) {
  const themed = getThemedColors(theme)
  
  return (
    <div style={{ 
      display: 'flex', 
      borderBottom: `1px solid ${themed.rightSidebar.tabBorder}`,
      backgroundColor: themed.rightSidebar.tabBackground
    }}>
      <button
        onClick={() => onTabChange('dna')}
        style={{
          flex: 1,
          padding: '12px 16px',
          border: 'none',
          background: activeTab === 'dna' ? themed.rightSidebar.tabBackgroundActive : 'transparent',
          color: activeTab === 'dna' ? themed.rightSidebar.tabTextActive : themed.rightSidebar.tabText,
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: activeTab === 'dna' ? '600' : '400',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (activeTab !== 'dna') {
            e.currentTarget.style.backgroundColor = themed.rightSidebar.tabBackgroundHover
          }
        }}
        onMouseLeave={(e) => {
          if (activeTab !== 'dna') {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        DNA Metadata
      </button>
      <button
        onClick={() => onTabChange('properties')}
        style={{
          flex: 1,
          padding: '12px 16px',
          border: 'none',
          background: activeTab === 'properties' ? themed.rightSidebar.tabBackgroundActive : 'transparent',
          color: activeTab === 'properties' ? themed.rightSidebar.tabTextActive : themed.rightSidebar.tabText,
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: activeTab === 'properties' ? '600' : '400',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (activeTab !== 'properties') {
            e.currentTarget.style.backgroundColor = themed.rightSidebar.tabBackgroundHover
          }
        }}
        onMouseLeave={(e) => {
          if (activeTab !== 'properties') {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        Node Properties
      </button>
    </div>
  )
}
