import { defineEntityStore } from './entityStore'
import { getSuppliers, createSupplier, updateSupplier } from '../api/suppliers'
import type { Supplier } from '../types'

export const useSuppliersStore = defineEntityStore<Supplier>('suppliers', {
  getAll: getSuppliers,
  create: createSupplier,
  update: updateSupplier,
})
