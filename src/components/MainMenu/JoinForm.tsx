import { useState } from 'react'
import { useSession } from '../../features/session/SessionContext'

type Props = {
  onJoin: (code: string) => void
  onCancel: () => void
}

export function JoinForm({ onJoin, onCancel }: Props) {
  const [code, setCode] = useState('')
  const { joinSession, isLoading, error } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    
    const success = await joinSession(code.trim())
    if (success) {
      onJoin(code.trim().toUpperCase())
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Join Game</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 mb-2">Session Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            maxLength={6}
            className="w-full px-4 py-3 bg-slate-700 text-white text-2xl text-center tracking-widest uppercase rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!code.trim() || isLoading}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Joining...' : 'Join'}
          </button>
        </div>
      </form>
    </div>
  )
}
