import type { AxiosInstance } from 'axios'
import { createMockState } from './state'
import type { MockState } from './state'
import { handleAuth } from './auth'
import { handleInventory } from './inventory'
import { handleCategories } from './categories'
import { handleParties } from './parties'
import { handleTransactions } from './transactions'
import { handleAdmin } from './admin'

type Handler = (config: any, state: MockState) => boolean

const handlers: Handler[] = [
  handleAuth,
  handleInventory,
  handleCategories,
  handleParties,
  handleTransactions,
  handleAdmin,
]

export function installMockInterceptor(client: AxiosInstance) {
  const state = createMockState()

  client.interceptors.request.use(async (config) => {
    config.params = config.params || {}
    for (const handler of handlers) {
      if (handler(config, state)) return config
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // إذا كان هناك خطأ محاكاة في الاستجابة، رفض الوعد لمحاكاة سلوك axios الحقيقي
      if (error.response) {
        return Promise.reject(error)
      }
      return Promise.reject(error)
    }
  )
}
