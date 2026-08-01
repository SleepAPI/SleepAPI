import type { TeamInstance } from '@/types/member/instanced'
import type { PokemonInstance } from 'sleepapi-common'

export interface TeamData extends Omit<TeamInstance, 'members'> {
  members: PokemonInstance[]
}
