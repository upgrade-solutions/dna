import { useRef } from 'react'
import { GraphCanvasWithRef, type GraphCanvasRef } from '../GraphCanvasWithRef'
import { GraphToolbar } from '../../toolbar/GraphToolbar'
import { dnaPlatformTenant } from '../../../../data'
import type { dia } from '@joint/plus'

/**
 * Example: Complete graph canvas with toolbar
 * 
 * This demonstrates the modular approach:
 * - GraphCanvasWithRef provides the graph and paper instances
 * - GraphToolbar uses those instances for zoom/pan/fit controls
 * - You can easily add more toolbars, panels, or controls
 */
export function GraphCanvasExample() {
  const graphCanvasRef = useRef<GraphCanvasRef>(null)

  const handleCellSelected = (cellView: dia.CellView | null) => {
    if (cellView) {
      console.log('Selected cell:', cellView.model.id)
    } else {
      console.log('Deselected')
    }
  }

  const handleAddNode = () => {
    console.log('Add node clicked - implement node creation logic')
    // Example: You could open a modal to configure the new node
    // Then use ShapesFactory to create it and add to graph
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <GraphToolbar
        graph={graphCanvasRef.current?.graph || null}
        paper={graphCanvasRef.current?.paper || null}
        onAddNode={handleAddNode}
        theme={dnaPlatformTenant.theme}
      />
      <div style={{ paddingTop: '48px', height: '100%' }}>
        <GraphCanvasWithRef
          ref={graphCanvasRef}
          tenantConfig={dnaPlatformTenant}
          onCellViewSelected={handleCellSelected}
        />
      </div>
    </div>
  )
}
