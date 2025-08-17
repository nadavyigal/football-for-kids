import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  I18nManager,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, Clock, Trophy, Share2, Copy, Shield } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const israeliTeams = [
  'מכבי תל אביב',
  'הפועל תל אביב',
  'מכבי חיפה',
  'בית"ר ירושלים',
  'הפועל חיפה',
  'מכבי פתח תקווה',
  'הפועל באר שבע',
  'מכבי נתניה',
  'אשדוד',
  'הפועל עכו',
];

const europeanTeams = [
  'ריאל מדריד',
  'ברצלונה',
  'מנצ\'סטר סיטי',
  'ליברפול',
  'באיירן מינכן',
  'פריז סן ז\'רמן',
  'יובנטוס',
  'צ\'לסי',
  'ארסנל',
  'אתלטיקו מדריד',
  'אינטר מילאן',
  'מנצ\'סטר יונייטד',
];

const leagues = [
  'הליגה הישראלית',
  'ליגת האלופות',
  'הליגה האירופית',
  'הליגה הספרדית',
  'הליגה האנגלית',
  'הבונדסליגה',
];

interface Group {
  id: string;
  name: string;
  adminId: string;
  adminName: string;
}

const currentUserId = 'user1';

const mockGroups: Group[] = [
  { id: 'group1', name: 'חברי הילדות', adminId: 'user1', adminName: 'יוסי' },
  { id: 'group2', name: 'עבודה', adminId: 'user2', adminName: 'דני' },
];

export default function CreateScreen() {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [league, setLeague] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showHomeTeams, setShowHomeTeams] = useState(false);
  const [showAwayTeams, setShowAwayTeams] = useState(false);
  const [showLeagues, setShowLeagues] = useState(false);

  const currentGroup = mockGroups.find(g => g.id === 'group1');
  const isAdmin = currentGroup?.adminId === currentUserId;

  const getTeamsByLeague = (selectedLeague: string) => {
    if (selectedLeague === 'הליגה הישראלית') {
      return israeliTeams;
    }
    return europeanTeams;
  };

  const handleCreateMatch = () => {
    if (!homeTeam || !awayTeam || !league || !date || !time) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }
    
    if (homeTeam === awayTeam) {
      Alert.alert('שגיאה', 'לא ניתן לבחור את אותה קבוצה פעמיים');
      return;
    }

    const matchId = Math.random().toString(36).substr(2, 9);
    const shareLink = `https://football-bet.app/match/${matchId}`;
    
    const approvalMessage = isAdmin 
      ? 'המשחק נוצר ואושר אוטומטית!' 
      : 'המשחק נוצר ונשלח לאישור המנהל!';

    Alert.alert(
      'משחק נוצר בהצלחה!',
      `המשחק ${homeTeam} נגד ${awayTeam} נוצר בהצלחה!\n\n${approvalMessage}\n\nקישור פרטי נוצר למשחק - רק מי שיקבל את הקישור יוכל לנחש.`,
      [
        {
          text: 'שתף עם חברים',
          onPress: () => handleShareMatch(homeTeam, awayTeam, date, time, league, shareLink),
        },
        {
          text: 'אישור',
          onPress: () => {
            setHomeTeam('');
            setAwayTeam('');
            setLeague('');
            setDate('');
            setTime('');
          }
        }
      ]
    );
  };

  const handleShareMatch = async (home: string, away: string, matchDate: string, matchTime: string, matchLeague: string, link: string) => {
    try {
      await Share.share({
        message: `🏆 בוא לנחש איתי את המשחק!\n\n⚽ ${home} נגד ${away}\n📅 ${matchDate} בשעה ${matchTime}\n🏟️ ${matchLeague}\n\n🔗 ${link}\n\n💡 רק מי שיש לו את הקישור יכול לנחש!`,
        title: 'ניחוש פרטי על מששחק כדורגל',
      });
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לשתף את המשחק כרגע');
    }
  };

  const TeamSelector = ({ 
    title, 
    selectedTeam, 
    onSelect, 
    showDropdown, 
    setShowDropdown 
  }: {
    title: string;
    selectedTeam: string;
    onSelect: (team: string) => void;
    showDropdown: boolean;
    setShowDropdown: (show: boolean) => void;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{title}</Text>
      <TouchableOpacity
        style={[styles.dropdown, showDropdown && styles.dropdownActive]}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={[styles.dropdownText, !selectedTeam && styles.placeholder]}>
          {selectedTeam || `בחר ${title.toLowerCase()}`}
        </Text>
      </TouchableOpacity>
      {showDropdown && (
        <ScrollView style={styles.dropdownList} nestedScrollEnabled>
          {getTeamsByLeague(league).map((team) => (
            <TouchableOpacity
              key={team}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(team);
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{team}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>⚽ צור משחק חדש</Text>
          <Text style={styles.subtitle}>🔒 רק החברים שלך יוכלו לנחש</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Shield size={16} color="#FFFFFF" />
              <Text style={styles.adminText}>מנהל קבוצה</Text>
            </View>
          )}
        </View>
        <Text style={styles.groupName}>קבוצה: {currentGroup?.name}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ליגה</Text>
            <TouchableOpacity
              style={[styles.dropdown, showLeagues && styles.dropdownActive]}
              onPress={() => setShowLeagues(!showLeagues)}
            >
              <Text style={[styles.dropdownText, !league && styles.placeholder]}>
                {league || 'בחר ליגה'}
              </Text>
            </TouchableOpacity>
            {showLeagues && (
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {leagues.map((leagueOption) => (
                  <TouchableOpacity
                    key={leagueOption}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setLeague(leagueOption);
                      setShowLeagues(false);
                      // Reset teams when league changes
                      setHomeTeam('');
                      setAwayTeam('');
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{leagueOption}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {league && (
            <>
              <TeamSelector
                title="קבוצת בית"
                selectedTeam={homeTeam}
                onSelect={setHomeTeam}
                showDropdown={showHomeTeams}
                setShowDropdown={setShowHomeTeams}
              />

              <TeamSelector
                title="קבוצת חוץ"
                selectedTeam={awayTeam}
                onSelect={setAwayTeam}
                showDropdown={showAwayTeams}
                setShowDropdown={setShowAwayTeams}
              />

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.label}>תאריך</Text>
                  <View style={styles.inputWithIcon}>
                    <Calendar size={20} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="DD/MM/YYYY"
                      value={date}
                      onChangeText={setDate}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>שעה</Text>
                  <View style={styles.inputWithIcon}>
                    <Clock size={20} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="HH:MM"
                      value={time}
                      onChangeText={setTime}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {homeTeam && awayTeam && league && date && time && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>תצוגה מקדימה:</Text>
            <View style={styles.previewCard}>
              <View style={styles.privateIndicator}>
                <Text style={styles.privateText}>🔒 משחק פרטי</Text>
              </View>
              <Text style={styles.previewLeague}>{league}</Text>
              <View style={styles.previewTeams}>
                <Text style={styles.previewTeam}>{homeTeam}</Text>
                <Text style={styles.previewVs}>נגד</Text>
                <Text style={styles.previewTeam}>{awayTeam}</Text>
              </View>
              <Text style={styles.previewDateTime}>{date} בשעה {time}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.createButton} onPress={handleCreateMatch}>
          <Plus size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>צור משחק פרטי</Text>
        </TouchableOpacity>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔒 איך זה עובד?</Text>
          <Text style={styles.infoText}>
            {isAdmin 
              ? '• כמנהל, המשחקים שלך מאושרים אוטומטית\n• תוכל לאשר או לדחות משחקים של חברים אחרים\n• תקבל קישור ייחודי לשיתוף עם החברים'
              : '• המשחק יישלח לאישור המנהל לפני שיהיה זמין\n• תקבל קישור ייחודי לשיתוף עם החברים\n• רק החברים שלך יוכלו לראות ולנחש את המשחק'
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    backgroundColor: '#3B82F6',
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
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 5,
    opacity: 0.95,
    fontWeight: '600',
    textAlign: 'center',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    gap: 4,
  },
  adminText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  groupName: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.9,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'right',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownActive: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'right',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  preview: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'right',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  privateIndicator: {
    alignSelf: 'flex-end',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  privateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D97706',
  },
  previewLeague: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  previewTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTeam: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  previewVs: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  previewDateTime: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    gap: 8,
    marginBottom: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'right',
  },
});