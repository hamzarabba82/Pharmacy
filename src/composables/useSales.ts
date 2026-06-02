import { ref, computed } from 'vue'
import type { Medicine, Batch } from '../types'
import { allocateQuantityFIFO } from '../utils/batchAllocation'
import { validateStock } from '../services/inventory.service'

export interface CartItem {
  id: string // temporary unique id
  medicine: Medicine
  quantity: number
  unit_price: number
  total_price: number
  batch_id: number
}

export function useSales() {
  const cart = ref<CartItem[]>([])
  const discount = ref(0)

  // Temporary state for batch availability during the POS session
  // Key: medicine_id, Value: array of batches with available quantity (we will mutate the quantity field)
  const batchAvailability = new Map<number, Batch[]>()

  let idCounter = 0

  function getBatchAvailability(medicineId: number): Batch[] {
    return batchAvailability.get(medicineId) || []
  }

  function hasValidBatches(medicineId: number): boolean {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const batches = batchAvailability.get(medicineId)
    if (!batches) return false
    return batches.some(b => b.quantity > 0 && new Date(b.expiry_date) >= today)
  }

  function returnQuantityToBatch(medicineId: number, batchId: number, qty: number): void {
    const batches = getBatchAvailability(medicineId)
    const batch = batches.find(b => b.id === batchId)
    if (batch) batch.quantity += qty
  }

  const subtotal = computed(() =>
    cart.value.reduce((sum, item) => sum + item.total_price, 0),
  )

  const total = computed(() => Math.max(0, subtotal.value - discount.value))

  const itemCount = computed(() =>
    cart.value.reduce((sum, item) => sum + item.quantity, 0),
  )

function setBatchesForMedicine(medicineId: number, batches: Batch[]): void {
  batchAvailability.set(medicineId, batches.map(b => ({ ...b })))
}

function addToCart(medicine: Medicine, quantity: number = 1): { success: true } | { error: string } {
      try {
        // Account for quantity already allocated in cart
        const alreadyInCart = cart.value
          .filter(item => item.medicine.id === medicine.id)
          .reduce((sum, item) => sum + item.quantity, 0)
        validateStock(medicine, quantity, medicine.current_stock - alreadyInCart)
      } catch (err: unknown) {
        if (err instanceof Error) return { error: err.message }
        return { error: 'فشل التحقق من صحة البيانات' }
      }

      try {
        // Get batches for this medicine from temporary availability state
        const batches = batchAvailability.get(medicine.id)
        if (!batches) {
          throw new Error(`Batch availability not loaded for medicine ${medicine.id}`)
        }

        // Use utility function for FIFO allocation
        const allocations = allocateQuantityFIFO([...batches], quantity)

        // For each allocation, try to merge with existing cart item (same medicine and batch)
        for (const allocation of allocations) {
          const existingItemIndex = cart.value.findIndex(
            item => item.medicine.id === medicine.id && item.batch_id === allocation.batch_id
          )

          if (existingItemIndex >= 0) {
            // Update existing item
            const existingItem = cart.value[existingItemIndex]
            const newQuantity = existingItem.quantity + allocation.quantity
            existingItem.quantity = newQuantity
            existingItem.total_price = newQuantity * medicine.sale_price
          } else {
            // Push new item
            idCounter++
            cart.value.push({
              id: `${medicine.id}-${allocation.batch_id}-${Date.now()}-${idCounter}`,
              medicine,
              quantity: allocation.quantity,
              unit_price: medicine.sale_price,
              total_price: allocation.quantity * medicine.sale_price,
              batch_id: allocation.batch_id,
            })
          }
        }

        return { success: true }
      } catch (error: unknown) {
        if (error instanceof Error) {
          return { error: error.message }
        }
        return { error: 'An unknown error occurred' }
      }
    }

  function updateQuantity(cartItemId: string, newQuantity: number): { success: true } | { error: string } {
      const item = cart.value.find(i => i.id === cartItemId)
      if (!item) return { error: 'الصنف غير موجود في السلة' }

      if (newQuantity <= 0) {
        returnQuantityToBatch(item.medicine.id, item.batch_id, item.quantity)
        const idx = cart.value.indexOf(item)
        if (idx >= 0) cart.value.splice(idx, 1)
        return { success: true }
      }

      const diff = newQuantity - item.quantity
      const batches = batchAvailability.get(item.medicine.id)
      const batch = batches?.find(b => b.id === item.batch_id)
      if (!batch) return { error: 'الدفعة غير متوفرة' }

      if (diff > 0) {
        if (batch.quantity < diff) {
          return { error: `الكمية المطلوبة غير متوفرة في الدفعة (المتبقي: ${batch.quantity})` }
        }
        batch.quantity -= diff
      } else if (diff < 0) {
        batch.quantity += Math.abs(diff)
      }

      item.quantity = newQuantity
      item.total_price = newQuantity * item.unit_price
      return { success: true }
    }

  function removeFromCart(cartItemId: string): void {
    const cartItemIndex = cart.value.findIndex(item => item.id === cartItemId)
    if (cartItemIndex === -1) return

    const oldItem = cart.value[cartItemIndex]
    returnQuantityToBatch(oldItem.medicine.id, oldItem.batch_id, oldItem.quantity)
    cart.value.splice(cartItemIndex, 1)
  }

  function clearCart(): void {
    cart.value = []
    discount.value = 0
    // Clear the batch availability for the new invoice
    batchAvailability.clear()
  }

  function setDiscount(value: number): { success: true } | { error: string } {
    if (value < 0) return { error: 'الخصم لا يمكن أن يكون سالباً' }
    if (value >= subtotal.value) return { error: 'الخصم لا يمكن أن يساوي أو يتجاوز الإجمالي' }
    discount.value = value
    return { success: true }
  }

  return { 
    cart, 
    discount, 
    subtotal, 
    total, 
    itemCount, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    setDiscount,
    setBatchesForMedicine,
    hasValidBatches,
  }
}