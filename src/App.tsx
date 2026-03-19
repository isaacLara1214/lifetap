import { useState } from 'react'
import { MainMenu } from './components/MainMenu/MainMenu'
import { Session } from './components/Session/Session'
import { SessionProvider } from './features/session/SessionContext'

export type Page = 'menu' | 'session'

function App() {
  const [page, setPage] = useState<Page>('menu')
  const [, setSessionCode] = useState<string>('')

  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-900 text-white">
        {page === 'menu' && (
          <MainMenu 
            onCreateGame={(code) => {
              setSessionCode(code)
              setPage('session')
            }}
            onJoinGame={(code) => {
              setSessionCode(code)
              setPage('session')
            }}
          />
        )}
        {page === 'session' && (
          <Session 
            onBackToMenu={() => setPage('menu')}
          />
        )}
      </div>
    </SessionProvider>
  )
}

export default App
