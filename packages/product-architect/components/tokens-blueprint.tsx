"use client"

import { useEffect, useRef } from "react"

export function TokensBlueprint() {
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
    const gridSize = 15

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

    // Design tokens visualization
    ctx.fillStyle = "#f59e0b"
    ctx.font = "12px monospace"
    ctx.fillText("DESIGN TOKENS GENERATION", 30, 30)

    // Token categories
    const categories = [
      { name: "COLORS", x: 30, y: 60, tokens: ["primary", "secondary", "accent", "neutral"] },
      { name: "SPACING", x: 200, y: 60, tokens: ["xs", "sm", "md", "lg", "xl"] },
      { name: "TYPOGRAPHY", x: 350, y: 60, tokens: ["heading", "body", "caption"] },
      { name: "SHADOWS", x: 30, y: 160, tokens: ["sm", "md", "lg", "xl"] },
      { name: "RADIUS", x: 200, y: 160, tokens: ["none", "sm", "md", "full"] },
      { name: "BREAKPOINTS", x: 350, y: 160, tokens: ["sm", "md", "lg", "xl"] }
    ]

    categories.forEach(category => {
      // Category header
      ctx.fillStyle = "#f59e0b"
      ctx.font = "10px monospace"
      ctx.fillText(category.name, category.x, category.y)

      // Token items
      category.tokens.forEach((token, i) => {
        const tokenY = category.y + 20 + (i * 15)
        
        // Token indicator
        ctx.fillStyle = "#fbbf24"
        ctx.fillRect(category.x, tokenY - 8, 8, 8)
        
        // Token name
        ctx.fillStyle = "#fde68a"
        ctx.font = "9px monospace"
        ctx.fillText(`${category.name.toLowerCase()}-${token}`, category.x + 15, tokenY)
      })
    })

    // Export formats
    ctx.fillStyle = "#06b6d4"
    ctx.font = "10px monospace"
    ctx.fillText("EXPORT FORMATS", 30, rect.height - 80)

    const formats = [
      "CSS Custom Properties",
      "Tailwind Config",
      "JavaScript Tokens",
      "Figma Tokens",
      "SCSS Variables"
    ]

    formats.forEach((format, i) => {
      const formatY = rect.height - 60 + (i * 12)
      
      // Format icon
      ctx.fillStyle = "#22d3ee"
      ctx.fillRect(30, formatY - 6, 6, 6)
      
      // Format name
      ctx.fillStyle = "#67e8f9"
      ctx.font = "8px monospace"
      ctx.fillText(format, 45, formatY)
    })

    // Connection lines
    ctx.strokeStyle = "#fbbf24"
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    // Lines connecting token categories
    ctx.beginPath()
    ctx.moveTo(150, 100)
    ctx.lineTo(200, 100)
    ctx.moveTo(320, 100)
    ctx.lineTo(350, 100)
    ctx.stroke()

    // Automation indicators
    ctx.fillStyle = "#10b981"
    ctx.font = "8px monospace"
    ctx.fillText("• Auto-generated scales", rect.width - 150, 50)
    ctx.fillText("• Semantic naming", rect.width - 150, 65)
    ctx.fillText("• Cross-platform sync", rect.width - 150, 80)
    ctx.fillText("• Version control", rect.width - 150, 95)

  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "crisp-edges" }} />
    </div>
  )
}