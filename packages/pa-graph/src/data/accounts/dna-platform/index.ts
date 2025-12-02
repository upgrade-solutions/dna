/**
 * DNA Platform Account
 */

import { dnaPlatformConfig } from './config'
import { dnaPlatformResources } from './resources'
import type { TenantConfig } from '../../tenant-config'

export const dnaPlatformTenant: TenantConfig = {
  ...dnaPlatformConfig,
  data: dnaPlatformResources
}
