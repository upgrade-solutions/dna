"use client"

import { useEffect, useRef } from "react"

export function StyleBlueprint() {
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

    // Color palette section
    ctx.strokeStyle = "#a855f7"
    ctx.lineWidth = 2
    ctx.setLineDash([3, 3])

    const paletteX = 40
    const paletteY = 40
    const colorWidth = 30
    const colorHeight = 40

    // Color swatches
    const colors = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]
    const colorLabels = ["Primary", "Accent", "Success", "Warning", "Error"]

    for (let i = 0; i < colors.length; i++) {
      const x = paletteX + i * (colorWidth + 10)
      
      // Color rectangle
      ctx.fillStyle = colors[i]
      ctx.fillRect(x, paletteY, colorWidth, colorHeight)
      
      // Border
      ctx.strokeStyle = "#a855f7"
      ctx.strokeRect(x, paletteY, colorWidth, colorHeight)
      
      // Label
      ctx.fillStyle = "#a855f7"
      ctx.font = "8px monospace"
      ctx.fillText(colorLabels[i], x, paletteY + colorHeight + 15)
    }

    // Typography scale
    const typographyX = paletteX
    const typographyY = 140
    
    ctx.fillStyle = "#e879f9"
    ctx.font = "10px monospace"
    ctx.fillText("TYPOGRAPHY SCALE", typographyX, typographyY)
    
    const fontSizes = [32, 24, 18, 16, 14, 12]
    const fontLabels = ["H1", "H2", "H3", "Body", "Small", "Caption"]
    
    for (let i = 0; i < fontSizes.length; i++) {
      const y = typographyY + 20 + (i * 25)
      
      // Sample text
      ctx.fillStyle = "#ffffff"
      ctx.font = `${fontSizes[i]}px serif`
      ctx.fillText("Aa", typographyX, y)
      
      // Label and size
      ctx.fillStyle = "#e879f9"
      ctx.font = "10px monospace"
      ctx.fillText(`${fontLabels[i]} ${fontSizes[i]}px`, typographyX + 50, y - 5)
    }

    // Component showcase
    const componentX = rect.width - 200
    const componentY = 40

    ctx.fillStyle = "#a855f7"
    ctx.font = "10px monospace"
    ctx.fillText("COMPONENT VARIANTS", componentX, componentY)

    // Button variations
    const buttonVariants = [
      { bg: "#3b82f6", text: "Primary", y: componentY + 30 },
      { bg: "transparent", text: "Secondary", y: componentY + 65, border: true },
      { bg: "#ef4444", text: "Destructive", y: componentY + 100 }
    ]

    buttonVariants.forEach(variant => {
      const buttonWidth = 100
      const buttonHeight = 25
      
      if (variant.bg !== "transparent") {
        ctx.fillStyle = variant.bg
        ctx.fillRect(componentX, variant.y, buttonWidth, buttonHeight)
      }
      
      if (variant.border) {
        ctx.strokeStyle = "#6b7280"
        ctx.setLineDash([])
        ctx.strokeRect(componentX, variant.y, buttonWidth, buttonHeight)
      }
      
      ctx.fillStyle = variant.bg === "transparent" ? "#ffffff" : "#ffffff"
      ctx.font = "12px sans-serif"
      ctx.fillText(variant.text, componentX + 10, variant.y + 16)
    })

    // Design tokens showcase
    const tokenY = rect.height - 100
    ctx.fillStyle = "#a855f7"
    ctx.font = "10px monospace"
    ctx.fillText("DESIGN TOKENS", paletteX, tokenY)

    const tokens = [
      "--primary: #3b82f6",
      "--radius: 8px", 
      "--spacing-lg: 24px",
      "--font-body: Inter"
    ]

    tokens.forEach((token, i) => {
      ctx.fillStyle = "#c084fc"
      ctx.font = "9px monospace"
      ctx.fillText(token, paletteX, tokenY + 15 + (i * 12))
    })

    // Connection lines showing relationships
    ctx.strokeStyle = "#c084fc"
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    // Line from color palette to components
    ctx.beginPath()
    ctx.moveTo(paletteX + colors.length * 40, paletteY + 20)
    ctx.lineTo(componentX - 20, componentY + 50)
    ctx.stroke()

    // Line from typography to tokens
    ctx.beginPath()
    ctx.moveTo(typographyX + 150, typographyY + 100)
    ctx.lineTo(paletteX + 100, tokenY)
    ctx.stroke()

    // Dimension annotations
    ctx.fillStyle = "#06b6d4"
    ctx.font = "8px monospace"
    ctx.fillText("• Auto-generated variants", componentX, componentY + 140)
    ctx.fillText("• Accessibility tested", componentX, componentY + 155)
    ctx.fillText("• Multi-format export", componentX, componentY + 170)

  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "crisp-edges" }} />
    </div>
  )
}