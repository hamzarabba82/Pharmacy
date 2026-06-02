<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomersStore } from '../stores/customers'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { getErrorMessage } from '../services/errorHandler'
const route = useRoute()
const router = useRouter()
const store = useCustomersStore()
const isEdit = !!route.params.id
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const nameError = ref('')

interface CustomerFormVM { name: string; phone: string; email: string; address: string }
const form = ref<CustomerFormVM>({ name: '', phone: '', email: '', address: '' })

onMounted(async () => {
  if (!isEdit) return
  loading.value = true
  try {
    await store.fetchAll({ limit: 100 })
    const found = store.items.find((c) => c.id === Number(route.params.id))
    if (found) {
      form.value = {
        name: found.name,
        phone: found.phone || '',
        email: found.email || '',
        address: found.address || '',
      }
    } else error.value = 'العميل غير موجود'
  } catch { error.value = 'فشل تحميل بيانات العميل' }
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
    router.push('/customers')
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  }
  finally { saving.value = false }
}
</script>

<template>
  <div class="customer-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'تعديل عميل' : 'إضافة عميل' }}</h1>
    </div>

    <div v-if="loading">
      <p>جاري التحميل...</p>
    </div>

    <div v-else class="customer-form__card">
      <p v-if="error" class="customer-form__error">
        {{ error }}
      </p>

      <div class="customer-form__grid">
        <BaseInput v-model="form.name" label="الاسم *" :error="nameError" />
        <BaseInput v-model="form.phone" label="الهاتف" />
        <BaseInput v-model="form.email" label="البريد الإلكتروني" />
        <BaseInput v-model="form.address" label="العنوان" />
      </div>

      <div class="customer-form__actions">
        <BaseButton :label="isEdit ? 'حفظ التغييرات' : 'إضافة'" :loading="saving" @click="handleSubmit" />
        <BaseButton label="إلغاء" variant="ghost" @click="router.push('/customers')" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.customer-form {
  &__card { @include card; max-width: 600px; }
  &__error { color: $danger-color; margin-bottom: 1rem; }
  &__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
  &__actions { display: flex; gap: 0.75rem; }
}
</style>
