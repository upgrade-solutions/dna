/**
 * Maps resource types to their corresponding icon URLs
 */
export const resourceTypeIconMap: Record<string, string> = {
  // Inspector dropdown values
  'web-application': 'https://api.iconify.design/mdi/web.svg?color=white',
  api: 'https://api.iconify.design/mdi/api.svg?color=white',
  database: 'https://api.iconify.design/mdi/database.svg?color=white',
  service: 'https://api.iconify.design/mdi/cog.svg?color=white',
  file: 'https://api.iconify.design/mdi/file.svg?color=white',
  queue: 'https://api.iconify.design/mdi/inbox-multiple.svg?color=white',
  cache: 'https://api.iconify.design/mdi/database-clock.svg?color=white',
  storage: 'https://api.iconify.design/mdi/harddisk.svg?color=white',
  other: 'https://api.iconify.design/mdi/cube-outline.svg?color=white',
  
  // Original resource type values from data
  'form-component': 'https://api.iconify.design/mdi/form-select.svg?color=white',
  'ui-component': 'https://api.iconify.design/mdi/view-dashboard.svg?color=white'
}

/**
 * Get the icon URL for a given resource type
 */
export function getIconForResourceType(resourceType: string): string {
  return resourceTypeIconMap[resourceType.toLowerCase()] || resourceTypeIconMap.other
}
