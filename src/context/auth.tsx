import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthUser } from '@/types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isITAdmin: boolean
  isManager: boolean
  permittedRoles: string[]
  login: () => void
  logout: () => void
  getAccessToken: () => Promise<string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const MOCK_USER: AuthUser = {
  email: import.meta.env.VITE_MOCK_USER_EMAIL || 'sarah@company.com',
  name: import.meta.env.VITE_MOCK_USER_NAME || 'Sarah Chen',
  groups: (import.meta.env.VITE_MOCK_USER_GROUPS || 'it-admins,engineering-leads,hr-team').split(','),
}

const ROLE_GROUP_MAP: Record<string, string[]> = {
  engineering: ['engineering-leads'],
  gtm: ['gtm-leads'],
  design: ['design-leads'],
  exec: ['it-admins'],
}

function derivePermittedRoles(groups: string[]): string[] {
  if (groups.includes('hr-team') || groups.includes('it-admins')) {
    return ['engineering', 'gtm', 'design', 'exec']
  }
  return Object.entries(ROLE_GROUP_MAP)
    .filter(([, roleGroups]) => roleGroups.some((g) => groups.includes(g)))
    .map(([role]) => role)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<AuthUser>(MOCK_USER)

  const isITAdmin = user.groups.includes('it-admins')
  const isManager =
    isITAdmin ||
    user.groups.includes('hr-team') ||
    user.groups.some((g) => g.endsWith('-leads'))

  const permittedRoles = derivePermittedRoles(user.groups)

  const login = useCallback(() => {
    // Mock: already logged in
  }, [])

  const logout = useCallback(() => {
    window.location.href = '/'
  }, [])

  const getAccessToken = useCallback(async () => {
    return 'mock-token'
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        isLoading: false,
        isITAdmin,
        isManager,
        permittedRoles,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
