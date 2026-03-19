import { ref, onValue, set, update, remove, onDisconnect, getFirebaseDatabase } from './config'
import type { Session, Player, PlayerLock } from '../../features/session/types'

export function subscribeToSession(code: string, callback: (session: Session | null) => void) {
  const db = getFirebaseDatabase()
  const sessionRef = ref(db, `sessions/${code}`)
  
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      callback(data as Session)
    } else {
      callback(null)
    }
  })
  
  return unsubscribe
}

export function createSession(session: Session): Promise<void> {
  const db = getFirebaseDatabase()
  const sessionRef = ref(db, `sessions/${session.code}`)
  return set(sessionRef, session)
}

export function updateSession(code: string, updates: Partial<Session>): Promise<void> {
  const db = getFirebaseDatabase()
  const sessionRef = ref(db, `sessions/${code}`)
  return update(sessionRef, {
    ...updates,
    updatedAt: Date.now(),
  })
}

export function updatePlayer(code: string, playerId: string, updates: Partial<Player>): Promise<void> {
  const db = getFirebaseDatabase()
  const playerRef = ref(db, `sessions/${code}/players/${playerId}`)
  return update(playerRef, updates)
}

export function deleteSession(code: string): Promise<void> {
  const db = getFirebaseDatabase()
  const sessionRef = ref(db, `sessions/${code}`)
  return remove(sessionRef)
}

export function setPlayerOnline(code: string, playerId: string): void {
  const db = getFirebaseDatabase()
  const playerRef = ref(db, `sessions/${code}/players/${playerId}/lastSeenAt`)
  set(playerRef, Date.now())
  
  onDisconnect(playerRef).set(Date.now())
}

export function addPlayerToSession(code: string, player: Player): Promise<void> {
  const db = getFirebaseDatabase()
  const playerRef = ref(db, `sessions/${code}/players/${player.id}`)
  return set(playerRef, player)
}

export function acquireLock(code: string, cardId: string, lock: PlayerLock): Promise<void> {
  const db = getFirebaseDatabase()
  const lockRef = ref(db, `sessions/${code}/locks/${cardId}`)
  return set(lockRef, lock)
}

export function releaseLock(code: string, cardId: string): Promise<void> {
  const db = getFirebaseDatabase()
  const lockRef = ref(db, `sessions/${code}/locks/${cardId}`)
  return remove(lockRef)
}
