import type { TenantConfig } from '../types'

interface HeaderProps {
  tenant: TenantConfig
  onTenantChange: (tenant: TenantConfig) => void
  tenantOptions: TenantConfig[]
}

export function Header({ tenant, onTenantChange, tenantOptions }: HeaderProps) {
  return (
    <div style={{ 
      padding: '1rem', 
      background: '#1f2937', 
      borderBottom: '1px solid #374151',
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center'
    }}>
      <span style={{ color: '#9ca3af', marginRight: '0.5rem', fontSize: '0.875rem' }}>
        Account:
      </span>
      {tenantOptions.map((option) => (
        <button 
          key={option.id}
          onClick={() => onTenantChange(option)}
          style={{
            padding: '0.5rem 1rem',
            background: tenant.id === option.id ? '#3b82f6' : '#374151',
            color: '#ffffff',
            border: 'none',
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
        color: '#6b7280', 
        fontSize: '0.75rem',
        fontStyle: 'italic'
      }}>
        {tenant.description}
      </span>
    </div>
  )
}
