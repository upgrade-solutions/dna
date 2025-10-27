"use client"

import { useEffect, useRef, useState } from "react"

interface Concept {
  id: string
  name: string
  type: "organization" | "product" | "workflow" | "step" | "property" | "actor" | "resource"
  parent?: string
  properties?: string[]
  level: number
}

interface Relationship {
  from: string
  to: string
  type: "contains" | "implements" | "executes" | "uses" | "depends-on" | "flows-to"
  label: string
}

interface DrawingConfig {
  gridSize: number
  lineWidth: {
    grid: number
    border: number
    connection: number
  }
  colors: {
    background: string
    grid: string
    organization: string
    product: string
    workflow: string
    step: string
    property: string
    actor: string
    resource: string
    contains: string
    implements: string
    executes: string
    uses: string
    dependsOn: string
    flowsTo: string
  }
}

const CONCEPTS: Concept[] = [
  {
    id: "O001",
    name: "Financial Services",
    type: "organization",
    level: 0,
    properties: ["business_unit", "region", "compliance"]
  },
  {
    id: "P001",
    name: "Loan Platform",
    type: "product",
    parent: "O001",
    level: 1,
    properties: ["version", "status", "users"]
  },
  {
    id: "P002",
    name: "Banking Core",
    type: "product",
    parent: "O001",
    level: 1,
    properties: ["version", "status", "users"]
  },
  {
    id: "W001",
    name: "Customer Onboarding",
    type: "workflow",
    parent: "P001",
    level: 2,
    properties: ["duration", "complexity", "automation"]
  },
  {
    id: "W002",
    name: "Loan Application",
    type: "workflow", 
    parent: "P001",
    level: 2,
    properties: ["duration", "complexity", "automation"]
  },
  {
    id: "S001",
    name: "Identity Verification",
    type: "step",
    parent: "W001",
    level: 3,
    properties: ["actor", "action", "resource"]
  },
  {
    id: "S002",
    name: "Credit Assessment",
    type: "step",
    parent: "W002",
    level: 3,
    properties: ["actor", "action", "resource"]
  },
  {
    id: "A001",
    name: "Customer",
    type: "actor",
    level: 4,
    properties: ["role", "permissions", "context"]
  },
  {
    id: "A002",
    name: "System",
    type: "actor",
    level: 4,
    properties: ["role", "permissions", "context"]
  },
  {
    id: "R001",
    name: "Identity Database",
    type: "resource",
    level: 4,
    properties: ["type", "access", "security"]
  }
]

const RELATIONSHIPS: Relationship[] = [
  {
    from: "O001",
    to: "P001",
    type: "contains",
    label: "owns"
  },
  {
    from: "O001",
    to: "P002",
    type: "contains",
    label: "owns"
  },
  {
    from: "P001",
    to: "W001",
    type: "implements",
    label: "provides"
  },
  {
    from: "P001",
    to: "W002",
    type: "implements",
    label: "provides"
  },
  {
    from: "W001",
    to: "S001",
    type: "executes",
    label: "runs"
  },
  {
    from: "W002",
    to: "S002",
    type: "executes",
    label: "runs"
  },
  {
    from: "S001",
    to: "A001",
    type: "uses",
    label: "involves"
  },
  {
    from: "S001",
    to: "R001",
    type: "uses",
    label: "accesses"
  },
  {
    from: "S002",
    to: "A002",
    type: "uses",
    label: "involves"
  },
  {
    from: "S001",
    to: "S002",
    type: "flows-to",
    label: "triggers"
  }
]

const DRAWING_CONFIG: DrawingConfig = {
  gridSize: 20,
  lineWidth: {
    grid: 0.5,
    border: 2,
    connection: 1.5,
  },
  colors: {
    background: "#0a0f1a",
    grid: "rgba(236, 72, 153, 0.1)",
    organization: "#3b82f6",  // Blue for organizations
    product: "#8b5cf6",      // Purple for products  
    workflow: "#10b981",     // Green for workflows
    step: "#06b6d4",         // Cyan for steps
    property: "#f59e0b",     // Orange for properties
    actor: "#ec4899",        // Pink for actors
    resource: "#ef4444",     // Red for resources
    contains: "#3b82f6",     // Blue for contains relationships
    implements: "#8b5cf6",   // Purple for implements relationships
    executes: "#10b981",     // Green for executes relationships
    uses: "#06b6d4",         // Cyan for uses relationships
    dependsOn: "#f59e0b",    // Orange for depends-on relationships
    flowsTo: "#ec4899"       // Pink for flows-to relationships
  },
}

export function OntologyBlueprint() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)

  const setupCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    return { ctx, width: rect.width, height: rect.height }
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = DRAWING_CONFIG.colors.grid
    ctx.lineWidth = DRAWING_CONFIG.lineWidth.grid

    for (let x = 0; x < width; x += DRAWING_CONFIG.gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += DRAWING_CONFIG.gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  const getConceptColor = (type: Concept["type"]) => {
    const colors = {
      organization: DRAWING_CONFIG.colors.organization,
      product: DRAWING_CONFIG.colors.product,
      workflow: DRAWING_CONFIG.colors.workflow,
      step: DRAWING_CONFIG.colors.step,
      property: DRAWING_CONFIG.colors.property,
      actor: DRAWING_CONFIG.colors.actor,
      resource: DRAWING_CONFIG.colors.resource
    }
    return colors[type]
  }

  const getRelationshipColor = (type: Relationship["type"]) => {
    const colors = {
      "contains": DRAWING_CONFIG.colors.contains,
      "implements": DRAWING_CONFIG.colors.implements,
      "executes": DRAWING_CONFIG.colors.executes,
      "uses": DRAWING_CONFIG.colors.uses,
      "depends-on": DRAWING_CONFIG.colors.dependsOn,
      "flows-to": DRAWING_CONFIG.colors.flowsTo
    }
    return colors[type]
  }

  const drawConceptNode = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    concept: Concept,
    isSelected: boolean
  ) => {
    const nodeWidth = 100
    const nodeHeight = 60
    const color = getConceptColor(concept.type)
    
    // Draw node background based on entity type
    if (concept.type === "organization" || concept.type === "product") {
      // Rectangle for organizations and products
      ctx.fillStyle = isSelected ? `${color}30` : `${color}15`
      ctx.fillRect(x, y, nodeWidth, nodeHeight)
      ctx.strokeStyle = isSelected ? color : `${color}80`
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.strokeRect(x, y, nodeWidth, nodeHeight)
    } else if (concept.type === "workflow" || concept.type === "step") {
      // Rounded rectangle for workflows and steps
      const radius = 8
      ctx.fillStyle = isSelected ? `${color}30` : `${color}15`
      ctx.beginPath()
      ctx.roundRect(x, y, nodeWidth, nodeHeight, radius)
      ctx.fill()
      ctx.strokeStyle = isSelected ? color : `${color}80`
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.stroke()
    } else if (concept.type === "property") {
      // Diamond for properties
      ctx.fillStyle = isSelected ? `${color}30` : `${color}15`
      ctx.beginPath()
      ctx.moveTo(x + nodeWidth/2, y)
      ctx.lineTo(x + nodeWidth, y + nodeHeight/2)
      ctx.lineTo(x + nodeWidth/2, y + nodeHeight)
      ctx.lineTo(x, y + nodeHeight/2)
      ctx.closePath()
      ctx.fill()
      
      ctx.strokeStyle = isSelected ? color : `${color}80`
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.stroke()
    } else {
      // Circle for actors and resources
      const radius = Math.min(nodeWidth, nodeHeight) / 2
      const centerX = x + nodeWidth / 2
      const centerY = y + nodeHeight / 2
      
      ctx.fillStyle = isSelected ? `${color}30` : `${color}15`
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.strokeStyle = isSelected ? color : `${color}80`
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.stroke()
    }
    
    // Draw concept name
    ctx.fillStyle = color
    ctx.font = "10px monospace"
    ctx.textAlign = "center"
    ctx.fillText(concept.name, x + nodeWidth/2, y + nodeHeight/2 + 3)
    
    // Draw concept ID
    ctx.font = "8px monospace"
    ctx.fillStyle = `${color}80`
    ctx.fillText(concept.id, x + nodeWidth/2, y + nodeHeight/2 - 8)
    
    ctx.textAlign = "start"
  }

  const drawRelationship = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    relationship: Relationship
  ) => {
    const color = getRelationshipColor(relationship.type)
    
    ctx.strokeStyle = color
    ctx.lineWidth = DRAWING_CONFIG.lineWidth.connection
    
    // Draw line with different styles for different relationship types
    if (relationship.type === "contains") {
      // Solid thick line for contains relationships
      ctx.setLineDash([])
      ctx.lineWidth = 3
    } else if (relationship.type === "implements") {
      // Dashed line for implements relationships
      ctx.setLineDash([8, 4])
    } else if (relationship.type === "executes") {
      // Dotted line for executes relationships
      ctx.setLineDash([2, 3])
    } else if (relationship.type === "uses") {
      // Dash-dot for uses relationships
      ctx.setLineDash([8, 3, 2, 3])
    } else if (relationship.type === "depends-on") {
      // Double dash for depends-on
      ctx.setLineDash([10, 3, 3, 3])
    } else {
      // Solid line for flows-to relationships
      ctx.setLineDash([])
    }
    
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
    
    // Draw arrow
    const angle = Math.atan2(toY - fromY, toX - fromX)
    const arrowLength = 8
    
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle - Math.PI / 6),
      toY - arrowLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle + Math.PI / 6),
      toY - arrowLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
    
    // Reset line dash
    ctx.setLineDash([])
    
    // Draw relationship label
    const midX = (fromX + toX) / 2
    const midY = (fromY + toY) / 2
    
    ctx.fillStyle = color
    ctx.font = "8px monospace"
    ctx.textAlign = "center"
    ctx.fillText(relationship.label, midX, midY - 5)
    ctx.textAlign = "start"
  }

  const drawOntologyGraph = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Define positions for concepts in a hierarchical layout matching Entity Architecture
    const positions = {
      // Organizations at top level
      "O001": { x: width/2 - 60, y: 40 },
      
      // Products at second level
      "P001": { x: 80, y: 120 },
      "P002": { x: width - 200, y: 120 },
      
      // Workflows at third level  
      "W001": { x: 40, y: 200 },
      "W002": { x: 160, y: 200 },
      
      // Steps at fourth level
      "S001": { x: 40, y: 280 },
      "S002": { x: 160, y: 280 },
      
      // Actors and Resources around the sides
      "A001": { x: width - 140, y: 220 },
      "A002": { x: width - 140, y: 280 },
      "R001": { x: width - 140, y: 340 }
    }
    
    // Draw relationships first (behind nodes)
    RELATIONSHIPS.forEach(rel => {
      const fromPos = positions[rel.from as keyof typeof positions]
      const toPos = positions[rel.to as keyof typeof positions]
      
      if (fromPos && toPos) {
        drawRelationship(
          ctx,
          fromPos.x + 50, fromPos.y + 30,
          toPos.x + 50, toPos.y + 30,
          rel
        )
      }
    })
    
    // Draw concept nodes
    CONCEPTS.forEach(concept => {
      const pos = positions[concept.id as keyof typeof positions]
      if (pos) {
        drawConceptNode(
          ctx,
          pos.x, pos.y,
          concept,
          selectedConcept === concept.id
        )
      }
    })
  }

  const drawLegend = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const legendX = width - 180
    const legendY = height - 160
    
    // Legend background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.fillRect(legendX - 10, legendY - 10, 170, 140)
    
    ctx.font = "10px monospace"
    
    // Entity types
    ctx.fillStyle = DRAWING_CONFIG.colors.organization
    ctx.fillRect(legendX, legendY, 12, 8)
    ctx.fillText("Organization", legendX + 16, legendY + 6)
    
    ctx.fillStyle = DRAWING_CONFIG.colors.product
    ctx.fillRect(legendX, legendY + 15, 12, 8)
    ctx.fillText("Product", legendX + 16, legendY + 21)
    
    ctx.fillStyle = DRAWING_CONFIG.colors.workflow
    ctx.fillRect(legendX, legendY + 30, 12, 8)
    ctx.fillText("Workflow", legendX + 16, legendY + 36)
    
    ctx.fillStyle = DRAWING_CONFIG.colors.step
    ctx.fillRect(legendX, legendY + 45, 12, 8)
    ctx.fillText("Step", legendX + 16, legendY + 51)
    
    ctx.fillStyle = DRAWING_CONFIG.colors.actor
    ctx.fillRect(legendX, legendY + 60, 12, 8)
    ctx.fillText("Actor", legendX + 16, legendY + 66)
    
    ctx.fillStyle = DRAWING_CONFIG.colors.resource
    ctx.fillRect(legendX, legendY + 75, 12, 8)
    ctx.fillText("Resource", legendX + 16, legendY + 81)
    
    // Relationship types
    ctx.strokeStyle = DRAWING_CONFIG.colors.contains
    ctx.lineWidth = 3
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(legendX, legendY + 95)
    ctx.lineTo(legendX + 12, legendY + 95)
    ctx.stroke()
    ctx.fillStyle = DRAWING_CONFIG.colors.contains
    ctx.fillText("contains", legendX + 16, legendY + 98)
    
    ctx.strokeStyle = DRAWING_CONFIG.colors.implements
    ctx.lineWidth = 2
    ctx.setLineDash([4, 2])
    ctx.beginPath()
    ctx.moveTo(legendX, legendY + 110)
    ctx.lineTo(legendX + 12, legendY + 110)
    ctx.stroke()
    ctx.fillStyle = DRAWING_CONFIG.colors.implements
    ctx.fillText("implements", legendX + 16, legendY + 113)
    
    ctx.setLineDash([])
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Check if click is on any concept node
    const positions = {
      "O001": { x: canvas.width/2 - 60, y: 40 },
      "P001": { x: 80, y: 120 },
      "P002": { x: canvas.width - 200, y: 120 },
      "W001": { x: 40, y: 200 },
      "W002": { x: 160, y: 200 },
      "S001": { x: 40, y: 280 },
      "S002": { x: 160, y: 280 },
      "A001": { x: canvas.width - 140, y: 220 },
      "A002": { x: canvas.width - 140, y: 280 },
      "R001": { x: canvas.width - 140, y: 340 }
    }
    
    Object.entries(positions).forEach(([conceptId, pos]) => {
      if (x >= pos.x && x <= pos.x + 100 && y >= pos.y && y <= pos.y + 60) {
        setSelectedConcept(selectedConcept === conceptId ? null : conceptId)
      }
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const setup = setupCanvas(canvas)
    if (!setup) return

    const { ctx, width, height } = setup

    // Clear canvas
    ctx.fillStyle = DRAWING_CONFIG.colors.background
    ctx.fillRect(0, 0, width, height)

    // Draw all components
    drawGrid(ctx, width, height)
    drawOntologyGraph(ctx, width, height)
    drawLegend(ctx, width, height)
  }, [selectedConcept])

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-pointer" 
        style={{ width: "100%", height: "100%" }}
        onClick={handleCanvasClick}
      />

      {/* Selected concept details */}
      {selectedConcept && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs">
          {(() => {
            const concept = CONCEPTS.find(c => c.id === selectedConcept)
            if (!concept) return null
            
            return (
              <div>
                <div className="font-bold text-pink-400">{concept.name}</div>
                <div className="text-gray-400">Type: {concept.type}</div>
                {concept.properties && (
                  <div className="text-gray-400">
                    Properties: {concept.properties.join(", ")}
                  </div>
                )}
                {concept.parent && (
                  <div className="text-gray-400">
                    Parent: {CONCEPTS.find(c => c.id === concept.parent)?.name}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}