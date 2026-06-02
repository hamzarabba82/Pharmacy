import axios from 'axios'
import { triggerUnauthorized } from '../services/navigation.service'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
})

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token')
      triggerUnauthorized()
    }
    return Promise.reject(error)
  },
)

export default client
