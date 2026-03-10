'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi } from '@/services/api'
import type { User } from '@/types'

interface AuthContext {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const Ctx = createContext<AuthContext>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const u = await authApi.me() as User
      setUser(u)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    await authApi.login(email, password)
    await refresh()
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  return (
    <Ctx.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
