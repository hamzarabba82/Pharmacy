<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSalesStore } from '../stores/sales'
import Skeleton from '../components/ui/Skeleton.vue'
import Badge from '../components/ui/Badge.vue'
import { PAYMENT_METHODS } from '../utils/constants'

const salesStore = useSalesStore()
const router = useRouter()

const dateFrom = ref('')
const dateTo = ref('')
const error = ref('')

const isFiltered = computed(() => !!(dateFrom.value || dateTo.value))

onMounted(async () => {
  try { await salesStore.fetchAll() }
  catch { error.value = 'فشل تحميل المبيعات' }
})

async function fetchFiltered() {
  error.value = ''
  try { await salesStore.fetchAll({ from: dateFrom.value || undefined, to: dateTo.value || undefined }) }
  catch { error.value = 'فشل تحميل المبيعات' }
}

function statusVariant(status: string) {
  return status === 'completed' ? 'success' : 'warning'
}
</script>

<template>
  <div class="sales">
    <div class="page-header">
      <h1>سجل المبيعات</h1>
    </div>

    <div class="sales__filters">
      <input v-model="dateFrom" type="date" class="sales__filter-input">
      <span>إلى</span>
      <input v-model="dateTo" type="date" class="sales__filter-input">
      <button class="sales__filter-btn" @click="fetchFiltered">
        بحث
      </button>
    </div>

    <Skeleton v-if="salesStore.loading" type="table" />

    <div v-else-if="error" class="sales__error">
      <p>{{ error }}</p>
      <button class="sales__retry-btn" @click="fetchFiltered">
        إعادة المحاولة
      </button>
    </div>

    <div v-else-if="!salesStore.sales?.length && isFiltered" class="sales__empty">
      لا توجد فواتير في هذه الفترة
    </div>
    <div v-else-if="!salesStore.sales?.length" class="sales__empty">
      لا توجد فواتير مبيعات
    </div>

    <div v-else class="sales__table-wrapper">
      <table class="sales__table">
        <thead>
          <tr><th>رقم الفاتورة</th><th>العميل</th><th>التاريخ</th><th>المبلغ</th><th>طريقة الدفع</th><th>الحالة</th><th>عرض</th></tr>
        </thead>
        <tbody>
          <tr v-for="sale in salesStore.sales" :key="sale.id">
            <td>{{ sale.invoice_number }}</td>
            <td>{{ sale.customer?.name || '—' }}</td>
            <td>{{ new Date(sale.created_at).toLocaleDateString('ar-SA') }}</td>
            <td>{{ sale.net_amount?.toFixed(2) }}</td>
            <td>{{ PAYMENT_METHODS[sale.payment_method] || sale.payment_method }}</td>
            <td>
              <Badge :variant="statusVariant(sale.status)">
                {{ sale.status === 'completed' ? 'مكتمل' : 'مسترجع' }}
              </Badge>
            </td>
            <td>
              <button class="sales__view-btn" @click="router.push(`/sales/${sale.id}`)">
                عرض
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.sales {
  &__filters { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
  &__filter-input { padding: 0.375rem 0.5rem; border: 1px solid $gray-300; border-radius: $border-radius-sm; }
  &__filter-btn { @include btn-base; background: $primary-color; color: white; padding: 0.375rem 1rem; }
  &__error { @include card; text-align: center; padding: 3rem; color: $danger-color; }
  &__retry-btn { @include btn-base; background: $primary-color; color: white; margin-top: 0.75rem; }
  &__table-wrapper { @include card; overflow-x: auto; }
  &__table { @include table-base; }
  &__view-btn { @include btn-base; background: $primary-color; color: white; padding: 0.25rem 0.75rem; font-size: $font-size-sm; }
  &__empty { @include card; text-align: center; padding: 3rem; color: $gray-400; }
}
</style>
