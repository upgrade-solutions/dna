/**
 * Perfected Claims Account
 */

import { perfectedClaimsConfig } from './config'
import { perfectedClaimsResources } from './resources'
import type { TenantConfig } from '../../tenant-config'

export const perfectedClaimsTenant: TenantConfig = {
  ...perfectedClaimsConfig,
  data: perfectedClaimsResources
}
