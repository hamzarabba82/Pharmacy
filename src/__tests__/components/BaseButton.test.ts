import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../../components/ui/BaseButton.vue'

describe('BaseButton', () => {
  it('يعرض الـ label', () => {
    const wrapper = mount(BaseButton, { props: { label: 'حفظ' } })
    expect(wrapper.text()).toContain('حفظ')
  })

  it('يرسل emit click عند الضغط', async () => {
    const wrapper = mount(BaseButton, { props: { label: 'حفظ' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('لا يرسل click عندما disabled = true', async () => {
    const wrapper = mount(BaseButton, { props: { label: 'حفظ', disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('يظهر spinner عندما loading = true', () => {
    const wrapper = mount(BaseButton, { props: { label: 'حفظ', loading: true } })
    expect(wrapper.find('.base-btn__spinner').exists()).toBe(true)
  })

  it('يكون معطل أثناء التحميل', () => {
    const wrapper = mount(BaseButton, { props: { label: 'حفظ', loading: true } })
    expect(wrapper.find('button').element.disabled).toBe(true)
  })

  it('يطبق class danger', () => {
    const wrapper = mount(BaseButton, { props: { label: 'حفظ', variant: 'danger' } })
    expect(wrapper.find('button').classes()).toContain('base-btn--danger')
  })

  it('يطبق class ghost', () => {
    const wrapper = mount(BaseButton, { props: { label: 'حفظ', variant: 'ghost' } })
    expect(wrapper.find('button').classes()).toContain('base-btn--ghost')
  })
})
