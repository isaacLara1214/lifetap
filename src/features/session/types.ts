export type Commander = {
  id: string
  name: string
}

export type DamageReceived = {
  opponentId: string
  opponentName: string
  damageByCommander: Record<string, number> // commanderId -> damage
}

export type Player = {
  id: string
  name: string
  life: number
  color: string
  commanderCount: 1 | 2
  commanders: Commander[]
  damageReceived: DamageReceived[]
  joinedAt: number
  lastSeenAt: number
  isDead: boolean
}

export type PlayerLock = {
  playerId: string
  playerName: string
  lockedAt: number
}

export type Session = {
  code: string
  createdAt: number
  updatedAt: number
  status: 'active' | 'closed'
  creatorId: string
  playerCount: number
  players: Record<string, Player>
  locks: Record<string, PlayerLock> // cardId -> lock info
}

export const LOCK_TIMEOUT_MS = 3000 // 3 seconds

export const PLAYER_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
] as const

export const DEFAULT_STARTING_LIFE = 40
export const COMMANDER_DEATH_DAMAGE = 21
export const PLAYER_COUNT_MIN = 2
export const PLAYER_COUNT_MAX = 10
