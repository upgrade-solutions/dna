/**
 * Perfected Claims Account
 */

import { perfectedClaimsConfig } from './config'
import { perfectedClaimsResources } from './resources'
import { getAccountTheme } from '../../themes/brand-mapper'
import type { TenantConfig } from '../../tenant-config'

export const perfectedClaimsTenant: TenantConfig = {
  ...perfectedClaimsConfig,
  get theme() {
    return getAccountTheme('perfected-claims')
  },
  data: perfectedClaimsResources
}
