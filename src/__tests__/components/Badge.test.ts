import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '../../components/ui/Badge.vue'

describe('Badge', () => {
  it('يعرض المحتوى داخل slot', () => {
    const wrapper = mount(Badge, { slots: { default: 'نشط' } })
    expect(wrapper.text()).toContain('نشط')
  })

  it('يطبق class للـ variant الافتراضي', () => {
    const wrapper = mount(Badge, { slots: { default: 'نص' } })
    expect(wrapper.find('span').classes()).toContain('badge--gray')
  })

  it('يطبق class للـ variant success', () => {
    const wrapper = mount(Badge, { props: { variant: 'success' }, slots: { default: 'مكتمل' } })
    expect(wrapper.find('span').classes()).toContain('badge--success')
  })

  it('يطبق class للـ variant danger', () => {
    const wrapper = mount(Badge, { props: { variant: 'danger' }, slots: { default: 'خطأ' } })
    expect(wrapper.find('span').classes()).toContain('badge--danger')
  })
})
