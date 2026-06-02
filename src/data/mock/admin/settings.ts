import { parseRequestData, requireAccess, okResponse } from '../helpers'
import type { MockState } from '../state'

export function handleSettings(config: any, state: MockState): boolean {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()

  if (url === '/settings' && method === 'get') {
    if (!requireAccess('settings', 'view', config)) return true
    config.adapter = async () => okResponse(state.settings, config)
    return true
  }

  if (url === '/settings' && method === 'put') {
    if (!requireAccess('settings', 'edit', config)) return true
    const data = parseRequestData(config.data) as Record<string, string>
    state.settings = { ...state.settings, ...data }
    config.adapter = async () => okResponse({}, config)
    return true
  }

  return false
}
