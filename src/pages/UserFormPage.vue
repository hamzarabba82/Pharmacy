<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '../stores/users'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import FormSelect from '../components/ui/FormSelect.vue'
import { getErrorMessage } from '../services/errorHandler'
const route = useRoute()
const router = useRouter()
const store = useUsersStore()
const isEdit = !!route.params.id
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')

interface UserForm { name: string; email: string; role: 'admin' | 'pharmacist' | 'cashier'; phone: string; is_active: boolean; password: string }
const form = ref<UserForm>({ name: '', email: '', role: 'cashier', phone: '', is_active: true, password: '' })

const roleOptions = [
  { value: 'admin', label: 'مدير' },
  { value: 'pharmacist', label: 'صيدلي' },
  { value: 'cashier', label: 'كاشير' },
]

onMounted(async () => {
  if (!isEdit) return
  loading.value = true
  try {
    await store.fetchAll({ limit: 100 })
    const found = store.users.find((u) => u.id === Number(route.params.id))
    if (found) {
      form.value = {
        name: found.name,
        email: found.email,
        role: found.role,
        phone: found.phone || '',
        is_active: found.is_active,
        password: '', // Never pre-fill password
      }
    } else error.value = 'المستخدم غير موجود'
  } catch { error.value = 'فشل تحميل بيانات المستخدم' }
  finally { loading.value = false }
})

async function handleSubmit() {
  error.value = ''
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''

  let valid = true
  if (!form.value.name) { nameError.value = 'الاسم مطلوب'; valid = false }
  if (!form.value.email) { emailError.value = 'البريد الإلكتروني مطلوب'; valid = false }
  if (!isEdit && !form.value.password?.trim()) { passwordError.value = 'كلمة المرور مطلوبة'; valid = false }
  if (!valid) return
  saving.value = true
  try {
    const userData = {
      name: form.value.name,
      email: form.value.email,
      role: form.value.role,
      phone: form.value.phone,
      is_active: form.value.is_active,
    };
    if (isEdit) await store.update(Number(route.params.id), userData)
    else await store.add(userData)
    router.push('/users')
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  }
  finally { saving.value = false }
}
</script>

<template>
  <div class="user-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'تعديل مستخدم' : 'إضافة مستخدم' }}</h1>
    </div>

    <div v-if="loading">
      <p>جاري التحميل...</p>
    </div>

    <div v-else class="user-form__card">
      <p v-if="error" class="user-form__error">
        {{ error }}
      </p>

      <div class="user-form__grid">
        <BaseInput v-model="form.name" label="الاسم *" :error="nameError" />
        <BaseInput v-model="form.email" label="البريد الإلكتروني *" :error="emailError" />
        <BaseInput v-model="form.password" label="كلمة المرور" :placeholder="isEdit ? 'اتركه فارغاً بدون تغيير' : ''" type="password" :error="passwordError" />
        <BaseInput v-model="form.phone" label="الهاتف" />
        <FormSelect v-model="form.role" :options="roleOptions" label="الصلاحية" />
      </div>

      <div class="user-form__actions">
        <BaseButton :label="isEdit ? 'حفظ التغييرات' : 'إضافة'" :loading="saving" @click="handleSubmit" />
        <BaseButton label="إلغاء" variant="ghost" @click="router.push('/users')" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.user-form {
  &__card { @include card; max-width: 600px; }
  &__error { color: $danger-color; margin-bottom: 1rem; }
  &__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
  &__actions { display: flex; gap: 0.75rem; }
}
</style>
