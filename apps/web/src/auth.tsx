import { createContext, useContext, type ReactNode } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api, type SessionUser } from './api'
import { queryClient } from './queryClient'

type AuthContextValue = {
  user: SessionUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const me = useQuery({
    queryKey: ['me'],
    queryFn: api.me,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login({ email, password }),
    onSuccess: (data) => queryClient.setQueryData(['me'], data),
  })

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      api.register({ name, email, password }),
    onSuccess: (data) => queryClient.setQueryData(['me'], data),
  })

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => queryClient.setQueryData(['me'], null),
  })

  return (
    <AuthContext.Provider
      value={{
        user: me.data?.user ?? null,
        loading: me.isLoading,
        login: async (email, password) => {
          await loginMutation.mutateAsync({ email, password })
        },
        register: async (name, email, password) => {
          await registerMutation.mutateAsync({ name, email, password })
        },
        logout: async () => {
          await logoutMutation.mutateAsync()
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthProvider is missing')
  return value
}
