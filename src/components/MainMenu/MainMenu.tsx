import { useState } from 'react'
import { CreateGameModal } from './CreateGameModal'
import { JoinForm } from './JoinForm'

type Props = {
  onCreateGame: (code: string) => void
  onJoinGame: (code: string) => void
}

export function MainMenu({ onCreateGame, onJoinGame }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)

  const handleCreateGame = (code: string) => {
    setShowCreateModal(false)
    onCreateGame(code)
  }

  const handleJoinGame = (code: string) => {
    setShowJoinForm(false)
    onJoinGame(code)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-emerald-500 mb-2">LifeTap</h1>
          <p className="text-slate-400 text-lg">MTG Commander Life Counter</p>
        </div>

        {!showJoinForm ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xl rounded-lg transition-colors"
            >
              Create Game
            </button>
            <button
              onClick={() => setShowJoinForm(true)}
              className="w-full py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xl rounded-lg transition-colors"
            >
              Join Game
            </button>
          </div>
        ) : (
          <JoinForm
            onJoin={handleJoinGame}
            onCancel={() => setShowJoinForm(false)}
          />
        )}

        {showCreateModal && (
          <CreateGameModal
            onCreate={handleCreateGame}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </div>
  )
}
