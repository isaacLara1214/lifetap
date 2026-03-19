import { useSession } from '../../features/session/SessionContext'
import { PlayerCard } from './PlayerCard'

type Props = {
  onBackToMenu: () => void
}

export function Session({ onBackToMenu }: Props) {
  const { session, resetSession, leaveSession } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading session...</p>
      </div>
    )
  }

  const players = Object.values(session.players)
  const alivePlayers = players.filter(p => !p.isDead)

  const handleReset = () => {
    if (window.confirm('Reset all life totals and commander damage to starting values?')) {
      resetSession()
    }
  }

  const handleLeave = () => {
    leaveSession()
    onBackToMenu()
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">LifeTap</h1>
            <p className="text-slate-400">
              Session: <span className="font-mono text-lg text-white">{session.code}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleLeave}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
        
        {alivePlayers.length === 1 && (
          <div className="mt-4 p-4 bg-emerald-600/20 border border-emerald-500/50 rounded-lg text-center">
            <p className="text-emerald-400 font-bold text-xl">
              {alivePlayers[0].name} Wins!
            </p>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-auto">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              allPlayers={players}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
