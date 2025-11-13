"use client"

import { useEffect, useRef } from "react"

export function ArchitectureBlueprint() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Blueprint style
    ctx.fillStyle = "#0a0f1a"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Grid
    ctx.strokeStyle = "#1e3a5f"
    ctx.lineWidth = 0.5
    const gridSize = 20
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // System components
    const systems = [
      { x: 80, y: 80, width: 120, height: 80, label: "API Gateway", color: "#06b6d4" },
      { x: 80, y: 200, width: 120, height: 80, label: "Auth Service", color: "#3b82f6" },
      { x: 80, y: 320, width: 120, height: 80, label: "Analytics", color: "#8b5cf6" },
      { x: 280, y: 140, width: 120, height: 80, label: "App Service", color: "#06b6d4" },
      { x: 280, y: 260, width: 120, height: 80, label: "Worker Queue", color: "#3b82f6" },
      { x: 480, y: 80, width: 120, height: 80, label: "Database", color: "#10b981" },
      { x: 480, y: 200, width: 120, height: 80, label: "Cache", color: "#f59e0b" },
      { x: 480, y: 320, width: 120, height: 80, label: "Storage", color: "#ec4899" },
    ]

    // Draw connections
    const connections = [
      { from: 0, to: 3 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 3, to: 6 },
      { from: 4, to: 5 },
      { from: 4, to: 7 },
    ]

    ctx.strokeStyle = "#06b6d4"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    connections.forEach(({ from, to }) => {
      const fromSys = systems[from]
      const toSys = systems[to]
      ctx.beginPath()
      ctx.moveTo(fromSys.x + fromSys.width, fromSys.y + fromSys.height / 2)
      ctx.lineTo(toSys.x, toSys.y + toSys.height / 2)
      ctx.stroke()
    })
    ctx.setLineDash([])

    // Draw systems
    systems.forEach((sys) => {
      // System box
      ctx.strokeStyle = sys.color
      ctx.lineWidth = 2
      ctx.strokeRect(sys.x, sys.y, sys.width, sys.height)

      // Fill with slight transparency
      ctx.fillStyle = sys.color + "15"
      ctx.fillRect(sys.x, sys.y, sys.width, sys.height)

      // Label
      ctx.fillStyle = sys.color
      ctx.font = "12px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(sys.label, sys.x + sys.width / 2, sys.y + sys.height / 2)

      // Corner markers
      const markerSize = 6
      ctx.fillStyle = sys.color
      ctx.fillRect(sys.x - 1, sys.y - 1, markerSize, 2)
      ctx.fillRect(sys.x - 1, sys.y - 1, 2, markerSize)
      ctx.fillRect(sys.x + sys.width - markerSize + 1, sys.y - 1, markerSize, 2)
      ctx.fillRect(sys.x + sys.width - 1, sys.y - 1, 2, markerSize)
      ctx.fillRect(sys.x - 1, sys.y + sys.height - 1, markerSize, 2)
      ctx.fillRect(sys.x - 1, sys.y + sys.height - markerSize + 1, 2, markerSize)
      ctx.fillRect(sys.x + sys.width - markerSize + 1, sys.y + sys.height - 1, markerSize, 2)
      ctx.fillRect(sys.x + sys.width - 1, sys.y + sys.height - markerSize + 1, 2, markerSize)
    })

    // Annotations
    ctx.fillStyle = "#06b6d4"
    ctx.font = "10px monospace"
    ctx.textAlign = "left"
    ctx.fillText("Load Balancer", 85, 65)
    ctx.fillText("Microservices", 285, 125)
    ctx.fillText("Data Layer", 485, 65)

    // Dimension lines
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(70, 420)
    ctx.lineTo(610, 420)
    ctx.stroke()
    ctx.fillStyle = "#3b82f6"
    ctx.fillRect(68, 418, 4, 4)
    ctx.fillRect(608, 418, 4, 4)
    ctx.font = "9px monospace"
    ctx.textAlign = "center"
    ctx.fillText("540px", 340, 435)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
}
