/**
 * Utility functions for batch allocation algorithms
 */

/**
 * Allocate a quantity from batches in FIFO (First In, First Out) order
 * @param batches Array of batches with quantity and expiry_date
 * @param quantity The quantity to allocate
 * @returns Array of allocations, each containing { batch_id, quantity }
 * @throws Error if insufficient stock in batches
 */
export function allocateQuantityFIFO(batches: { id: number; quantity: number; expiry_date: string }[], quantity: number): { batch_id: number; quantity: number }[] {
  if (quantity <= 0) {
    return []
  }

  // Filter batches with available quantity > 0 and not expired
  // Sort by expiry_date ascending (earliest first)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const availableBatches = batches
    .filter(batch => batch.quantity > 0 && new Date(batch.expiry_date) >= today)
    .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())

  const allocations: { batch_id: number; quantity: number }[] = []
  let remaining = quantity

  for (const batch of availableBatches) {
    if (remaining <= 0) break
    const take = Math.min(batch.quantity, remaining)
    allocations.push({ batch_id: batch.id, quantity: take })
    batch.quantity -= take // update the temporary availability
    remaining -= take
  }

  if (remaining > 0) {
    // We could not fulfill the full quantity
    throw new Error(`الكمية المطلوبة (${quantity}) غير متوفرة في الدفعات`)
  }

  return allocations
}

/**
 * Check if medicine is expired based on expiry_date or is_fully_expired flag
 * @param medicine Medicine object to check
 * @returns true if medicine is expired, false otherwise
 */
export function isMedicineExpired(medicine: { expiry_date?: string; is_fully_expired?: boolean }): boolean {
  // If explicitly marked as fully expired
  if (medicine.is_fully_expired) return true
  // If expiry_date is set and is in the past
  if (medicine.expiry_date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(medicine.expiry_date)
    return expiry < today
  }
  return false
}