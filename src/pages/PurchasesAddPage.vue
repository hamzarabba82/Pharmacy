<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createPurchase } from '../services/orchestrator'
import { useInventoryStore } from '../stores/inventory'
import { getSuppliers } from '../api/suppliers'
import { getMedicines } from '../api/medicines'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import FormSelect from '../components/ui/FormSelect.vue'
import type { Supplier, Medicine } from '../types'
import { getErrorMessage } from '../services/errorHandler'
import { X } from '@lucide/vue'

const router = useRouter()

const suppliers = ref<Supplier[]>([])
const saving = ref(false)
const error = ref('')
const supplierError = ref('')
const itemsError = ref('')

const form = ref({
  supplier_id: '' as string | number,
  notes: '',
  items: [] as { medicine_id: number; quantity: number; unit_cost: number; batch_number: string; expiry_date: string }[],
})

const medSearchQueries = ref<Record<number, string>>({})
const medResults = ref<Record<number, Medicine[]>>({})
const medSearching = ref<Record<number, boolean>>({})
let debounceTimers: Record<number, ReturnType<typeof setTimeout>> = {}
const draftSaving = ref(false)

onMounted(async () => {
  try { suppliers.value = (await getSuppliers()).data } catch { /* ignore */ }
})

function addRow() {
  const idx = form.value.items.length
  form.value.items.push({ medicine_id: 0, quantity: 1, unit_cost: 0, batch_number: '', expiry_date: '' })
  medSearchQueries.value[idx] = ''
  medResults.value[idx] = []
  medSearching.value[idx] = false
}

function removeRow(index: number) {
  form.value.items.splice(index, 1)
}

function handleMedSearch(index: number) {
  clearTimeout(debounceTimers[index])
  const q = medSearchQueries.value[index]
  if (!q?.trim()) { medResults.value[index] = []; return }
  medSearching.value[index] = true
  debounceTimers[index] = setTimeout(async () => {
    try {
      const res = await getMedicines({ search: q, limit: 10 })
      medResults.value[index] = res.data
    } catch { medResults.value[index] = [] }
    finally { medSearching.value[index] = false }
  }, 300)
}

function selectMedicine(index: number, med: Medicine) {
  form.value.items[index].medicine_id = med.id
  form.value.items[index].unit_cost = med.purchase_price || 0
  medSearchQueries.value[index] = med.name
  medResults.value[index] = []
}

async function save(status: 'completed' | 'draft') {
  error.value = ''
  supplierError.value = ''
  itemsError.value = ''

  let valid = true
  if (!form.value.supplier_id) { supplierError.value = 'المورد مطلوب'; valid = false }
  const validItems = form.value.items.filter(i => i.medicine_id && i.quantity > 0)
  if (!validItems.length) { itemsError.value = 'أضف على الأقل صنفاً واحداً'; valid = false }
  if (!valid) return

  const isDraft = status === 'draft'
  if (isDraft) draftSaving.value = true
  else saving.value = true

  try {
    const inventoryStore = useInventoryStore()
    await createPurchase({
      supplier_id: Number(form.value.supplier_id),
      notes: form.value.notes || undefined,
      status,
      items: validItems.map(i => ({
        medicine_id: i.medicine_id,
        quantity: i.quantity,
        unit_price: i.unit_cost,
        batch_number: i.batch_number || undefined,
        expiry_date: i.expiry_date || undefined,
      })),
    }, (items) => inventoryStore.addPurchaseStock(items))
    router.push('/purchases')
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    saving.value = false; draftSaving.value = false
  }
}
</script>

<template>
  <div class="add-purchase">
    <div class="page-header">
      <h1>إضافة فاتورة مشتريات</h1>
    </div>
    <div class="add-purchase__card">
      <p v-if="error" class="add-purchase__error">
        {{ error }}
      </p>

      <FormSelect v-model="form.supplier_id" label="المورد" required :error="supplierError" :options="suppliers.map(s => ({ value: s.id, label: s.name + (s.phone ? ` (${s.phone})` : '') }))" />
      <BaseInput v-model="form.notes" label="ملاحظات" />

      <h3 class="add-purchase__items-title">
        الأصناف
      </h3>
      <p v-if="itemsError" class="add-purchase__field-error">
        {{ itemsError }}
      </p>

      <div v-for="(item, idx) in form.items" :key="idx" class="add-purchase__item">
        <div class="add-purchase__item-search">
          <input
            v-model="medSearchQueries[idx]"
            type="text"
            placeholder="ابحث عن دواء..."
            class="add-purchase__search-input"
            @input="handleMedSearch(idx)"
          >
          <div v-if="medResults[idx]?.length" class="add-purchase__search-results">
            <div
              v-for="med in medResults[idx]"
              :key="med.id"
              class="add-purchase__search-item"
              @click="selectMedicine(idx, med)"
            >
              {{ med.name }} — {{ med.scientific_name }}
            </div>
          </div>
        </div>
        <BaseInput v-model="item.quantity" label="الكمية" type="number" min="1" class="add-purchase__field" />
        <BaseInput v-model="item.unit_cost" label="سعر الوحدة" type="number" min="0" class="add-purchase__field" />
        <BaseInput v-model="item.batch_number" label="رقم التشغيلة" class="add-purchase__field" />
        <BaseInput v-model="item.expiry_date" label="تاريخ الصلاحية" type="date" class="add-purchase__field" />
        <button class="add-purchase__remove-btn" @click="removeRow(idx)">
          <X :size="14" />
        </button>
      </div>

      <BaseButton label="+ إضافة صنف" variant="ghost" size="sm" @click="addRow" />

      <div class="add-purchase__actions">
        <BaseButton :label="saving ? 'جاري الحفظ...' : 'حفظ'" :loading="saving" @click="save('completed')" />
        <BaseButton :label="draftSaving ? 'جاري الحفظ...' : 'حفظ كمسودة'" variant="warning" :loading="draftSaving" @click="save('draft')" />
        <BaseButton label="إلغاء" variant="ghost" @click="router.push('/purchases')" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.add-purchase {
  &__card { @include card; max-width: 900px; }
  &__error { color: $danger-color; margin-bottom: 1rem; padding: 0.5rem; background: #fce4ec; border-radius: $border-radius-sm; }
  &__items-title { margin-top: 1.5rem; margin-bottom: 0.75rem; }
  &__item { display: flex; gap: 0.5rem; align-items: flex-end; margin-bottom: 0.75rem; flex-wrap: wrap; }
  &__item-search { flex: 2; min-width: 180px; position: relative; }
  &__search-input { @include input-base; }
  &__search-results { position: absolute; top: 100%; right: 0; left: 0; background: white; border: 1px solid $gray-200; border-radius: $border-radius-sm; z-index: 10; max-height: 200px; overflow-y: auto; }
  &__search-item { padding: 0.5rem; cursor: pointer; font-size: $font-size-sm; &:hover { background: $primary-color; color: white; } }
  &__field { min-width: 100px; }
  &__field-error { color: $danger-color; font-size: $font-size-xs; margin-bottom: 0.5rem; }
  &__remove-btn { background: none; border: none; color: $danger-color; font-size: $font-size-lg; cursor: pointer; padding: 0.5rem; }
  &__actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
}
</style>
