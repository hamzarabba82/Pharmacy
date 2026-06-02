<script setup lang="ts">
interface Props {
  label?: string
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password' | 'date'
  error?: string
  required?: boolean
  readonly?: boolean
}
withDefaults(defineProps<Props>(), {
  type: 'text', required: false, readonly: false,
  label: '', placeholder: '', error: '',
})
const model = defineModel<string | number>({ required: true })
</script>

<template>
  <div class="base-input" :class="{ 'base-input--error': !!error }">
    <label v-if="label" class="base-input__label">
      {{ label }}<span v-if="required" class="base-input__required"> *</span>
    </label>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :readonly="readonly"
      class="base-input__field"
      :class="{ 'base-input__field--readonly': readonly }"
    >
    <p v-if="error" class="base-input__error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.base-input {
  display: flex; flex-direction: column; gap: 0.25rem;

  &__label { font-size: $font-size-sm; color: $gray-700; font-weight: 500; }
  &__field--readonly { background: $gray-100; cursor: not-allowed; opacity: 0.8; }
  &__required { color: $danger-color; }
  &__field {
    width: 100%; padding: 0.5rem 0.75rem;
    border: 1px solid $gray-300; border-radius: $border-radius-sm;
    font-size: $font-size-base; transition: border-color 0.2s;
    &:focus { outline: none; border-color: $primary-color; box-shadow: 0 0 0 3px rgba($primary-color, 0.1); }
  }
  &__error { color: $danger-color; font-size: $font-size-xs; margin-top: 0.125rem; }

  &--error .base-input__field { border-color: $danger-color; }
}
</style>
