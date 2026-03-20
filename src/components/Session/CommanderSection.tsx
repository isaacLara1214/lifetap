import { useState } from 'react'
import { Player } from '../../features/session/types'
import { useSession } from '../../features/session/SessionContext'
import { getTotalDamageFromCommander } from '../../features/session/utils'

type Props = {
  player: Player
  allPlayers: Player[]
}

export function CommanderSection({ player, allPlayers }: Props) {
  const { addCommanderDamage, removeCommanderDamage } = useSession()
  const [expanded, setExpanded] = useState(false)

  const commanderOwners = [
    player,
    ...allPlayers.filter((otherPlayer) => otherPlayer.id !== player.id),
  ]

  const handleDamageToSelf = (opponentId: string, opponentName: string, commanderId: string, damage: number) => {
    addCommanderDamage(player.id, opponentId, opponentName, commanderId, damage)
  }

  const handleRemoveDamageFromOpponent = (opponentId: string, commanderId: string, damage: number) => {
    const currentDamage = getTotalDamageFromCommander(player, opponentId, commanderId)
    if (currentDamage <= 0) return

    removeCommanderDamage(player.id, opponentId, commanderId, damage)
  }

  return (
    <div className="border-t border-white/20 pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-white/80 hover:text-white"
      >
        <span className="text-sm font-medium">Damage Taken</span>
        <span className="text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 max-h-[280px] overflow-y-auto">
          {commanderOwners.map((commanderOwner) => (
            <div key={commanderOwner.id} className="bg-black/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${
                  commanderOwner.isDead ? 'text-slate-500 line-through' : 'text-white'
                }`}>
                  {commanderOwner.id === player.id ? `${commanderOwner.name} (You)` : commanderOwner.name}
                </span>
              </div>

              <div className="space-y-2">
                {commanderOwner.commanders.map((commander) => {
                  const damage = getTotalDamageFromCommander(player, commanderOwner.id, commander.id)
                  
                  return (
                    <div key={commander.id} className="flex items-center gap-2">
                      <span className="flex-1 text-white/70 text-xs truncate">
                        {commander.name}
                      </span>
                      <span className={`text-xs font-bold min-w-[40px] text-center ${
                        damage >= 21 ? 'text-red-400' : 'text-white/60'
                      }`}>
                        {damage}/21
                      </span>
                      {!player.isDead && !commanderOwner.isDead && (
                        <div className="flex gap-1">
                          {[1, 5].map((dmg) => (
                            <button
                              key={dmg}
                              onClick={() => handleDamageToSelf(commanderOwner.id, commanderOwner.name, commander.id, dmg)}
                              className="w-6 h-6 bg-red-600 hover:bg-red-700 border-2 border-black text-white text-xs rounded transition-colors"
                            >
                              +{dmg}
                            </button>
                          ))}
                          <button
                            onClick={() => handleRemoveDamageFromOpponent(commanderOwner.id, commander.id, 1)}
                            disabled={damage === 0}
                            className="w-6 h-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900/40 disabled:text-white/40 disabled:cursor-not-allowed border-2 border-black text-white text-xs rounded transition-colors"
                          >
                            -1
                          </button>
                        </div>
                      )}
                      {player.isDead && (
                        <button
                          onClick={() => handleRemoveDamageFromOpponent(commanderOwner.id, commander.id, 1)}
                          disabled={damage === 0}
                          className="w-6 h-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900/40 disabled:text-white/40 disabled:cursor-not-allowed border-2 border-black text-white text-xs rounded transition-colors"
                        >
                          -1
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
