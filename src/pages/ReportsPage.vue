<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSalesReport, getInventoryReport, getProfitReport } from '../api/reports'
import Skeleton from '../components/ui/Skeleton.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import DashboardChart from '../components/DashboardChart.vue'
import type { SalesReportDTO, InventoryReportDTO, ProfitReportDTO } from '../types/reports'

const route = useRoute()
const reportType = ref((route.params.type as string) || 'sales')
const data = ref<SalesReportDTO | InventoryReportDTO | ProfitReportDTO | null>(null)
const loading = ref(false)
const error = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const hasData = computed(() => data.value !== null)
const salesData = computed(() => reportType.value === 'sales' ? data.value as SalesReportDTO : null)
const chartData = computed(() => salesData.value?.total_sales_week?.map(item => item.amount) || [])

const tabs = [
  { key: 'sales', label: 'المبيعات' },
  { key: 'inventory', label: 'المخزون' },
  { key: 'profits', label: 'الأرباح' },
]

async function fetchReport() {
  loading.value = true
  try {
    const params = { from: dateFrom.value || undefined, to: dateTo.value || undefined }
    switch (reportType.value) {
      case 'sales': data.value = await getSalesReport(params); break
      case 'inventory': data.value = await getInventoryReport(); break
      case 'profits': data.value = await getProfitReport(params); break
    }
  } catch { error.value = 'فشل تحميل التقرير'; data.value = null }
  finally { loading.value = false }
}

onMounted(() => fetchReport())

function retry() { error.value = ''; fetchReport() }

function switchTab(key: string) {
  reportType.value = key
  fetchReport()
}

function exportPDF() { window.print() }

function exportCSV() {
  const reportData = data.value
  if (!reportData) return
  if (!reportData.rows?.length) return
  const headers = reportData.columns.join(',')
  const rows = reportData.rows.map((r: Record<string, unknown>) => reportData.columns.map((c: string) => r[c]).join(',')).join('\n')
  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `report_${reportType.value}_${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

</script>

<template>
  <div class="reports">
    <div class="page-header">
      <h1>التقارير</h1>
      <BaseButton v-if="hasData" label="تصدير CSV" variant="ghost" size="sm" @click="exportCSV" />
      <BaseButton v-if="hasData" label="PDF" variant="ghost" size="sm" @click="exportPDF" />
    </div>

    <div class="reports__tabs">
      <button
        v-for="tab in tabs" :key="tab.key"
        class="reports__tab"
        :class="{ 'reports__tab--active': reportType === tab.key }"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="reports__filters">
      <input v-model="dateFrom" type="date" class="reports__filter-input">
      <span>إلى</span>
      <input v-model="dateTo" type="date" class="reports__filter-input">
      <BaseButton label="عرض التقرير" size="sm" @click="fetchReport" />
    </div>

    <Skeleton v-if="loading" type="chart" />
    <div v-else-if="error" class="reports__error">
      <p>{{ error }}</p>
      <button class="reports__retry-btn" @click="retry">
        إعادة المحاولة
      </button>
    </div>
    <div v-else-if="!hasData" class="reports__empty">
      اختر نوع التقرير واضغط "عرض التقرير"
    </div>
    <div v-else class="reports__content">
      <div class="reports__cards">
        <div v-for="(value, key) in data!.summary" :key="key" class="reports__card">
          <div class="reports__card-value">
            {{ typeof value === 'number' ? value.toFixed(2) : value }}
          </div>
          <div class="reports__card-label">
            {{ key }}
          </div>
        </div>
      </div>

      <!-- Sales report chart -->
      <div v-if="chartData.length" class="reports__chart">
        <h3>الرسم البياني</h3>
        <DashboardChart :data="chartData" />
      </div>

      <div class="reports__table-wrapper">
        <table class="reports__table">
          <thead>
            <tr>
              <th v-for="col in data!.columns" :key="col">
                {{ col }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in data!.rows" :key="i">
              <td v-for="col in data!.columns" :key="col">
                {{ (row as Record<string, unknown>)[col] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

@media print {
  .reports__tabs, .reports__filters, .reports__chart { display: none !important; }
  .page-header { border: none; padding: 0; margin-bottom: 0.5cm; }
  .page-header h1 { font-size: 18pt; }
  .page-header button { display: none !important; }
  .reports__table-wrapper { box-shadow: none; border: none; padding: 0; }
  .reports__table { font-size: 10pt; width: 100%; }
  .reports__table th { background: #eee !important; color: #000 !important; }
  .reports__table th, .reports__table td { padding: 6pt 4pt; border: 1pt solid #333; }
  .reports__card { box-shadow: none; border: 1pt solid #ddd; break-inside: avoid; }
  .reports__content { display: block !important; }
  body { margin: 0; padding: 10mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}

.reports {
  &__tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  &__tab {
    padding: 0.5rem 1rem; border: 1px solid $gray-300; background: white;
    border-radius: $border-radius; cursor: pointer; font-size: $font-size-sm;
    &--active { background: $primary-color; color: white; border-color: $primary-color; }
  }
  &__filters { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
  &__filter-input { padding: 0.375rem 0.5rem; border: 1px solid $gray-300; border-radius: $border-radius-sm; }
  &__cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
  &__card { @include card; text-align: center; }
  &__card-value { font-size: $font-size-2xl; font-weight: 700; color: $primary-color; }
  &__card-label { font-size: $font-size-sm; color: $gray-500; }
  &__chart { @include card; margin-bottom: 1rem; }
  &__table-wrapper { @include card; overflow-x: auto; }
  &__table { @include table-base; }
  &__empty { @include card; text-align: center; padding: 3rem; color: $gray-400; }
  &__error { @include card; text-align: center; padding: 3rem; color: $danger-color; }
  &__retry-btn { @include btn-base; background: $primary-color; color: white; margin-top: 0.75rem; }
}
</style>