import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { Session, Player, PlayerLock } from './types'
import { generateSessionCode, generatePlayerId, createPlaceholderPlayer, generateCommanderId, createDefaultCommander } from './utils'
import { PLAYER_COLORS } from './types'
import { subscribeToSession, createSession as fbCreateSession, updatePlayer as fbUpdatePlayer, deleteSession, setPlayerOnline, acquireLock, releaseLock } from '../../lib/firebase'

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value.filter((item) => item != null) as T[]
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, T>)
  }
  return []
}

function normalizePlayer(player: Player): Player {
  return {
    ...player,
    commanders: toArray(player.commanders),
    damageReceived: toArray(player.damageReceived),
  }
}

function normalizeSession(session: Session): Session {
  const players: Record<string, Player> = {}

  for (const [id, player] of Object.entries(session.players ?? {})) {
    players[id] = normalizePlayer(player)
  }

  return {
    ...session,
    players: players,
    locks: session.locks ?? {},
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

type SessionContextType = {
  session: Session | null
  currentPlayerId: string
  isLoading: boolean
  error: string | null
  createSession: (playerCount: number, playerName: string) => Promise<string>
  joinSession: (code: string) => Promise<boolean>
  updatePlayer: (playerId: string, updates: Partial<Player>) => void
  addLife: (playerId: string, delta: number) => void
  addCommanderDamage: (defenderId: string, attackerId: string, attackerName: string, commanderId: string, damage: number) => void
  removeCommanderDamage: (defenderId: string, attackerId: string, commanderId: string, damage: number) => void
  resetSession: () => void
  leaveSession: () => void
  acquireCardLock: (cardId: string) => void
  releaseCardLock: (cardId: string) => void
}

const SessionContext = createContext<SessionContextType | null>(null)

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}

type Props = { children: ReactNode }

export function SessionProvider({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('')
  const [sessionCode, setSessionCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  const cleanupSubscription = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
  }, [])

  const createSession = useCallback(async (playerCount: number, playerName: string): Promise<string> => {
    setIsLoading(true)
    setError(null)
    cleanupSubscription()
    
    try {
      const code = generateSessionCode()
      const playerId = generatePlayerId()
      
      const players: Record<string, Player> = {}
      
      for (let i = 0; i < playerCount; i++) {
        const id = i === 0 ? playerId : generatePlayerId()
        const color = PLAYER_COLORS[i % PLAYER_COLORS.length]
        players[id] = createPlaceholderPlayer(id, i, color)
        if (i === 0) {
          players[id].name = playerName
          players[id].joinedAt = Date.now()
          players[id].lastSeenAt = Date.now()
        }
      }
      
      const newSession: Session = {
        code,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'active',
        creatorId: playerId,
        playerCount,
        players,
        locks: {},
      }
      
      setSession(newSession)
      setSessionCode(code)
      setCurrentPlayerId(playerId)
      
      await fbCreateSession(newSession)
      setPlayerOnline(code, playerId)
      
      unsubscribeRef.current = subscribeToSession(code, (firebaseSession) => {
        if (firebaseSession) {
          setSession(normalizeSession(firebaseSession))
        }
      })
      
      setIsLoading(false)
      return code
    } catch (err) {
      console.error('Failed to create session:', err)
      setError(getErrorMessage(err, 'Failed to create session'))
      setIsLoading(false)
      throw err
    }
  }, [cleanupSubscription])

  const joinSession = useCallback(async (code: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    cleanupSubscription()
    
    try {
      const normalizedCode = code.trim().toUpperCase()
      
      const handleSession = (firebaseSession: Session | null) => {
        if (!firebaseSession) {
          setError('Session not found')
          setIsLoading(false)
          return
        }

        const normalizedSession = normalizeSession(firebaseSession)
        setSession(normalizedSession)
        setSessionCode(normalizedCode)
        setIsLoading(false)
      }
      
      unsubscribeRef.current = subscribeToSession(normalizedCode, handleSession)
      setSessionCode(normalizedCode)
      
      return true
    } catch (err) {
      console.error('Failed to join session:', err)
      setError(getErrorMessage(err, 'Failed to join session'))
      setIsLoading(false)
      return false
    }
  }, [cleanupSubscription])

  const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
    if (!sessionCode) return
    
    const player = session?.players[playerId]
    if (!player) return

    let finalUpdates = { ...updates }

    if (updates.commanderCount !== undefined && updates.commanderCount !== player.commanderCount) {
      const targetCount = updates.commanderCount
      const commanders = [...player.commanders]

      if (targetCount > commanders.length) {
        while (commanders.length < targetCount) {
          const id = generateCommanderId()
          commanders.push(createDefaultCommander(id, commanders.length + 1))
        }
      } else if (targetCount < commanders.length) {
        commanders.splice(targetCount)
      }

      finalUpdates = {
        ...finalUpdates,
        commanders,
        commanderCount: targetCount
      }
    }

    fbUpdatePlayer(sessionCode, playerId, finalUpdates)
  }, [session, sessionCode])

  const addLife = useCallback((playerId: string, delta: number) => {
    if (!sessionCode || !session) return
    
    const player = session.players[playerId]
    if (!player) return
    
    const newLife = player.life + delta
    fbUpdatePlayer(sessionCode, playerId, { life: newLife })
  }, [session, sessionCode])

  const addCommanderDamage = useCallback((
    defenderId: string,
    attackerId: string,
    attackerName: string,
    commanderId: string,
    damage: number
  ) => {
    if (!sessionCode || !session) return
    
    const defender = session.players[defenderId]
    if (!defender || defender.isDead) return
    
    const attacker = session.players[attackerId]
    if (!attacker) return

    const commander = attacker.commanders.find(c => c.id === commanderId)
    if (!commander) return

    const newLife = defender.life - damage

    const damageReceived = Array.isArray(defender.damageReceived)
      ? [...defender.damageReceived]
      : []
    const existingEntryIndex = damageReceived.findIndex(e => e.opponentId === attackerId)
    
    if (existingEntryIndex >= 0) {
      const existingEntry = { ...damageReceived[existingEntryIndex] }
      existingEntry.damageByCommander = { ...existingEntry.damageByCommander }
      existingEntry.damageByCommander[commanderId] = (existingEntry.damageByCommander[commanderId] || 0) + damage
      damageReceived[existingEntryIndex] = existingEntry
    } else {
      damageReceived.push({
        opponentId: attackerId,
        opponentName: attackerName,
        damageByCommander: { [commanderId]: damage }
      })
    }

    fbUpdatePlayer(sessionCode, defenderId, { life: newLife, damageReceived })
  }, [session, sessionCode])

  const removeCommanderDamage = useCallback((
    defenderId: string,
    attackerId: string,
    commanderId: string,
    damage: number
  ) => {
    if (!sessionCode || !session) return
    
    const defender = session.players[defenderId]
    if (!defender) return
    
    const damageReceived = Array.isArray(defender.damageReceived)
      ? [...defender.damageReceived]
      : []
    const existingEntryIndex = damageReceived.findIndex(e => e.opponentId === attackerId)
    
    if (existingEntryIndex < 0) return
    
    const existingEntry = { ...damageReceived[existingEntryIndex] }
    existingEntry.damageByCommander = { ...existingEntry.damageByCommander }

    const currentDamage = existingEntry.damageByCommander[commanderId] || 0
    const newDamage = Math.max(0, currentDamage - damage)
    const lifeRestore = currentDamage - newDamage

    if (newDamage === 0) {
      delete existingEntry.damageByCommander[commanderId]
    } else {
      existingEntry.damageByCommander[commanderId] = newDamage
    }
    
    if (Object.keys(existingEntry.damageByCommander).length === 0) {
      damageReceived.splice(existingEntryIndex, 1)
    } else {
      damageReceived[existingEntryIndex] = existingEntry
    }

    fbUpdatePlayer(sessionCode, defenderId, {
      life: defender.life + lifeRestore,
      damageReceived
    })
  }, [session, sessionCode])

  const resetSession = useCallback(() => {
    if (!sessionCode || !session) return
    
    for (const playerId of Object.keys(session.players)) {
      fbUpdatePlayer(sessionCode, playerId, {
        life: 40,
        damageReceived: [],
        isDead: false
      })
    }
  }, [session, sessionCode])

  const acquireCardLock = useCallback((cardId: string) => {
    if (!sessionCode || !session) return
    
    const player = session.players[currentPlayerId]
    if (!player) return
    
    const lock: PlayerLock = {
      playerId: currentPlayerId,
      playerName: player.name,
      lockedAt: Date.now(),
    }
    
    acquireLock(sessionCode, cardId, lock)
  }, [session, sessionCode, currentPlayerId])

  const releaseCardLock = useCallback((cardId: string) => {
    if (!sessionCode) return
    releaseLock(sessionCode, cardId)
  }, [sessionCode])

  const leaveSession = useCallback(async () => {
    cleanupSubscription()
    
    if (sessionCode && session?.creatorId === currentPlayerId) {
      try {
        await deleteSession(sessionCode)
      } catch (err) {
        console.error('Failed to delete session:', err)
      }
    }
    
    setSession(null)
    setCurrentPlayerId('')
    setSessionCode('')
    setError(null)
  }, [session, sessionCode, currentPlayerId, cleanupSubscription])

  return (
    <SessionContext.Provider value={{
      session,
      currentPlayerId,
      isLoading,
      error,
      createSession,
      joinSession,
      updatePlayer,
      addLife,
      addCommanderDamage,
      removeCommanderDamage,
      resetSession,
      leaveSession,
      acquireCardLock,
      releaseCardLock,
    }}>
      {children}
    </SessionContext.Provider>
  )
}
