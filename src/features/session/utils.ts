import { Player, Commander, COMMANDER_DEATH_DAMAGE } from './types'

export function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function generateCommanderId(): string {
  return `commander_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function createDefaultCommander(id: string, index: number): Commander {
  return {
    id,
    name: `Commander ${index}`,
  }
}

export function createPlaceholderPlayer(
  id: string,
  index: number,
  color: string
): Player {
  const commanderId = generateCommanderId()
  return {
    id,
    name: `Player ${index + 1}`,
    life: 40,
    color,
    commanderCount: 1,
    commanders: [createDefaultCommander(commanderId, 1)],
    damageReceived: [],
    joinedAt: 0,
    lastSeenAt: 0,
    isDead: false,
  }
}

export function checkDeath(player: Player): boolean {
  if (player.life <= 0) return true
  
  for (const entry of player.damageReceived) {
    for (const damage of Object.values(entry.damageByCommander)) {
      if (damage >= COMMANDER_DEATH_DAMAGE) return true
    }
  }
  
  return false
}

export function getTotalDamageFromCommander(player: Player, opponentId: string, commanderId: string): number {
  const entry = player.damageReceived.find(e => e.opponentId === opponentId)
  if (!entry) return 0
  return entry.damageByCommander[commanderId] || 0
}

export function getTotalDamageFromOpponent(player: Player, opponentId: string): number {
  const entry = player.damageReceived.find(e => e.opponentId === opponentId)
  if (!entry) return 0
  return Object.values(entry.damageByCommander).reduce((sum, d) => sum + d, 0)
}
