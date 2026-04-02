import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

interface MessageItem {
  _id: string;
  content: string;
  createdAt: string;
  sender: {
    _id?: string;
    name: string;
  };
}

const formatMessageTime = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

const ChatRoomScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { chatId, recipientName } = route.params;
  const { user } = useAuth();
  const { markChatAsRead, refreshChats } = useChats();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(response.data.data || []);
    } catch (error: any) {
      console.log('Error loading messages:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    markChatAsRead(chatId);
  }, [chatId, markChatAsRead]);

  const sendMessage = async () => {
    if (!content.trim()) {
      return;
    }

    try {
      setSending(true);
      const response = await api.post(`/chats/${chatId}/messages`, {
        content: content.trim(),
      });
      setMessages((current) => [...current, response.data.data]);
      setContent('');
      await refreshChats();
      await markChatAsRead(chatId);
    } catch (error: any) {
      console.log('Error sending message:', error.response?.data || error.message);
    } finally {
      setSending(false);
    }
  };

  const unsendMessage = async (messageId: string) => {
    try {
      setDeletingId(messageId);
      await api.delete(`/chats/${chatId}/messages/${messageId}`);
      setMessages((current) => current.filter((message) => message._id !== messageId));
      await refreshChats();
      await markChatAsRead(chatId);
    } catch (error: any) {
      Alert.alert('Could not unsend', error.response?.data?.message || 'Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{recipientName}</Text>
        <NotificationBell navigation={navigation} dark />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {messages.map((message) => {
            const mine = message.sender?._id === user?.id;

            return (
              <View key={message._id} style={[styles.messageWrap, mine ? styles.messageWrapMine : styles.messageWrapOther]}>
                <View style={[styles.messageBubble, mine ? styles.messageBubbleMine : styles.messageBubbleOther]}>
                  {!mine ? <Text style={styles.senderName}>{message.sender?.name}</Text> : null}
                  <Text style={[styles.messageText, mine && styles.messageTextMine]}>{message.content}</Text>
                  <Text style={[styles.messageTime, mine && styles.messageTimeMine]}>{formatMessageTime(message.createdAt)}</Text>
                  {mine ? (
                    <TouchableOpacity
                      style={styles.unsendButton}
                      onPress={() =>
                        Alert.alert('Unsend message', 'Remove this message from the chat?', [
                          { text: 'Keep it', style: 'cancel' },
                          { text: 'Unsend', style: 'destructive', onPress: () => unsendMessage(message._id) },
                        ])
                      }
                      disabled={deletingId === message._id}
                    >
                      <Text style={styles.unsendText}>{deletingId === message._id ? 'Removing...' : 'Unsend'}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          placeholder="Write a message"
          placeholderTextColor="#8A949C"
          value={content}
          onChangeText={setContent}
        />
        <TouchableOpacity style={[styles.sendButton, sending && styles.sendButtonDisabled]} onPress={sendMessage} disabled={sending}>
          <Text style={styles.sendButtonText}>{sending ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F1E8' },
  header: {
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#12212B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { backgroundColor: '#243744', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  backText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  contentInner: { padding: 20, gap: 10 },
  messageWrap: { width: '100%', marginBottom: 10 },
  messageWrapMine: { alignItems: 'flex-end' },
  messageWrapOther: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '82%', borderRadius: 18, padding: 14 },
  messageBubbleMine: { backgroundColor: '#F97316' },
  messageBubbleOther: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6DCC8' },
  senderName: { color: '#8B5E1A', fontSize: 11, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase' },
  messageText: { color: '#12212B', fontSize: 15, lineHeight: 20 },
  messageTextMine: { color: '#FFFFFF' },
  messageTime: { marginTop: 8, color: '#7C8590', fontSize: 11 },
  messageTimeMine: { color: '#FFF3E6' },
  unsendButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  unsendText: {
    color: '#FFF3E6',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6DCC8',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F5EE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#12212B',
    fontSize: 15,
  },
  sendButton: { backgroundColor: '#12212B', borderRadius: 16, paddingHorizontal: 18, justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.7 },
  sendButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default ChatRoomScreen;
