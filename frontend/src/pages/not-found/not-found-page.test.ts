import NotFoundPage from '@/pages/not-found/not-found-page.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
describe('NotFoundPage.vue', () => {
  it('renders the correct content', () => {
    const wrapper = mount(NotFoundPage)
    expect(wrapper.text()).toContain('Not found')
  })
})
