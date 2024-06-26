export interface TeamInstance {
  index: number
  name: string
  camp: boolean
  version: number
  members: (string | undefined)[]
  production: undefined
}

export const MAX_TEAM_MEMBERS = 5
export const MAX_TEAMS = 5
