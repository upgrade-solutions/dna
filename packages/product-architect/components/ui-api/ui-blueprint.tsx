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

    // Layout calculations
    const margin = 40
    const sidebarWidth = 200
    const gapBetween = 20
    const totalMargins = margin * 2
    const contentWidth = rect.width - totalMargins - sidebarWidth - gapBetween
    const headerWidth = rect.width - totalMargins

    // Header component
    ctx.strokeRect(margin, 40, headerWidth, 60)
    ctx.fillStyle = "#3b82f6"
    ctx.font = "12px monospace"
    ctx.fillText("HEADER", margin + 10, 60)
    ctx.fillText("h: 60px", margin + headerWidth - 60, 60)

    // Sidebar
    ctx.strokeRect(margin, 120, sidebarWidth, rect.height - 200)
    ctx.fillText("SIDEBAR", margin + 10, 140)
    ctx.fillText(`w: ${sidebarWidth}px`, margin + sidebarWidth - 70, 140)

    // Main content area
    const contentX = margin + sidebarWidth + gapBetween
    ctx.strokeRect(contentX, 120, contentWidth, rect.height - 200)
    ctx.fillText("CONTENT", contentX + 10, 140)
    ctx.fillText(`w: ${Math.round(contentWidth)}px`, contentX + contentWidth - 70, 140)

    // Dimension lines
    ctx.setLineDash([])
    ctx.strokeStyle = "#06b6d4"
    ctx.lineWidth = 1

    // Horizontal dimension
    const dimensionY = rect.height - 60
    ctx.beginPath()
    ctx.moveTo(margin, dimensionY)
    ctx.lineTo(rect.width - margin, dimensionY)
    ctx.stroke()

    // Arrows
    ctx.beginPath()
    ctx.moveTo(margin, dimensionY)
    ctx.lineTo(margin + 10, dimensionY - 5)
    ctx.lineTo(margin + 10, dimensionY + 5)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(rect.width - margin, dimensionY)
    ctx.lineTo(rect.width - margin - 10, dimensionY - 5)
    ctx.lineTo(rect.width - margin - 10, dimensionY + 5)
    ctx.closePath()
    ctx.fill()

    ctx.fillText(`${Math.round(headerWidth)}px`, rect.width / 2 - 30, dimensionY + 15)

    // Annotations
    ctx.fillStyle = "#06b6d4"
    ctx.font = "10px monospace"
    ctx.fillText("• Responsive Grid", contentX + 10, 160)
    ctx.fillText("• Flexbox Layout", contentX + 10, 180)
    ctx.fillText("• Mobile-First", contentX + 10, 200)
  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "crisp-edges" }} />
    </div>
  )
}
