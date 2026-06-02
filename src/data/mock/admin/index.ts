import { handleDashboard } from './dashboard'
import { handleUsers } from './users'
import { handleSettings } from './settings'
import { handleReports } from './reports'
import type { MockState } from '../state'

type Handler = (config: any, state: MockState) => boolean

const handlers: Handler[] = [
  handleDashboard,
  handleUsers,
  handleSettings,
  handleReports,
]

export function handleAdmin(config: any, state: MockState): boolean {
  for (const handler of handlers) {
    if (handler(config, state)) return true
  }
  return false
}
