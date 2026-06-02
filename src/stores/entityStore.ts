import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FetchParams } from '../types'

interface EntityApi<T> {
  getAll(params?: FetchParams): Promise<{ data: T[]; total: number }>
  create(data: Partial<T>): Promise<T>
  update(id: number, data: Partial<T>): Promise<T>
}

export function defineEntityStore<T extends { is_active?: boolean }>(
  id: string,
  api: EntityApi<T>,
) {
  return defineStore(id, () => {
    const items = ref<T[]>([])
    const loading = ref(false)
    const total = ref(0)
    const error = ref('')

    async function fetchAll(params?: FetchParams) {
      loading.value = true
      error.value = ''
      try {
        const res = await api.getAll(params)
        items.value = res.data.filter(item => item.is_active !== false)
        total.value = res.total
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'فشل التحميل'
        throw err
      } finally {
        loading.value = false
      }
    }

    async function add(data: Partial<T>) {
      return await api.create({ ...data, is_active: true } as Partial<T>)
    }

    async function update(id: number, data: Partial<T>) {
      return await api.update(id, data)
    }

    async function remove(id: number) {
      await api.update(id, { is_active: false } as Partial<T>)
    }

    return { items, loading, total, error, fetchAll, add, update, remove }
  })
}
