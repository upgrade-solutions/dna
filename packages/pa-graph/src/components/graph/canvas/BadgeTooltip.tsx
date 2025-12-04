import { useState, useEffect, useRef } from 'react'

interface TooltipPosition {
  x: number
  y: number
}

interface BadgeTooltipProps {
  content: string | null
  position: TooltipPosition | null
}

export function BadgeTooltip({ content, position }: BadgeTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (content && position) {
      // Small delay before showing tooltip
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(true)
      }, 300)
    } else {
      setIsVisible(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [content, position])

  if (!isVisible || !content || !position) {
    return null
  }

  return (
    <div
      className="badge-tooltip"
      style={{
        position: 'fixed',
        left: `${position.x - 25}px`,
        top: `${position.y - 50}px`,
        backgroundColor: '#1f2937',
        color: '#ffffff',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        border: '1px solid #374151',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        pointerEvents: 'none',
        zIndex: 10000,
        whiteSpace: 'nowrap',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      {content}
    </div>
  )
}
