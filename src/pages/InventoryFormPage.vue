<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInventoryStore } from '../stores/inventory'
import { getMedicine, getMedicines } from '../api/medicines'
import { getCategories } from '../api/categories'
import { getSuppliers } from '../api/suppliers'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import FormSelect from '../components/ui/FormSelect.vue'
import type { Category, Supplier } from '../types'
import { getErrorMessage } from '../services/errorHandler'
import { isMedicineExpired } from '../utils/batchAllocation'

const route = useRoute()
const router = useRouter()
const inventory = useInventoryStore()

const isEdit = computed(() => !!route.params.id)

const categories = ref<Category[]>([])
const suppliers = ref<Supplier[]>([])

const form = ref({
  name: '',
  scientific_name: '',
  barcode: '',
  category_id: '' as string | number,
  manufacturer: '',
  purchase_price: 0,
  sale_price: 0,
  current_stock: 0,
  min_stock: 10,
  expiry_date: '',
  supplier_id: '' as string | number,
  location: '',
})
const originalBarcode = ref('')
const saving = ref(false)
const loading = ref(true)
const error = ref('')
const nameError = ref('')
const barcodeError = ref('')
const categoryError = ref('')
const salePriceError = ref('')
const expiryDateError = ref('')
const priceWarning = ref('')
const showPriceConfirm = ref(false)

onMounted(async () => {
  try {
    categories.value = (await getCategories()).data
    const res = await getSuppliers()
    suppliers.value = res.data
  } catch { /* ignore */ }
  if (isEdit.value) {
    try {
      const med = await getMedicine(Number(route.params.id))
      originalBarcode.value = med.barcode
      form.value = {
        name: med.name,
        scientific_name: med.scientific_name || '',
        barcode: med.barcode,
        category_id: med.category_id || '',
        manufacturer: med.manufacturer || '',
        purchase_price: med.purchase_price,
        sale_price: med.sale_price,
        current_stock: med.current_stock,
        min_stock: med.min_stock,
        expiry_date: '',
        supplier_id: med.supplier_id || '',
        location: med.location || '',
      }
    } catch {
      error.value = 'فشل تحميل بيانات الدواء'
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

async function handleSave() {
  error.value = ''
  nameError.value = ''
  barcodeError.value = ''
  categoryError.value = ''
  salePriceError.value = ''
  expiryDateError.value = ''

  let valid = true
  if (!isEdit.value) {
    if (!form.value.name.trim()) { nameError.value = 'الاسم التجاري مطلوب'; valid = false }
    if (!form.value.barcode.trim()) { barcodeError.value = 'الباركود مطلوب'; valid = false }
    if (!form.value.category_id) { categoryError.value = 'الفئة مطلوبة'; valid = false }
  }
  if (form.value.sale_price <= 0) { salePriceError.value = 'سعر البيع يجب أن يكون أكبر من صفر'; valid = false }
  if (form.value.expiry_date && isMedicineExpired({ expiry_date: form.value.expiry_date })) {
    expiryDateError.value = 'تاريخ الصلاحية لا يمكن أن يكون في الماضي'
    valid = false
  }
  if (!valid) return

  if (!showPriceConfirm.value && form.value.sale_price < form.value.purchase_price) {
    priceWarning.value = `سعر البيع (${form.value.sale_price}) أقل من سعر الشراء (${form.value.purchase_price}) — هل أنت متأكد؟`
    showPriceConfirm.value = true; return
  }

  if (form.value.barcode) {
    const shouldCheck = !isEdit.value || form.value.barcode !== originalBarcode.value
    if (shouldCheck) {
      try {
        const existing = await getMedicines({ search: form.value.barcode, limit: 1 })
        if (existing.data.length && existing.data[0].barcode === form.value.barcode) {
          barcodeError.value = `الباركود موجود مسبقاً للدواء: ${existing.data[0].name}`; return
        }
      } catch { /* ignore */ }
    }
  }

  saving.value = true
  try {
    const payload: Record<string, unknown> = {
      ...form.value,
      category_id: Number(form.value.category_id) || undefined,
      supplier_id: form.value.supplier_id ? Number(form.value.supplier_id) : undefined,
    }
    if (!isEdit.value) delete payload.current_stock
    if (isEdit.value) {
      await inventory.update(Number(route.params.id), payload)
    } else {
      await inventory.add(payload as Parameters<typeof inventory.add>[0])
    }
    router.push('/inventory')
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    saving.value = false
  }
}

function dismissWarning() {
  priceWarning.value = ''
  showPriceConfirm.value = false
}
</script>

<template>
  <div class="inventory-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'تعديل دواء' : 'إضافة دواء جديد' }}</h1>
    </div>

    <Skeleton v-if="isEdit && loading" type="detail" />

    <div v-else class="inventory-form__card">
      <p v-if="error" class="inventory-form__error">
        {{ error }}
      </p>

      <div v-if="priceWarning" class="inventory-form__warning">
        <p>{{ priceWarning }}</p>
        <div class="inventory-form__warning-actions">
          <BaseButton label="نعم، متأكد" variant="warning" size="sm" @click="showPriceConfirm = false; handleSave()" />
          <BaseButton label="رجوع" variant="ghost" size="sm" @click="dismissWarning" />
        </div>
      </div>

      <div class="inventory-form__grid">
        <BaseInput v-model="form.name" label="الاسم التجاري" required :error="nameError" />
        <BaseInput v-model="form.scientific_name" label="الاسم العلمي" />
        <BaseInput v-model="form.barcode" label="الباركود" required :error="barcodeError" />
        <FormSelect v-model="form.category_id" label="الفئة" required :error="categoryError" :options="categories.map(c => ({ value: c.id, label: c.name }))" />
        <FormSelect v-model="form.supplier_id" label="المورد" :options="suppliers.map(s => ({ value: s.id, label: s.name }))" />
        <BaseInput v-model="form.manufacturer" label="الشركة المصنعة" />
        <BaseInput v-model="form.purchase_price" label="سعر الشراء" type="number" />
        <BaseInput v-model="form.sale_price" label="سعر البيع" type="number" required :error="salePriceError" />
        <BaseInput v-if="isEdit" v-model="form.current_stock" label="الكمية الحالية" type="number" readonly />
        <BaseInput v-model="form.min_stock" label="حد التنبيه" type="number" />
        <BaseInput v-model="form.expiry_date" label="تاريخ الصلاحية" type="date" :error="expiryDateError" />
        <BaseInput v-model="form.location" label="الموقع / الرف" />
      </div>

      <div class="inventory-form__actions">
        <BaseButton :label="saving ? 'جاري الحفظ...' : 'حفظ'" :loading="saving" @click="handleSave" />
        <BaseButton label="إلغاء" variant="ghost" @click="router.push('/inventory')" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.inventory-form {
  &__card { @include card; max-width: 800px; }
  &__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
  &__actions { display: flex; gap: 0.75rem; }
  &__error { color: $danger-color; margin-bottom: 1rem; padding: 0.5rem; background: #fce4ec; border-radius: $border-radius-sm; }
  &__warning {
    background: #fef3c7; border: 1px solid $warning-color; border-radius: $border-radius-sm;
    padding: 0.75rem; margin-bottom: 1rem; color: $gray-800; font-size: $font-size-sm;
    &-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  }
}
</style>
