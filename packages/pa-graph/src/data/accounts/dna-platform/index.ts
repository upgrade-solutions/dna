/**
 * DNA Platform Account
 */

import { dnaPlatformConfig } from './config'
import { dnaPlatformResources } from './resources'

export const dnaPlatformTenant = {
  ...dnaPlatformConfig,
  data: dnaPlatformResources
}
