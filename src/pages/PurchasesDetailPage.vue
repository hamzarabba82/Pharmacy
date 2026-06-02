<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPurchase } from '../api/purchases'
import Skeleton from '../components/ui/Skeleton.vue'
import Badge from '../components/ui/Badge.vue'
import type { Purchase } from '../types'

const route = useRoute()
const purchase = ref<Purchase | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    purchase.value = await getPurchase(Number(route.params.id))
  } catch {
    error.value = 'فشل تحميل بيانات الفاتورة'
  } finally { loading.value = false }
})
</script>

<template>
  <div class="purchase-detail">
    <Skeleton v-if="loading" type="detail" />
    <div v-else-if="error" class="purchase-detail__error">
      {{ error }}
    </div>
    <div v-else-if="purchase">
      <div class="page-header">
        <h1>فاتورة مشتريات #{{ purchase.id }}</h1>
        <Badge :variant="purchase.status === 'completed' ? 'success' : 'warning'">
          {{ purchase.status === 'completed' ? 'مكتملة' : 'مسودة' }}
        </Badge>
      </div>

      <div class="purchase-detail__info">
        <p><strong>المورد:</strong> {{ purchase.supplier?.name || '—' }}</p>
        <p><strong>رقم فاتورة المورد:</strong> {{ purchase.supplier_invoice_number || '—' }}</p>
        <p><strong>التاريخ:</strong> {{ new Date(purchase.created_at).toLocaleDateString('ar-SA') }}</p>
      </div>

      <div class="purchase-detail__table-wrapper">
        <table class="purchase-detail__table">
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
            <tr v-for="(item, i) in purchase.items" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.medicine?.name || `#${item.medicine_id}` }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unit_price?.toFixed(2) }}</td>
              <td>{{ item.total_price?.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="purchase-detail__total">
        الإجمالي: {{ purchase.total_amount?.toFixed(2) }} ر.س
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.purchase-detail {
  &__info { @include card; margin-bottom: 1rem; display: flex; gap: 2rem; }
  &__table-wrapper { @include card; margin-bottom: 1rem; overflow-x: auto; }
  &__table { @include table-base; }
  &__total { @include card; text-align: left; font-size: $font-size-lg; font-weight: 700; color: $primary-color; max-width: 300px; margin-right: auto; }
  &__error { @include card; text-align: center; padding: 3rem; color: $danger-color; }
}
</style>
