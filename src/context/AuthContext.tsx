import React, { createContext, useContext, useEffect, useState } from "react"
import supabase from "../services/Supabase"
import type { User } from "@supabase/supabase-js"
import { acceptPendingInvites } from "../services/CollabService"

interface AuthContextType {
  user: User | null
  loading: boolean
  register: (email: string, password: string) => Promise<any>
  login: (email: string, password: string) => Promise<any>
  loginGoogle: () => Promise<any>
  logout: () => Promise<any>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      setLoading(false)
      // Accept any pending invites for this user
      if (sessionUser?.email) {
        acceptPendingInvites(sessionUser.id, sessionUser.email)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      // Accept pending invites whenever auth state changes (login)
      if (sessionUser?.email && _event === "SIGNED_IN") {
        acceptPendingInvites(sessionUser.id, sessionUser.email)
      }
    })

    return () => { listener?.subscription.unsubscribe() }
  }, [])

  const register = (email: string, password: string) =>
    supabase.auth.signUp({ email, password })

  const login = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  const loginGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: "google" })

  const logout = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)