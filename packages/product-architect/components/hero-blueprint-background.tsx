"use client"

import { useEffect, useRef } from "react"

export function HeroBlueprintBackground() {
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

    let animationFrame: number
    let offset = 0

    // Calculate centered positions for systems
    const systemWidth = 220
    const systemHeight = 140
    const rows = 2
    const cols = 3
    const horizontalSpacing = 340
    const verticalSpacing = 220
    
    // Calculate total width and height of the system grid
    const totalGridWidth = (cols - 1) * horizontalSpacing + systemWidth
    const totalGridHeight = (rows - 1) * verticalSpacing + systemHeight
    
    // Calculate starting position to center the grid
    const startX = (rect.width - totalGridWidth) / 2
    const startY = (rect.height - totalGridHeight) / 2
    
    const systems = [
      { x: startX, y: startY, width: systemWidth, height: systemHeight, label: "UI", color: "#06b6d4" },
      { x: startX + horizontalSpacing, y: startY, width: systemWidth, height: systemHeight, label: "API", color: "#3b82f6" },
      { x: startX + horizontalSpacing * 2, y: startY, width: systemWidth, height: systemHeight, label: "Database", color: "#10b981" },
      { x: startX, y: startY + verticalSpacing, width: systemWidth, height: systemHeight, label: "Auth", color: "#8b5cf6" },
      { x: startX + horizontalSpacing, y: startY + verticalSpacing, width: systemWidth, height: systemHeight, label: "Services", color: "#06b6d4" },
      { x: startX + horizontalSpacing * 2, y: startY + verticalSpacing, width: systemWidth, height: systemHeight, label: "Cache", color: "#f59e0b" },
    ]

    const connections = [
      { from: 0, to: 1 }, // UI → API
      { from: 1, to: 2 }, // API → Database
      { from: 3, to: 1 }, // Auth → API
      { from: 1, to: 4 }, // API → Services
      { from: 4, to: 5 }, // Services → Cache
    ]

    // Define workflow sequences
    const workflows = [
      [0, 1, 2], // UI → API → Database
      [3, 1, 4, 5], // Auth → API → Services → Cache
    ]

    const getConnectionPoint = (fromSys: typeof systems[0], toSys: typeof systems[0]) => {
      const fromCenterX = fromSys.x + fromSys.width / 2
      const fromCenterY = fromSys.y + fromSys.height / 2
      const toCenterX = toSys.x + toSys.width / 2
      const toCenterY = toSys.y + toSys.height / 2

      const dx = toCenterX - fromCenterX
      const dy = toCenterY - fromCenterY

      if (Math.abs(dx) > Math.abs(dy)) {
        const fromX = dx > 0 ? fromSys.x + fromSys.width : fromSys.x
        const fromY = fromCenterY
        const toX = dx > 0 ? toSys.x : toSys.x + toSys.width
        const toY = toCenterY
        return { fromX, fromY, toX, toY }
      } else {
        const fromX = fromCenterX
        const fromY = dy > 0 ? fromSys.y + fromSys.height : fromSys.y
        const toX = toCenterX
        const toY = dy > 0 ? toSys.y : toSys.y + toSys.height
        return { fromX, fromY, toX, toY }
      }
    }

    const animate = () => {
      // Background
      ctx.fillStyle = "#0a0f1a"
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Grid
      const gridSize = 30
      ctx.strokeStyle = "#1e3a5f"
      ctx.lineWidth = 0.5
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

      const workflowSpeed = 0.08
      const cycleDuration = 16000 // 16 seconds per complete cycle
      const currentTime = Date.now() % cycleDuration
      const cycleProgress = currentTime / cycleDuration

      // Draw systems with workflow-based highlighting
      systems.forEach((sys, idx) => {
        let targetIntensity = 0.3 // Base intensity
        let glowIntensity = 0

        // Check if this system is active in any workflow
        workflows.forEach((workflow, workflowIdx) => {
          const workflowStart = workflowIdx * 0.5 // Stagger workflows
          const stepDuration = 0.4 / workflow.length // Each step takes portion of cycle
          
          workflow.forEach((systemIdx, stepIdx) => {
            if (systemIdx === idx) {
              const stepStart = (workflowStart + stepIdx * stepDuration) % 1
              const stepEnd = (stepStart + stepDuration * 0.7) % 1
              const transitionDuration = stepDuration * 0.15 // 15% of step for fade in/out
              
              // Check for next step to determine when to fade out
              const isLastStep = stepIdx === workflow.length - 1
              const nextStepStart = isLastStep ? 
                (workflowStart) % 1 : // Loop back to beginning
                (stepStart + stepDuration) % 1
              
              let localProgress = 0
              let isInStep = false
              let shouldStayGlowing = false
              
              // Calculate if we're in this step and local progress
              if (stepStart < stepEnd) {
                if (cycleProgress >= stepStart && cycleProgress <= stepEnd) {
                  isInStep = true
                  localProgress = (cycleProgress - stepStart) / (stepEnd - stepStart)
                }
                // Check if we should stay glowing (until next step starts)
                if (cycleProgress >= stepStart && cycleProgress < nextStepStart) {
                  shouldStayGlowing = true
                }
              } else {
                if (cycleProgress >= stepStart || cycleProgress <= stepEnd) {
                  isInStep = true
                  localProgress = cycleProgress >= stepStart ? 
                    (cycleProgress - stepStart) / (1 - stepStart + stepEnd) :
                    (cycleProgress + 1 - stepStart) / (1 - stepStart + stepEnd)
                }
                // Handle wrap-around case for staying glowing
                if (cycleProgress >= stepStart || (nextStepStart > stepEnd && cycleProgress < nextStepStart)) {
                  shouldStayGlowing = true
                }
              }
              
              if (isInStep) {
                // Fade in at the beginning of the step
                const fadeInEnd = transitionDuration / (stepEnd - stepStart || 1)
                
                if (localProgress <= fadeInEnd) {
                  // Fade in
                  const fadeProgress = localProgress / fadeInEnd
                  targetIntensity = 0.3 + (0.6 * Math.sin(fadeProgress * Math.PI / 2))
                  glowIntensity = Math.sin(fadeProgress * Math.PI / 2)
                } else {
                  // Full intensity - stay at full until connection reaches next box
                  targetIntensity = 0.9
                  glowIntensity = 1
                }
              } else if (shouldStayGlowing) {
                // Keep glowing at full intensity until next step starts
                targetIntensity = 0.9
                glowIntensity = 1
              }
              
              // Only fade out when the next step is about to start
              if (shouldStayGlowing && !isInStep) {
                // Calculate distance to next step start for fade out
                let distanceToNext
                if (stepStart < nextStepStart) {
                  distanceToNext = nextStepStart - cycleProgress
                } else {
                  distanceToNext = cycleProgress <= nextStepStart ? 
                    nextStepStart - cycleProgress : 
                    (1 - cycleProgress) + nextStepStart
                }
                
                const fadeOutThreshold = stepDuration * 0.1 // Start fading 10% before next step
                if (distanceToNext <= fadeOutThreshold) {
                  const fadeProgress = (fadeOutThreshold - distanceToNext) / fadeOutThreshold
                  targetIntensity = 0.3 + (0.6 * Math.cos(fadeProgress * Math.PI / 2))
                  glowIntensity = Math.cos(fadeProgress * Math.PI / 2)
                }
              }
            }
          })
        })

        // Box with glow effect
        ctx.strokeStyle = sys.color
        ctx.lineWidth = 2
        ctx.globalAlpha = targetIntensity
        
        // Add glow effect when active
        if (glowIntensity > 0) {
          ctx.shadowColor = sys.color
          ctx.shadowBlur = 20 * glowIntensity
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }
        
        ctx.strokeRect(sys.x, sys.y, sys.width, sys.height)
        
        // Reset shadow
        ctx.shadowBlur = 0
        
        ctx.fillStyle = sys.color + (glowIntensity > 0.5 ? "25" : "10")
        ctx.fillRect(sys.x, sys.y, sys.width, sys.height)

        // Corner markers
        const markerSize = 12
        ctx.fillStyle = sys.color
        ctx.fillRect(sys.x - 1, sys.y - 1, markerSize, 2)
        ctx.fillRect(sys.x - 1, sys.y - 1, 2, markerSize)
        ctx.fillRect(sys.x + sys.width - markerSize + 1, sys.y - 1, markerSize, 2)
        ctx.fillRect(sys.x + sys.width - 1, sys.y - 1, 2, markerSize)

        // Centered text
        ctx.fillStyle = sys.color
        ctx.font = "20px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(sys.label, sys.x + sys.width / 2, sys.y + sys.height / 2)

        ctx.globalAlpha = 1
      })

      // Draw connections with workflow-based flow
      connections.forEach(({ from, to }) => {
        const fromSys = systems[from]
        const toSys = systems[to]
        const { fromX, fromY, toX, toY } = getConnectionPoint(fromSys, toSys)

        // Base connection line
        ctx.strokeStyle = `rgba(6, 182, 212, 0.15)`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.stroke()

        // Check if this connection is active in current workflow
        let isConnectionActive = false
        let flowProgress = 0

        workflows.forEach((workflow, workflowIdx) => {
          const workflowStart = workflowIdx * 0.5
          const stepDuration = 0.4 / workflow.length
          
          for (let i = 0; i < workflow.length - 1; i++) {
            if (workflow[i] === from && workflow[i + 1] === to) {
              const stepStart = (workflowStart + i * stepDuration) % 1
              const stepEnd = (stepStart + stepDuration) % 1
              
              if ((stepStart < stepEnd && cycleProgress >= stepStart && cycleProgress <= stepEnd) ||
                  (stepStart > stepEnd && (cycleProgress >= stepStart || cycleProgress <= stepEnd))) {
                isConnectionActive = true
                // Calculate flow progress within this step
                let localProgress
                if (stepStart < stepEnd) {
                  localProgress = (cycleProgress - stepStart) / (stepEnd - stepStart)
                } else {
                  localProgress = cycleProgress >= stepStart ? 
                    (cycleProgress - stepStart) / (1 - stepStart + stepEnd) :
                    (cycleProgress + 1 - stepStart) / (1 - stepStart + stepEnd)
                }
                flowProgress = Math.max(0, Math.min(1, localProgress))
              }
            }
          }
        })

        if (isConnectionActive) {
          // Active flowing connection
          const currentX = fromX + (toX - fromX) * flowProgress
          const currentY = fromY + (toY - fromY) * flowProgress

          ctx.strokeStyle = `rgba(6, 182, 212, 0.8)`
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(fromX, fromY)
          ctx.lineTo(currentX, currentY)
          ctx.stroke()

          // Flow indicator dot
          ctx.fillStyle = `rgba(6, 182, 212, 1)`
          ctx.beginPath()
          ctx.arc(currentX, currentY, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      offset += 0.02
      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  )
}
