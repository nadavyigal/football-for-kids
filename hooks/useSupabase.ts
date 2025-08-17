import { useState, useEffect, useCallback } from 'react'
import { APIService } from '../lib/api'
import { RealtimeService } from '../lib/realtime'
import { useAuth } from '../components/AuthProvider'

// Hook for managing groups
export const useGroups = () => {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchGroups = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      const { groups: fetchedGroups, error } = await APIService.getUserGroups()
      
      if (error) {
        setError(error)
      } else {
        setGroups(fetchedGroups)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createGroup = async (name: string, description?: string) => {
    const { group, error } = await APIService.createGroup(name, description)
    
    if (error) {
      setError(error)
      return { success: false, error }
    }
    
    await fetchGroups() // Refresh groups
    return { success: true, group }
  }

  const joinGroup = async (inviteCode: string) => {
    const { result, error } = await APIService.joinGroupByInviteCode(inviteCode)
    
    if (error) {
      setError(error)
      return { success: false, error }
    }
    
    await fetchGroups() // Refresh groups
    return { success: true, result }
  }

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    joinGroup,
    setError,
  }
}

// Hook for managing matches in a group
export const useGroupMatches = (groupId: string | null) => {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = useCallback(async (status?: string) => {
    if (!groupId) return

    setLoading(true)
    setError(null)
    
    try {
      const { matches: fetchedMatches, error } = await APIService.getGroupMatches(groupId, status)
      
      if (error) {
        setError(error)
      } else {
        setMatches(fetchedMatches)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  const createMatch = async (matchData: {
    homeTeamId: string
    awayTeamId: string
    leagueId: string
    matchDate: string
    matchTime: string
  }) => {
    if (!groupId) return { success: false, error: 'No group selected' }

    const { result, error } = await APIService.createMatch({
      groupId,
      ...matchData,
    })
    
    if (error) {
      setError(error)
      return { success: false, error }
    }
    
    await fetchMatches() // Refresh matches
    return { success: true, result }
  }

  const approveMatch = async (matchId: string) => {
    const { match, error } = await APIService.approveMatch(matchId)
    
    if (error) {
      setError(error)
      return { success: false, error }
    }
    
    await fetchMatches() // Refresh matches
    return { success: true, match }
  }

  const rejectMatch = async (matchId: string) => {
    const { match, error } = await APIService.rejectMatch(matchId)
    
    if (error) {
      setError(error)
      return { success: false, error }
    }
    
    await fetchMatches() // Refresh matches
    return { success: true, match }
  }

  const updateMatchResult = async (matchId: string, homeScore: number, awayScore: number) => {
    const { result, error } = await APIService.updateMatchResult(matchId, homeScore, awayScore)
    
    if (error) {
      setError(error)
      return { success: false, error }
    }
    
    await fetchMatches() // Refresh matches
    return { success: true, result }
  }

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  // Subscribe to real-time match updates
  useEffect(() => {
    if (!groupId) return

    const subscription = RealtimeService.subscribeToGroupMatches(
      groupId,
      (payload) => {
        // Refresh matches when there's an update
        fetchMatches()
      },
      (error) => {
        console.error('Real-time match subscription error:', error)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [groupId, fetchMatches])

  return {
    matches,
    loading,
    error,
    fetchMatches,
    createMatch,
    approveMatch,
    rejectMatch,
    updateMatchResult,
    setError,
  }
}

// Hook for managing predictions
export const usePredictions = (matchId: string | null) => {
  const [predictions, setPredictions] = useState<any[]>([])
  const [userPrediction, setUserPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchMatchData = useCallback(async () => {
    if (!matchId) return

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await APIService.getMatchWithPredictions(matchId)
      
      if (error) {
        setError(error)
      } else if (data.success) {
        setPredictions(data.predictions || [])
        
        // Find user's prediction
        const myPrediction = data.predictions?.find((p: any) => p.user_id === user?.id)
        setUserPrediction(myPrediction || null)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [matchId, user?.id])

  const createPrediction = async (homeScore: number, awayScore: number) => {
    if (!matchId) return { success: false, error: 'No match selected' }

    const { prediction, error } = await APIService.createPrediction(matchId, homeScore, awayScore)
    
    if (error) {
      setError(error)
      return { success: false, error }
    }
    
    setUserPrediction(prediction)
    await fetchMatchData() // Refresh all predictions
    return { success: true, prediction }
  }

  const updatePrediction = async (homeScore: number, awayScore: number) => {
    if (!userPrediction) return { success: false, error: 'No prediction to update' }

    const { prediction, error } = await APIService.updatePrediction(
      userPrediction.id,
      homeScore,
      awayScore
    )
    
    if (error) {
      setError(error)
      return { success: false, error }
    }
    
    setUserPrediction(prediction)
    await fetchMatchData() // Refresh all predictions
    return { success: true, prediction }
  }

  useEffect(() => {
    fetchMatchData()
  }, [fetchMatchData])

  // Subscribe to real-time prediction updates
  useEffect(() => {
    if (!matchId) return

    const subscription = RealtimeService.subscribeToMatchPredictions(
      matchId,
      (payload) => {
        // Refresh predictions when there's an update
        fetchMatchData()
      },
      (error) => {
        console.error('Real-time prediction subscription error:', error)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [matchId, fetchMatchData])

  return {
    predictions,
    userPrediction,
    loading,
    error,
    createPrediction,
    updatePrediction,
    fetchMatchData,
    setError,
  }
}

// Hook for managing group chat
export const useGroupChat = (groupId: string | null) => {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typing, setTyping] = useState<any[]>([])

  const fetchMessages = useCallback(async (limit = 50, offset = 0) => {
    if (!groupId) return

    setLoading(true)
    setError(null)
    
    try {
      const { messages: fetchedMessages, error } = await APIService.getGroupChatMessages(groupId, limit, offset)
      
      if (error) {
        setError(error)
      } else {
        if (offset === 0) {
          setMessages(fetchedMessages)
        } else {
          setMessages(prev => [...fetchedMessages, ...prev])
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  const sendMessage = async (message: string, replyToId?: string) => {
    if (!groupId) return { success: false, error: 'No group selected' }

    const { message: sentMessage, error } = await APIService.sendChatMessage(groupId, message, replyToId)
    
    if (error) {
      setError(error)
      return { success: false, error }
    }
    
    // Message will be added via real-time subscription
    return { success: true, message: sentMessage }
  }

  const sendTypingIndicator = async (isTyping: boolean, userId: string) => {
    if (!groupId) return

    await RealtimeService.sendTypingIndicator(groupId, userId, isTyping)
  }

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Subscribe to real-time chat updates
  useEffect(() => {
    if (!groupId) return

    const chatSubscription = RealtimeService.subscribeToGroupChat(
      groupId,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => 
            prev.map(msg => msg.id === payload.new.id ? payload.new : msg)
          )
        }
      },
      (error) => {
        console.error('Real-time chat subscription error:', error)
      }
    )

    const typingSubscription = RealtimeService.subscribeToTypingIndicators(
      groupId,
      (payload) => {
        setTyping(prev => {
          const filtered = prev.filter(t => t.user_id !== payload.user_id)
          
          if (payload.is_typing) {
            return [...filtered, payload]
          } else {
            return filtered
          }
        })
        
        // Remove typing indicator after 3 seconds
        if (payload.is_typing) {
          setTimeout(() => {
            setTyping(prev => prev.filter(t => 
              !(t.user_id === payload.user_id && t.timestamp === payload.timestamp)
            ))
          }, 3000)
        }
      }
    )

    return () => {
      chatSubscription.unsubscribe()
      typingSubscription.unsubscribe()
    }
  }, [groupId])

  return {
    messages,
    loading,
    error,
    typing,
    fetchMessages,
    sendMessage,
    sendTypingIndicator,
    setError,
  }
}

// Hook for managing leaderboard
export const useGroupLeaderboard = (groupId: string | null) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    if (!groupId) return

    setLoading(true)
    setError(null)
    
    try {
      const { leaderboard: fetchedLeaderboard, error } = await APIService.getGroupLeaderboard(groupId)
      
      if (error) {
        setError(error)
      } else {
        setLeaderboard(fetchedLeaderboard)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Subscribe to real-time leaderboard updates
  useEffect(() => {
    if (!groupId) return

    const subscription = RealtimeService.subscribeToGroupLeaderboard(
      groupId,
      (payload) => {
        // Refresh leaderboard when there's an update
        fetchLeaderboard()
      },
      (error) => {
        console.error('Real-time leaderboard subscription error:', error)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [groupId, fetchLeaderboard])

  return {
    leaderboard,
    loading,
    error,
    fetchLeaderboard,
    setError,
  }
}

// Hook for managing teams and leagues
export const useTeamsAndLeagues = () => {
  const [leagues, setLeagues] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeagues = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { leagues: fetchedLeagues, error } = await APIService.getLeagues()
      
      if (error) {
        setError(error)
      } else {
        setLeagues(fetchedLeagues)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTeams = useCallback(async (leagueId?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { teams: fetchedTeams, error } = await APIService.getTeamsByLeague(leagueId)
      
      if (error) {
        setError(error)
      } else {
        setTeams(fetchedTeams)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const searchTeams = async (searchTerm: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { teams: searchResults, error } = await APIService.searchTeams(searchTerm)
      
      if (error) {
        setError(error)
        return []
      } else {
        return searchResults
      }
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeagues()
    fetchTeams()
  }, [fetchLeagues, fetchTeams])

  return {
    leagues,
    teams,
    loading,
    error,
    fetchLeagues,
    fetchTeams,
    searchTeams,
    setError,
  }
}