import { ref } from 'vue'

interface ConfirmState {
  show: boolean
  message: string
  resolve: ((value: boolean) => void) | null
}

const state = ref<ConfirmState>({ show: false, message: '', resolve: null })

export function useConfirm() {
  function confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      state.value = { show: true, message, resolve }
    })
  }

  function resolveConfirm(value: boolean) {
    if (state.value.resolve) {
      state.value.resolve(value)
    }
    state.value = { show: false, message: '', resolve: null }
  }

  return { state, confirm, resolveConfirm }
}
