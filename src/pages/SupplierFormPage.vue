<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSuppliersStore } from '../stores/suppliers'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { getErrorMessage } from '../services/errorHandler'
const route = useRoute()
const router = useRouter()
const store = useSuppliersStore()
const isEdit = !!route.params.id
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const nameError = ref('')

interface SupplierForm { name: string; phone: string; email: string; address: string; contact_person: string }
const form = ref<SupplierForm>({ name: '', phone: '', email: '', address: '', contact_person: '' })

onMounted(async () => {
  if (!isEdit) return
  loading.value = true
  try {
    await store.fetchAll({ limit: 100 })
    const found = store.items.find((s: { id: number }) => s.id === Number(route.params.id))
    if (found) {
      form.value = {
        name: found.name,
        phone: found.phone ?? '',
        email: found.email ?? '',
        address: found.address ?? '',
        contact_person: found.contact_person ?? '',
      }
    } else error.value = 'المورد غير موجود'
  } catch { error.value = 'فشل تحميل بيانات المورد' }
  finally { loading.value = false }
})

async function handleSubmit() {
  error.value = ''
  nameError.value = ''

  let valid = true
  if (!form.value.name) { nameError.value = 'الاسم مطلوب'; valid = false }
  if (!valid) return
  saving.value = true
  try {
    if (isEdit) await store.update(Number(route.params.id), form.value)
    else await store.add(form.value)
    router.push('/suppliers')
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  }
  finally { saving.value = false }
}
</script>

<template>
  <div class="supplier-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'تعديل مورد' : 'إضافة مورد' }}</h1>
    </div>

    <div v-if="loading">
      <p>جاري التحميل...</p>
    </div>

    <div v-else class="supplier-form__card">
      <p v-if="error" class="supplier-form__error">
        {{ error }}
      </p>

      <div class="supplier-form__grid">
        <BaseInput v-model="form.name" label="الاسم *" :error="nameError" />
        <BaseInput v-model="form.phone" label="الهاتف" />
        <BaseInput v-model="form.email" label="البريد الإلكتروني" />
        <BaseInput v-model="form.address" label="العنوان" />
        <BaseInput v-model="form.contact_person" label="جهة الاتصال" />
      </div>

      <div class="supplier-form__actions">
        <BaseButton :label="isEdit ? 'حفظ التغييرات' : 'إضافة'" :loading="saving" @click="handleSubmit" />
        <BaseButton label="إلغاء" variant="ghost" @click="router.push('/suppliers')" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.supplier-form {
  &__card { @include card; max-width: 600px; }
  &__error { color: $danger-color; margin-bottom: 1rem; }
  &__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
  &__actions { display: flex; gap: 0.75rem; }
}
</style>
