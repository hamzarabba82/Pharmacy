import { installMockInterceptor } from './data/mockInterceptor'
import client from './api/client'

installMockInterceptor(client)

await import('./main')
