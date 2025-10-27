"use client"

import { useEffect, useRef, useState } from "react"

interface ContextNode {
  id: string
  name: string
  type: "input" | "context" | "inference" | "output" | "feedback"
  data: string
  confidence?: number
}

interface InferenceRule {
  id: string
  premise: string
  conclusion: string
  confidence: number
}

interface DrawingConfig {
  gridSize: number
  lineWidth: {
    grid: number
    border: number
    flow: number
  }
  colors: {
    background: string
    grid: string
    input: string
    context: string
    inference: string
    output: string
    feedback: string
    dataFlow: string
    reasoning: string
  }
}

const CONTEXT_NODES: ContextNode[] = [
  {
    id: "I001",
    name: "User Intent",
    type: "input",
    data: "Find premium products under $100"
  },
  {
    id: "C001", 
    name: "User Profile",
    type: "context",
    data: "VIP customer, previous purchases",
    confidence: 0.9
  },
  {
    id: "C002",
    name: "Product Catalog",
    type: "context", 
    data: "Inventory, pricing, categories",
    confidence: 0.95
  },
  {
    id: "R001",
    name: "Recommendation Engine",
    type: "inference",
    data: "Apply VIP discount rules",
    confidence: 0.85
  },
  {
    id: "O001",
    name: "Personalized Results",
    type: "output",
    data: "Filtered products with VIP pricing"
  },
  {
    id: "F001",
    name: "User Feedback",
    type: "feedback", 
    data: "Implicit: click patterns, dwell time"
  }
]

const INFERENCE_RULES: InferenceRule[] = [
  {
    id: "R1",
    premise: "User is VIP AND searches premium products",
    conclusion: "Apply VIP discount filters",
    confidence: 0.9
  },
  {
    id: "R2", 
    premise: "Product category matches user preferences",
    conclusion: "Boost relevance score",
    confidence: 0.8
  },
  {
    id: "R3",
    premise: "User has purchase history in category",
    conclusion: "Include complementary products",
    confidence: 0.75
  }
]

const DRAWING_CONFIG: DrawingConfig = {
  gridSize: 20,
  lineWidth: {
    grid: 0.5,
    border: 2,
    flow: 2,
  },
  colors: {
    background: "#0a0f1a",
    grid: "rgba(99, 102, 241, 0.1)",
    input: "#10b981",
    context: "#3b82f6", 
    inference: "#8b5cf6",
    output: "#f59e0b",
    feedback: "#ef4444",
    dataFlow: "rgba(99, 102, 241, 0.6)",
    reasoning: "rgba(139, 92, 246, 0.8)"
  },
}

export function SemanticsBlueprint() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activePhase, setActivePhase] = useState(0)
  const [animationFrame, setAnimationFrame] = useState(0)

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

  const getNodeColor = (type: ContextNode["type"]) => {
    const colors = {
      input: DRAWING_CONFIG.colors.input,
      context: DRAWING_CONFIG.colors.context,
      inference: DRAWING_CONFIG.colors.inference,
      output: DRAWING_CONFIG.colors.output,
      feedback: DRAWING_CONFIG.colors.feedback
    }
    return colors[type]
  }

  const drawContextNode = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    node: ContextNode,
    isActive: boolean
  ) => {
    const nodeWidth = 120
    const nodeHeight = 80
    const color = getNodeColor(node.type)
    
    // Draw node with rounded corners based on type
    ctx.fillStyle = isActive ? `${color}30` : `${color}15`
    
    if (node.type === "inference") {
      // Hexagon for inference nodes
      const centerX = x + nodeWidth / 2
      const centerY = y + nodeHeight / 2
      const radius = 35
      
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const pointX = centerX + radius * Math.cos(angle)
        const pointY = centerY + radius * Math.sin(angle)
        if (i === 0) ctx.moveTo(pointX, pointY)
        else ctx.lineTo(pointX, pointY)
      }
      ctx.closePath()
      ctx.fill()
    } else {
      // Rounded rectangle for other types
      const radius = 8
      ctx.beginPath()
      ctx.roundRect(x, y, nodeWidth, nodeHeight, radius)
      ctx.fill()
    }
    
    // Draw border
    ctx.strokeStyle = isActive ? color : `${color}80`
    ctx.lineWidth = isActive ? 3 : 2
    ctx.stroke()
    
    // Draw node name
    ctx.fillStyle = color
    ctx.font = "bold 10px monospace"
    ctx.textAlign = "center"
    ctx.fillText(node.name, x + nodeWidth/2, y + 20)
    
    // Draw node type
    ctx.font = "8px monospace"
    ctx.fillStyle = `${color}80`
    ctx.fillText(node.type.toUpperCase(), x + nodeWidth/2, y + 35)
    
    // Draw confidence if available
    if (node.confidence !== undefined) {
      ctx.fillStyle = color
      ctx.fillText(`${Math.round(node.confidence * 100)}%`, x + nodeWidth/2, y + nodeHeight - 8)
    }
    
    ctx.textAlign = "start"
  }

  const drawDataFlow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    label: string,
    animated: boolean = false
  ) => {
    ctx.strokeStyle = DRAWING_CONFIG.colors.dataFlow
    ctx.lineWidth = DRAWING_CONFIG.lineWidth.flow
    
    if (animated) {
      // Animated dashed line
      ctx.setLineDash([8, 4])
      ctx.lineDashOffset = -animationFrame * 0.5
    } else {
      ctx.setLineDash([])
    }
    
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
    
    // Draw arrow
    const angle = Math.atan2(toY - fromY, toX - fromX)
    const arrowLength = 10
    
    ctx.setLineDash([])
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
    
    // Draw label
    const midX = (fromX + toX) / 2
    const midY = (fromY + toY) / 2
    
    ctx.fillStyle = DRAWING_CONFIG.colors.dataFlow
    ctx.font = "8px monospace"
    ctx.textAlign = "center"
    ctx.fillText(label, midX, midY - 5)
    ctx.textAlign = "start"
  }

  const drawInferenceEngine = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number
  ) => {
    // Draw main inference engine box
    const boxWidth = 200
    const boxHeight = 120
    const x = centerX - boxWidth / 2
    const y = centerY - boxHeight / 2
    
    ctx.fillStyle = `${DRAWING_CONFIG.colors.reasoning}20`
    ctx.fillRect(x, y, boxWidth, boxHeight)
    ctx.strokeStyle = DRAWING_CONFIG.colors.reasoning
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, boxWidth, boxHeight)
    
    // Draw title
    ctx.fillStyle = DRAWING_CONFIG.colors.reasoning
    ctx.font = "bold 12px monospace"
    ctx.textAlign = "center"
    ctx.fillText("INFERENCE ENGINE", centerX, y + 20)
    
    // Draw active rule
    const activeRule = INFERENCE_RULES[activePhase % INFERENCE_RULES.length]
    if (activeRule) {
      ctx.font = "8px monospace"
      ctx.fillStyle = `${DRAWING_CONFIG.colors.reasoning}cc`
      
      // Wrap premise text
      const premiseWords = activeRule.premise.split(' ')
      let line = ''
      let textY = y + 40
      
      premiseWords.forEach(word => {
        const testLine = line + word + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > boxWidth - 20 && line !== '') {
          ctx.fillText('IF: ' + line, centerX, textY)
          line = word + ' '
          textY += 12
        } else {
          line = testLine
        }
      })
      if (line) ctx.fillText('IF: ' + line, centerX, textY)
      
      // Draw conclusion
      textY += 16
      ctx.fillStyle = DRAWING_CONFIG.colors.reasoning
      ctx.fillText('THEN: ' + activeRule.conclusion, centerX, textY)
      
      // Draw confidence
      textY += 16
      ctx.fillStyle = `${DRAWING_CONFIG.colors.reasoning}80`
      ctx.fillText(`Confidence: ${Math.round(activeRule.confidence * 100)}%`, centerX, textY)
    }
    
    ctx.textAlign = "start"
  }

  const drawReasoningFlow = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const nodePositions = {
      "I001": { x: 50, y: 50 },
      "C001": { x: 50, y: 160 },
      "C002": { x: 50, y: 270 },
      "R001": { x: width/2 - 60, y: height/2 - 40 },
      "O001": { x: width - 170, y: 150 },
      "F001": { x: width - 170, y: 270 }
    }
    
    // Draw nodes
    CONTEXT_NODES.forEach((node, index) => {
      const pos = nodePositions[node.id as keyof typeof nodePositions]
      if (pos) {
        drawContextNode(
          ctx,
          pos.x, pos.y,
          node,
          index === activePhase
        )
      }
    })
    
    // Draw inference engine
    drawInferenceEngine(ctx, width/2, height/2)
    
    // Draw data flows
    const flows = [
      { from: "I001", to: "R001", label: "intent" },
      { from: "C001", to: "R001", label: "profile" },
      { from: "C002", to: "R001", label: "catalog" },
      { from: "R001", to: "O001", label: "results" },
      { from: "O001", to: "F001", label: "metrics" },
      { from: "F001", to: "C001", label: "learning" }
    ]
    
    flows.forEach((flow, index) => {
      const fromPos = nodePositions[flow.from as keyof typeof nodePositions]
      const toPos = nodePositions[flow.to as keyof typeof nodePositions]
      
      if (fromPos && toPos) {
        const isActive = index <= activePhase
        drawDataFlow(
          ctx,
          fromPos.x + 120, fromPos.y + 40,
          toPos.x, toPos.y + 40,
          flow.label,
          isActive
        )
      }
    })
  }

  const drawKnowledgeGraph = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) => {
    // Draw mini knowledge graph representation
    const graphWidth = 160
    const graphHeight = 100
    
    ctx.fillStyle = `${DRAWING_CONFIG.colors.context}10`
    ctx.fillRect(x, y, graphWidth, graphHeight)
    ctx.strokeStyle = DRAWING_CONFIG.colors.context
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, graphWidth, graphHeight)
    
    // Draw nodes and connections
    const nodes = [
      { x: x + 30, y: y + 30, label: "User" },
      { x: x + 130, y: y + 30, label: "Product" },
      { x: x + 80, y: y + 70, label: "Category" }
    ]
    
    // Draw connections
    ctx.strokeStyle = `${DRAWING_CONFIG.colors.context}60`
    nodes.forEach((nodeA, i) => {
      nodes.slice(i + 1).forEach(nodeB => {
        ctx.beginPath()
        ctx.moveTo(nodeA.x, nodeA.y)
        ctx.lineTo(nodeB.x, nodeB.y)
        ctx.stroke()
      })
    })
    
    // Draw nodes
    ctx.fillStyle = DRAWING_CONFIG.colors.context
    nodes.forEach(node => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.font = "7px monospace"
      ctx.fillText(node.label, node.x - 10, node.y - 8)
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1)
    }, 50)
    
    return () => clearInterval(interval)
  }, [])

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
    drawReasoningFlow(ctx, width, height)
    drawKnowledgeGraph(ctx, 20, height - 130)
  }, [activePhase, animationFrame])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />

      {/* Phase control */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {["Input", "Context", "Inference", "Output", "Feedback"].map((phase, index) => (
          <button
            key={phase}
            onClick={() => setActivePhase(index)}
            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
              activePhase === index
                ? "bg-indigo-500 text-white"
                : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Rule display */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs">
        <div className="font-bold text-indigo-400 mb-2">Active Inference Rule</div>
        {(() => {
          const rule = INFERENCE_RULES[activePhase % INFERENCE_RULES.length]
          return (
            <div>
              <div className="text-purple-300 mb-1">IF: {rule.premise}</div>
              <div className="text-pink-300 mb-1">THEN: {rule.conclusion}</div>
              <div className="text-gray-400">Confidence: {Math.round(rule.confidence * 100)}%</div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}