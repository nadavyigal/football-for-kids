import { Tabs } from 'expo-router';
import { Trophy, Plus, Chrome as Home, User, MessageCircle } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 75,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '🏠 בית',
          tabBarIcon: ({ size, color }) => (
            <Home size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '⚽ צור משחק',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '💬 צ\'אט',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: '🏆 מובילים',
          tabBarIcon: ({ size, color }) => (
            <Trophy size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '👤 פרופיל',
          tabBarIcon: ({ size, color }) => (
            <User size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}