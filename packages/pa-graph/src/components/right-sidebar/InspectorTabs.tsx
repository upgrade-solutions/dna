interface InspectorTabsProps {
  activeTab: 'dna' | 'properties'
  onTabChange: (tab: 'dna' | 'properties') => void
}

export function InspectorTabs({ activeTab, onTabChange }: InspectorTabsProps) {
  return (
    <div className="tabs-container">
      <button
        className={`tab-button ${activeTab === 'dna' ? 'active' : ''}`}
        onClick={() => onTabChange('dna')}
      >
        DNA Metadata
      </button>
      <button
        className={`tab-button ${activeTab === 'properties' ? 'active' : ''}`}
        onClick={() => onTabChange('properties')}
      >
        Node Properties
      </button>
    </div>
  )
}
