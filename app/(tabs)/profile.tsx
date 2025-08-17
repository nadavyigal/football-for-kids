import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  I18nManager,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Trophy, 
  Target, 
  Calendar,
  Settings,
  Share,
  Bell,
  Zap,
  Shield,
  Users
} from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface UserStats {
  totalPoints: number;
  exactPredictions: number;
  totalPredictions: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
  matchesCreated: number;
}

interface Group {
  id: string;
  name: string;
  adminId: string;
  adminName: string;
  memberCount: number;
}

const currentUserId = 'user1';

const userGroups: Group[] = [
  { id: 'group1', name: 'חברי הילדות', adminId: 'user1', adminName: 'יוסי', memberCount: 8 },
  { id: 'group2', name: 'עבודה', adminId: 'user2', adminName: 'דני', memberCount: 12 },
];

const userStats: UserStats = {
  totalPoints: 185,
  exactPredictions: 8,
  totalPredictions: 32,
  winRate: 71.9,
  currentStreak: 4,
  bestStreak: 7,
  rank: 1,
  matchesCreated: 6,
};

const recentMatches = [
  { id: '1', homeTeam: 'מכבי ת"א', awayTeam: 'הפועל ת"א', prediction: '2-1', actual: '2-1', points: 10 },
  { id: '2', homeTeam: 'ריאל מדריד', awayTeam: 'ברצלונה', prediction: '1-0', actual: '2-1', points: 3 },
  { id: '3', homeTeam: 'מכבי חיפה', awayTeam: 'בית"ר', prediction: '1-1', actual: '2-1', points: 0 },
  { id: '4', homeTeam: 'צ\'לסי', awayTeam: 'ליברפול', prediction: '0-2', actual: '1-2', points: 5 },
];

export default function ProfileScreen() {
  const [userName] = useState('יוסי');
  const adminGroups = userGroups.filter(g => g.adminId === currentUserId);
  const memberGroups = userGroups.filter(g => g.adminId !== currentUserId);

  const StatCard = ({ icon, title, value, subtitle }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const handleShare = () => {
    Alert.alert(
      'שתף עם חברים',
      `היי! אני משחק באפליקציית "ליגת הניחושים" ויש לי ${userStats.totalPoints} נקודות! בוא להתחרות איתי!`,
      [{ text: 'אישור' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <User size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRank}>מקום #{userStats.rank} בליגה</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Trophy size={20} color="#F59E0B" />}
            title="סה&quot;כ נקודות"
            value={userStats.totalPoints.toString()}
          />
          <StatCard
            icon={<Target size={20} color="#22C55E" />}
            title="ניחושים מדויקים"
            value={userStats.exactPredictions.toString()}
          />
          <StatCard
            icon={<Calendar size={20} color="#3B82F6" />}
            title="אחוז הצלחה"
            value={`${userStats.winRate}%`}
          />
          <StatCard
            icon={<Zap size={20} color="#EF4444" />}
            title="רצף נוכחי"
            value={userStats.currentStreak.toString()}
            subtitle={`הכי טוב: ${userStats.bestStreak}`}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>המשחקים האחרונים</Text>
          {recentMatches.map((match) => (
            <View key={match.id} style={styles.matchRow}>
              <View style={styles.matchInfo}>
                <Text style={styles.matchTeams}>
                  {match.homeTeam} נגד {match.awayTeam}
                </Text>
                <Text style={styles.matchPrediction}>
                  ניחשת: {match.prediction} | תוצאה: {match.actual}
                </Text>
              </View>
              <View style={[
                styles.pointsBadge, 
                match.points === 10 ? styles.perfectBadge : 
                match.points > 0 ? styles.goodBadge : styles.missedBadge
              ]}>
                <Text style={styles.pointsText}>{match.points}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>הישגים</Text>
          <View style={styles.achievementGrid}>
            <View style={styles.achievement}>
              <Trophy size={24} color="#F59E0B" />
              <Text style={styles.achievementTitle}>מלך הניחושים</Text>
              <Text style={styles.achievementDesc}>8 ניחושים מדויקים</Text>
            </View>
            <View style={styles.achievement}>
              <Target size={24} color="#22C55E" />
              <Text style={styles.achievementTitle}>רצף זהב</Text>
              <Text style={styles.achievementDesc}>7 ניחושים ברצף</Text>
            </View>
            <View style={styles.achievement}>
              <Calendar size={24} color="#3B82F6" />
              <Text style={styles.achievementTitle}>יוצר משחקים</Text>
              <Text style={styles.achievementDesc}>{userStats.matchesCreated} משחקים</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>הקבוצות שלי</Text>
          
          {adminGroups.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>🛡️ קבוצות שאני מנהל</Text>
              {adminGroups.map((group) => (
                <View key={group.id} style={[styles.groupCard, styles.adminGroupCard]}>
                  <View style={styles.groupInfo}>
                    <View style={styles.groupHeader}>
                      <Shield size={20} color="#F59E0B" />
                      <Text style={styles.groupName}>{group.name}</Text>
                    </View>
                    <View style={styles.groupStats}>
                      <Users size={16} color="#6B7280" />
                      <Text style={styles.groupMemberCount}>{group.memberCount} חברים</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.manageButton}>
                    <Text style={styles.manageButtonText}>נהל</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
          
          {memberGroups.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>👥 קבוצות שאני חבר בהן</Text>
              {memberGroups.map((group) => (
                <View key={group.id} style={styles.groupCard}>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <View style={styles.groupStats}>
                      <Users size={16} color="#6B7280" />
                      <Text style={styles.groupMemberCount}>{group.memberCount} חברים</Text>
                      <Text style={styles.adminLabel}>מנהל: {group.adminName}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>שתף עם חברים</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Bell size={20} color="#6B7280" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              הגדרות התראות
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Settings size={20} color="#6B7280" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              הגדרות כלליות
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 35,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRank: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'right',
  },
  matchRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  matchInfo: {
    flex: 1,
  },
  matchTeams: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'right',
  },
  matchPrediction: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  pointsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perfectBadge: {
    backgroundColor: '#22C55E',
  },
  goodBadge: {
    backgroundColor: '#3B82F6',
  },
  missedBadge: {
    backgroundColor: '#EF4444',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievement: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#6B7280',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
  },
  adminGroupCard: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
  },
  groupMemberCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  adminLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 8,
  },
  manageButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});