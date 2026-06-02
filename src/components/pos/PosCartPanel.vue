<script setup lang="ts">
import BaseButton from '../ui/BaseButton.vue'
import { PAYMENT_OPTIONS } from '../../utils/constants'
import type { CartItem } from '../../composables/useSales'
import { Trash2 } from '@lucide/vue'

defineProps<{
  cart: CartItem[]
  discount: number
  subtotal: number
  total: number
  selectedPayment: string
  saving: boolean
}>()

const emit = defineEmits<{
  (e: 'update:discount', val: number): void
  (e: 'update:selectedPayment', val: string): void
  (e: 'updateQuantity', id: string, qty: number): void
  (e: 'removeFromCart', id: string): void
  (e: 'checkout'): void
}>()
</script>

<template>
  <div class="pos-cart">
    <h3 class="pos-cart__title">
      سلة المشتريات
    </h3>

    <div v-if="!cart?.length" class="pos-cart__empty">
      السلة فارغة — ابحث وأضف أدوية
    </div>

    <div v-else class="pos-cart__items">
      <div v-for="item in cart" :key="item.id" class="pos-cart__item">
        <div class="pos-cart__item-info">
          <div class="pos-cart__item-name">
            {{ item.medicine.name }}
          </div>
          <div class="pos-cart__item-price">
            {{ item.unit_price?.toFixed(2) }} ر.س
          </div>
        </div>
        <div class="pos-cart__item-controls">
          <button type="button" class="pos-cart__qty-btn" aria-label="إنقاص الكمية" @click="emit('updateQuantity', item.id, item.quantity - 1)">
            −
          </button>
          <span class="pos-cart__qty-val">{{ item.quantity }}</span>
          <button type="button" class="pos-cart__qty-btn" aria-label="زيادة الكمية" @click="emit('updateQuantity', item.id, item.quantity + 1)">
            +
          </button>
          <button type="button" class="pos-cart__remove-btn" aria-label="حذف الصنف" @click="emit('removeFromCart', item.id)">
            <Trash2 :size="14" />
          </button>
        </div>
        <div class="pos-cart__item-total">
          {{ item.total_price?.toFixed(2) }} ر.س
        </div>
      </div>
    </div>

    <div class="pos-cart__summary">
      <div class="pos-cart__row">
        <span>المجموع</span><span>{{ subtotal.toFixed(2) }} ر.س</span>
      </div>
      <div class="pos-cart__row">
        <span>الخصم</span>
        <input :value="discount" type="number" class="pos-cart__discount" min="0" aria-label="قيمة الخصم" @input="emit('update:discount', Number(($event.target as HTMLInputElement).value))">
      </div>
      <div class="pos-cart__row pos-cart__row--total">
        <span>الإجمالي</span><span>{{ total.toFixed(2) }} ر.س</span>
      </div>
    </div>

    <div class="pos-cart__payment">
      <select :value="selectedPayment" class="pos-cart__payment-select" aria-label="طريقة الدفع" @change="emit('update:selectedPayment', ($event.target as HTMLSelectElement).value)">
        <option v-for="opt in PAYMENT_OPTIONS" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <BaseButton label="إتمام البيع" variant="success" size="lg" :disabled="!cart?.length" :loading="saving" @click="emit('checkout')" />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.pos-cart {
  flex: 1; @include card; display: flex; flex-direction: column; gap: 0.75rem;
  position: sticky; top: 1rem; align-self: flex-start;
  &__title { font-size: $font-size-lg; margin: 0; }
  &__empty { text-align: center; color: $gray-400; padding: 2rem; }
  &__items { display: flex; flex-direction: column; gap: 0.5rem; max-height: 40vh; overflow-y: auto; }
  &__item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: $gray-50; border-radius: $border-radius-sm; }
  &__item-info { flex: 1; }
  &__item-name { font-size: $font-size-sm; font-weight: 600; }
  &__item-price { font-size: $font-size-xs; color: $gray-500; }
  &__item-controls { display: flex; align-items: center; gap: 0.25rem; }
  &__qty-btn { width: 28px; height: 28px; border: 1px solid $gray-300; background: white; border-radius: $border-radius-sm; cursor: pointer; font-size: $font-size-lg; @include flex-center; }
  &__qty-val { min-width: 24px; text-align: center; font-weight: 600; }
  &__remove-btn { background: none; border: none; cursor: pointer; font-size: $font-size-sm; padding: 0.25rem; }
  &__item-total { font-weight: 700; min-width: 70px; text-align: left; }
  &__summary { border-top: 1px solid $gray-200; padding-top: 0.75rem; }
  &__row { @include flex-between; padding: 0.25rem 0; font-size: $font-size-sm; }
  &__row--total { font-size: $font-size-lg; font-weight: 700; color: $primary-color; border-top: 1px solid $gray-200; margin-top: 0.5rem; padding-top: 0.5rem; }
  &__discount { width: 80px; text-align: center; padding: 0.25rem; border: 1px solid $gray-300; border-radius: $border-radius-sm; }
  &__payment-select { width: 100%; padding: 0.5rem; border: 1px solid $gray-300; border-radius: $border-radius; font-size: $font-size-base; }
}
</style>
