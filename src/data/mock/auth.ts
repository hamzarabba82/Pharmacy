import { findMockUser, DEFAULT_USERS } from '../mockUsers'
import { encodeToken, decodeToken } from '../../config/permissions'
import { parseRequestData, okResponse } from './helpers'
import { AuthError } from '../../types/errors'
import type { MockState } from './state'

export function handleAuth(config: any, _state: MockState): boolean {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()

  if (url === '/auth/login' && method === 'post') {
    const { email, password } = parseRequestData(config.data)
    const user = findMockUser(email as string, password as string)
    if (user) {
      config.adapter = async () => ({
        data: { token: encodeToken(user), user },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
      })
    } else {
      config.adapter = async () => {
        throw new AuthError('بيانات الدخول غير صحيحة')
      }
    }
    return true
  }

  if (url === '/auth/me' && method === 'get') {
    const token = sessionStorage.getItem('token')
    if (!token) {
      return false
    }
    const decoded = decodeToken(token)
    if (decoded) {
      const found = DEFAULT_USERS.find((u) => u.id === decoded.id)
      if (found) {
        const { password: _, ...u } = found
        config.adapter = async () => okResponse(u, config)
        return true
      }
    }
  }

  return false
}
