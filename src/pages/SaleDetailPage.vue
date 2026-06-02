<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSale } from '../api/sales'
import { refundSale } from '../services/orchestrator'
import { useInventoryStore } from '../stores/inventory'
import { useAuthStore } from '../stores/auth'
import Skeleton from '../components/ui/Skeleton.vue'
import Badge from '../components/ui/Badge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import type { Sale } from '../types'
import { PAYMENT_METHODS } from '../utils/constants'

const route = useRoute()
const auth = useAuthStore()
const sale = ref<Sale | null>(null)
const loading = ref(true)
const error = ref('')
const refunding = ref(false)

onMounted(async () => {
  try {
    sale.value = await getSale(Number(route.params.id))
  } catch {
    error.value = 'فشل تحميل الفاتورة'
  } finally {
    loading.value = false
  }
})

async function handleRefund() {
  refunding.value = true
  try {
    const inventoryStore = useInventoryStore()
    const refunded = await refundSale(Number(route.params.id), (items) => inventoryStore.refundStock(items))
    sale.value = refunded
  } catch {
    error.value = 'فشل إرجاع الفاتورة'
  } finally {
    refunding.value = false
  }
}
</script>

<template>
  <div class="sale-detail">
    <Skeleton v-if="loading" type="detail" />
    <div v-else-if="error" class="sale-detail__error">
      {{ error }}
    </div>

    <template v-else-if="sale">
      <div class="page-header">
        <h1>الفاتورة: {{ sale.invoice_number }}</h1>
        <Badge :variant="sale.status === 'completed' ? 'success' : 'warning'">
          {{ sale.status === 'completed' ? 'مكتملة' : 'مُرجعَة' }}
        </Badge>
      </div>

      <div class="sale-detail__info">
        <div class="sale-detail__info-item">
          <span class="sale-detail__label">التاريخ:</span>
          <span>{{ new Date(sale.created_at).toLocaleDateString('ar-SA') }}</span>
        </div>
        <div class="sale-detail__info-item">
          <span class="sale-detail__label">طريقة الدفع:</span>
          <span>{{ PAYMENT_METHODS[sale.payment_method] }}</span>
        </div>
        <div v-if="sale.customer" class="sale-detail__info-item">
          <span class="sale-detail__label">العميل:</span>
          <span>{{ sale.customer.name }} {{ sale.customer.phone ? `(${sale.customer.phone})` : '' }}</span>
        </div>
      </div>

      <div class="sale-detail__table-wrapper">
        <table class="sale-detail__table">
          <thead>
            <tr>
              <th>#</th>
              <th>الدواء</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in sale.items" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.medicine?.name || `#${item.medicine_id}` }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unit_price?.toFixed(2) }}</td>
              <td>{{ item.total_price?.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sale-detail__summary">
        <div class="sale-detail__summary-row">
          <span>المجموع</span>
          <span>{{ sale.total_amount?.toFixed(2) }} ر.س</span>
        </div>
        <div v-if="sale.discount > 0" class="sale-detail__summary-row">
          <span>الخصم</span>
          <span>{{ sale.discount?.toFixed(2) }} ر.س</span>
        </div>
        <div class="sale-detail__summary-row sale-detail__summary-row--total">
          <span>الإجمالي</span>
          <span>{{ sale.net_amount?.toFixed(2) }} ر.س</span>
        </div>
      </div>

      <div v-if="sale.status === 'completed' && auth.user?.role === 'admin'" class="sale-detail__actions">
        <BaseButton
          label="إرجاع الفاتورة"
          variant="danger"
          :loading="refunding"
          @click="handleRefund"
        />
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.sale-detail {
  &__info { @include card; display: flex; gap: 2rem; margin-bottom: 1rem; }
  &__info-item { display: flex; gap: 0.5rem; }
  &__label { color: $gray-500; font-weight: 600; }

  &__table-wrapper { @include card; margin-bottom: 1rem; overflow-x: auto; }
  &__table { @include table-base; }

  &__summary { @include card; max-width: 400px; margin-right: auto; }
  &__summary-row { @include flex-between; padding: 0.5rem 0; }
  &__summary-row--total { font-size: $font-size-lg; font-weight: 700; color: $primary-color; border-top: 1px solid $gray-200; margin-top: 0.5rem; padding-top: 0.5rem; }

  &__actions { margin-top: 1rem; }
  &__error { @include card; text-align: center; color: $danger-color; padding: 3rem; }
}
</style>
