export const PAYMENT_METHODS: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  network: 'شبكة',
}

export const PAYMENT_OPTIONS = [
  { value: 'cash', label: PAYMENT_METHODS.cash },
  { value: 'card', label: PAYMENT_METHODS.card },
  { value: 'network', label: PAYMENT_METHODS.network },
]