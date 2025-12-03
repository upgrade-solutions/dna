/**
 * inAudio Account
 */

import { inAudioConfig } from './config'
import { inAudioResources } from './resources'
import type { TenantConfig } from '../../tenant-config'

export const inAudioTenant: TenantConfig = {
  ...inAudioConfig,
  data: inAudioResources
}
