import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../context/ChatContext';
import api from '../services/api';

interface UserLite {
  _id: string;
  name: string;
  email: string;
  position?: string;
  skillLevel?: string;
}

interface ChatItem {
  _id: string;
  name?: string;
  isGroupChat: boolean;
  members: UserLite[];
  lastMessage?: {
    content?: string;
    sentAt?: string;
  };
}

const formatTime = (value?: string) => {
  if (!value) {
    return 'No messages yet';
  }

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
};

const ChatsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || (user as any)?._id;
  const { chats, loading, refreshChats, markChatAsRead, isChatUnread } = useChats();
  const [users, setUsers] = useState<UserLite[]>([]);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  const searchUsers = async (text: string) => {
    setQuery(text);

    if (!text.trim()) {
      setUsers([]);
      return;
    }

    try {
      setSearching(true);
      const response = await api.get('/users', { params: { q: text.trim() } });
      setUsers(response.data.data || []);
    } catch (error: any) {
      console.log('Error searching users:', error.response?.data || error.message);
    } finally {
      setSearching(false);
    }
  };

  const startDirectChat = async (userId: string, userName: string) => {
    try {
      const response = await api.post('/chats/direct', { recipientId: userId });
      const chat = response.data.data;
      await refreshChats();
      await markChatAsRead(chat._id);
      navigation.navigate('ChatRoom', { chatId: chat._id, recipientName: userName });
    } catch (error: any) {
      Alert.alert('Chat unavailable', error.response?.data?.message || 'Could not open this chat.');
    }
  };

  const renderedChats = useMemo(
    () =>
      (chats as ChatItem[]).map((chat) => {
        const title = chat.isGroupChat
          ? chat.name || 'Group chat'
          : chat.members.find((member) => member._id !== currentUserId)?.name || 'Direct chat';
        return { ...chat, title };
      }),
    [chats, currentUserId],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Chats</Text>
          <Text style={styles.headerSubtitle}>Talk one-to-one and keep your futsal planning simple.</Text>
        </View>
        <NotificationBell navigation={navigation} dark />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshChats} tintColor="#F97316" />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Chats</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TeamHub')}>
              <Text style={styles.linkText}>Open Team</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F97316" />
            </View>
          ) : renderedChats.length ? (
            renderedChats.map((chat) => {
              const unread = isChatUnread(chat);

              return (
                <TouchableOpacity
                  key={chat._id}
                  style={[styles.chatCard, unread && styles.chatCardUnread]}
                  activeOpacity={0.85}
                  onPress={async () => {
                    await markChatAsRead(chat._id);
                    navigation.navigate('ChatRoom', { chatId: chat._id, recipientName: chat.title });
                  }}
                >
                  <View style={[styles.chatAvatar, unread && styles.chatAvatarUnread]}>
                    <Text style={styles.chatAvatarText}>{chat.isGroupChat ? 'GG' : 'DM'}</Text>
                  </View>
                  <View style={styles.chatInfo}>
                    <View style={styles.chatTop}>
                      <View style={styles.chatTitleWrap}>
                        <Text style={[styles.chatTitle, unread && styles.chatTitleUnread]}>{chat.title}</Text>
                        {unread ? (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>NEW</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[styles.chatDate, unread && styles.chatDateUnread]}>{formatTime(chat.lastMessage?.sentAt)}</Text>
                    </View>
                    <Text style={[styles.chatPreview, unread && styles.chatPreviewUnread]} numberOfLines={2}>
                      {unread ? `NEW: ${chat.lastMessage?.content || 'Start the conversation.'}` : chat.lastMessage?.content || 'Start the conversation.'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No chats yet</Text>
              <Text style={styles.emptyText}>Search players below to start a direct chat.</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start a chat</Text>
          <TextInput
            style={styles.input}
            placeholder="Search players by name or email"
            placeholderTextColor="#8A949C"
            value={query}
            onChangeText={searchUsers}
          />
          {searching ? <Text style={styles.helperText}>Searching players...</Text> : null}
          {users.map((player) => (
            <View key={player._id} style={styles.userCard}>
              <TouchableOpacity style={styles.userInfo} activeOpacity={0.85} onPress={() => startDirectChat(player._id, player.name)}>
                <Text style={styles.userName}>{player.name}</Text>
                <Text style={styles.userMeta}>
                  {player.position || 'Any'}{player.skillLevel ? ` - ${player.skillLevel}` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageButton} onPress={() => startDirectChat(player._id, player.name)}>
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F1E8' },
  header: {
    paddingTop: 58,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: '#12212B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  headerSubtitle: { marginTop: 6, color: '#C2CBD2', fontSize: 14, lineHeight: 20, maxWidth: 250 },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#12212B', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  linkText: { color: '#B45309', fontSize: 13, fontWeight: '800' },
  loadingContainer: { paddingVertical: 40, alignItems: 'center' },
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
  },
  chatCardUnread: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F97316',
  },
  chatAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#12212B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarUnread: { backgroundColor: '#F97316' },
  chatAvatarText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  chatInfo: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  chatTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatTitle: { flex: 1, color: '#12212B', fontSize: 17, fontWeight: '800' },
  chatTitleUnread: { color: '#C2410C' },
  unreadBadge: {
    backgroundColor: '#F97316',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  chatDate: { color: '#8B5E1A', fontSize: 12, fontWeight: '700' },
  chatDateUnread: { color: '#F97316' },
  chatPreview: { marginTop: 6, color: '#12212B', fontSize: 14, lineHeight: 20 },
  chatPreviewUnread: { color: '#F97316', fontWeight: '700' },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E6DCC8', padding: 18 },
  emptyTitle: { color: '#12212B', fontSize: 20, fontWeight: '800' },
  emptyText: { marginTop: 8, color: '#5F6B74', fontSize: 14, lineHeight: 21 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#12212B',
    fontSize: 15,
  },
  helperText: { color: '#69747D', fontSize: 13, marginTop: 10 },
  userCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: { flex: 1 },
  userName: { color: '#12212B', fontSize: 16, fontWeight: '800' },
  userMeta: { color: '#5F6B74', fontSize: 13, marginTop: 4 },
  messageButton: { backgroundColor: '#FFF8EC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#F1DFC0' },
  messageButtonText: { color: '#9A4B14', fontSize: 12, fontWeight: '800' },
  bottomSpacer: { height: 90 },
});

export default ChatsScreen;
