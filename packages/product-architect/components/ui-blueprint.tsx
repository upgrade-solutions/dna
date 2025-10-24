"use client"

import { useEffect, useRef } from "react"

export function UIBlueprint() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    canvas.style.width = rect.width + "px"
    canvas.style.height = rect.height + "px"

    // Blueprint background
    ctx.fillStyle = "#0a1628"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Grid pattern
    ctx.strokeStyle = "#1e3a5f"
    ctx.lineWidth = 0.5
    const gridSize = 20

    for (let x = 0; x <= rect.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }

    for (let y = 0; y <= rect.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Blueprint style - UI components
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    // Header component
    ctx.strokeRect(40, 40, rect.width - 80, 60)
    ctx.fillStyle = "#3b82f6"
    ctx.font = "12px monospace"
    ctx.fillText("HEADER", 50, 30)
    ctx.fillText("h: 60px", rect.width - 120, 30)

    // Sidebar
    ctx.strokeRect(40, 120, 200, rect.height - 200)
    ctx.fillText("SIDEBAR", 50, 110)
    ctx.fillText("w: 200px", 50, rect.height - 70)

    // Main content area
    ctx.strokeRect(260, 120, rect.width - 320, rect.height - 200)
    ctx.fillText("CONTENT", 270, 110)
    ctx.fillText(`w: ${Math.round(rect.width - 320)}px`, rect.width - 180, 110)

    // Dimension lines
    ctx.setLineDash([])
    ctx.strokeStyle = "#06b6d4"
    ctx.lineWidth = 1

    // Horizontal dimension
    ctx.beginPath()
    ctx.moveTo(40, rect.height - 30)
    ctx.lineTo(rect.width - 40, rect.height - 30)
    ctx.stroke()

    // Arrows
    ctx.beginPath()
    ctx.moveTo(40, rect.height - 30)
    ctx.lineTo(50, rect.height - 35)
    ctx.lineTo(50, rect.height - 25)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(rect.width - 40, rect.height - 30)
    ctx.lineTo(rect.width - 50, rect.height - 35)
    ctx.lineTo(rect.width - 50, rect.height - 25)
    ctx.closePath()
    ctx.fill()

    ctx.fillText(`${Math.round(rect.width - 80)}px`, rect.width / 2 - 30, rect.height - 15)

    // Annotations
    ctx.fillStyle = "#06b6d4"
    ctx.font = "10px monospace"
    ctx.fillText("• Responsive Grid", 270, 140)
    ctx.fillText("• Flexbox Layout", 270, 160)
    ctx.fillText("• Mobile-First", 270, 180)
  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "crisp-edges" }} />
    </div>
  )
}
