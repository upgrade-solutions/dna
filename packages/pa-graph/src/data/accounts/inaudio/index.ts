/**
 * inAudio Account
 */

import { inAudioConfig } from './config'
import { inAudioResources } from './resources'
import { getAccountTheme } from '../../themes/brand-mapper'
import type { TenantConfig } from '../../tenant-config'

export const inAudioTenant: TenantConfig = {
  ...inAudioConfig,
  get theme() {
    return getAccountTheme('inaudio')
  },
  data: inAudioResources
}
