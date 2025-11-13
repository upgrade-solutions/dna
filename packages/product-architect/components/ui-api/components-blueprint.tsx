"use client"

import { useEffect, useRef } from "react"

export function ComponentsBlueprint() {
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

    // Component library showcase
    ctx.fillStyle = "#22c55e"
    ctx.font = "12px monospace"
    ctx.fillText("COMPONENT LIBRARY", 30, 30)

    // Component categories
    const categories = [
      { name: "FORMS", x: 40, y: 60, components: ["Button", "Input", "Select", "Checkbox"] },
      { name: "LAYOUT", x: 200, y: 60, components: ["Card", "Modal", "Drawer", "Sheet"] },
      { name: "FEEDBACK", x: 360, y: 60, components: ["Alert", "Toast", "Badge", "Loader"] },
      { name: "DATA", x: 40, y: 160, components: ["Table", "List", "Tabs", "Accordion"] }
    ]

    categories.forEach(category => {
      // Category header
      ctx.fillStyle = "#22c55e"
      ctx.font = "10px monospace"
      ctx.fillText(category.name, category.x, category.y)

      // Component items with mini previews
      category.components.forEach((component, i) => {
        const compY = category.y + 20 + (i * 20)
        
        // Component mini preview based on type
        ctx.strokeStyle = "#4ade80"
        ctx.lineWidth = 1
        
        if (component === "Button") {
          ctx.fillStyle = "#3b82f6"
          ctx.fillRect(category.x, compY - 8, 40, 16)
          ctx.fillStyle = "#ffffff"
          ctx.font = "7px sans-serif"
          ctx.fillText("Button", category.x + 8, compY + 2)
        } else if (component === "Input") {
          ctx.strokeRect(category.x, compY - 8, 50, 16)
          ctx.fillStyle = "#9ca3af"
          ctx.font = "7px sans-serif"
          ctx.fillText("Input", category.x + 5, compY + 2)
        } else if (component === "Card") {
          ctx.fillStyle = "#f9fafb"
          ctx.fillRect(category.x, compY - 8, 45, 16)
          ctx.strokeRect(category.x, compY - 8, 45, 16)
        } else if (component === "Alert") {
          ctx.fillStyle = "#fef3c7"
          ctx.fillRect(category.x, compY - 8, 50, 16)
          ctx.strokeStyle = "#f59e0b"
          ctx.strokeRect(category.x, compY - 8, 50, 16)
        } else {
          // Generic component preview
          ctx.strokeRect(category.x, compY - 8, 40, 16)
        }
        
        // Component name
        ctx.fillStyle = "#86efac"
        ctx.font = "8px monospace"
        ctx.fillText(component, category.x + 60, compY)
      })
    })

    // Variant system
    ctx.fillStyle = "#06b6d4"
    ctx.font = "10px monospace"
    ctx.fillText("VARIANT SYSTEM", rect.width - 180, 60)

    const variants = ["size", "variant", "color", "state"]
    variants.forEach((variant, i) => {
      const variantY = 80 + (i * 15)
      
      ctx.fillStyle = "#0891b2"
      ctx.fillRect(rect.width - 170, variantY - 6, 6, 6)
      
      ctx.fillStyle = "#67e8f9"
      ctx.font = "8px monospace"
      ctx.fillText(variant, rect.width - 160, variantY)
    })

    // Code generation section
    ctx.fillStyle = "#8b5cf6"
    ctx.font = "10px monospace"
    ctx.fillText("CODE GENERATION", 40, rect.height - 80)

    const frameworks = ["React", "Vue", "Angular", "Svelte", "Web Components"]
    frameworks.forEach((framework, i) => {
      const frameworkY = rect.height - 60 + (i * 10)
      
      ctx.fillStyle = "#a78bfa"
      ctx.fillRect(50, frameworkY - 4, 4, 4)
      
      ctx.fillStyle = "#c4b5fd"
      ctx.font = "8px monospace"
      ctx.fillText(framework, 60, frameworkY)
    })

    // Documentation generation
    ctx.fillStyle = "#f59e0b"
    ctx.font = "8px monospace"
    ctx.fillText("AUTO-DOCUMENTATION", rect.width - 150, rect.height - 60)
    ctx.fillText("• PropTypes", rect.width - 140, rect.height - 45)
    ctx.fillText("• Examples", rect.width - 140, rect.height - 35)
    ctx.fillText("• Storybook", rect.width - 140, rect.height - 25)

    // Connection lines showing component relationships
    ctx.strokeStyle = "#4ade80"
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    // Connect categories
    ctx.beginPath()
    ctx.moveTo(150, 110)
    ctx.lineTo(200, 110)
    ctx.moveTo(310, 110)
    ctx.lineTo(360, 110)
    ctx.stroke()

    // Testing indicators
    ctx.fillStyle = "#ef4444"
    ctx.font = "8px monospace"
    ctx.fillText("TESTING", rect.width - 180, 160)
    ctx.fillText("• Unit Tests", rect.width - 170, 175)
    ctx.fillText("• Visual Tests", rect.width - 170, 185)
    ctx.fillText("• A11y Tests", rect.width - 170, 195)

  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "crisp-edges" }} />
    </div>
  )
}