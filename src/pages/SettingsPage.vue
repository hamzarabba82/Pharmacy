<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSettings, updateSettings } from '../api/settings'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import FormSelect from '../components/ui/FormSelect.vue'
import { getErrorMessage } from '../services/errorHandler'

const settings = ref<Record<string, string>>({})
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const currencyOptions = [
  { value: 'ر.س', label: 'ريال سعودي (ر.س)' },
  { value: 'د.ك', label: 'دينار كويتي (د.ك)' },
  { value: 'د.ع', label: 'دينار عراقي (د.ع)' },
  { value: 'ج.م', label: 'جنيه مصري (ج.م)' },
  { value: 'ل.س', label: 'ليرة سورية (ل.س)' },
  { value: '$', label: 'دولار أمريكي ($)' },
  { value: '€', label: 'يورو (€)' },
]

onMounted(async () => {
  try { settings.value = await getSettings() }
  catch { error.value = 'فشل تحميل الإعدادات' }
  finally { loading.value = false }
})

async function handleSave() {
  error.value = ''; success.value = ''; saving.value = true
  try {
    await updateSettings(settings.value)
    success.value = 'تم حفظ الإعدادات بنجاح'
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally { saving.value = false }
}
</script>

<template>
  <div class="settings">
    <div class="page-header">
      <h1>الإعدادات</h1>
    </div>

    <div v-if="loading" class="settings__loading">
      جاري التحميل...
    </div>
    <div v-else class="settings__card">
      <p v-if="error" class="settings__error">
        {{ error }}
      </p>
      <p v-if="success" class="settings__success">
        {{ success }}
      </p>

      <div class="settings__fields">
        <BaseInput v-model="settings.pharmacy_name" label="اسم الصيدلية" />
        <FormSelect v-model="settings.currency" label="العملة" :options="currencyOptions" />
        <BaseInput v-model="settings.tax_rate" label="نسبة الضريبة (%)" type="number" />
        <BaseInput v-model="settings.default_min_stock" label="حد التنبيه الافتراضي" type="number" />
        <BaseInput v-model="settings.address" label="العنوان" />
        <BaseInput v-model="settings.phone" label="الهاتف" />
      </div>

      <BaseButton :label="saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'" :loading="saving" @click="handleSave" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.settings {
  &__card { @include card; max-width: 600px; }
  &__fields { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
  &__loading { @include card; text-align: center; color: $gray-400; }
  &__error { color: $danger-color; margin-bottom: 1rem; padding: 0.5rem; background: #fce4ec; border-radius: $border-radius-sm; }
  &__success { color: $success-color; margin-bottom: 1rem; padding: 0.5rem; background: #dcfce7; border-radius: $border-radius-sm; }
}
</style>
