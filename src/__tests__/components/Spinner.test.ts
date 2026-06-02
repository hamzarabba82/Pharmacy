import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Spinner from '../../components/ui/Spinner.vue'

describe('Spinner', () => {
  it('يظهر spinner بالحجم الافتراضي', () => {
    const wrapper = mount(Spinner)
    expect(wrapper.find('span').exists()).toBe(true)
    expect(wrapper.find('span').classes()).toContain('spinner--md')
  })

  it('يظهر spinner بحجم sm', () => {
    const wrapper = mount(Spinner, { props: { size: 'sm' } })
    expect(wrapper.find('span').classes()).toContain('spinner--sm')
  })

  it('يظهر spinner بحجم lg', () => {
    const wrapper = mount(Spinner, { props: { size: 'lg' } })
    expect(wrapper.find('span').classes()).toContain('spinner--lg')
  })
})
