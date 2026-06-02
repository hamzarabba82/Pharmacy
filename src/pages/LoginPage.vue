<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { Building2 } from '@lucide/vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { getErrorMessage } from '../services/errorHandler'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const emailError = ref('')
const passwordError = ref('')

async function handleLogin() {
  error.value = ''
  emailError.value = ''
  passwordError.value = ''

  let valid = true
  if (!email.value.trim()) {
    emailError.value = 'البريد الإلكتروني مطلوب'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    emailError.value = 'البريد الإلكتروني غير صالح'
    valid = false
  }
  if (!password.value) {
    passwordError.value = 'كلمة المرور مطلوبة'
    valid = false
  }
  if (!valid) return

  try {
    await auth.login(email.value, password.value)
    router.push('/dashboard')
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  }
}
</script>

<template>
  <div class="login">
    <div class="login__header">
      <div class="login__logo">
        <Building2 :size="48" color="#2563eb" />
      </div>
      <h1 class="login__title">
        نظام إدارة الصيدلة
      </h1>
      <p class="login__subtitle">
        تسجيل الدخول إلى النظام
      </p>
    </div>

    <form class="login__form" @submit.prevent="handleLogin">
      <BaseInput
        v-model="email"
        label="البريد الإلكتروني"
        type="email"
        placeholder="admin@pharm.com"
        required
        :error="emailError"
      />

      <BaseInput
        v-model="password"
        label="كلمة المرور"
        type="password"
        placeholder="••••••••"
        required
        :error="passwordError"
      />

      <p v-if="error" class="login__error">
        {{ error }}
      </p>

      <BaseButton
        :label="auth.loading ? 'جاري تسجيل الدخول...' : 'دخول'"
        :loading="auth.loading"
        type="submit"
        size="lg"
      />
    </form>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.login {
  text-align: center;

  &__header { margin-bottom: 2rem; }

  &__logo { margin-bottom: 0.5rem; display: flex; justify-content: center; }

  &__title { font-size: $font-size-xl; color: $gray-900; margin-bottom: 0.25rem; }

  &__subtitle { color: $gray-500; font-size: $font-size-sm; }

  &__form { display: flex; flex-direction: column; gap: 1rem; }

  &__error {
    color: $danger-color; font-size: $font-size-sm;
    padding: 0.5rem; background: #fce4ec; border-radius: $border-radius-sm;
    display: flex; align-items: center; gap: 0.5rem; justify-content: center;
  }
}
</style>
