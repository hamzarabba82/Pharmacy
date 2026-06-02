import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUsers, createUser, updateUser, deleteUser } from '../api/auth'
import type { User, FetchParams } from '../types'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const total = ref(0)
  const error = ref('')

  async function fetchAll(params?: FetchParams) {
    loading.value = true
    error.value = ''
    try {
      const res = await getUsers(params)
      users.value = res.data
      total.value = res.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'فشل تحميل المستخدمين'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function add(data: Partial<User>) {
    return await createUser(data)
  }

  async function update(id: number, data: Partial<User>) {
    return await updateUser(id, data)
  }

  async function remove(id: number) {
    await deleteUser(id)
  }

  return { users, loading, total, error, fetchAll, add, update, remove }
})
