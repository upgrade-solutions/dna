import type { TenantConfig } from '../data/tenant-config'
import { getThemedColors } from '../types/theme'

interface HeaderProps {
  tenant: TenantConfig
  onTenantChange: (tenant: TenantConfig) => void
  tenantOptions: TenantConfig[]
  isDarkMode: boolean
  onThemeToggle: () => void
}

export function Header({ tenant, onTenantChange, tenantOptions, isDarkMode, onThemeToggle }: HeaderProps) {
  const themed = getThemedColors(tenant.theme)
  
  return (
    <div style={{ 
      padding: '1rem', 
      background: themed.header.background, 
      borderBottom: `1px solid ${themed.header.borderColor}`,
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center'
    }}>
      <span style={{ color: themed.header.textSecondary, marginRight: '0.5rem', fontSize: '0.875rem' }}>
        Account:
      </span>
      {tenantOptions.map((option) => (
        <button 
          key={option.id}
          onClick={() => onTenantChange(option)}
          style={{
            padding: '0.5rem 1rem',
            background: tenant.id === option.id ? themed.header.buttonActive : themed.header.buttonInactive,
            color: themed.header.buttonText,
            border: `1px solid ${tenant.id === option.id ? themed.header.buttonActive : themed.header.borderColor}`,
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: tenant.id === option.id ? '600' : '400',
            transition: 'all 0.2s'
          }}
        >
          {option.name}
        </button>
      ))}
      <button
        onClick={onThemeToggle}
        style={{
          marginLeft: 'auto',
          padding: '0.5rem',
          background: 'transparent',
          color: themed.header.text,
          border: `1px solid ${themed.header.borderColor}`,
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <img 
          src={isDarkMode 
            ? 'https://api.iconify.design/mdi/white-balance-sunny.svg?color=white'
            : `https://api.iconify.design/mdi/weather-night.svg?color=${encodeURIComponent(themed.header.text.replace('#', ''))}`
          } 
          alt={isDarkMode ? 'Light mode' : 'Dark mode'}
          style={{ width: '20px', height: '20px' }}
        />
      </button>
    </div>
  )
}
