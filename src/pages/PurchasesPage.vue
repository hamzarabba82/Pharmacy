<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePurchasesStore } from '../stores/purchases'
import Skeleton from '../components/ui/Skeleton.vue'
import Badge from '../components/ui/Badge.vue'
import BaseButton from '../components/ui/BaseButton.vue'

const purchasesStore = usePurchasesStore()
const router = useRouter()
const error = ref('')

onMounted(async () => {
  try { await purchasesStore.fetchAll() }
  catch { error.value = 'فشل تحميل المشتريات' }
})

async function retry() {
  error.value = ''
  try { await purchasesStore.fetchAll() }
  catch { error.value = 'فشل تحميل المشتريات' }
}
</script>

<template>
  <div class="purchases">
    <div class="page-header">
      <h1>المشتريات</h1>
      <BaseButton label="إضافة فاتورة مشتريات" @click="router.push('/purchases/add')" />
    </div>

    <Skeleton v-if="purchasesStore.loading" type="table" />

    <div v-else-if="error" class="purchases__error">
      <p>{{ error }}</p>
      <button class="purchases__retry-btn" @click="retry">
        إعادة المحاولة
      </button>
    </div>

    <div v-else-if="!purchasesStore.purchases?.length" class="purchases__empty">
      <p>لا توجد فواتير مشتريات</p>
    </div>

    <div v-else class="purchases__table-wrapper">
      <table class="purchases__table">
        <thead>
          <tr><th>#</th><th>رقم الفاتورة</th><th>المورد</th><th>التاريخ</th><th>الإجمالي</th><th>الحالة</th><th>عرض</th></tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in purchasesStore.purchases" :key="p.id">
            <td>{{ i + 1 }}</td>
            <td>{{ p.supplier_invoice_number || `#${p.id}` }}</td>
            <td>{{ p.supplier?.name || '—' }}</td>
            <td>{{ new Date(p.created_at).toLocaleDateString('ar-SA') }}</td>
            <td>{{ p.total_amount?.toFixed(2) }}</td>
            <td>
              <Badge :variant="p.status === 'completed' ? 'success' : 'warning'">
                {{ p.status === 'completed' ? 'مكتملة' : 'مسودة' }}
              </Badge>
            </td>
            <td>
              <button class="purchases__view-btn" @click="router.push(`/purchases/${p.id}`)">
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

.purchases {
  &__table-wrapper { @include card; overflow-x: auto; }
  &__table { @include table-base; }
  &__view-btn { @include btn-base; background: $primary-color; color: white; padding: 0.25rem 0.75rem; font-size: $font-size-sm; }
  &__empty { @include card; text-align: center; padding: 3rem; color: $gray-400; }
  &__error { @include card; text-align: center; padding: 3rem; color: $danger-color; }
  &__retry-btn { @include btn-base; background: $primary-color; color: white; margin-top: 0.75rem; }
}
</style>
