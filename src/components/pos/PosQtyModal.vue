<script setup lang="ts">
import BaseButton from '../ui/BaseButton.vue'
import type { Medicine } from '../../types'

defineProps<{
  medicine: Medicine | null
  quantity: number
  maxQty: number
}>()

const emit = defineEmits<{
  (e: 'update:quantity', val: number): void
  (e: 'confirm'): void
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="medicine" class="pos-modal__overlay" @click.self="emit('close')">
      <div class="pos-modal">
        <h3>تحديد الكمية</h3>
        <p class="pos-modal__medicine">
          {{ medicine.name }}
        </p>
        <p class="pos-modal__price">
          {{ (medicine.sale_price * quantity).toFixed(2) }} ر.س
        </p>
        <div class="pos-modal__controls">
          <button type="button" class="pos-modal__btn" aria-label="إنقاص الكمية" @click="emit('update:quantity', Math.max(1, quantity - 1))">
            −
          </button>
          <input :value="quantity" type="number" min="1" :max="maxQty" class="pos-modal__input" aria-label="الكمية المطلوبة" @input="emit('update:quantity', Number(($event.target as HTMLInputElement).value))">
          <button type="button" class="pos-modal__btn" aria-label="زيادة الكمية" @click="emit('update:quantity', Math.min(maxQty || 1, quantity + 1))">
            +
          </button>
        </div>
        <p v-if="quantity > maxQty" class="pos-modal__error">
          الحد الأقصى: {{ maxQty }}
        </p>
        <div class="pos-modal__actions">
          <BaseButton label="إضافة للسلة" type="button" @click="emit('confirm')" />
          <BaseButton label="إلغاء" variant="ghost" type="button" @click="emit('close')" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.pos-modal {
  &__overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); @include flex-center; z-index: 1000; }
  background: white; border-radius: $border-radius-lg; padding: 2rem; min-width: 300px; text-align: center; display: flex; flex-direction: column; gap: 1rem;
  &__medicine { font-weight: 600; font-size: $font-size-lg; }
  &__price { color: $primary-color; font-size: $font-size-xl; font-weight: 700; }
  &__controls { display: flex; align-items: center; justify-content: center; gap: 1rem; }
  &__btn { width: 40px; height: 40px; border: 1px solid $gray-300; border-radius: $border-radius; background: white; font-size: $font-size-2xl; cursor: pointer; @include flex-center; &:hover { background: $gray-100; } }
  &__input { width: 80px; text-align: center; font-size: $font-size-2xl; font-weight: 700; border: none; border-bottom: 2px solid $primary-color; padding: 0.25rem; }
  &__error { color: $danger-color; font-size: $font-size-sm; }
  &__actions { display: flex; gap: 0.75rem; justify-content: center; }
}
</style>
