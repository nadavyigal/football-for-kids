import { supabase } from './supabase'
import { Alert } from 'react-native'

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  is_active: boolean
}

export interface SignUpData {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  // Sign up new user
  static async signUp(data: SignUpData) {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone || null,
          },
        },
      })

      if (error) {
        throw error
      }

      return { user: authData.user, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { user: null, error: error.message }
    }
  }

  // Sign in existing user
  static async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

      // Update last_seen
      if (authData.user) {
        await supabase
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', authData.user.id)
      }

      return { user: authData.user, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { user: null, error: error.message }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      return { error: null }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return { error: error.message }
    }
  }

  // Get current user session
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        throw error
      }
      return { user, error: null }
    } catch (error: any) {
      console.error('Get current user error:', error)
      return { user: null, error: error.message }
    }
  }

  // Get user profile
  static async getUserProfile(userId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const targetUserId = userId || user?.id

      if (!targetUserId) {
        throw new Error('No user ID provided')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (error) {
        throw error
      }

      return { profile: data, error: null }
    } catch (error: any) {
      console.error('Get user profile error:', error)
      return { profile: null, error: error.message }
    }
  }

  // Update user profile
  static async updateProfile(updates: Partial<AuthUser>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { profile: data, error: null }
    } catch (error: any) {
      console.error('Update profile error:', error)
      return { profile: null, error: error.message }
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://app.ligat-hanichushim.com/reset-password',
      })

      if (error) {
        throw error
      }

      return { error: null }
    } catch (error: any) {
      console.error('Reset password error:', error)
      return { error: error.message }
    }
  }

  // Change password
  static async changePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw error
      }

      return { error: null }
    } catch (error: any) {
      console.error('Change password error:', error)
      return { error: error.message }
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    } catch {
      return false
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Validate Hebrew phone number
  static validateHebrewPhone(phone: string): boolean {
    // Israeli phone number patterns
    const patterns = [
      /^05[0-9]{8}$/, // Mobile: 05X-XXXXXXX
      /^0[2-4,8-9][0-9]{7}$/, // Landline: 0X-XXXXXXX
    ]
    
    const cleanPhone = phone.replace(/[-\s]/g, '')
    return patterns.some(pattern => pattern.test(cleanPhone))
  }

  // Format Hebrew phone number
  static formatHebrewPhone(phone: string): string {
    const cleanPhone = phone.replace(/[-\s]/g, '')
    
    if (cleanPhone.startsWith('05') && cleanPhone.length === 10) {
      // Mobile: 05X-XXXXXXX
      return `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3)}`
    } else if (cleanPhone.length === 9 && !cleanPhone.startsWith('05')) {
      // Landline: 0X-XXXXXXX
      return `${cleanPhone.slice(0, 2)}-${cleanPhone.slice(2)}`
    }
    
    return phone
  }

  // Show authentication alerts in Hebrew
  static showAuthAlert(type: 'success' | 'error' | 'info', message: string) {
    const titles = {
      success: '✅ הצלחה',
      error: '❌ שגיאה',
      info: 'ℹ️ הודעה'
    }

    Alert.alert(titles[type], message)
  }

  // Get error message in Hebrew
  static getHebrewErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'Invalid login credentials': 'פרטי התחברות שגויים',
      'User already registered': 'המשתמש כבר רשום במערכת',
      'Password too short': 'הסיסמה קצרה מדי (מינימום 6 תווים)',
      'Invalid email': 'כתובת האימייל לא תקינה',
      'Email not confirmed': 'האימייל לא אושר. בדוק את תיבת הדואר שלך',
      'Too many requests': 'יותר מדי בקשות. נסה שוב מאוחר יותר',
      'Network request failed': 'בעיית חיבור לאינטרנט',
      'User not found': 'המשתמש לא נמצא',
      'Email rate limit exceeded': 'נשלחו יותר מדי אימיילים. נסה שוב מאוחר יותר',
    }

    return errorMessages[error] || error
  }
}

// Authentication context hook (for React Native)
export const useAuth = () => {
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Get initial session
    AuthService.getCurrentUser().then(({ user }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    signIn: AuthService.signIn,
    signUp: AuthService.signUp,
    signOut: AuthService.signOut,
    updateProfile: AuthService.updateProfile,
    resetPassword: AuthService.resetPassword,
    changePassword: AuthService.changePassword,
  }
}

// Import React for the hook
import React from 'react'