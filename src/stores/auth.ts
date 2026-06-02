import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, getMe } from '../api/auth'
import { decodeToken, ROLE_PERMISSIONS } from '../config/permissions'
import { navigate } from '../services/navigation.service'
import { setOnUnauthorized } from '../services/navigation.service'
import type { User } from '../types'
import type { ResourceKey, Permission } from '../config/permissions'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(sessionStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref('')

  setOnUnauthorized(() => {
    token.value = null
    user.value = null
    sessionStorage.removeItem('token')
    navigate('/login')
  })

  const isAuthenticated = computed(() => !!token.value)

  const role = computed(() => {
    if (!token.value) return ''
    const decoded = decodeToken(token.value)
    return decoded?.role || user.value?.role || ''
  })

  function hasRole(r: string): boolean {
    return role.value === r
  }

  function hasPermission(resource: ResourceKey, action: Permission): boolean {
    if (!token.value) return false
    const decoded = decodeToken(token.value)
    if (!decoded) return false
    const perms = ROLE_PERMISSIONS[decoded.role]
    return perms?.[resource]?.includes(action) ?? false
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      const res = await apiLogin({ email, password })
      token.value = res.token
      user.value = res.user
      sessionStorage.setItem('token', res.token)
      return res
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'فشل تسجيل الدخول'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      user.value = await getMe()
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    sessionStorage.removeItem('token')
    navigate('/login')
  }

  return { token, user, loading, error, role, isAuthenticated, hasRole, hasPermission, login, fetchMe, logout }
})
