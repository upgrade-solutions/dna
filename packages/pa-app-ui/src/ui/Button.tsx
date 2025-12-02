interface ButtonProps {
  label: string
  onClick?: () => void
  icon?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
}

export function Button({ 
  label, 
  onClick, 
  icon, 
  variant = 'secondary',
  disabled = false 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={`icon icon-${icon}`}>{icon}</span>}
      <span>{label}</span>
    </button>
  )
}
