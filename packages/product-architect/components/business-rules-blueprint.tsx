"use client"

import { useEffect, useRef, useState } from "react"

interface BusinessRule {
  id: string
  name: string
  condition: string
  action: string
  priority: "high" | "medium" | "low"
  type: "validation" | "business" | "decision" | "process"
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
    validation: string
    business: string
    decision: string
    process: string
    condition: string
    action: string
    flow: string
  }
}

const BUSINESS_RULES: BusinessRule[] = [
  {
    id: "R001",
    name: "Order Validation",
    condition: "amount > 0 AND items.length > 0",
    action: "Process Order",
    priority: "high",
    type: "validation"
  },
  {
    id: "R002", 
    name: "Discount Logic",
    condition: "customer.tier === 'VIP' OR order.total > $500",
    action: "Apply 15% Discount",
    priority: "medium",
    type: "business"
  },
  {
    id: "R003",
    name: "Approval Required",
    condition: "order.total > $10000",
    action: "Route to Manager",
    priority: "high", 
    type: "decision"
  },
  {
    id: "R004",
    name: "Shipping Method",
    condition: "weight > 50lbs OR destination === 'International'",
    action: "Use Freight Shipping",
    priority: "medium",
    type: "process"
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
    grid: "rgba(147, 51, 234, 0.1)",
    validation: "#10b981",
    business: "#3b82f6", 
    decision: "#f59e0b",
    process: "#ef4444",
    condition: "#8b5cf6",
    action: "#ec4899",
    flow: "rgba(147, 51, 234, 0.6)"
  },
}

export function BusinessRulesBlueprint() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeRule, setActiveRule] = useState(0)

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

  const drawRuleNode = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rule: BusinessRule,
    isActive: boolean
  ) => {
    const nodeWidth = 120
    const nodeHeight = 80
    
    // Get color based on rule type
    const typeColors = {
      validation: DRAWING_CONFIG.colors.validation,
      business: DRAWING_CONFIG.colors.business,
      decision: DRAWING_CONFIG.colors.decision,
      process: DRAWING_CONFIG.colors.process
    }
    
    const color = typeColors[rule.type]
    
    // Draw node background
    ctx.fillStyle = isActive ? `${color}20` : `${color}10`
    ctx.fillRect(x, y, nodeWidth, nodeHeight)
    
    // Draw border
    ctx.strokeStyle = isActive ? color : `${color}80`
    ctx.lineWidth = isActive ? 3 : 2
    ctx.strokeRect(x, y, nodeWidth, nodeHeight)
    
    // Draw rule ID
    ctx.fillStyle = color
    ctx.font = "bold 10px monospace"
    ctx.fillText(rule.id, x + 8, y + 16)
    
    // Draw rule name
    ctx.font = "8px monospace"
    const nameLines = rule.name.split(' ')
    nameLines.forEach((line, index) => {
      ctx.fillText(line, x + 8, y + 30 + (index * 10))
    })
    
    // Draw priority indicator
    const priorityColors = {
      high: "#ef4444",
      medium: "#f59e0b", 
      low: "#10b981"
    }
    ctx.fillStyle = priorityColors[rule.priority]
    ctx.fillRect(x + nodeWidth - 16, y + 6, 8, 8)
  }

  const drawConnection = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    label?: string
  ) => {
    ctx.strokeStyle = DRAWING_CONFIG.colors.flow
    ctx.lineWidth = DRAWING_CONFIG.lineWidth.connection
    
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
    
    // Draw label if provided
    if (label) {
      const midX = (fromX + toX) / 2
      const midY = (fromY + toY) / 2
      
      ctx.fillStyle = DRAWING_CONFIG.colors.flow
      ctx.font = "8px monospace"
      ctx.fillText(label, midX - 10, midY - 5)
    }
  }

  const drawConditionAction = (
    ctx: CanvasRenderingContext2D,
    rule: BusinessRule,
    centerX: number,
    centerY: number
  ) => {
    // Draw condition box
    ctx.fillStyle = `${DRAWING_CONFIG.colors.condition}20`
    ctx.fillRect(centerX - 150, centerY - 60, 140, 50)
    ctx.strokeStyle = DRAWING_CONFIG.colors.condition
    ctx.lineWidth = 2
    ctx.strokeRect(centerX - 150, centerY - 60, 140, 50)
    
    ctx.fillStyle = DRAWING_CONFIG.colors.condition
    ctx.font = "10px monospace"
    ctx.fillText("CONDITION", centerX - 145, centerY - 45)
    ctx.font = "8px monospace"
    
    // Wrap condition text
    const conditionWords = rule.condition.split(' ')
    let line = ''
    let y = centerY - 30
    
    conditionWords.forEach(word => {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > 130 && line !== '') {
        ctx.fillText(line, centerX - 145, y)
        line = word + ' '
        y += 10
      } else {
        line = testLine
      }
    })
    ctx.fillText(line, centerX - 145, y)
    
    // Draw action box
    ctx.fillStyle = `${DRAWING_CONFIG.colors.action}20`
    ctx.fillRect(centerX + 10, centerY - 60, 140, 50)
    ctx.strokeStyle = DRAWING_CONFIG.colors.action
    ctx.lineWidth = 2
    ctx.strokeRect(centerX + 10, centerY - 60, 140, 50)
    
    ctx.fillStyle = DRAWING_CONFIG.colors.action
    ctx.font = "10px monospace"
    ctx.fillText("ACTION", centerX + 15, centerY - 45)
    ctx.font = "8px monospace"
    
    // Wrap action text
    const actionWords = rule.action.split(' ')
    line = ''
    y = centerY - 30
    
    actionWords.forEach(word => {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > 130 && line !== '') {
        ctx.fillText(line, centerX + 15, y)
        line = word + ' '
        y += 10
      } else {
        line = testLine
      }
    })
    ctx.fillText(line, centerX + 15, y)
    
    // Draw arrow from condition to action
    drawConnection(ctx, centerX - 10, centerY - 35, centerX + 10, centerY - 35, "IF")
  }

  const drawRuleFlow = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const nodePositions = [
      { x: 50, y: 50 },
      { x: width - 170, y: 50 },
      { x: 50, y: height - 130 },
      { x: width - 170, y: height - 130 }
    ]
    
    // Draw rules
    BUSINESS_RULES.forEach((rule, index) => {
      const pos = nodePositions[index]
      drawRuleNode(ctx, pos.x, pos.y, rule, index === activeRule)
    })
    
    // Draw connections between rules
    drawConnection(
      ctx,
      nodePositions[0].x + 120,
      nodePositions[0].y + 40,
      nodePositions[1].x,
      nodePositions[1].y + 40,
      "THEN"
    )
    
    drawConnection(
      ctx,
      nodePositions[1].x + 60,
      nodePositions[1].y + 80,
      nodePositions[3].x + 60,
      nodePositions[3].y,
      "OR"
    )
    
    drawConnection(
      ctx,
      nodePositions[0].x + 60,
      nodePositions[0].y + 80,
      nodePositions[2].x + 60,
      nodePositions[2].y,
      "ELSE"
    )
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const setup = setupCanvas(canvas)
    if (!setup) return

    const { ctx, width, height } = setup
    const centerX = width / 2
    const centerY = height / 2

    // Clear canvas
    ctx.fillStyle = DRAWING_CONFIG.colors.background
    ctx.fillRect(0, 0, width, height)

    // Draw all components
    drawGrid(ctx, width, height)
    drawRuleFlow(ctx, width, height)
    
    // Draw detailed view of active rule
    if (BUSINESS_RULES[activeRule]) {
      drawConditionAction(ctx, BUSINESS_RULES[activeRule], centerX, centerY + 50)
    }
  }, [activeRule])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />

      {/* Rule selector */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {BUSINESS_RULES.map((rule, index) => (
          <button
            key={rule.id}
            onClick={() => setActiveRule(index)}
            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
              activeRule === index 
                ? "bg-purple-500 text-white" 
                : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
            }`}
          >
            {rule.id}
          </button>
        ))}
      </div>
    </div>
  )
}