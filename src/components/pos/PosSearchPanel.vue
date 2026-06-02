<script setup lang="ts">
import Spinner from '../ui/Spinner.vue'
import type { Medicine } from '../../types'
import { isMedicineExpired } from '../../utils/batchAllocation'

defineProps<{
  searchQuery: string
  searchResults: Medicine[] | null
  searching: boolean
  cartQtyByMedicineId: Record<number, number>
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'search'): void
  (e: 'selectMedicine', med: Medicine): void
}>()

function remainingStock(med: Medicine, cartQty: Record<number, number>): number {
  const inCart = cartQty[med.id] || 0
  return Math.max(0, med.current_stock - inCart)
}

function isUnavailable(med: Medicine, cartQty: Record<number, number>): boolean {
  return remainingStock(med, cartQty) <= 0 || isMedicineExpired(med)
}
</script>

<template>
  <div class="pos-search">
    <div class="pos-search__wrapper">
      <input
        :value="searchQuery"
        type="text"
        placeholder="ابحث عن دواء بالاسم أو الباركود..."
        class="pos-search__input"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value); emit('search')"
      >
      <Spinner v-if="searching" size="sm" />
    </div>

    <div class="pos-search__results">
      <div v-if="!searchResults?.length && !searching && !searchQuery" class="pos-search__empty">
        ابحث عن دواء لإضافته للسلة
      </div>
      <div v-if="!searchResults?.length && !searching && searchQuery" class="pos-search__empty">
        لا توجد أدوية تطابق بحثك
      </div>
      <div
        v-for="med in searchResults"
        :key="med.id"
        class="pos-search__card"
        :class="{ 'pos-search__card--out': isUnavailable(med, cartQtyByMedicineId) }"
        @click="emit('selectMedicine', med)"
      >
        <div class="pos-search__info">
          <div class="pos-search__name">
            {{ med.name }}
          </div>
          <div class="pos-search__price">
            {{ med.sale_price?.toFixed(2) }} ر.س
          </div>
        </div>
        <span v-if="isUnavailable(med, cartQtyByMedicineId)" class="pos-search__stock">غير متوفر</span>
        <span v-else class="pos-search__avail">متوفر: {{ remainingStock(med, cartQtyByMedicineId) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.pos-search {
  flex: 2;
  &__wrapper { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
  &__input { @include input-base; font-size: $font-size-lg; padding: 0.75rem; }
  &__results { display: flex; flex-direction: column; gap: 0.5rem; max-height: 60vh; overflow-y: auto; }
  &__empty { @include card; text-align: center; color: $gray-400; }
  &__card {
    @include card; display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; transition: all 0.2s;
    &:hover { background: $primary-color; color: white; transform: translateX(-4px); }
    &--out { opacity: 0.5; cursor: not-allowed; }
  }
  &__name { font-weight: 600; }
  &__avail { font-size: $font-size-xs; color: $success-color; }
  &__stock { font-size: $font-size-xs; color: $danger-color; }
}
</style>
