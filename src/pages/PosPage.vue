<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSales } from '../composables/useSales'
import { createSale } from '../services/orchestrator'
import { useInventoryStore } from '../stores/inventory'
import { useDebouncedSearch } from '../composables/useDebouncedSearch'
import { printInvoice } from '../services/posPrinter'
import BaseButton from '../components/ui/BaseButton.vue'
import PosSearchPanel from '../components/pos/PosSearchPanel.vue'
import PosCartPanel from '../components/pos/PosCartPanel.vue'
import PosQtyModal from '../components/pos/PosQtyModal.vue'
import PosCustomerModal from '../components/pos/PosCustomerModal.vue'
import { useToast } from '../composables/useToast'
import { getErrorMessage } from '../services/errorHandler'
import type { Customer, Medicine, Sale } from '../types'
import { getMedicines, getBatches } from '../api/medicines'
import { getCustomers } from '../api/customers'
import { Printer, X } from '@lucide/vue'

const { searchQuery, searchResults, searching, handleSearch } = useDebouncedSearch<Medicine>(
  async (q, signal) => {
    const res = await getMedicines({ search: q, limit: 10 }, signal)
    return res.data
  },
)
const { searchQuery: customerQuery, searchResults: customerResults, searching: customerSearching, handleSearch: customerSearch } = useDebouncedSearch<Customer>(
  async (q, signal) => {
    const res = await getCustomers({ search: q, limit: 10 }, signal)
    return res.data
  },
)
const toast = useToast()

const { cart, discount, subtotal, total, addToCart, updateQuantity, removeFromCart, clearCart, setDiscount, setBatchesForMedicine, hasValidBatches } = useSales()
const cartQtyByMedicineId = computed(() => {
  const map: Record<number, number> = {}
  for (const item of cart.value) {
    map[item.medicine.id] = (map[item.medicine.id] || 0) + item.quantity
  }
  return map
})
const loadingBatches = ref(false)
const loadedBatchesMedicineIds = ref<Set<number>>(new Set())

const selectedPayment = ref<'cash' | 'card' | 'network'>('cash')
const saving = ref(false)
const invoiceNumber = ref(`INV-${Date.now()}`)
const lastSale = ref<Sale | null>(null)

const showQtyModal = ref(false)
const qtyModalMedicine = ref<Medicine | null>(null)
const qtyInput = ref(1)

const selectedCustomer = ref<Customer | null>(null)
const showCustomerModal = ref(false)

const modalMaxQty = computed(() => {
  if (!qtyModalMedicine.value) return 0
  const inCart = cartQtyByMedicineId.value[qtyModalMedicine.value.id] || 0
  return Math.max(0, qtyModalMedicine.value.current_stock - inCart)
})

async function openQtyModal(medicine: Medicine) {
  if (medicine.current_stock <= 0) {
    toast.error('الدواء غير متوفر'); return
  }
  if (!loadedBatchesMedicineIds.value.has(medicine.id)) {
    loadingBatches.value = true
    try {
      const batches = await getBatches(medicine.id)
      setBatchesForMedicine(medicine.id, batches)
      loadedBatchesMedicineIds.value.add(medicine.id)
    } catch (err) { toast.error(getErrorMessage(err)); return }
    finally { loadingBatches.value = false }
  }
  if (!hasValidBatches(medicine.id)) {
    toast.error('الدواء غير متوفر — لا توجد دفعات صالحة للبيع'); return
  }
  qtyModalMedicine.value = medicine
  qtyInput.value = 1
  showQtyModal.value = true
}

function confirmAddToCart() {
  if (!qtyModalMedicine.value) return
  const result = addToCart(qtyModalMedicine.value, qtyInput.value)
  if ('error' in result) { toast.error(result.error); return }
  showQtyModal.value = false
  qtyModalMedicine.value = null
}

function handleDiscountChange(value: number) {
  const result = setDiscount(value)
  if ('error' in result) toast.error(result.error)
}

async function handleCheckout() {
  saving.value = true
  try {
    const inventoryStore = useInventoryStore()
    const sale = await createSale({
      items: cart.value.map((item) => ({ medicine_id: item.medicine.id, quantity: item.quantity, unit_price: item.unit_price, batch_id: item.batch_id })),
      discount: discount.value,
      payment_method: selectedPayment.value,
      customer_id: selectedCustomer.value?.id,
    }, (items) => inventoryStore.deductStock(items))
    lastSale.value = sale
    clearCart()
    loadedBatchesMedicineIds.value.clear()
    toast.success('تم إتمام البيع بنجاح')
  } catch (err) { toast.error(getErrorMessage(err)) }
  finally { saving.value = false }
}

function handleNewInvoice() {
  clearCart(); invoiceNumber.value = `INV-${Date.now()}`; lastSale.value = null; loadedBatchesMedicineIds.value.clear(); selectedCustomer.value = null
}
</script>

<template>
  <div class="pos">
    <div class="pos__header">
      <div class="pos__invoice-info">
        <span class="pos__invoice-label">فاتورة:</span>
        <span class="pos__invoice-number">{{ invoiceNumber }}</span>
      </div>
      <div class="pos__header-actions">
        <BaseButton label="إلغاء الفاتورة" variant="danger" size="sm" @click="handleNewInvoice" />
        <BaseButton label="فاتورة جديدة" variant="ghost" size="sm" @click="handleNewInvoice" />
      </div>
    </div>

    <div v-if="lastSale" class="pos__success">
      تم إتمام البيع بنجاح
      <div class="pos__success-actions">
        <BaseButton size="sm" variant="ghost" @click="printInvoice(lastSale)">
          <Printer :size="16" /> طباعة الفاتورة
        </BaseButton>
        <BaseButton label="فاتورة جديدة" size="sm" @click="handleNewInvoice" />
      </div>
    </div>

    <div class="pos__body">
      <PosSearchPanel
        :search-query="searchQuery"
        :search-results="searchResults"
        :searching="searching"
        :cart-qty-by-medicine-id="cartQtyByMedicineId"
        @update:search-query="searchQuery = $event"
        @search="handleSearch"
        @select-medicine="openQtyModal"
      />
      <div class="pos__customer-bar">
        <button class="pos__customer-btn" @click="showCustomerModal = true">
          {{ selectedCustomer ? selectedCustomer.name : 'اختيار عميل' }}
        </button>
        <button v-if="selectedCustomer" class="pos__customer-clear" @click="selectedCustomer = null">
          <X :size="14" />
        </button>
      </div>
      <PosCartPanel
        :cart="cart"
        :discount="discount"
        :subtotal="subtotal"
        :total="total"
        :selected-payment="selectedPayment"
        :saving="saving"
        @update:discount="handleDiscountChange"
        @update:selected-payment="selectedPayment = $event as 'cash' | 'card' | 'network'"
        @update-quantity="updateQuantity"
        @remove-from-cart="removeFromCart"
        @checkout="handleCheckout"
      />
    </div>

    <PosQtyModal
      :medicine="qtyModalMedicine"
      :quantity="qtyInput"
      :max-qty="modalMaxQty"
      @update:quantity="qtyInput = $event"
      @confirm="confirmAddToCart"
      @close="showQtyModal = false; qtyModalMedicine = null"
    />

    <PosCustomerModal
      v-if="showCustomerModal"
      :search-query="customerQuery"
      :search-results="customerResults"
      :searching="customerSearching"
      @update:search-query="customerQuery = $event"
      @search="customerSearch"
      @select="(c: Customer) => { selectedCustomer = c; showCustomerModal = false }"
      @close="showCustomerModal = false"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.pos {
  &__header { @include flex-between; margin-bottom: 1rem; padding: 0.75rem; background: $white; border-radius: $border-radius; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  &__header-actions { display: flex; gap: 0.5rem; }
  &__invoice-label { color: $gray-500; font-size: $font-size-sm; }
  &__invoice-number { font-weight: 700; margin-right: 0.5rem; }
  &__success { background: #dcfce7; color: $success-color; padding: 0.75rem; border-radius: $border-radius; margin-bottom: 1rem; text-align: center; font-weight: 600; }
  &__body { display: flex; gap: 1rem; }
  &__customer-bar { display: flex; align-items: center; gap: 0.25rem; }
  &__customer-btn { @include btn-base; background: white; border: 1px solid $gray-300; color: $gray-600; font-size: $font-size-sm; padding: 0.375rem 0.75rem; &:hover { border-color: $primary-color; color: $primary-color; } }
  &__customer-clear { background: none; border: none; color: $danger-color; cursor: pointer; font-size: $font-size-sm; padding: 0.25rem; }
}
</style>
