"use client"

import { useEffect, useRef } from "react"

export function ThemeBlueprint() {
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

    // Theme variations showcase
    ctx.fillStyle = "#ec4899"
    ctx.font = "12px monospace"
    ctx.fillText("THEME VARIATIONS", 30, 30)

    // Light theme preview
    const lightX = 40
    const lightY = 50
    const themeWidth = 120
    const themeHeight = 80

    // Light theme background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(lightX, lightY, themeWidth, themeHeight)
    
    // Light theme elements
    ctx.fillStyle = "#1f2937"
    ctx.fillRect(lightX + 10, lightY + 10, themeWidth - 20, 15)
    ctx.fillStyle = "#3b82f6"
    ctx.fillRect(lightX + 10, lightY + 30, 40, 12)
    ctx.fillStyle = "#6b7280"
    ctx.fillRect(lightX + 10, lightY + 50, 60, 8)

    ctx.fillStyle = "#ec4899"
    ctx.font = "8px monospace"
    ctx.fillText("LIGHT", lightX, lightY + themeHeight + 15)

    // Dark theme preview
    const darkX = lightX + themeWidth + 30
    const darkY = lightY

    // Dark theme background
    ctx.fillStyle = "#111827"
    ctx.fillRect(darkX, darkY, themeWidth, themeHeight)
    
    // Dark theme elements
    ctx.fillStyle = "#f9fafb"
    ctx.fillRect(darkX + 10, darkY + 10, themeWidth - 20, 15)
    ctx.fillStyle = "#60a5fa"
    ctx.fillRect(darkX + 10, darkY + 30, 40, 12)
    ctx.fillStyle = "#9ca3af"
    ctx.fillRect(darkX + 10, darkY + 50, 60, 8)

    ctx.fillText("DARK", darkX, darkY + themeHeight + 15)

    // Custom theme preview
    const customX = darkX + themeWidth + 30
    const customY = darkY

    // Custom theme background
    ctx.fillStyle = "#fef3c7"
    ctx.fillRect(customX, customY, themeWidth, themeHeight)
    
    // Custom theme elements
    ctx.fillStyle = "#92400e"
    ctx.fillRect(customX + 10, customY + 10, themeWidth - 20, 15)
    ctx.fillStyle = "#d97706"
    ctx.fillRect(customX + 10, customY + 30, 40, 12)
    ctx.fillStyle = "#a3a3a3"
    ctx.fillRect(customX + 10, customY + 50, 60, 8)

    ctx.fillText("CUSTOM", customX, customY + themeHeight + 15)

    // Theme configuration panel
    const configY = 180
    ctx.fillStyle = "#f472b6"
    ctx.font = "10px monospace"
    ctx.fillText("THEME CONFIGURATION", 40, configY)

    const configOptions = [
      "• Primary Color: #3b82f6",
      "• Background: Auto-generated",
      "• Text Contrast: AAA Compliant",
      "• Component Variants: 12",
      "• CSS Variables: 48"
    ]

    configOptions.forEach((option, i) => {
      ctx.fillStyle = "#fbbf24"
      ctx.font = "8px monospace"
      ctx.fillText(option, 50, configY + 20 + (i * 12))
    })

    // Real-time preview area
    ctx.fillStyle = "#22d3ee"
    ctx.font = "10px monospace"
    ctx.fillText("LIVE PREVIEW", rect.width - 150, configY)

    // Mini component previews
    const previewX = rect.width - 140
    const previewStartY = configY + 20

    // Button preview
    ctx.fillStyle = "#3b82f6"
    ctx.fillRect(previewX, previewStartY, 50, 20)
    ctx.fillStyle = "#ffffff"
    ctx.font = "8px sans-serif"
    ctx.fillText("Button", previewX + 12, previewStartY + 12)

    // Input preview
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.strokeRect(previewX, previewStartY + 30, 80, 16)
    ctx.fillStyle = "#9ca3af"
    ctx.font = "7px sans-serif"
    ctx.fillText("Input field", previewX + 5, previewStartY + 40)

    // Card preview
    ctx.fillStyle = "#f9fafb"
    ctx.fillRect(previewX, previewStartY + 55, 70, 40)
    ctx.strokeStyle = "#e5e7eb"
    ctx.strokeRect(previewX, previewStartY + 55, 70, 40)

    // Accessibility indicators
    ctx.fillStyle = "#10b981"
    ctx.font = "8px monospace"
    ctx.fillText("ACCESSIBILITY", 40, rect.height - 50)
    ctx.fillText("✓ WCAG AA", 50, rect.height - 35)
    ctx.fillText("✓ Color Blind Safe", 50, rect.height - 22)

    // Export options
    ctx.fillStyle = "#8b5cf6"
    ctx.font = "8px monospace"
    ctx.fillText("EXPORT OPTIONS", rect.width - 150, rect.height - 50)
    ctx.fillText("• CSS Variables", rect.width - 140, rect.height - 35)
    ctx.fillText("• Tailwind Theme", rect.width - 140, rect.height - 22)

  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "crisp-edges" }} />
    </div>
  )
}