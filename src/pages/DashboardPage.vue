<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { getDashboardStats } from '../api/analytics'
import { Pill, DollarSign, LayoutDashboard, AlertTriangle, AlertCircle } from '@lucide/vue'
import Skeleton from '../components/ui/Skeleton.vue'
import DashboardChart from '../components/DashboardChart.vue'
import type { DashboardStats } from '../types'

const auth = useAuthStore()
const router = useRouter()

const stats = ref<DashboardStats>({
  total_medicines: 0, today_sales_count: 0, today_sales_amount: 0,
  low_stock_count: 0, daily_sales: [], alerts: [],
})
const loading = ref(true)
const error = ref('')

const isCashier = computed(() => auth.user?.role === 'cashier')

onMounted(load)

async function load() {
  loading.value = true; error.value = ''
  try { stats.value = await getDashboardStats() }
  catch { error.value = 'حدث خطأ في تحميل البيانات' }
  finally { loading.value = false }
}
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <div>
        <h1>لوحة التحكم</h1>
        <p class="dashboard__welcome">
          مرحباً، {{ auth.user?.name || 'مستخدم' }}
          <span v-if="auth.user?.role" class="dashboard__role">({{ auth.user.role === 'admin' ? 'مدير' : auth.user.role === 'pharmacist' ? 'صيدلي' : 'كاشير' }})</span>
        </p>
      </div>
    </div>

    <Skeleton v-if="loading" type="card" :rows="isCashier ? 3 : 4" />
    <Skeleton v-if="loading" type="chart" />

    <div v-else-if="error" class="dashboard__error">
      <p>{{ error }}</p>
      <button class="dashboard__retry-btn" @click="load">
        إعادة المحاولة
      </button>
    </div>

    <template v-else>
      <div class="dashboard__cards">
        <div class="dashboard__card" @click="router.push('/inventory')">
          <div class="dashboard__card-icon">
            <Pill :size="40" color="#2563eb" />
          </div>
          <div class="dashboard__card-info">
            <div class="dashboard__card-value">
              {{ stats.total_medicines }}
            </div>
            <div class="dashboard__card-label">
              إجمالي الأدوية
            </div>
          </div>
        </div>

        <div class="dashboard__card" @click="router.push('/sales')">
          <div class="dashboard__card-icon">
            <DollarSign :size="40" color="#16a34a" />
          </div>
          <div class="dashboard__card-info">
            <div class="dashboard__card-value">
              {{ stats.today_sales_count }}
            </div>
            <div class="dashboard__card-label">
              مبيعات اليوم
            </div>
          </div>
        </div>

        <div class="dashboard__card dashboard__card--revenue" @click="router.push('/sales')">
          <div class="dashboard__card-icon">
            <LayoutDashboard :size="40" color="#16a34a" />
          </div>
          <div class="dashboard__card-info">
            <div class="dashboard__card-value">
              {{ stats.today_sales_amount?.toFixed(2) }}
            </div>
            <div class="dashboard__card-label">
              إيرادات اليوم (ر.س)
            </div>
          </div>
        </div>

        <div v-if="!isCashier" class="dashboard__card dashboard__card--warning" @click="router.push('/inventory')">
          <div class="dashboard__card-icon">
            <AlertTriangle :size="40" color="#f59e0b" />
          </div>
          <div class="dashboard__card-info">
            <div class="dashboard__card-value">
              {{ stats.low_stock_count }}
            </div>
            <div class="dashboard__card-label">
              أدوية منخفضة المخزون
            </div>
          </div>
        </div>
      </div>

      <div v-if="stats.alerts?.length" class="dashboard__alerts">
        <h2 class="dashboard__section-title">
          التنبيهات
        </h2>
        <div v-for="alert in stats.alerts" :key="alert.medicine_id" class="dashboard__alert" :class="`dashboard__alert--${alert.type}`">
          <span class="dashboard__alert-icon">
            <AlertCircle v-if="alert.type === 'low_stock'" :size="20" color="#dc2626" />
            <AlertTriangle v-else :size="20" color="#f59e0b" />
          </span>
          <div class="dashboard__alert-info">
            <div class="dashboard__alert-msg">
              {{ alert.message }}
            </div>
            <div class="dashboard__alert-med">
              {{ alert.medicine_name }}
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="!isCashier" class="dashboard__alerts-empty">
        لا توجد تنبيهات
      </div>

      <div v-if="!isCashier" class="dashboard__section">
        <h2 class="dashboard__section-title">
          مبيعات آخر 7 أيام
        </h2>
        <DashboardChart :data="stats.daily_sales?.map(d => d.amount) || []" />
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.dashboard {
  &__header { margin-bottom: 1.5rem; }
  &__welcome { color: $gray-500; margin: 0; }
  &__role { font-size: $font-size-xs; color: $gray-400; }

  &__error { @include card; text-align: center; padding: 3rem; color: $danger-color; }
  &__retry-btn { @include btn-base; background: $primary-color; color: white; margin-top: 0.75rem; }

  &__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
  &__card {
    @include card-hover; display: flex; align-items: center; gap: 1rem; cursor: pointer;
  }
  &__card-icon { display: flex; align-items: center; }
  &__card-value { font-size: $font-size-2xl; font-weight: 700; }
  &__card-label { color: $gray-500; font-size: $font-size-sm; margin-top: 0.25rem; }
  &__card--revenue { border-right: 4px solid $success-color; }
  &__card--warning { border-right: 4px solid $warning-color; }

  &__alerts { @include card; margin-bottom: 1rem; }
  &__alerts-empty { @include card; text-align: center; color: $gray-400; margin-bottom: 1rem; }
  &__alert { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: $border-radius-sm; &:not(:last-child) { margin-bottom: 0.25rem; }
    &--low_stock { background: rgba($danger-color, 0.05); border-right: 3px solid $danger-color; }
    &--expired, &--expiry { background: rgba($warning-color, 0.08); border-right: 3px solid $warning-color; }
  }
  &__alert-icon { display: flex; align-items: center; }
  &__alert-msg { font-size: $font-size-sm; font-weight: 600; }
  &__alert-med { font-size: $font-size-xs; color: $gray-500; }

  &__section { @include card; }
  &__section-title { margin: 0 0 1rem; font-size: $font-size-lg; }
}
</style>
