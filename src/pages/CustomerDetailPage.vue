<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomersStore } from '../stores/customers'
import Skeleton from '../components/ui/Skeleton.vue'
import Spinner from '../components/ui/Spinner.vue'
import Badge from '../components/ui/Badge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { PAYMENT_METHODS } from '../utils/constants'

const route = useRoute()
const router = useRouter()
const store = useCustomersStore()

const customerError = ref('')
const currentPage = ref(1)
const limit = 10

const totalPages = computed(() => Math.ceil(store.purchasesTotal / limit) || 1)

async function loadPurchases() {
  await store.fetchPurchases(Number(route.params.id), { page: currentPage.value, limit })
}

onMounted(async () => {
  try { await store.fetchById(Number(route.params.id)) }
  catch { customerError.value = 'فشل تحميل بيانات العميل' }
  await loadPurchases()
})

function statusVariant(status: string) {
  return status === 'completed' ? 'success' : 'warning'
}
</script>

<template>
  <div class="customer-detail">
    <div class="page-header">
      <div>
        <h1>{{ store.activeCustomer?.name || 'العميل' }}</h1>
        <p v-if="store.activeCustomer" class="customer-detail__meta">
          {{ store.activeCustomer.phone || '—' }}<span v-if="store.activeCustomer.email"> | {{ store.activeCustomer.email }}</span>
        </p>
      </div>
      <BaseButton label="رجوع" variant="ghost" size="sm" @click="router.push('/customers')" />
    </div>

    <Skeleton v-if="!store.activeCustomer && !customerError" type="detail" />
    <div v-else-if="customerError" class="customer-detail__error">
      {{ customerError }}
    </div>

    <template v-else-if="store.activeCustomer">
      <div class="customer-detail__cards">
        <div class="customer-detail__card">
          <div class="customer-detail__card-label">
            إجمالي المشتريات
          </div>
          <div class="customer-detail__card-value">
            {{ store.activeCustomer.total_purchases?.toFixed(2) || '0.00' }} ر.س
          </div>
        </div>
      </div>

      <div class="customer-detail__section">
        <h3>سجل المشتريات</h3>
        <Spinner v-if="store.purchasesLoading" size="sm" />
        <div v-else-if="store.purchases.length === 0 && !store.purchasesLoading" class="customer-detail__empty">
          لا توجد مشتريات
        </div>
        <div v-else-if="!store.purchases.length" class="customer-detail__empty">
          لا توجد مشتريات
        </div>
        <div v-else class="customer-detail__table-wrapper">
          <table class="customer-detail__table">
            <thead>
              <tr><th>رقم الفاتورة</th><th>التاريخ</th><th>المبلغ</th><th>طريقة الدفع</th><th>الحالة</th><th /></tr>
            </thead>
            <tbody>
              <tr v-for="s in store.purchases" :key="s.id">
                <td>{{ s.invoice_number }}</td>
                <td>{{ new Date(s.created_at).toLocaleDateString('ar-SA') }}</td>
                <td>{{ s.net_amount?.toFixed(2) }}</td>
                <td>{{ PAYMENT_METHODS[s.payment_method] || s.payment_method }}</td>
                <td>
                  <Badge :variant="statusVariant(s.status)">
                    {{ s.status === 'completed' ? 'مكتمل' : 'مسترجع' }}
                  </Badge>
                </td>
                <td>
                  <button class="customer-detail__view-btn" @click="router.push(`/sales/${s.id}`)">
                    عرض
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="totalPages > 1" class="customer-detail__pagination">
            <button :disabled="currentPage <= 1" @click="currentPage--; loadPurchases()">
              « السابق
            </button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button :disabled="currentPage >= totalPages" @click="currentPage++; loadPurchases()">
              التالي »
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.customer-detail {
  &__meta { color: $gray-500; font-size: $font-size-sm; margin-top: 0.25rem; }
  &__cards { display: flex; gap: 1rem; margin-bottom: 1rem; }
  &__card { @include card; text-align: center; min-width: 200px; }
  &__card-value { font-size: $font-size-2xl; font-weight: 700; color: $primary-color; }
  &__card-label { font-size: $font-size-sm; color: $gray-500; }
  &__section { margin-top: 1rem; }
  &__table-wrapper { @include card; overflow-x: auto; }
  &__table { @include table-base; }
  &__view-btn { @include btn-base; background: $primary-color; color: white; padding: 0.25rem 0.75rem; font-size: $font-size-sm; }
  &__pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1rem; }
  &__pagination button { @include btn-base; background: $primary-color; color: white; &:disabled { opacity: 0.5; } }
  &__pagination span { font-weight: 600; color: $gray-600; }
  &__empty { @include card; text-align: center; padding: 2rem; color: $gray-400; }
  &__error { text-align: center; padding: 2rem; color: $danger-color; }
}
</style>
