import { useState } from 'react'
import { useSession } from '../../features/session/SessionContext'
import { PLAYER_COUNT_MIN, PLAYER_COUNT_MAX } from '../../features/session/types'

type Props = {
  onCreate: (code: string) => void
  onClose: () => void
}

export function CreateGameModal({ onCreate, onClose }: Props) {
  const [playerCount, setPlayerCount] = useState(4)
  const [playerName, setPlayerName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { createSession } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim() || isCreating) return
    
    setIsCreating(true)
    try {
      const code = await createSession(playerCount, playerName.trim())
      onCreate(code)
    } catch (err) {
      console.error('Failed to create session:', err)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Game</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">
              Number of Players: <span className="text-emerald-400 font-bold">{playerCount}</span>
            </label>
            <input
              type="range"
              min={PLAYER_COUNT_MIN}
              max={PLAYER_COUNT_MAX}
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-slate-500 text-sm mt-1">
              <span>{PLAYER_COUNT_MIN}</span>
              <span>{PLAYER_COUNT_MAX}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!playerName.trim() || isCreating}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
