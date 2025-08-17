import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Users, Calendar, Share2, Trash2, CircleCheck as CheckCircle, Circle as XCircle, Clock } from 'lucide-react-native';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  shareLink: string;
  predictions: Array<{
    userId: string;
    userName: string;
    homeScore: number;
    awayScore: number;
  }>;
}

interface Group {
  id: string;
  name: string;
  adminId: string;
  adminName: string;
  memberCount: number;
  members: Array<{
    id: string;
    name: string;
    isAdmin: boolean;
  }>;
}

export default function HomeScreen() {
  const [isAdmin] = useState(true); // In real app, this would come from user context
  const [matches, setMatches] = useState<Match[]>([
    {
      id: '1',
      homeTeam: 'מכבי תל אביב',
      awayTeam: 'הפועל תל אביב',
      league: 'ליגת העל הישראלית',
      date: '2024-01-15',
      time: '20:00',
      status: 'approved',
      createdBy: 'admin',
      shareLink: 'https://app.com/match/abc123',
      predictions: [
        { userId: '1', userName: 'דני', homeScore: 2, awayScore: 1 },
        { userId: '2', userName: 'רון', homeScore: 1, awayScore: 1 },
      ]
    },
    {
      id: '2',
      homeTeam: 'ריאל מדריד',
      awayTeam: 'ברצלונה',
      league: 'ליגת האלופות',
      date: '2024-01-18',
      time: '22:00',
      status: 'pending',
      createdBy: 'user1',
      shareLink: 'https://app.com/match/def456',
      predictions: []
    }
  ]);

  const currentGroup: Group = {
    id: 'group1',
    name: 'חברי הילדות',
    adminId: 'user1',
    adminName: 'יוסי',
    memberCount: 8,
    members: [
      { id: 'user1', name: 'יוסי', isAdmin: true },
      { id: 'user2', name: 'דני', isAdmin: false },
      { id: 'user3', name: 'רון', isAdmin: false },
      { id: 'user4', name: 'מיכל', isAdmin: false },
      { id: 'user5', name: 'עומר', isAdmin: false },
      { id: 'user6', name: 'נועה', isAdmin: false },
      { id: 'user7', name: 'אלי', isAdmin: false },
      { id: 'user8', name: 'שירה', isAdmin: false },
    ],
  };
  const approveMatch = (matchId: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId ? { ...match, status: 'approved' } : match
    ));
    Alert.alert('✅ אושר!', 'המשחק אושר בהצלחה');
  };

  const rejectMatch = (matchId: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId ? { ...match, status: 'rejected' } : match
    ));
    Alert.alert('❌ נדחה', 'המשחק נדחה');
  };

  const deleteMatch = (matchId: string) => {
    Alert.alert(
      '🗑️ מחיקת משחק',
      'האם אתה בטוח שברצונך למחוק את המשחק?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => {
            setMatches(prev => prev.filter(match => match.id !== matchId));
            Alert.alert('🗑️ נמחק', 'המשחק נמחק בהצלחה');
          }
        }
      ]
    );
  };

  const shareMatch = (shareLink: string) => {
    Alert.alert('🔗 שיתוף משחק', `קישור המשחק הועתק!\n${shareLink}`);
  };

  const approvedMatches = matches.filter(match => match.status === 'approved');
  const pendingMatches = matches.filter(match => match.status === 'pending');

  const renderMatch = (match: Match) => (
    <TouchableOpacity key={match.id} style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Text style={styles.leagueText}>{match.league}</Text>
        <View style={styles.statusContainer}>
          {match.status === 'approved' && <CheckCircle size={16} color="#22C55E" />}
          {match.status === 'pending' && <Clock size={16} color="#F59E0B" />}
          {match.status === 'rejected' && <XCircle size={16} color="#EF4444" />}
        </View>
      </View>
      
      <View style={styles.teamsContainer}>
        <Text style={styles.teamName}>{match.homeTeam}</Text>
        <Text style={styles.vsText}>נגד</Text>
        <Text style={styles.teamName}>{match.awayTeam}</Text>
      </View>
      
      <View style={styles.matchInfo}>
        <Text style={styles.dateTime}>📅 {match.date} ⏰ {match.time}</Text>
        <Text style={styles.predictions}>
          🎯 {match.predictions.length} ניחושים
        </Text>
      </View>

      <View style={styles.matchActions}>
        {match.status === 'approved' && (
          <>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => shareMatch(match.shareLink)}
            >
              <Share2 size={16} color="#3B82F6" />
              <Text style={styles.shareButtonText}>שתף</Text>
            </TouchableOpacity>
            
            {isAdmin && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteMatch(match.id)}
              >
                <Trash2 size={16} color="#EF4444" />
                <Text style={styles.deleteButtonText}>מחק</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        
        {match.status === 'pending' && isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity 
              style={styles.approveButton}
              onPress={() => approveMatch(match.id)}
            >
              <CheckCircle size={16} color="#22C55E" />
              <Text style={styles.approveButtonText}>אשר</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => rejectMatch(match.id)}
            >
              <XCircle size={16} color="#EF4444" />
              <Text style={styles.rejectButtonText}>דחה</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Trophy size={32} color="white" />
          <Text style={styles.headerTitle}>ליגת הניחושים ⚽</Text>
          <Text style={styles.headerSubtitle}>נחש תוצאות והתחרה עם החברים!</Text>
          <View style={styles.groupBadge}>
            <Text style={styles.groupBadgeText}>קבוצה: {currentGroup.name}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isAdmin && pendingMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>ממתינים לאישור ({pendingMatches.length})</Text>
            </View>
            {pendingMatches.map(renderMatch)}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>משחקים פעילים ({approvedMatches.length})</Text>
          </View>
          
          {approvedMatches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>🎯 אין משחקים פעילים כרגע</Text>
              <Text style={styles.emptySubtext}>צור משחק חדש כדי להתחיל!</Text>
            </View>
          ) : (
            approvedMatches.map(renderMatch)
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔗 איך זה עובד?</Text>
          <Text style={styles.infoText}>
            • צור משחק חדש{'\n'}
            • שלח את הקישור הפרטי לחברים{'\n'}
            • החברים נוחשים תוצאות{'\n'}
            • צבור נקודות וטפס בטבלה!
          </Text>
        </View>

        <View style={styles.groupInfoCard}>
          <Text style={styles.groupInfoTitle}>👥 פרטי הקבוצה</Text>
          <View style={styles.groupDetails}>
            <Text style={styles.groupDetailText}>📛 שם: {currentGroup.name}</Text>
            <Text style={styles.groupDetailText}>👑 מנהל: {currentGroup.adminName}</Text>
            <Text style={styles.groupDetailText}>👥 חברים: {currentGroup.memberCount}</Text>
          </View>
          <Text style={styles.groupMembersTitle}>רשימת חברים:</Text>
          <View style={styles.membersList}>
            {currentGroup.members.map((member: { id: string; name: string; isAdmin: boolean }) => (
              <View key={member.id} style={styles.memberItem}>
                <Text style={styles.memberName}>{member.name}</Text>
                {member.isAdmin && (
                  <View style={styles.adminTag}>
                    <Text style={styles.adminTagText}>מנהל</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 10,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  leagueText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamsContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 2,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 5,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  predictions: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    marginRight: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    marginRight: 6,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 10,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  approveButtonText: {
    color: '#22C55E',
    fontWeight: '600',
    marginRight: 6,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    marginRight: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
  },
  groupBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  groupBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  groupInfoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  groupInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#15803D',
    marginBottom: 12,
    textAlign: 'right',
  },
  groupDetails: {
    marginBottom: 16,
  },
  groupDetailText: {
    fontSize: 14,
    color: '#15803D',
    marginBottom: 6,
    textAlign: 'right',
  },
  groupMembersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#15803D',
    marginBottom: 8,
    textAlign: 'right',
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 6,
  },
  memberName: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  adminTag: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminTagText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});