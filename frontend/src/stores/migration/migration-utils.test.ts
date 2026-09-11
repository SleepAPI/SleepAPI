import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { useVersionStore } from '@/stores/version-store/version-store'
import { describe, expect, it, vi } from 'vitest'
import { getMigrations, getStores } from './migration-utils'

vi.mock('@/stores/avatar-store/avatar-store')
vi.mock('@/stores/comparison-store/comparison-store')
vi.mock('@/stores/notification-store/notification-store')
vi.mock('@/stores/pokedex-store/pokedex-store')
vi.mock('@/stores/pokemon/pokemon-store')
vi.mock('@/stores/team/team-store')
vi.mock('@/stores/user-store')
vi.mock('@/stores/version-store/version-store')

describe('migration-utils', () => {
  describe('getMigrations', () => {
    it('should return migrations sorted by version', () => {
      const migrations = getMigrations()

      expect(migrations).toHaveLength(6)
      expect(migrations).toMatchSnapshot()
    })
  })

  describe('getStores', () => {
    it('should return all initialized stores', () => {
      const stores = getStores()

      expect(Object.keys(stores)).toEqual([
        'avatar',
        'comparison',
        'notification',
        'pokemon',
        'team',
        'user',
        'version'
      ])

      expect(useAvatarStore).toHaveBeenCalled()
      expect(useComparisonStore).toHaveBeenCalled()
      expect(useNotificationStore).toHaveBeenCalled()
      expect(usePokemonStore).toHaveBeenCalled()
      expect(useTeamStore).toHaveBeenCalled()
      expect(useUserStore).toHaveBeenCalled()
      expect(useVersionStore).toHaveBeenCalled()
    })
  })
})
