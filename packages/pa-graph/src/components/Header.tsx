import type { TenantConfig } from '../data/tenant-config'
import { getThemedColors } from '../types/theme'

interface HeaderProps {
  tenant: TenantConfig
  onTenantChange: (tenant: TenantConfig) => void
  tenantOptions: TenantConfig[]
}

export function Header({ tenant, onTenantChange, tenantOptions }: HeaderProps) {
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
            background: 'transparent',
            color: tenant.id === option.id ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
            border: `1px solid ${tenant.id === option.id ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}`,
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
      <span style={{ 
        marginLeft: 'auto', 
        color: themed.header.textSecondary, 
        fontSize: '0.75rem',
        fontStyle: 'italic'
      }}>
        {tenant.description}
      </span>
    </div>
  )
}
