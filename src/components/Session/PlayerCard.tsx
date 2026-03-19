import { useState, useEffect, useRef, useCallback } from 'react'
import { Player, PLAYER_COLORS, LOCK_TIMEOUT_MS } from '../../features/session/types'
import { useSession } from '../../features/session/SessionContext'
import { checkDeath } from '../../features/session/utils'
import { LifeControls } from './LifeControls'
import { FloatingDelta } from './FloatingDelta'
import { CommanderSection } from './CommanderSection'

type Props = {
  player: Player
  allPlayers: Player[]
}

export function PlayerCard({ player, allPlayers }: Props) {
  const { session, currentPlayerId, updatePlayer, addLife, acquireCardLock, releaseCardLock } = useSession()
  const [isDead, setIsDead] = useState(player.isDead)
  const [showSettings, setShowSettings] = useState(false)
  const [displayDelta, setDisplayDelta] = useState<number | null>(null)
  const [isDeltaFading, setIsDeltaFading] = useState(false)
  const cumulativeRef = useRef(0)
  const fadeStartTimeoutRef = useRef<number | null>(null)
  const lockTimeoutRef = useRef<number | null>(null)
  const lockRefreshIntervalRef = useRef<number | null>(null)

  const lock = session?.locks?.[player.id]
  const isLockedByOther = lock && lock.playerId !== currentPlayerId
  const lockAge = lock ? Date.now() - lock.lockedAt : 0
  const isLockStale = lockAge > LOCK_TIMEOUT_MS

  useEffect(() => {
    const dead = checkDeath(player)
    if (dead !== isDead) {
      setIsDead(dead)
      if (dead) {
        updatePlayer(player.id, { isDead: true })
      }
    }
  }, [player, isDead, updatePlayer])

  useEffect(() => {
    return () => {
      if (fadeStartTimeoutRef.current) {
        window.clearTimeout(fadeStartTimeoutRef.current)
      }
      if (lockTimeoutRef.current) {
        window.clearTimeout(lockTimeoutRef.current)
      }
      if (lockRefreshIntervalRef.current) {
        window.clearInterval(lockRefreshIntervalRef.current)
      }
    }
  }, [])

  const clearLockState = useCallback(() => {
    if (lockTimeoutRef.current) {
      window.clearTimeout(lockTimeoutRef.current)
      lockTimeoutRef.current = null
    }
    if (lockRefreshIntervalRef.current) {
      window.clearInterval(lockRefreshIntervalRef.current)
      lockRefreshIntervalRef.current = null
    }
  }, [])

  const handleOpenSettings = () => {
    if (isDead) return
    
    if (isLockedByOther && !isLockStale) return
    
    acquireCardLock(player.id)
    setShowSettings(true)
    
    lockRefreshIntervalRef.current = window.setInterval(() => {
      acquireCardLock(player.id)
    }, LOCK_TIMEOUT_MS / 2)
    
    lockTimeoutRef.current = window.setTimeout(() => {
      clearLockState()
    }, LOCK_TIMEOUT_MS)
  }

  const handleCloseSettings = () => {
    clearLockState()
    releaseCardLock(player.id)
    setShowSettings(false)
  }

  const handleLifeChange = (change: number) => {
    addLife(player.id, change)

    cumulativeRef.current += change
    setDisplayDelta(cumulativeRef.current)
    setIsDeltaFading(false)

    if (fadeStartTimeoutRef.current) {
      window.clearTimeout(fadeStartTimeoutRef.current)
    }

    fadeStartTimeoutRef.current = window.setTimeout(() => {
      setIsDeltaFading(true)
    }, 500)
  }

  const handleDeltaFadeComplete = () => {
    if (!isDeltaFading) return

    setIsDeltaFading(false)
    setDisplayDelta(null)
    cumulativeRef.current = 0
  }

  const cardStyle = {
    backgroundColor: player.color,
    opacity: isDead ? 0.4 : isLockedByOther ? 0.6 : 1,
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-lg transition-all ${
        isDead ? 'filter grayscale' : ''
      } ${isLockedByOther ? 'ring-2 ring-yellow-500' : ''}`}
      style={cardStyle}
    >
      {isDead && (
        <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center">
          <span className="text-4xl font-bold text-slate-400">DEAD</span>
        </div>
      )}

      {isLockedByOther && !isDead && (
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none">
          <span className="text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded">
            {lock.playerName} is editing...
          </span>
        </div>
      )}

      <div className="p-4 flex flex-col">
        {showSettings ? (
          <SettingsPanel
            player={player}
            onClose={handleCloseSettings}
            onActivity={() => {
              clearLockState()
              acquireCardLock(player.id)
              lockTimeoutRef.current = window.setTimeout(() => {
                clearLockState()
              }, LOCK_TIMEOUT_MS)
              lockRefreshIntervalRef.current = window.setInterval(() => {
                acquireCardLock(player.id)
              }, LOCK_TIMEOUT_MS / 2)
            }}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3
                onClick={handleOpenSettings}
                className={`text-xl font-bold text-white truncate ${
                  !isDead && (!isLockedByOther || isLockStale) ? 'cursor-pointer hover:underline' : 'cursor-not-allowed'
                }`}
                title={isLockedByOther ? `Locked by ${lock.playerName}` : 'Click to edit settings'}
              >
                {player.name}
              </h3>
              <span className="text-white/60 text-sm">⚙️</span>
            </div>

            <div className="relative text-center mb-4 overflow-visible">
              <div className="text-6xl font-bold text-white">
                {player.life}
              </div>
              <FloatingDelta
                delta={displayDelta}
                isFading={isDeltaFading}
                onFadeComplete={handleDeltaFadeComplete}
              />
            </div>

            {!isDead && (
              <LifeControls onChange={handleLifeChange} />
            )}

            {!isDead && (
              <CommanderSection player={player} allPlayers={allPlayers} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

type SettingsPanelProps = {
  player: Player
  onClose: () => void
  onActivity: () => void
}

function SettingsPanel({ player, onClose, onActivity }: SettingsPanelProps) {
  const { updatePlayer } = useSession()
  const [nameValue, setNameValue] = useState(player.name)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  const handleNameChange = (name: string) => {
    setNameValue(name)
    if (name.trim()) {
      onActivity()
      updatePlayer(player.id, { name: name.trim() })
    }
  }

  const handleColorChange = (color: string) => {
    onActivity()
    updatePlayer(player.id, { color })
  }

  const handleCommanderCountChange = (count: 1 | 2) => {
    onActivity()
    updatePlayer(player.id, { commanderCount: count })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Settings</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <label className="block text-white/80 text-sm mb-2">Name</label>
          <input
            ref={nameInputRef}
            type="text"
            value={nameValue}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
            maxLength={20}
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-2">Color</label>
          <div className="grid grid-cols-5 gap-2">
            {PLAYER_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-full aspect-square rounded-lg transition-transform hover:scale-105 ${
                  color === player.color ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-2">Commanders</label>
          <div className="flex gap-2 mb-3">
            {[1, 2].map((num) => (
              <button
                key={num}
                onClick={() => handleCommanderCountChange(num as 1 | 2)}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  player.commanderCount === num
                    ? 'bg-white/40 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {player.commanders.map((commander, index) => (
              <div key={commander.id} className="flex items-center gap-2">
                <span className="text-white/60 text-xs w-8">C{index + 1}</span>
                <input
                  type="text"
                  value={commander.name}
                  onChange={(e) => {
                    onActivity()
                    const commanders = [...player.commanders]
                    commanders[index] = { ...commanders[index], name: e.target.value }
                    updatePlayer(player.id, { commanders })
                  }}
                  className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded focus:outline-none focus:bg-white/20"
                  placeholder={`Commander ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
