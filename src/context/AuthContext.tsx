import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { sanitizeDisplayName } from '../utils/sanitize'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAnonymous: boolean
  signInAsGuest: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  upgradeAccount: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signInAsGuest() {
    await signInAnonymously(auth)
  }

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signUpWithEmail(email: string, password: string, displayName: string) {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(newUser, { displayName: sanitizeDisplayName(displayName) })
    // Refresh local user state to reflect displayName
    setUser({ ...newUser, displayName: sanitizeDisplayName(displayName) } as User)
  }

  // Links an anonymous account to email/password, preserving the UID so any
  // Firestore data already written under the guest UID is retained.
  async function upgradeAccount(email: string, password: string, displayName: string) {
    if (!user) throw new Error('No authenticated user to upgrade.')
    const credential = EmailAuthProvider.credential(email, password)
    const { user: linked } = await linkWithCredential(user, credential)
    await updateProfile(linked, { displayName: sanitizeDisplayName(displayName) })
    setUser({ ...linked, displayName: sanitizeDisplayName(displayName) } as User)
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAnonymous: user?.isAnonymous ?? false,
        signInAsGuest,
        signInWithEmail,
        signUpWithEmail,
        upgradeAccount,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
