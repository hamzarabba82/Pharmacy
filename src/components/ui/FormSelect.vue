<script setup lang="ts">
interface Props {
  label?: string
  required?: boolean
  error?: string
  options: { value: string | number; label: string }[]
}
withDefaults(defineProps<Props>(), { required: false, label: '', error: '' })
const model = defineModel<string | number>({ required: true })
</script>

<template>
  <div class="form-select" :class="{ 'form-select--error': !!error }">
    <label v-if="label" class="form-select__label">
      {{ label }}<span v-if="required" class="form-select__required"> *</span>
    </label>
    <select v-model="model" class="form-select__field">
      <option value="" disabled>
        اختر...
      </option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="form-select__error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.form-select {
  display: flex; flex-direction: column; gap: 0.25rem;

  &__label { font-size: $font-size-sm; color: $gray-700; font-weight: 500; }
  &__required { color: $danger-color; }
  &__field {
    width: 100%; padding: 0.5rem 0.75rem;
    border: 1px solid $gray-300; border-radius: $border-radius-sm;
    font-size: $font-size-base; transition: border-color 0.2s; background: white;
    &:focus { outline: none; border-color: $primary-color; box-shadow: 0 0 0 3px rgba($primary-color, 0.1); }
  }
  &__error { color: $danger-color; font-size: $font-size-xs; margin-top: 0.125rem; }

  &--error .form-select__field { border-color: $danger-color; }
}
</style>
