import { useState, useRef, useEffect, useCallback } from 'react'
import { dia } from '@joint/plus'
import type { Theme } from '../../../types/theme'
import { getThemedColors } from '../../../types/theme'

// Note: format might not be available in trial version
// Fallback to paper.toSVG() and other methods
let format: any
try {
  format = require('@joint/plus').format
} catch (e) {
  console.warn('Format export not available in this JointJS version')
}

// Export icon
const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

export interface ExportControlProps {
  paper: dia.Paper | null
  theme: Theme
}

export type ExportFormat = 'png' | 'jpeg' | 'svg' | 'print'

interface ExportOption {
  id: ExportFormat
  label: string
}

const exportOptions: ExportOption[] = [
  { id: 'png', label: 'PNG' },
  { id: 'jpeg', label: 'JPEG' },
  { id: 'svg', label: 'SVG' },
  { id: 'print', label: 'Print' }
]

export function ExportControl({ paper, theme }: ExportControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const themed = getThemedColors(theme)

  // Update dropdown position when opening
  const handleToggleDropdown = useCallback(() => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      })
    }
    setIsOpen(!isOpen)
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const downloadFile = (data: string, filename: string, mimeType: string) => {
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async (exportFormat: ExportFormat) => {
    if (!paper) return

    setIsOpen(false)

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      
      // Check if format module is available
      if (!format) {
        console.error('Export functionality requires JointJS+ format module')
        alert('Export functionality is not available. This feature requires the full JointJS+ license.')
        return
      }

      console.log('Exporting as:', exportFormat)
      
      switch (exportFormat) {
        case 'png':
          format.toPNG(paper, (imageData: string) => {
            const link = document.createElement('a')
            link.href = imageData
            link.download = `diagram-${timestamp}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }, {
            padding: 10,
            backgroundColor: theme.id === 'dark' ? '#1a1a1a' : '#ffffff'
          })
          break

        case 'jpeg':
          format.toJPEG(paper, (imageData: string) => {
            const link = document.createElement('a')
            link.href = imageData
            link.download = `diagram-${timestamp}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }, {
            padding: 10,
            quality: 0.9,
            backgroundColor: theme.id === 'dark' ? '#1a1a1a' : '#ffffff'
          })
          break

        case 'svg':
          format.toSVG(paper, (svgString: string) => {
            downloadFile(svgString, `diagram-${timestamp}.svg`, 'image/svg+xml')
          }, {
            preserveDimensions: true,
            convertImagesToDataUris: true,
            useComputedStyles: false,
            stylesheet: ''
          })
          break

        case 'print':
          format.print(paper, {
            padding: 10,
            sheet: {
              width: 297,  // A4 width in mm
              height: 210  // A4 height in mm
            },
            poster: false,
            margin: 1,
            marginUnit: 'in',
            ready: (pages, printAction) => {
              // Apply styling to pages before printing
              pages.forEach((pageEl) => {
                pageEl.style.border = '1px solid #ddd'
                pageEl.style.backgroundColor = theme.id === 'dark' ? '#1a1a1a' : '#ffffff'
              })
              printAction(pages)
            }
          })
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        disabled={!paper}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: isOpen ? themed.toolbar.buttonBackgroundHover : themed.toolbar.buttonBackground,
          border: 'none',
          borderRadius: '4px',
          color: themed.toolbar.buttonText,
          cursor: paper ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          fontSize: '12px',
          fontWeight: '500',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          if (paper && !isOpen) {
            e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
            e.currentTarget.style.color = themed.toolbar.buttonTextHover
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = themed.toolbar.buttonBackground
            e.currentTarget.style.color = themed.toolbar.buttonText
          }
        }}
        title="Export diagram"
      >
        <ExportIcon />
        <span>Export</span>
        <div style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          <ChevronDownIcon />
        </div>
      </button>

      {isOpen && paper && (
        <div
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            minWidth: '200px',
            background: themed.toolbar.background,
            border: `1px solid ${themed.toolbar.borderColor}`,
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
            padding: '8px 0 0 0'
          }}
        >
          {/* Header */}
          <div style={{ 
            padding: '8px 12px',
            borderBottom: `1px solid ${themed.toolbar.borderColor}`,
            marginBottom: '4px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: themed.toolbar.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Export Format
            </div>
          </div>

          {/* Export Options */}
          <div style={{ padding: '4px 8px' }}>
            {exportOptions.map((option) => (
              <div
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  background: 'transparent',
                  borderRadius: '4px',
                  margin: '2px 0',
                }}
                onClick={() => handleExport(option.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ 
                  flex: 1, 
                  fontSize: '13px',
                  color: themed.toolbar.text,
                }}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
