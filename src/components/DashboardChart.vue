<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ data: number[] }>()

const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
const maxVal = computed(() => Math.max(...props.data, 1))
const barHeight = (v: number) => `${(v / maxVal.value) * 100}%`
</script>

<template>
  <div class="chart" dir="ltr">
    <div class="chart__bars">
      <div v-for="(v, i) in data" :key="i" class="chart__bar-group">
        <div class="chart__bar-wrapper">
          <div class="chart__bar" :style="{ height: barHeight(v) }">
            <span class="chart__bar-val">{{ v.toFixed(0) }}</span>
          </div>
        </div>
        <span class="chart__bar-label">{{ days[i % 7] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '../styles/variables' as *;

.chart {
  &__bars { display: flex; align-items: flex-end; gap: 1rem; height: 200px; padding: 1rem 0; }
  &__bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
  &__bar-wrapper { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
  &__bar {
    width: 60%; background: linear-gradient(to top, $primary-color, color.adjust($primary-color, $lightness: 20%));
    border-radius: $border-radius-sm $border-radius-sm 0 0; position: relative; min-height: 4px;
    transition: height 0.5s ease;
  }
  &__bar-val { position: absolute; top: -1.25rem; left: 50%; transform: translateX(-50%); font-size: $font-size-xs; color: $gray-600; font-weight: 600; }
  &__bar-label { font-size: $font-size-xs; color: $gray-500; margin-top: 0.5rem; }
  &__bar-group:first-child .chart__bar-label,
  &__bar-group:last-child .chart__bar-label { color: $danger-color; }
}
</style>
