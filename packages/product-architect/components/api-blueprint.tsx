"use client"

import { useEffect, useRef, useState } from "react"

export function APIBlueprint() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeEndpoint, setActiveEndpoint] = useState(0)

  const endpoints = [
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

    const width = rect.width
    const height = rect.height

    // Clear canvas
    ctx.fillStyle = "#0a0f1a"
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = "rgba(59, 130, 246, 0.1)"
    ctx.lineWidth = 0.5
    const gridSize = 20

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw API flow diagram
    const centerX = width / 2
    const centerY = height / 2

    // Client box
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.strokeRect(50, centerY - 40, 120, 80)
    ctx.fillStyle = "#3b82f6"
    ctx.font = "12px monospace"
    ctx.fillText("CLIENT", 70, centerY - 10)
    ctx.font = "10px monospace"
    ctx.fillStyle = "rgba(59, 130, 246, 0.7)"
    ctx.fillText("Browser/App", 65, centerY + 10)

    // Server box
    ctx.strokeStyle = "#06b6d4"
    ctx.lineWidth = 2
    ctx.strokeRect(width - 170, centerY - 40, 120, 80)
    ctx.fillStyle = "#06b6d4"
    ctx.font = "12px monospace"
    ctx.fillText("SERVER", width - 150, centerY - 10)
    ctx.font = "10px monospace"
    ctx.fillStyle = "rgba(6, 182, 212, 0.7)"
    ctx.fillText("API Gateway", width - 155, centerY + 10)

    // Request arrow
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(170, centerY - 15)
    ctx.lineTo(width - 170, centerY - 15)
    ctx.stroke()

    // Arrow head
    ctx.beginPath()
    ctx.moveTo(width - 170, centerY - 15)
    ctx.lineTo(width - 180, centerY - 20)
    ctx.lineTo(width - 180, centerY - 10)
    ctx.closePath()
    ctx.fillStyle = "#3b82f6"
    ctx.fill()

    // Request label
    ctx.fillStyle = "#3b82f6"
    ctx.font = "10px monospace"
    ctx.fillText("REQUEST", centerX - 30, centerY - 25)

    // Response arrow
    ctx.strokeStyle = "#06b6d4"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(width - 170, centerY + 15)
    ctx.lineTo(170, centerY + 15)
    ctx.stroke()

    // Arrow head
    ctx.beginPath()
    ctx.moveTo(170, centerY + 15)
    ctx.lineTo(180, centerY + 10)
    ctx.lineTo(180, centerY + 20)
    ctx.closePath()
    ctx.fillStyle = "#06b6d4"
    ctx.fill()

    // Response label
    ctx.fillStyle = "#06b6d4"
    ctx.font = "10px monospace"
    ctx.fillText("RESPONSE", centerX - 35, centerY + 30)

    // Draw endpoint details
    const endpoint = endpoints[activeEndpoint]

    // Method badge
    const methodColors: Record<string, string> = {
      GET: "#10b981",
      POST: "#3b82f6",
      PUT: "#f59e0b",
      DELETE: "#ef4444",
    }

    ctx.fillStyle = methodColors[endpoint.method] || "#3b82f6"
    ctx.fillRect(centerX - 60, 30, 50, 24)
    ctx.fillStyle = "#0a0f1a"
    ctx.font = "bold 11px monospace"
    ctx.fillText(endpoint.method, centerX - 50, 47)

    // Path
    ctx.fillStyle = "#3b82f6"
    ctx.font = "12px monospace"
    ctx.fillText(endpoint.path, centerX - 5, 45)

    // Request spec
    ctx.fillStyle = "rgba(59, 130, 246, 0.7)"
    ctx.font = "10px monospace"
    ctx.fillText("Request:", centerX - 60, centerY - 60)
    ctx.fillStyle = "#3b82f6"
    ctx.fillText(endpoint.request, centerX + 10, centerY - 60)

    // Response spec
    ctx.fillStyle = "rgba(6, 182, 212, 0.7)"
    ctx.fillText("Response:", centerX - 60, height - 30)
    ctx.fillStyle = "#06b6d4"
    ctx.fillText(endpoint.response, centerX + 15, height - 30)

    // Draw dimension lines
    ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"
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

    // Add technical annotations
    ctx.fillStyle = "rgba(59, 130, 246, 0.5)"
    ctx.font = "8px monospace"
    ctx.fillText("HTTP/2", 20, centerY)
    ctx.fillText("JSON", width - 40, centerY)
    ctx.fillText("REST", centerX - 15, 70)
  }, [activeEndpoint])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />

      {/* Endpoint selector */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {endpoints.map((endpoint, index) => (
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
