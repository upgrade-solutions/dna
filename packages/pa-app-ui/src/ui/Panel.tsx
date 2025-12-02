import styles from './Panel.module.css'

interface PanelProps {
  title?: string
  children?: React.ReactNode
  className?: string
}

export function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <div className={`${styles.panel} ${className}`}>
      {title && (
        <div className={styles['panel-header']}>
          <h3>{title}</h3>
        </div>
      )}
      <div className={styles['panel-content']}>
        {children}
      </div>
    </div>
  )
}
