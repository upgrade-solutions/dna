"use client"

import { useEffect, useRef } from "react"

interface StateNode {
  id: string
  label: string
  x: number
  y: number
  color: string
  isInitial?: boolean
  isFinal?: boolean
}

interface Transition {
  from: string
  to: string
  label: string
  curve?: number // curve amount for better spacing
}

interface StateMachineBlueprint {
  title: string
  states: StateNode[]
  transitions: Transition[]
}

const EXAMPLES: Record<string, StateMachineBlueprint> = {
  dataFetch: {
    title: "Data Fetch Lifecycle",
    states: [
      { id: "idle", label: "Idle", x: 80, y: 120, color: "#94a3b8", isInitial: true },
      { id: "loading", label: "Loading", x: 280, y: 60, color: "#3b82f6" },
      { id: "success", label: "Success", x: 480, y: 120, color: "#10b981", isFinal: true },
      { id: "error", label: "Error", x: 480, y: 180, color: "#ef4444", isFinal: true },
    ],
    transitions: [
      { from: "idle", to: "loading", label: "fetch()" },
      { from: "loading", to: "success", label: "response" },
      { from: "loading", to: "error", label: "failure" },
      { from: "error", to: "loading", label: "retry()" },
      { from: "success", to: "idle", label: "reset" },
    ],
  },
  formSubmission: {
    title: "Form Submission Flow",
    states: [
      { id: "pristine", label: "Pristine", x: 60, y: 120, color: "#94a3b8", isInitial: true },
      { id: "dirty", label: "Dirty", x: 200, y: 60, color: "#f59e0b" },
      { id: "validating", label: "Validating", x: 200, y: 180, color: "#3b82f6" },
      { id: "submitting", label: "Submitting", x: 360, y: 120, color: "#06b6d4" },
      { id: "success", label: "Success", x: 520, y: 120, color: "#10b981", isFinal: true },
      { id: "error", label: "Error", x: 520, y: 200, color: "#ef4444" },
    ],
    transitions: [
      { from: "pristine", to: "dirty", label: "change" },
      { from: "dirty", to: "validating", label: "blur" },
      { from: "validating", to: "dirty", label: "invalid" },
      { from: "dirty", to: "submitting", label: "submit" },
      { from: "validating", to: "submitting", label: "submit" },
      { from: "submitting", to: "success", label: "ok" },
      { from: "submitting", to: "error", label: "fail" },
      { from: "error", to: "dirty", label: "edit" },
    ],
  },
  userSession: {
    title: "User Session Management",
    states: [
      { id: "anonymous", label: "Anonymous", x: 80, y: 120, color: "#94a3b8", isInitial: true },
      { id: "authenticating", label: "Authenticating", x: 240, y: 120, color: "#3b82f6" },
      { id: "authenticated", label: "Authenticated", x: 400, y: 60, color: "#10b981" },
      { id: "refreshing", label: "Refreshing", x: 400, y: 180, color: "#06b6d4" },
      { id: "expired", label: "Expired", x: 560, y: 120, color: "#ef4444" },
      { id: "logged_out", label: "Logged Out", x: 720, y: 120, color: "#94a3b8", isFinal: true },
    ],
    transitions: [
      { from: "anonymous", to: "authenticating", label: "login" },
      { from: "authenticating", to: "authenticated", label: "ok" },
      { from: "authenticating", to: "anonymous", label: "fail" },
      { from: "authenticated", to: "refreshing", label: "expiring" },
      { from: "refreshing", to: "authenticated", label: "ok" },
      { from: "authenticated", to: "expired", label: "timeout" },
      { from: "expired", to: "authenticating", label: "login" },
      { from: "authenticated", to: "logged_out", label: "logout" },
      { from: "expired", to: "logged_out", label: "logout" },
    ],
  },
}

export function useStateMachineBlueprint(exampleKey: string = "dataFetch") {
  return EXAMPLES[exampleKey] || EXAMPLES.dataFetch
}

interface StateMachineBlueprintProps {
  example?: string
}

export function StateMachineBlueprint({ example = "dataFetch" }: StateMachineBlueprintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const machine = useStateMachineBlueprint(example)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const radius = 24

    // Blueprint background
    ctx.fillStyle = "#0a0f1a"
    ctx.fillRect(0, 0, width, height)

    // Grid pattern - subtle
    ctx.strokeStyle = "rgba(30, 58, 95, 0.3)"
    ctx.lineWidth = 0.5
    const gridSize = 40
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

    // Helper: Draw curved path between two states
    const drawTransition = (from: StateNode, to: StateNode, label: string) => {
      if (from === to) return // Skip self-loops for now

      const dx = to.x - from.x
      const dy = to.y - from.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)

      // Start and end points on circle edges
      const startX = from.x + Math.cos(angle) * radius
      const startY = from.y + Math.sin(angle) * radius
      const endX = to.x - Math.cos(angle) * radius
      const endY = to.y - Math.sin(angle) * radius

      // Determine if we need to curve (for multiple transitions between same states)
      const sameTransitionsCount = machine.transitions.filter(
        (t) => (t.from === from.id && t.to === to.id) || (t.from === to.id && t.to === from.id)
      ).length
      const transitionIndex = machine.transitions.findIndex(
        (t) => t.from === from.id && t.to === to.id
      )

      let path
      if (sameTransitionsCount > 1) {
        // Use quadratic curve for multiple transitions
        const curveAmount = 25 + transitionIndex * 15
        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2
        const perpX = -Math.sin(angle) * curveAmount
        const perpY = Math.cos(angle) * curveAmount
        const controlX = midX + perpX
        const controlY = midY + perpY

        ctx.strokeStyle = "rgba(6, 182, 212, 0.7)"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.quadraticCurveTo(controlX, controlY, endX, endY)
        ctx.stroke()
      } else {
        // Straight line
        ctx.strokeStyle = "rgba(6, 182, 212, 0.7)"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }

      // Draw arrow head
      ctx.fillStyle = "rgba(6, 182, 212, 0.7)"
      const arrowSize = 6
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
      )
      ctx.moveTo(endX, endY)
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      )
      ctx.stroke()

      // Draw label with background
      const midX = (startX + endX) / 2 + (sameTransitionsCount > 1 ? -Math.sin(angle) * 20 : 0)
      const midY = (startY + endY) / 2 + (sameTransitionsCount > 1 ? Math.cos(angle) * 20 : -12)

      ctx.font = "10px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const metrics = ctx.measureText(label)
      const textWidth = metrics.width
      const textHeight = 12

      // Background for label
      ctx.fillStyle = "#0a0f1a"
      ctx.fillRect(midX - textWidth / 2 - 4, midY - textHeight / 2 - 2, textWidth + 8, textHeight + 4)

      // Label text
      ctx.fillStyle = "#06b6d4"
      ctx.fillText(label, midX, midY)
    }

    // Draw all transitions
    machine.transitions.forEach((transition) => {
      const fromState = machine.states.find((s) => s.id === transition.from)
      const toState = machine.states.find((s) => s.id === transition.to)
      if (fromState && toState) {
        drawTransition(fromState, toState, transition.label)
      }
    })

    // Draw states
    machine.states.forEach((state) => {
      // State circle with border
      ctx.beginPath()
      ctx.arc(state.x, state.y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = state.color
      ctx.lineWidth = 2
      ctx.stroke()

      // Fill with transparency
      ctx.fillStyle = state.color + "15"
      ctx.fill()

      // Initial state indicator (small dot with arrow)
      if (state.isInitial) {
        ctx.fillStyle = state.color
        ctx.beginPath()
        ctx.arc(state.x - radius - 10, state.y, 3, 0, Math.PI * 2)
        ctx.fill()
        // Arrow to state
        ctx.beginPath()
        ctx.moveTo(state.x - radius - 6, state.y)
        ctx.lineTo(state.x - radius, state.y)
        ctx.stroke()
      }

      // Final state indicator (double circle)
      if (state.isFinal) {
        ctx.strokeStyle = state.color
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(state.x, state.y, radius + 6, 0, Math.PI * 2)
        ctx.stroke()
      }

      // State label
      ctx.fillStyle = state.color
      ctx.font = "bold 11px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(state.label, state.x, state.y)
    })
  }, [machine])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
