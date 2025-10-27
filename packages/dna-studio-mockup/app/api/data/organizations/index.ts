// Auto-generated organization exports
// This file exports all organization data for easy importing
// Generated on: 2025-10-26T12:48:56.996Z

export { default as audiobookDistributionData } from './audiobook-distribution.json'
export { default as financialServicesDivisionData } from './financial-services-division.json'
export { default as perfectedClaimsData } from './perfected-claims.json'

// Organization data mapping
export const organizationFiles = {
  'audiobook-distribution': () => import('./audiobook-distribution.json'),
  'financial-services-division': () => import('./financial-services-division.json'),
  'perfected-claims': () => import('./perfected-claims.json')
}

// Get all organization data as an array
export const getAllOrganizations = async () => {
  const organizations = await Promise.all([
    import('./audiobook-distribution.json'),
    import('./financial-services-division.json'),
    import('./perfected-claims.json')
  ])
  
  return organizations.map((org, index) => ({
    key: `org${index + 1}`,
    data: org.default
  }))
}