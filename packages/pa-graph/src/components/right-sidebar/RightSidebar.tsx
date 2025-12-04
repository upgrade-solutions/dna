import { useEffect, useRef, useState } from 'react'
import { ui, dia } from '@joint/plus'
import { InspectorTabs } from './InspectorTabs'
import { getInspectorConfigForCell } from './config'
import type { Theme } from '../../types/theme'
import { getThemedColors } from '../../types/theme'
import './styles'

interface RightSidebarProps {
  width?: number
  cellView?: dia.CellView | null
  theme: Theme
}

export function RightSidebar({ 
  width = 320, 
  cellView = null,
  theme
}: RightSidebarProps) {
  const inspectorContainerRef = useRef<HTMLDivElement>(null)
  const inspectorRef = useRef<ui.Inspector | null>(null)
  const [activeTab, setActiveTab] = useState<'dna' | 'properties'>('dna')
  const themed = getThemedColors(theme)

  // Check if the selected cell is a node (not a link)
  const isNode = cellView && cellView.model && !cellView.model.isLink()

  // Initialize/update Inspector when cellView or tab changes
  useEffect(() => {
    if (!inspectorContainerRef.current) return

    // Clean up previous inspector
    if (inspectorRef.current) {
      inspectorRef.current.remove()
      inspectorRef.current = null
    }

    // Create new inspector if we have a selected cell
    if (cellView) {
      const cell = cellView.model
      const config = getInspectorConfigForCell(cell, activeTab)
      
      const inspector = ui.Inspector.create(inspectorContainerRef.current, {
        cell: cell,  // Pass cell instead of cellView for better compatibility
        ...config,
        live: true,  // Ensure live updates are enabled
        renderFieldContent: false,
        operators: {
          // Custom operators to ensure proper updates
          set: (cell: dia.Cell, path: string, value: any) => {
            cell.prop(path, value)
            // Force view update
            const view = cellView.paper?.findViewByModel(cell)
            if (view) {
              view.update()
            }
          }
        }
      })

      inspectorRef.current = inspector
    }

    return () => {
      if (inspectorRef.current) {
        inspectorRef.current.remove()
        inspectorRef.current = null
      }
    }
  }, [cellView, activeTab])

  return (
    <div
      style={{
        width,
        minWidth: width,
        height: '100%',
        backgroundColor: themed.rightSidebar.background,
        borderLeft: `1px solid ${themed.rightSidebar.borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: `1px solid ${themed.rightSidebar.borderColor}` }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: themed.rightSidebar.text }}>
            Inspector
          </h3>
        </div>
        
        {isNode && (
          <InspectorTabs activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />
        )}
        
        <div 
          ref={inspectorContainerRef} 
          className="inspector-container right-sidebar-content"
          style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '12px'
          }}
        >
          {!cellView && (
            <div style={{ 
              padding: '20px', 
              color: themed.rightSidebar.textSecondary, 
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Select an element to inspect its properties
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
