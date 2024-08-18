import serverAxios from '@/router/server-axios'
import { UserService } from '@/services/user/user-service'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { createMockPokemon } from '@/vitest'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/router/server-axios', () => ({
  default: {
    put: vi.fn(() => ({ data: 'ok put' })),
    get: vi.fn(() => ({ data: [] })),
    delete: vi.fn(() => ({ data: 'ok del' }))
  }
}))

const mockPokemon = createMockPokemon()

describe('getUserPokemon', () => {
  it('should call server to get saved mons', async () => {
    await UserService.getUserPokemon()

    expect(serverAxios.get).toHaveBeenCalledWith('user/pokemon')
  })
})

describe('upsertPokemon', () => {
  it('should call server to get upsert mon', async () => {
    await UserService.upsertPokemon(mockPokemon)

    const req = PokemonInstanceUtils.toUpsertTeamMemberRequest(mockPokemon)

    expect(serverAxios.put).toHaveBeenCalledWith('user/pokemon', req)
  })
})

describe('deletePokemon', () => {
  it('should call server to get delete mon', async () => {
    await UserService.deletePokemon(mockPokemon.externalId)

    expect(serverAxios.delete).toHaveBeenCalledWith('user/pokemon/external-id')
  })
})
