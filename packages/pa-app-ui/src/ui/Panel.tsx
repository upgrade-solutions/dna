interface PanelProps {
  title?: string
  children?: React.ReactNode
  className?: string
}

export function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <div className={`panel ${className}`}>
      {title && (
        <div className="panel-header">
          <h3>{title}</h3>
        </div>
      )}
      <div className="panel-content">
        {children}
      </div>
    </div>
  )
}
