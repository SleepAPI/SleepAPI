export interface TeamCombinedProduction {
  // TODO: expand
  berries: string
  ingredients: string
}
export interface TeamProduction {
  team: TeamCombinedProduction
  members: { berries: string; ingredients: string; skillProcs: number; externalId: string }[] // TODO: expand
}
export interface TeamInstance {
  index: number
  name: string
  camp: boolean
  bedtime: string
  wakeup: string
  version: number
  members: (string | undefined)[]
  production?: TeamProduction
}

export const MAX_TEAM_MEMBERS = 5
export const MAX_TEAMS = 5
export const DEFAULT_SLEEP = {
  bedtime: '21:30',
  wakeup: '06:00'
}
