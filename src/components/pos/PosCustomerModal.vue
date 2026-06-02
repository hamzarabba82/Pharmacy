<script setup lang="ts">
import Spinner from '../ui/Spinner.vue'
import type { Customer } from '../../types'

defineProps<{
  searchQuery: string
  searchResults: Customer[]
  searching: boolean
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'search'): void
  (e: 'select', customer: Customer): void
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div class="pos-customer-modal__overlay" @click.self="emit('close')">
      <div class="pos-customer-modal">
        <h3>اختيار عميل</h3>
        <input
          :value="searchQuery"
          type="text"
          placeholder="ابحث بالاسم أو الهاتف..."
          class="pos-customer-modal__input"
          aria-label="بحث عن عميل"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value); emit('search')"
        >
        <Spinner v-if="searching" size="sm" />
        <div v-if="!searchResults.length && searchQuery && !searching" class="pos-customer-modal__empty">
          لا توجد نتائج
        </div>
        <div class="pos-customer-modal__results">
          <div
            v-for="c in searchResults"
            :key="c.id"
            class="pos-customer-modal__card"
            @click="emit('select', c)"
          >
            <div class="pos-customer-modal__name">
              {{ c.name }}
            </div>
            <div class="pos-customer-modal__detail">
              {{ c.phone || '—' }}
            </div>
          </div>
        </div>
        <button type="button" class="pos-customer-modal__skip" @click="emit('close')">
          تخطي — بدون عميل
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.pos-customer-modal {
  &__overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); @include flex-center; z-index: 1000; }
  background: white; border-radius: $border-radius-lg; padding: 1.5rem; min-width: 320px; max-width: 400px; text-align: center; display: flex; flex-direction: column; gap: 0.75rem;
  &__input { @include input-base; }
  &__empty { color: $gray-400; font-size: $font-size-sm; padding: 1rem; }
  &__results { max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.25rem; }
  &__card { padding: 0.5rem; border: 1px solid $gray-200; border-radius: $border-radius; cursor: pointer; display: flex; justify-content: space-between; align-items: center; &:hover { background: $gray-50; } }
  &__name { font-weight: 600; font-size: $font-size-sm; }
  &__detail { color: $gray-500; font-size: $font-size-xs; }
  &__skip { background: none; border: none; color: $gray-400; font-size: $font-size-sm; cursor: pointer; padding: 0.5rem; &:hover { color: $gray-600; } }
}
</style>
