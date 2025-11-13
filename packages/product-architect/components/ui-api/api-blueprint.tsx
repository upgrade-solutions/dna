"use client"

import { useEffect, useRef, useState } from "react"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

interface ApiEndpoint {
  method: HttpMethod
  path: string
  request: string
  response: string
}

interface DrawingConfig {
  gridSize: number
  lineWidth: {
    grid: number
    border: number
    arrow: number
  }
  colors: {
    background: string
    grid: string
    client: string
    server: string
    request: string
    response: string
    methods: Record<HttpMethod, string>
  }
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/users",
    request: "{ name, email }",
    response: "{ id, created_at }",
  },
  {
    method: "GET",
    path: "/api/products",
    request: "?category=string",
    response: "{ items[], total }",
  },
  {
    method: "PUT",
    path: "/api/orders/:id",
    request: "{ status, items[] }",
    response: "{ updated_at }",
  },
]

const DRAWING_CONFIG: DrawingConfig = {
  gridSize: 20,
  lineWidth: {
    grid: 0.5,
    border: 2,
    arrow: 2,
  },
  colors: {
    background: "#0a0f1a",
    grid: "rgba(59, 130, 246, 0.1)",
    client: "#3b82f6",
    server: "#06b6d4",
    request: "#3b82f6",
    response: "#06b6d4",
    methods: {
      GET: "#10b981",
      POST: "#3b82f6",
      PUT: "#f59e0b",
      DELETE: "#ef4444",
    },
  },
}

export function APIBlueprint() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeEndpoint, setActiveEndpoint] = useState(0)

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

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    reverse = false
  ) => {
    ctx.strokeStyle = color
    ctx.lineWidth = DRAWING_CONFIG.lineWidth.arrow
    
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()

    // Arrow head
    const arrowSize = 10
    
    if (reverse) {
      // Response arrow: server to client (right to left)
      // Arrowhead at toX (client side) pointing left
      ctx.beginPath()
      ctx.moveTo(toX, toY)
      ctx.lineTo(toX + arrowSize, toY - 5)
      ctx.lineTo(toX + arrowSize, toY + 5)
      ctx.closePath()
    } else {
      // Request arrow: client to server (left to right)
      // Arrowhead at toX (server side) pointing right
      ctx.beginPath()
      ctx.moveTo(toX, toY)
      ctx.lineTo(toX - arrowSize, toY - 5)
      ctx.lineTo(toX - arrowSize, toY + 5)
      ctx.closePath()
    }
    
    ctx.fillStyle = color
    ctx.fill()
  }

  const drawBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    subtitle: string,
    color: string
  ) => {
    ctx.strokeStyle = color
    ctx.lineWidth = DRAWING_CONFIG.lineWidth.border
    ctx.strokeRect(x, y, width, height)
    
    ctx.fillStyle = color
    ctx.font = "12px monospace"
    ctx.fillText(title, x + 20, y + height / 2 - 5)
    
    ctx.font = "10px monospace"
    ctx.fillStyle = `${color}b3` // Add transparency
    ctx.fillText(subtitle, x + 15, y + height / 2 + 15)
  }

  const drawEndpointDetails = (
    ctx: CanvasRenderingContext2D,
    endpoint: ApiEndpoint,
    centerX: number,
    centerY: number,
    height: number
  ) => {
    // Method badge
    const methodColor = DRAWING_CONFIG.colors.methods[endpoint.method]
    ctx.fillStyle = methodColor
    ctx.fillRect(centerX - 60, 30, 50, 24)
    ctx.fillStyle = DRAWING_CONFIG.colors.background
    ctx.font = "bold 11px monospace"
    ctx.fillText(endpoint.method, centerX - 50, 47)

    // Path
    ctx.fillStyle = DRAWING_CONFIG.colors.client
    ctx.font = "12px monospace"
    ctx.fillText(endpoint.path, centerX - 5, 45)

    // Request spec
    ctx.fillStyle = `${DRAWING_CONFIG.colors.request}b3`
    ctx.font = "10px monospace"
    ctx.fillText("Request:", centerX - 60, centerY - 60)
    ctx.fillStyle = DRAWING_CONFIG.colors.request
    ctx.fillText(endpoint.request, centerX + 10, centerY - 60)

    // Response spec
    ctx.fillStyle = `${DRAWING_CONFIG.colors.response}b3`
    ctx.fillText("Response:", centerX - 60, centerY + 60)
    ctx.fillStyle = DRAWING_CONFIG.colors.response
    ctx.fillText(endpoint.response, centerX + 15, centerY + 60)
  }

  const drawTechnicalAnnotations = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    width: number
  ) => {
    ctx.fillStyle = `${DRAWING_CONFIG.colors.client}80`
    ctx.font = "8px monospace"
    ctx.fillText("HTTP/2", 20, centerY)
    ctx.fillText("JSON", width - 40, centerY)
    ctx.fillText("REST", centerX - 15, 70)
  }

  const drawDimensionLines = (
    ctx: CanvasRenderingContext2D,
    centerY: number,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = `${DRAWING_CONFIG.colors.client}4d`
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    // Vertical dimension line
    ctx.beginPath()
    ctx.moveTo(30, centerY - 40)
    ctx.lineTo(30, centerY + 40)
    ctx.stroke()

    // Horizontal dimension line
    ctx.beginPath()
    ctx.moveTo(50, height - 60)
    ctx.lineTo(width - 50, height - 60)
    ctx.stroke()

    ctx.setLineDash([])
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const setup = setupCanvas(canvas)
    if (!setup) return

    const { ctx, width, height } = setup
    const centerX = width / 2
    const centerY = height / 2
    const endpoint = ENDPOINTS[activeEndpoint]

    // Clear canvas
    ctx.fillStyle = DRAWING_CONFIG.colors.background
    ctx.fillRect(0, 0, width, height)

    // Draw all components
    drawGrid(ctx, width, height)
    
    // Draw client and server boxes
    drawBox(ctx, 50, centerY - 40, 120, 80, "CLIENT", "Browser/App", DRAWING_CONFIG.colors.client)
    drawBox(ctx, width - 170, centerY - 40, 120, 80, "SERVER", "API Gateway", DRAWING_CONFIG.colors.server)
    
    // Draw arrows and labels
    drawArrow(ctx, 170, centerY - 15, width - 170, centerY - 15, DRAWING_CONFIG.colors.request)
    drawArrow(ctx, width - 170, centerY + 15, 170, centerY + 15, DRAWING_CONFIG.colors.response, true)
    
    // Add labels
    ctx.fillStyle = DRAWING_CONFIG.colors.request
    ctx.font = "10px monospace"
    ctx.fillText("REQUEST", centerX - 30, centerY - 25)
    
    ctx.fillStyle = DRAWING_CONFIG.colors.response
    ctx.fillText("RESPONSE", centerX - 35, centerY + 30)
    
    // Draw endpoint details
    drawEndpointDetails(ctx, endpoint, centerX, centerY, height)
  }, [activeEndpoint])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />

      {/* Endpoint selector */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {ENDPOINTS.map((endpoint: ApiEndpoint, index: number) => (
          <button
            key={index}
            onClick={() => setActiveEndpoint(index)}
            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
              activeEndpoint === index ? "bg-blue-500 text-white" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            }`}
          >
            {endpoint.method}
          </button>
        ))}
      </div>
    </div>
  )
}
