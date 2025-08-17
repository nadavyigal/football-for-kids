import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthService } from '../lib/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signUp: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  updateProfile: (updates: any) => Promise<{ profile: any; error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  profile: any
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
        
        // Update last_seen when user signs in
        if (event === 'SIGNED_IN') {
          await supabase
            .from('profiles')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', session.user.id)
        }
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { profile, error } = await AuthService.getUserProfile(userId)
      if (error) {
        console.error('Error loading profile:', error)
      } else {
        setProfile(profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await AuthService.signIn({ email, password })
      return result
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: { email: string; password: string; full_name: string; phone?: string }) => {
    setLoading(true)
    try {
      const result = await AuthService.signUp(data)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const result = await AuthService.signOut()
      return result
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      const result = await AuthService.updateProfile(updates)
      if (result.profile) {
        setProfile(result.profile)
      }
      return result
    } catch (error: any) {
      return { profile: null, error: error.message }
    }
  }

  const resetPassword = async (email: string) => {
    return await AuthService.resetPassword(email)
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    profile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}