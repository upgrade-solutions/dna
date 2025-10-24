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

    // Draw relationships
    const drawRelationship = (
      from: { x: number; y: number; width: number; height: number },
      to: { x: number; y: number; width: number; height: number },
    ) => {
      const fromX = from.x + from.width
      const fromY = from.y + from.height / 2
      const toX = to.x
      const toY = to.y + to.height / 2

      ctx.strokeStyle = "#22d3ee"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      ctx.beginPath()
      ctx.moveTo(fromX, fromY)

      // Draw curved connection
      const midX = (fromX + toX) / 2
      ctx.bezierCurveTo(midX, fromY, midX, toY, toX, toY)
      ctx.stroke()

      // Arrow
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(toX, toY)
      ctx.lineTo(toX - 8, toY - 5)
      ctx.lineTo(toX - 8, toY + 5)
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

    // Draw relationships
    drawRelationship(users, products)
    drawRelationship(users, orders)
    drawRelationship(orders, orderItems)
    drawRelationship(products, orderItems)

    // Annotations
    ctx.fillStyle = "#3b82f6"
    ctx.font = "10px monospace"
    ctx.fillText("1:N", 230, 80)
    ctx.fillText("1:N", 90, 210)
    ctx.fillText("1:N", 230, 260)
    ctx.fillText("N:1", 230, 300)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
}
