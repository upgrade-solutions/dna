/**
 * DNA Platform Account Configuration
 */

import { defaultStyles, defaultSettings } from '../../default-config'
import type { GraphStyles, TenantSettings } from '../../default-config'

export const dnaPlatformConfig = {
  id: 'dna-platform',
  name: 'DNA Platform',
  description: 'BizOps-as-Code platform architecture',
  
  styles: defaultStyles as GraphStyles,
  
  settings: defaultSettings as TenantSettings
}
