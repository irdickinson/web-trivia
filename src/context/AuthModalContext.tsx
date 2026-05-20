import { createContext, useContext, useState, ReactNode } from 'react'

type AuthModalTab = 'signin' | 'signup'

interface AuthModalContextValue {
  isOpen: boolean
  tab: AuthModalTab
  open: (tab?: AuthModalTab) => void
  close: () => void
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<AuthModalTab>('signin')

  function open(t: AuthModalTab = 'signin') {
    setTab(t)
    setIsOpen(true)
  }

  return (
    <AuthModalContext.Provider value={{ isOpen, tab, open, close: () => setIsOpen(false) }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used inside <AuthModalProvider>')
  return ctx
}
