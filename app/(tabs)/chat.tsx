import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, MessageCircle, Users, Shield, Trophy } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isAdmin: boolean;
}

interface Group {
  id: string;
  name: string;
  adminId: string;
  adminName: string;
  memberCount: number;
}

const currentUserId = 'user1';
const currentUserName = 'יוסי';

const currentGroup: Group = {
  id: 'group1',
  name: 'חברי הילדות',
  adminId: 'user1',
  adminName: 'יוסי',
  memberCount: 8,
};

const mockMessages: Message[] = [
  {
    id: '1',
    userId: 'user2',
    userName: 'דני',
    message: 'מה אתם חושבים על המשחק של מכבי תל אביב מחר?',
    timestamp: new Date(Date.now() - 3600000),
    isAdmin: false,
  },
  {
    id: '2',
    userId: 'user1',
    userName: 'יוסי',
    message: 'אני חושב שהם ינצחו 2-1! מה דעתכם?',
    timestamp: new Date(Date.now() - 3000000),
    isAdmin: true,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'רון',
    message: 'לא בטוח... הפועל משחקת טוב השנה',
    timestamp: new Date(Date.now() - 2400000),
    isAdmin: false,
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'מיכל',
    message: 'יש לי הרגשה שזה יהיה תיקו 1-1',
    timestamp: new Date(Date.now() - 1800000),
    isAdmin: false,
  },
  {
    id: '5',
    userId: 'user2',
    userName: 'דני',
    message: 'בואו נראה מי צודק! 😄',
    timestamp: new Date(Date.now() - 900000),
    isAdmin: false,
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const isAdmin = currentGroup.adminId === currentUserId;

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUserName,
      message: newMessage.trim(),
      timestamp: new Date(),
      isAdmin: isAdmin,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'עכשיו';
    if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;
    if (diffInMinutes < 1440) return `לפני ${Math.floor(diffInMinutes / 60)} שעות`;
    return date.toLocaleDateString('he-IL');
  };

  const renderMessage = (message: Message) => {
    const isMyMessage = message.userId === currentUserId;
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMyMessage && (
          <View style={styles.messageHeader}>
            <View style={styles.userInfo}>
              {message.isAdmin && <Shield size={14} color="#F59E0B" />}
              <Text style={styles.userName}>{message.userName}</Text>
            </View>
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
            message.isAdmin && !isMyMessage && styles.adminMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {message.message}
          </Text>
        </View>
        
        <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MessageCircle size={28} color="#FFFFFF" />
          <View style={styles.headerText}>
            <Text style={styles.title}>💬 צ'אט קבוצתי</Text>
            <View style={styles.groupInfo}>
              <Users size={16} color="#FFFFFF" />
              <Text style={styles.subtitle}>{currentGroup.name} • {currentGroup.memberCount} חברים</Text>
            </View>
          </View>
        </View>
        
        {isAdmin && (
          <View style={styles.adminBadge}>
            <Shield size={16} color="#FFFFFF" />
            <Text style={styles.adminText}>מנהל</Text>
          </View>
        )}
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.welcomeMessage}>
            <Trophy size={24} color="#F59E0B" />
            <Text style={styles.welcomeText}>
              ברוכים הבאים לצ'אט של "{currentGroup.name}"!
            </Text>
            <Text style={styles.welcomeSubtext}>
              כאן תוכלו לדבר על המשחקים ולחלוק ניחושים
            </Text>
          </View>
          
          {messages.map(renderMessage)}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.sendButton, newMessage.trim() === '' && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={newMessage.trim() === ''}
          >
            <Send size={20} color={newMessage.trim() === '' ? '#9CA3AF' : '#FFFFFF'} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="כתוב הודעה..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
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
    alignSelf: 'flex-end',
  },
  adminText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  welcomeMessage: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97706',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#D97706',
    textAlign: 'center',
    opacity: 0.8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageHeader: {
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  myMessageBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
  },
  adminMessageBubble: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  otherMessageText: {
    color: '#111827',
    textAlign: 'right',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'left',
  },
  myTimestamp: {
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    textAlign: 'right',
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});