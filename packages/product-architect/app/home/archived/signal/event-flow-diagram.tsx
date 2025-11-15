'use client'

import { useEffect, useRef } from 'react'

interface EventFlowDiagramProps {
  phase: 'design' | 'build' | 'run'
}

export function EventFlowDiagram({ phase }: EventFlowDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    // Blueprint background
    ctx.fillStyle = '#0a0f1a'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Grid pattern
    ctx.strokeStyle = '#1e3a5f'
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

    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height / 2

    if (phase === 'design') {
      drawDesignPhase(ctx, width, height, centerX, centerY)
    } else if (phase === 'build') {
      drawBuildPhase(ctx, width, height, centerX, centerY)
    } else {
      drawRunPhase(ctx, width, height, centerX, centerY)
    }
  }, [phase])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  )
}

function drawDesignPhase(ctx: CanvasRenderingContext2D, width: number, height: number, centerX: number, centerY: number) {
  // Publishers on the left
  const pubY = height * 0.25
  drawBox(ctx, 30, pubY - 30, 80, 60, 'Publisher\nComponent', '#f59e0b', '#78350f')

  // Event Bus in the middle
  drawBox(ctx, centerX - 50, centerY - 40, 100, 80, 'Event\nTaxonomy', '#eab308', '#713f12')

  // Subscribers on the right
  const subY = height * 0.75
  drawBox(ctx, width - 110, subY - 30, 80, 60, 'Subscriber\nComponent', '#f59e0b', '#78350f')

  // Arrows showing event flow
  drawArrow(ctx, 110, pubY, centerX - 50, centerY, '#fbbf24', 2)
  drawArrow(ctx, centerX + 50, centerY, width - 110, subY, '#fbbf24', 2)

  // Event payload box
  drawBox(ctx, 30, height - 80, 120, 60, 'Event Schema\n{\n  type\n  payload\n  metadata\n}', '#f59e0b', '#78350f', 8)

  // Legend
  ctx.fillStyle = '#9ca3af'
  ctx.font = '11px monospace'
  ctx.fillText('Design: Map publishers, subscribers, and event types', 30, height - 10)
}

function drawBuildPhase(ctx: CanvasRenderingContext2D, width: number, height: number, centerX: number, centerY: number) {
  // Implementation layers
  const layers = [
    { y: height * 0.15, label: 'Event Bus\n(sync/async)', color: '#fbbf24', darkColor: '#78350f' },
    { y: height * 0.4, label: 'Listeners &\nHandlers', color: '#f59e0b', darkColor: '#78350f' },
    { y: height * 0.65, label: 'Error Handling\n& Retries', color: '#f97316', darkColor: '#7c2d12' },
  ]

  layers.forEach((layer, index) => {
    // Left side - sync
    drawBox(ctx, 40, layer.y - 30, 90, 60, `${layer.label}\n(Sync)`, layer.color, layer.darkColor, 8)

    // Right side - async
    drawBox(ctx, width - 130, layer.y - 30, 90, 60, `${layer.label}\n(Async)`, layer.color, layer.darkColor, 8)

    // Connection arrow
    drawArrow(ctx, 130, layer.y, width - 130, layer.y, '#fbbf24', 1.5)

    // Vertical flow arrow
    if (index < layers.length - 1) {
      ctx.strokeStyle = '#ea580c'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      drawArrow(ctx, centerX, layer.y + 35, centerX, layers[index + 1].y - 35, '#ea580c', 1.5)
      ctx.setLineDash([])
    }
  })

  // Legend
  ctx.fillStyle = '#9ca3af'
  ctx.font = '11px monospace'
  ctx.fillText('Build: Implement event infrastructure with sync/async patterns', 30, height - 10)
}

function drawRunPhase(ctx: CanvasRenderingContext2D, width: number, height: number, centerX: number, centerY: number) {
  // Event flow with monitoring
  const flowPoints = [
    { x: 50, y: height * 0.25, label: 'Event\nEmitted', color: '#eab308' },
    { x: centerX - 60, y: height * 0.4, label: 'In Transit\n(latency)', color: '#fbbf24' },
    { x: centerX + 60, y: height * 0.6, label: 'Processing\n(throughput)', color: '#f59e0b' },
    { x: width - 50, y: height * 0.75, label: 'Completed\n(metrics)', color: '#f97316' },
  ]

  // Draw monitoring dashboard
  drawBox(ctx, 30, height - 80, width - 60, 60, 'Real-time Telemetry\nEvents/sec | Latency | Errors | Success Rate', '#f59e0b', '#78350f', 8)

  // Draw flow path with circles
  flowPoints.forEach((point, index) => {
    // Circle for event
    ctx.fillStyle = point.color
    ctx.beginPath()
    ctx.arc(point.x, point.y, 12, 0, Math.PI * 2)
    ctx.fill()

    // Label
    ctx.fillStyle = '#e5e7eb'
    ctx.font = 'bold 9px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(point.label, point.x, point.y + 25)

    // Arrow to next point
    if (index < flowPoints.length - 1) {
      drawArrow(ctx, point.x + 15, point.y, flowPoints[index + 1].x - 15, flowPoints[index + 1].y, '#fbbf24', 2)
    }
  })

  // Feedback loop arrow
  ctx.strokeStyle = '#06b6d4'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.bezierCurveTo(width - 50, height * 0.75 - 30, width - 20, height * 0.4, 50, height * 0.25 - 30)
  ctx.stroke()
  ctx.setLineDash([])

  // Feedback label
  ctx.fillStyle = '#06b6d4'
  ctx.font = '10px monospace'
  ctx.fillText('Feedback', width - 80, height * 0.45)

  // Legend
  ctx.fillStyle = '#9ca3af'
  ctx.font = '11px monospace'
  ctx.fillText('Run: Monitor live events and feedback loops', 30, 15)
}

function drawBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  borderColor: string,
  fillColor: string,
  fontSize = 10
) {
  // Background
  ctx.fillStyle = fillColor
  ctx.fillRect(x, y, width, height)

  // Border
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, width, height)

  // Text
  ctx.fillStyle = '#e5e7eb'
  ctx.font = `bold ${fontSize}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const lines = label.split('\n')
  const lineHeight = height / (lines.length + 1)

  lines.forEach((line, index) => {
    ctx.fillText(line, x + width / 2, y + (index + 1) * lineHeight)
  })
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  lineWidth: number
) {
  const headlen = 10
  const angle = Math.atan2(toY - fromY, toX - fromX)

  // Line
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()

  // Arrowhead
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}
