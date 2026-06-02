import { getMockStats } from '../../mockData'
import { requireAccess, okResponse } from '../helpers'
import type { MockState } from '../state'

export function handleDashboard(config: any, state: MockState): boolean {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()

  if (url === '/dashboard/stats' && method === 'get') {
    if (!requireAccess('dashboard', 'view', config)) return true
    config.adapter = async () => okResponse(getMockStats(), config)
    return true
  }

  return false
}
