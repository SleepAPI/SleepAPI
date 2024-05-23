import { useUserStore } from '@/stores/user-store'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have expected default state', () => {
    const userStore = useUserStore()
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "avatar": null,
        "name": "Guest",
        "tokens": null,
      }
    `)
  })
})
