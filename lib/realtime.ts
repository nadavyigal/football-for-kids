import { supabase } from './supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RealtimeSubscription {
  channel: RealtimeChannel
  unsubscribe: () => void
}

export class RealtimeService {
  private static subscriptions: Map<string, RealtimeChannel> = new Map()

  // Subscribe to chat messages in a group
  static subscribeToGroupChat(
    groupId: string,
    onMessage: (payload: any) => void,
    onError?: (error: any) => void
  ): RealtimeSubscription {
    const channelName = `group_chat_${groupId}`
    
    // Unsubscribe from existing channel if it exists
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log('New chat message:', payload)
          onMessage(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log('Updated chat message:', payload)
          onMessage(payload)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to group chat: ${groupId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to group chat: ${groupId}`)
          onError && onError(status)
        }
      })

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    }
  }

  // Subscribe to match updates in a group
  static subscribeToGroupMatches(
    groupId: string,
    onMatchUpdate: (payload: any) => void,
    onError?: (error: any) => void
  ): RealtimeSubscription {
    const channelName = `group_matches_${groupId}`
    
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'matches',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log('Match update:', payload)
          onMatchUpdate(payload)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to group matches: ${groupId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to group matches: ${groupId}`)
          onError && onError(status)
        }
      })

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    }
  }

  // Subscribe to predictions for a specific match
  static subscribeToMatchPredictions(
    matchId: string,
    onPredictionUpdate: (payload: any) => void,
    onError?: (error: any) => void
  ): RealtimeSubscription {
    const channelName = `match_predictions_${matchId}`
    
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'predictions',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          console.log('Prediction update:', payload)
          onPredictionUpdate(payload)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to match predictions: ${matchId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to match predictions: ${matchId}`)
          onError && onError(status)
        }
      })

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    }
  }

  // Subscribe to leaderboard updates in a group
  static subscribeToGroupLeaderboard(
    groupId: string,
    onLeaderboardUpdate: (payload: any) => void,
    onError?: (error: any) => void
  ): RealtimeSubscription {
    const channelName = `group_leaderboard_${groupId}`
    
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboards',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log('Leaderboard update:', payload)
          onLeaderboardUpdate(payload)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to group leaderboard: ${groupId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to group leaderboard: ${groupId}`)
          onError && onError(status)
        }
      })

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    }
  }

  // Subscribe to user's presence in a group (online/offline status)
  static subscribeToGroupPresence(
    groupId: string,
    userId: string,
    onPresenceUpdate: (payload: any) => void,
    onError?: (error: any) => void
  ): RealtimeSubscription {
    const channelName = `group_presence_${groupId}`
    
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('Presence sync:', state)
        onPresenceUpdate({ type: 'sync', state })
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
        onPresenceUpdate({ type: 'join', key, presences: newPresences })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
        onPresenceUpdate({ type: 'leave', key, presences: leftPresences })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to group presence: ${groupId}`)
          
          // Track user's presence
          const presenceTrackStatus = await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          })
          
          console.log('Presence track status:', presenceTrackStatus)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to group presence: ${groupId}`)
          onError && onError(status)
        }
      })

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    }
  }

  // Subscribe to multiple events for a group (comprehensive subscription)
  static subscribeToGroupEvents(
    groupId: string,
    userId: string,
    callbacks: {
      onChatMessage?: (payload: any) => void
      onMatchUpdate?: (payload: any) => void
      onPredictionUpdate?: (payload: any) => void
      onLeaderboardUpdate?: (payload: any) => void
      onPresenceUpdate?: (payload: any) => void
      onError?: (error: any) => void
    }
  ): RealtimeSubscription {
    const channelName = `group_all_events_${groupId}`
    
    this.unsubscribeFromChannel(channelName)

    const channel = supabase.channel(channelName)

    // Chat messages
    if (callbacks.onChatMessage) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${groupId}`,
        },
        callbacks.onChatMessage
      )
    }

    // Matches
    if (callbacks.onMatchUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `group_id=eq.${groupId}`,
        },
        callbacks.onMatchUpdate
      )
    }

    // Predictions (for matches in this group)
    if (callbacks.onPredictionUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'predictions',
        },
        (payload) => {
          // We need to check if this prediction belongs to a match in our group
          // This is a limitation - we can't filter by nested relationships in real-time
          // So we'll need to verify this in the callback
          callbacks.onPredictionUpdate!(payload)
        }
      )
    }

    // Leaderboard
    if (callbacks.onLeaderboardUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboards',
          filter: `group_id=eq.${groupId}`,
        },
        callbacks.onLeaderboardUpdate
      )
    }

    // Presence
    if (callbacks.onPresenceUpdate) {
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState()
          callbacks.onPresenceUpdate!({ type: 'sync', state })
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          callbacks.onPresenceUpdate!({ type: 'join', key, presences: newPresences })
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          callbacks.onPresenceUpdate!({ type: 'leave', key, presences: leftPresences })
        })
    }

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to all group events: ${groupId}`)
        
        // Track presence if callback is provided
        if (callbacks.onPresenceUpdate) {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          })
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to group events: ${groupId}`)
        callbacks.onError && callbacks.onError(status)
      }
    })

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    }
  }

  // Unsubscribe from a specific channel
  static unsubscribeFromChannel(channelName: string): void {
    const channel = this.subscriptions.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.subscriptions.delete(channelName)
      console.log(`Unsubscribed from channel: ${channelName}`)
    }
  }

  // Unsubscribe from all channels
  static unsubscribeFromAll(): void {
    this.subscriptions.forEach((channel, channelName) => {
      channel.unsubscribe()
      console.log(`Unsubscribed from channel: ${channelName}`)
    })
    this.subscriptions.clear()
  }

  // Get active subscriptions count
  static getActiveSubscriptionsCount(): number {
    return this.subscriptions.size
  }

  // Check if subscribed to a specific channel
  static isSubscribedTo(channelName: string): boolean {
    return this.subscriptions.has(channelName)
  }

  // Send a broadcast message to a channel
  static async sendBroadcast(
    channelName: string,
    eventName: string,
    payload: any
  ): Promise<void> {
    const channel = this.subscriptions.get(channelName)
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: eventName,
        payload,
      })
    } else {
      console.warn(`Cannot send broadcast: Channel ${channelName} not found`)
    }
  }

  // Helper function to get typing indicator channel name
  static getTypingChannelName(groupId: string): string {
    return `typing_${groupId}`
  }

  // Send typing indicator
  static async sendTypingIndicator(
    groupId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    const channelName = this.getTypingChannelName(groupId)
    const channel = this.subscriptions.get(channelName) || 
                   supabase.channel(channelName)

    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, channel)
      await channel.subscribe()
    }

    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: userId,
        is_typing: isTyping,
        timestamp: new Date().toISOString(),
      },
    })
  }

  // Subscribe to typing indicators
  static subscribeToTypingIndicators(
    groupId: string,
    onTypingUpdate: (payload: any) => void
  ): RealtimeSubscription {
    const channelName = this.getTypingChannelName(groupId)
    
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        onTypingUpdate(payload)
      })
      .subscribe()

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    }
  }
}

// Hook for React Native components
export const useRealtimeSubscription = (
  subscriptionFunction: () => RealtimeSubscription | null,
  dependencies: any[] = []
) => {
  const React = require('react') as typeof import('react')
  const [subscription, setSubscription] = React.useState<RealtimeSubscription | null>(null)

  React.useEffect(() => {
    const sub = subscriptionFunction()
    setSubscription(sub)

    return () => {
      if (sub) {
        sub.unsubscribe()
      }
    }
  }, dependencies)

  return subscription
}