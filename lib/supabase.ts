import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          last_seen: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_seen?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_seen?: string | null
        }
      }
      groups: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          admin_id: string
          is_active: boolean
          invite_code: string
          max_members: number
          settings: Record<string, any> | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          admin_id: string
          is_active?: boolean
          invite_code?: string
          max_members?: number
          settings?: Record<string, any> | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          admin_id?: string
          is_active?: boolean
          invite_code?: string
          max_members?: number
          settings?: Record<string, any> | null
        }
      }
      group_members: {
        Row: {
          id: string
          created_at: string
          group_id: string
          user_id: string
          role: 'admin' | 'moderator' | 'member'
          joined_at: string
          is_active: boolean
          points: number
          notifications_enabled: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          group_id: string
          user_id: string
          role?: 'admin' | 'moderator' | 'member'
          joined_at?: string
          is_active?: boolean
          points?: number
          notifications_enabled?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          group_id?: string
          user_id?: string
          role?: 'admin' | 'moderator' | 'member'
          joined_at?: string
          is_active?: boolean
          points?: number
          notifications_enabled?: boolean
        }
      }
      leagues: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          country: string | null
          logo_url: string | null
          is_active: boolean
          external_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          country?: string | null
          logo_url?: string | null
          is_active?: boolean
          external_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          country?: string | null
          logo_url?: string | null
          is_active?: boolean
          external_id?: string | null
        }
      }
      teams: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          short_name: string | null
          logo_url: string | null
          league_id: string | null
          is_active: boolean
          external_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          short_name?: string | null
          logo_url?: string | null
          league_id?: string | null
          is_active?: boolean
          external_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          short_name?: string | null
          logo_url?: string | null
          league_id?: string | null
          is_active?: boolean
          external_id?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          group_id: string
          home_team_id: string
          away_team_id: string
          league_id: string
          match_date: string
          match_time: string
          status: 'pending' | 'approved' | 'rejected' | 'live' | 'finished' | 'cancelled'
          home_score: number | null
          away_score: number | null
          created_by: string
          approved_by: string | null
          approved_at: string | null
          share_link: string
          external_match_id: string | null
          metadata: Record<string, any> | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          group_id: string
          home_team_id: string
          away_team_id: string
          league_id: string
          match_date: string
          match_time: string
          status?: 'pending' | 'approved' | 'rejected' | 'live' | 'finished' | 'cancelled'
          home_score?: number | null
          away_score?: number | null
          created_by: string
          approved_by?: string | null
          approved_at?: string | null
          share_link?: string
          external_match_id?: string | null
          metadata?: Record<string, any> | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          group_id?: string
          home_team_id?: string
          away_team_id?: string
          league_id?: string
          match_date?: string
          match_time?: string
          status?: 'pending' | 'approved' | 'rejected' | 'live' | 'finished' | 'cancelled'
          home_score?: number | null
          away_score?: number | null
          created_by?: string
          approved_by?: string | null
          approved_at?: string | null
          share_link?: string
          external_match_id?: string | null
          metadata?: Record<string, any> | null
        }
      }
      predictions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          match_id: string
          user_id: string
          home_score: number
          away_score: number
          points_earned: number | null
          submitted_at: string
          is_locked: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          match_id: string
          user_id: string
          home_score: number
          away_score: number
          points_earned?: number | null
          submitted_at?: string
          is_locked?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          match_id?: string
          user_id?: string
          home_score?: number
          away_score?: number
          points_earned?: number | null
          submitted_at?: string
          is_locked?: boolean
        }
      }
      chat_messages: {
        Row: {
          id: string
          created_at: string
          group_id: string
          user_id: string
          message: string
          message_type: 'text' | 'prediction' | 'match_result' | 'system'
          reply_to_id: string | null
          metadata: Record<string, any> | null
          is_edited: boolean
          edited_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          group_id: string
          user_id: string
          message: string
          message_type?: 'text' | 'prediction' | 'match_result' | 'system'
          reply_to_id?: string | null
          metadata?: Record<string, any> | null
          is_edited?: boolean
          edited_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          group_id?: string
          user_id?: string
          message?: string
          message_type?: 'text' | 'prediction' | 'match_result' | 'system'
          reply_to_id?: string | null
          metadata?: Record<string, any> | null
          is_edited?: boolean
          edited_at?: string | null
        }
      }
      leaderboards: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          group_id: string
          user_id: string
          total_points: number
          correct_predictions: number
          total_predictions: number
          perfect_predictions: number
          current_streak: number
          longest_streak: number
          last_prediction_date: string | null
          rank: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          group_id: string
          user_id: string
          total_points?: number
          correct_predictions?: number
          total_predictions?: number
          perfect_predictions?: number
          current_streak?: number
          longest_streak?: number
          last_prediction_date?: string | null
          rank?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          group_id?: string
          user_id?: string
          total_points?: number
          correct_predictions?: number
          total_predictions?: number
          perfect_predictions?: number
          current_streak?: number
          longest_streak?: number
          last_prediction_date?: string | null
          rank?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}