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

  const opponents = allPlayers.filter(p => p.id !== player.id)

  const handleDamageToSelf = (opponentId: string, opponentName: string, commanderId: string, damage: number) => {
    addCommanderDamage(player.id, opponentId, opponentName, commanderId, damage)
  }

  const handleRemoveDamageFromOpponent = (opponentId: string, commanderId: string, damage: number) => {
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
          {opponents.map((opponent) => (
            <div key={opponent.id} className="bg-black/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${
                  opponent.isDead ? 'text-slate-500 line-through' : 'text-white'
                }`}>
                  {opponent.name}
                </span>
              </div>

              <div className="space-y-2">
                {opponent.commanders.map((commander) => {
                  const damage = getTotalDamageFromCommander(player, opponent.id, commander.id)
                  
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
                      {!player.isDead && !opponent.isDead && (
                        <div className="flex gap-1">
                          {[1, 5].map((dmg) => (
                            <button
                              key={dmg}
                              onClick={() => handleDamageToSelf(opponent.id, opponent.name, commander.id, dmg)}
                              className="w-6 h-6 bg-red-600/60 hover:bg-red-600 text-white text-xs rounded transition-colors"
                            >
                              +{dmg}
                            </button>
                          ))}
                          {damage > 0 && (
                            <button
                              onClick={() => handleRemoveDamageFromOpponent(opponent.id, commander.id, 1)}
                              className="w-6 h-6 bg-emerald-600/60 hover:bg-emerald-600 text-white text-xs rounded transition-colors"
                            >
                              -
                            </button>
                          )}
                        </div>
                      )}
                      {player.isDead && damage > 0 && (
                        <button
                          onClick={() => handleRemoveDamageFromOpponent(opponent.id, commander.id, 1)}
                          className="w-6 h-6 bg-emerald-600/60 hover:bg-emerald-600 text-white text-xs rounded transition-colors"
                        >
                          -
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
