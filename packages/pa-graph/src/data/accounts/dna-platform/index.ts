/**
 * DNA Platform Account
 */

import { dnaPlatformConfig } from './config'
import { dnaPlatformResources } from './resources'
import { getAccountTheme } from '../../themes/brand-mapper'

export const dnaPlatformTenant = {
  ...dnaPlatformConfig,
  get theme() {
    return getAccountTheme('dna-platform')
  },
  data: dnaPlatformResources
}
