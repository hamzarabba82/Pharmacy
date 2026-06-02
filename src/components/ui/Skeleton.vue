<script setup lang="ts">
defineProps<{
  type?: 'table' | 'card' | 'chart' | 'detail'
  rows?: number
}>()
</script>

<template>
  <div class="skeleton" :class="`skeleton--${type || 'table'}`">
    <template v-if="type === 'card'">
      <div v-for="i in (rows || 4)" :key="i" class="skeleton__card">
        <div class="skeleton__icon" />
        <div class="skeleton__lines">
          <div class="skeleton__line skeleton__line--short" />
          <div class="skeleton__line skeleton__line--long" />
        </div>
      </div>
    </template>

    <template v-else-if="type === 'chart'">
      <div class="skeleton__chart">
        <div v-for="i in 7" :key="i" class="skeleton__bar" />
      </div>
    </template>

    <template v-else-if="type === 'detail'">
      <div class="skeleton__detail-header" />
      <div class="skeleton__detail-grid">
        <div v-for="i in 6" :key="i" class="skeleton__detail-field">
          <div class="skeleton__line skeleton__line--label" />
          <div class="skeleton__line" />
        </div>
      </div>
      <div class="skeleton__detail-table">
        <div v-for="i in 3" :key="i" class="skeleton__detail-row" />
      </div>
    </template>

    <template v-else>
      <div class="skeleton__table">
        <div class="skeleton__header">
          <div v-for="i in 6" :key="i" class="skeleton__cell" />
        </div>
        <div v-for="i in (rows || 5)" :key="i" class="skeleton__row">
          <div v-for="j in 6" :key="j" class="skeleton__cell" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.skeleton {
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  &__line {
    height: 14px; border-radius: $border-radius-sm;
    background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%);
    background-size: 200% 100%; animation: shimmer 1.5s infinite;
    margin-bottom: 0.5rem;
    &--short { width: 40%; }
    &--long { width: 80%; }
    &--label { width: 30%; height: 10px; margin-bottom: 0.25rem; }
  }

  /* card */
  &--card { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
  &__card {
    background: white; border-radius: $border-radius; padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem;
  }
  &__icon { width: 48px; height: 48px; border-radius: $border-radius; background: $gray-100; }
  &__lines { flex: 1; }

  /* chart */
  &__chart { display: flex; align-items: flex-end; gap: 1rem; height: 200px; padding: 1rem 0; }
  &__bar {
    flex: 1; border-radius: $border-radius-sm $border-radius-sm 0 0;
    background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%);
    background-size: 200% 100%; animation: shimmer 1.5s infinite; height: 60%;
    &:nth-child(2) { height: 40%; } &:nth-child(3) { height: 80%; }
    &:nth-child(4) { height: 55%; } &:nth-child(5) { height: 90%; }
    &:nth-child(6) { height: 45%; } &:nth-child(7) { height: 70%; }
  }

  /* table */
  &__table { background: white; border-radius: $border-radius; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  &__header { display: flex; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid $gray-200; margin-bottom: 1rem; }
  &__row { display: flex; gap: 1rem; padding: 0.75rem 0; &:not(:last-child) { border-bottom: 1px solid $gray-50; } }
  &__cell {
    flex: 1; height: 16px; border-radius: $border-radius-sm;
    background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%);
    background-size: 200% 100%; animation: shimmer 1.5s infinite;
  }

  /* detail */
  &__detail-header { height: 32px; width: 50%; margin-bottom: 1.5rem; }
  &__detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
  &__detail-field { }
  &__detail-table { }
  &__detail-row { height: 48px; margin-bottom: 0.5rem; }
}
</style>
