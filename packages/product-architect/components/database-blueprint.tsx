"use client"

import { useEffect, useRef } from "react"

export function DatabaseBlueprint() {
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

    // Blueprint background
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

    // Draw tables
    const drawTable = (x: number, y: number, name: string, fields: string[], isPrimary = false) => {
      const width = 180
      const headerHeight = 35
      const rowHeight = 25
      const height = headerHeight + fields.length * rowHeight

      // Table shadow
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.fillRect(x + 3, y + 3, width, height)

      // Table border
      ctx.strokeStyle = isPrimary ? "#3b82f6" : "#06b6d4"
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, width, height)

      // Header
      ctx.fillStyle = isPrimary ? "rgba(59, 130, 246, 0.2)" : "rgba(6, 182, 212, 0.2)"
      ctx.fillRect(x, y, width, headerHeight)

      // Header text
      ctx.fillStyle = isPrimary ? "#3b82f6" : "#06b6d4"
      ctx.font = "bold 13px monospace"
      ctx.fillText(name, x + 10, y + 22)

      // Fields
      ctx.fillStyle = "#e2e8f0"
      ctx.font = "11px monospace"
      fields.forEach((field, i) => {
        const fieldY = y + headerHeight + i * rowHeight

        // Field separator
        ctx.strokeStyle = "#1e3a5f"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, fieldY)
        ctx.lineTo(x + width, fieldY)
        ctx.stroke()

        // Field text
        ctx.fillText(field, x + 10, fieldY + 17)
      })

      return { x, y, width, height }
    }

    // Draw relationships with better connector logic
    const drawRelationship = (
      from: { x: number; y: number; width: number; height: number },
      to: { x: number; y: number; width: number; height: number },
      offset = 0
    ) => {
      // Calculate optimal connection points
      const fromCenterX = from.x + from.width / 2
      const fromCenterY = from.y + from.height / 2
      const toCenterX = to.x + to.width / 2
      const toCenterY = to.y + to.height / 2

      let fromX, fromY, toX, toY

      // Determine best connection points based on relative positions
      if (Math.abs(fromCenterX - toCenterX) > Math.abs(fromCenterY - toCenterY)) {
        // Connect horizontally
        if (fromCenterX < toCenterX) {
          // from is left of to
          fromX = from.x + from.width
          fromY = from.y + from.height / 2 + offset * 10
          toX = to.x
          toY = to.y + to.height / 2 + offset * 10
        } else {
          // from is right of to
          fromX = from.x
          fromY = from.y + from.height / 2 + offset * 10
          toX = to.x + to.width
          toY = to.y + to.height / 2 + offset * 10
        }
      } else {
        // Connect vertically
        if (fromCenterY < toCenterY) {
          // from is above to
          fromX = from.x + from.width / 2 + offset * 15
          fromY = from.y + from.height
          toX = to.x + to.width / 2 + offset * 15
          toY = to.y
        } else {
          // from is below to
          fromX = from.x + from.width / 2 + offset * 15
          fromY = from.y
          toX = to.x + to.width / 2 + offset * 15
          toY = to.y + to.height
        }
      }

      ctx.strokeStyle = "#22d3ee"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      ctx.beginPath()
      ctx.moveTo(fromX, fromY)

      // Use different connection styles based on direction
      const dx = Math.abs(toX - fromX)
      const dy = Math.abs(toY - fromY)

      if (dx > dy && dx > 50) {
        // Horizontal connection with gentle curve
        const midX = (fromX + toX) / 2
        ctx.bezierCurveTo(midX, fromY, midX, toY, toX, toY)
      } else if (dy > 50) {
        // Vertical connection with gentle curve
        const midY = (fromY + toY) / 2
        ctx.bezierCurveTo(fromX, midY, toX, midY, toX, toY)
      } else {
        // Short direct connection
        ctx.lineTo(toX, toY)
      }
      
      ctx.stroke()

      // Draw arrow pointing toward 'to' table
      ctx.setLineDash([])
      const angle = Math.atan2(toY - fromY, toX - fromX)
      const arrowLength = 8
      
      ctx.beginPath()
      ctx.moveTo(toX, toY)
      ctx.lineTo(
        toX - arrowLength * Math.cos(angle - Math.PI / 6),
        toY - arrowLength * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        toX - arrowLength * Math.cos(angle + Math.PI / 6),
        toY - arrowLength * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fillStyle = "#22d3ee"
      ctx.fill()
    }

    // Draw database schema
    const users = drawTable(
      40,
      40,
      "users",
      ["id: uuid PK", "email: string", "name: string", "created_at: timestamp"],
      true,
    )
    const products = drawTable(280, 40, "products", [
      "id: uuid PK",
      "name: string",
      "price: decimal",
      "user_id: uuid FK",
    ])
    const orders = drawTable(40, 220, "orders", ["id: uuid PK", "user_id: uuid FK", "total: decimal", "status: enum"])
    const orderItems = drawTable(280, 220, "order_items", [
      "id: uuid PK",
      "order_id: uuid FK",
      "product_id: uuid FK",
      "quantity: int",
    ])

    // Draw relationships with proper offsets to avoid overlapping
    drawRelationship(users, orders, 0)
    drawRelationship(orders, orderItems, 0)
    drawRelationship(products, orderItems, 1)

    // Annotations positioned close to relationship lines
    ctx.fillStyle = "#3b82f6"
    ctx.font = "10px monospace"
    
    // Position annotations right next to the actual connection lines
    ctx.fillText("1:N", 150, 195)  // users -> orders (positioned on the line)
    ctx.fillText("1:N", 230, 270)  // orders -> order_items (positioned on the line)
    ctx.fillText("N:1", 340, 205)  // products -> order_items (positioned on the line)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
}
