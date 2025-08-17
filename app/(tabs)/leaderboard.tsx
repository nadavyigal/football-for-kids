import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Medal, Award, Target } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface Player {
  id: string;
  name: string;
  totalPoints: number;
  exactPredictions: number;
  closePredictions: number;
  totalPredictions: number;
  winRate: number;
}

const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'יוסי',
    totalPoints: 185,
    exactPredictions: 8,
    closePredictions: 15,
    totalPredictions: 32,
    winRate: 71.9,
  },
  {
    id: '2',
    name: 'דני',
    totalPoints: 172,
    exactPredictions: 6,
    closePredictions: 18,
    totalPredictions: 35,
    winRate: 68.6,
  },
  {
    id: '3',
    name: 'רון',
    totalPoints: 156,
    exactPredictions: 9,
    closePredictions: 12,
    totalPredictions: 28,
    winRate: 75.0,
  },
  {
    id: '4',
    name: 'מיכל',
    totalPoints: 143,
    exactPredictions: 5,
    closePredictions: 16,
    totalPredictions: 30,
    winRate: 70.0,
  },
  {
    id: '5',
    name: 'עומר',
    totalPoints: 128,
    exactPredictions: 4,
    closePredictions: 14,
    totalPredictions: 26,
    winRate: 69.2,
  },
  {
    id: '6',
    name: 'נועה',
    totalPoints: 115,
    exactPredictions: 3,
    closePredictions: 13,
    totalPredictions: 24,
    winRate: 66.7,
  },
  {
    id: '7',
    name: 'אלי',
    totalPoints: 98,
    exactPredictions: 2,
    closePredictions: 11,
    totalPredictions: 22,
    winRate: 59.1,
  },
  {
    id: '8',
    name: 'שירה',
    totalPoints: 87,
    exactPredictions: 3,
    closePredictions: 8,
    totalPredictions: 20,
    winRate: 55.0,
  },
];

export default function LeaderboardScreen() {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy size={24} color="#F59E0B" />;
      case 2:
        return <Medal size={24} color="#9CA3AF" />;
      case 3:
        return <Award size={24} color="#CD7C2F" />;
      default:
        return <Text style={styles.positionNumber}>{position}</Text>;
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return styles.firstPlace;
      case 2:
        return styles.secondPlace;
      case 3:
        return styles.thirdPlace;
      default:
        return styles.regularPlace;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Trophy size={32} color="#FFFFFF" />
        <Text style={styles.title}>לוח מובילים</Text>
        <Text style={styles.subtitle}>מי הכי טוב בניחושים?</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Target size={20} color="#22C55E" />
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>ניחושים מדויקים</Text>
        </View>
        <View style={styles.statBox}>
          <Award size={20} color="#3B82F6" />
          <Text style={styles.statNumber}>1,184</Text>
          <Text style={styles.statLabel}>סה"כ ניחושים</Text>
        </View>
        <View style={styles.statBox}>
          <Medal size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>68.2%</Text>
          <Text style={styles.statLabel}>אחוז הצלחה כללי</Text>
        </View>
      </View>

      <ScrollView style={styles.leaderboard} showsVerticalScrollIndicator={false}>
        {mockPlayers.map((player, index) => (
          <View key={player.id} style={[styles.playerCard, getPositionStyle(index + 1)]}>
            <View style={styles.playerRank}>
              {getPositionIcon(index + 1)}
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <View style={styles.playerStats}>
                <Text style={styles.statText}>
                  {player.totalPoints} נקודות
                </Text>
                <Text style={styles.statText}>
                  {player.exactPredictions} מדויקים
                </Text>
                <Text style={styles.statText}>
                  {player.winRate}% הצלחה
                </Text>
              </View>
            </View>
            
            <View style={styles.playerScore}>
              <Text style={styles.scoreNumber}>{player.totalPoints}</Text>
              <Text style={styles.scoreLabel}>נקודות</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>מערכת הניקוד:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.legendText}>ניחוש מדויק: 10 נקודות</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>ניחוש קרוב (הפרש של 1): 5 נקודות</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>ניחוש מנצח נכון: 3 נקודות</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7ED',
  },
  header: {
    backgroundColor: '#F59E0B',
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 5,
    opacity: 0.95,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  leaderboard: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  firstPlace: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  secondPlace: {
    borderLeftWidth: 4,
    borderLeftColor: '#9CA3AF',
    backgroundColor: '#F9FAFB',
  },
  thirdPlace: {
    borderLeftWidth: 4,
    borderLeftColor: '#CD7C2F',
    backgroundColor: '#FEF3E2',
  },
  regularPlace: {
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
  },
  playerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  positionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  playerInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'right',
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  playerScore: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  legend: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'right',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
});