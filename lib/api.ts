import { supabase } from './supabase'
import type { Database } from './supabase'

// Type definitions
type Tables = Database['public']['Tables']
type Match = Tables['matches']['Row']
type Prediction = Tables['predictions']['Row']
type Group = Tables['groups']['Row']
type Profile = Tables['profiles']['Row']
type ChatMessage = Tables['chat_messages']['Row']
type Leaderboard = Tables['leaderboards']['Row']

export interface GroupWithMembers extends Group {
  members: Array<{
    id: string
    user_id: string
    full_name: string
    avatar_url: string
    role: string
    points: number
  }>
  member_count: number
}

export interface MatchWithDetails extends Match {
  home_team: { id: string; name: string; logo_url: string }
  away_team: { id: string; name: string; logo_url: string }
  league: { id: string; name: string; logo_url: string }
  predictions_count: number
  user_prediction?: Prediction
}

export interface ChatMessageWithUser extends ChatMessage {
  user: {
    id: string
    full_name: string
    avatar_url: string
  }
}

export class APIService {
  // Groups API
  static async getUserGroups(userId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const targetUserId = userId || user?.id

      if (!targetUserId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('group_members')
        .select(`
          groups!inner (
            id,
            name,
            description,
            admin_id,
            is_active,
            invite_code,
            max_members,
            created_at,
            updated_at,
            profiles!groups_admin_id_fkey (full_name)
          )
        `)
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .eq('groups.is_active', true)

      if (error) throw error

      return { groups: data?.map(item => item.groups) || [], error: null }
    } catch (error: any) {
      console.error('Get user groups error:', error)
      return { groups: [], error: error.message }
    }
  }

  static async createGroup(name: string, description?: string, maxMembers = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          admin_id: user.id,
          max_members: maxMembers,
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as admin member
      await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: 'admin',
        })

      // Initialize leaderboard
      await supabase
        .from('leaderboards')
        .insert({
          group_id: data.id,
          user_id: user.id,
        })

      return { group: data, error: null }
    } catch (error: any) {
      console.error('Create group error:', error)
      return { group: null, error: error.message }
    }
  }

  static async joinGroupByInviteCode(inviteCode: string) {
    try {
      const { data, error } = await supabase.rpc('join_group_by_invite_code', {
        invite_code: inviteCode
      })

      if (error) throw error

      return { result: data, error: null }
    } catch (error: any) {
      console.error('Join group error:', error)
      return { result: null, error: error.message }
    }
  }

  static async getGroupMembers(groupId: string) {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          role,
          points,
          joined_at,
          is_active,
          profiles!group_members_user_id_fkey (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('group_id', groupId)
        .eq('is_active', true)
        .order('points', { ascending: false })

      if (error) throw error

      return { members: data || [], error: null }
    } catch (error: any) {
      console.error('Get group members error:', error)
      return { members: [], error: error.message }
    }
  }

  static async leaveGroup(groupId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('group_members')
        .update({ is_active: false })
        .eq('group_id', groupId)
        .eq('user_id', user.id)

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      console.error('Leave group error:', error)
      return { error: error.message }
    }
  }

  // Matches API
  static async getGroupMatches(groupId: string, status?: string) {
    try {
      let query = supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey (id, name, short_name, logo_url),
          away_team:teams!matches_away_team_id_fkey (id, name, short_name, logo_url),
          league:leagues!matches_league_id_fkey (id, name, logo_url),
          predictions!left (id, user_id)
        `)
        .eq('group_id', groupId)
        .order('match_date', { ascending: true })
        .order('match_time', { ascending: true })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error

      // Add predictions count and user's prediction
      const matchesWithDetails = data?.map(match => ({
        ...match,
        predictions_count: match.predictions?.length || 0,
      })) || []

      return { matches: matchesWithDetails, error: null }
    } catch (error: any) {
      console.error('Get group matches error:', error)
      return { matches: [], error: error.message }
    }
  }

  static async createMatch(matchData: {
    groupId: string
    homeTeamId: string
    awayTeamId: string
    leagueId: string
    matchDate: string
    matchTime: string
  }) {
    try {
      const { data, error } = await supabase.rpc('create_match_with_share_link', {
        group_id: matchData.groupId,
        home_team_id: matchData.homeTeamId,
        away_team_id: matchData.awayTeamId,
        league_id: matchData.leagueId,
        match_date: matchData.matchDate,
        match_time: matchData.matchTime,
      })

      if (error) throw error

      return { result: data, error: null }
    } catch (error: any) {
      console.error('Create match error:', error)
      return { result: null, error: error.message }
    }
  }

  static async approveMatch(matchId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('matches')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single()

      if (error) throw error

      return { match: data, error: null }
    } catch (error: any) {
      console.error('Approve match error:', error)
      return { match: null, error: error.message }
    }
  }

  static async rejectMatch(matchId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('matches')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single()

      if (error) throw error

      return { match: data, error: null }
    } catch (error: any) {
      console.error('Reject match error:', error)
      return { match: null, error: error.message }
    }
  }

  static async updateMatchResult(matchId: string, homeScore: number, awayScore: number) {
    try {
      const { data, error } = await supabase.rpc('update_match_result', {
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
      })

      if (error) throw error

      return { result: data, error: null }
    } catch (error: any) {
      console.error('Update match result error:', error)
      return { result: null, error: error.message }
    }
  }

  static async getMatchWithPredictions(matchId: string) {
    try {
      const { data, error } = await supabase.rpc('get_match_with_predictions', {
        match_id: matchId
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      console.error('Get match with predictions error:', error)
      return { data: null, error: error.message }
    }
  }

  // Predictions API
  static async createPrediction(matchId: string, homeScore: number, awayScore: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('predictions')
        .insert({
          match_id: matchId,
          user_id: user.id,
          home_score: homeScore,
          away_score: awayScore,
        })
        .select()
        .single()

      if (error) throw error

      return { prediction: data, error: null }
    } catch (error: any) {
      console.error('Create prediction error:', error)
      return { prediction: null, error: error.message }
    }
  }

  static async updatePrediction(predictionId: string, homeScore: number, awayScore: number) {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          updated_at: new Date().toISOString(),
        })
        .eq('id', predictionId)
        .select()
        .single()

      if (error) throw error

      return { prediction: data, error: null }
    } catch (error: any) {
      console.error('Update prediction error:', error)
      return { prediction: null, error: error.message }
    }
  }

  static async getUserPrediction(matchId: string, userId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const targetUserId = userId || user?.id

      if (!targetUserId) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', matchId)
        .eq('user_id', targetUserId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return { prediction: data, error: null }
    } catch (error: any) {
      console.error('Get user prediction error:', error)
      return { prediction: null, error: error.message }
    }
  }

  // Chat API
  static async getGroupChatMessages(groupId: string, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_user_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          reply_to:chat_messages!chat_messages_reply_to_id_fkey (
            id,
            message,
            profiles!chat_messages_user_id_fkey (full_name)
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return { messages: data?.reverse() || [], error: null }
    } catch (error: any) {
      console.error('Get chat messages error:', error)
      return { messages: [], error: error.message }
    }
  }

  static async sendChatMessage(groupId: string, message: string, replyToId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          message,
          reply_to_id: replyToId || null,
        })
        .select(`
          *,
          profiles!chat_messages_user_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      return { message: data, error: null }
    } catch (error: any) {
      console.error('Send chat message error:', error)
      return { message: null, error: error.message }
    }
  }

  // Leaderboard API
  static async getGroupLeaderboard(groupId: string) {
    try {
      const { data, error } = await supabase.rpc('get_group_leaderboard', {
        group_id: groupId
      })

      if (error) throw error

      return { leaderboard: data || [], error: null }
    } catch (error: any) {
      console.error('Get group leaderboard error:', error)
      return { leaderboard: [], error: error.message }
    }
  }

  // Teams and Leagues API
  static async getLeagues() {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      return { leagues: data || [], error: null }
    } catch (error: any) {
      console.error('Get leagues error:', error)
      return { leagues: [], error: error.message }
    }
  }

  static async getTeamsByLeague(leagueId?: string) {
    try {
      let query = supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (leagueId) {
        query = query.eq('league_id', leagueId)
      }

      const { data, error } = await query

      if (error) throw error

      return { teams: data || [], error: null }
    } catch (error: any) {
      console.error('Get teams error:', error)
      return { teams: [], error: error.message }
    }
  }

  static async searchTeams(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,short_name.ilike.%${searchTerm}%`)
        .order('name')
        .limit(20)

      if (error) throw error

      return { teams: data || [], error: null }
    } catch (error: any) {
      console.error('Search teams error:', error)
      return { teams: [], error: error.message }
    }
  }

  // Utility functions
  static async refreshLeaderboard(groupId: string) {
    try {
      const { error } = await supabase.rpc('refresh_group_leaderboard', {
        group_id: groupId
      })

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      console.error('Refresh leaderboard error:', error)
      return { error: error.message }
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      return { healthy: !error, error: error?.message || null }
    } catch (error: any) {
      return { healthy: false, error: error.message }
    }
  }
}