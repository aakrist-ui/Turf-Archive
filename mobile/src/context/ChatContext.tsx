import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface ChatMember {
  _id: string;
  name: string;
}

interface ChatRecord {
  _id: string;
  name?: string;
  isGroupChat: boolean;
  members: ChatMember[];
  lastMessage?: {
    content?: string;
    sender?: {
      _id?: string;
      name?: string;
    };
    sentAt?: string;
  };
}

interface ChatContextType {
  chats: ChatRecord[];
  unreadCount: number;
  loading: boolean;
  refreshChats: () => Promise<void>;
  markChatAsRead: (chatId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  unreadCount: 0,
  loading: false,
  refreshChats: async () => {},
  markChatAsRead: async () => {},
});

const STORAGE_KEY = 'chatLastSeenMap';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userToken, user } = useAuth();
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSeenMap = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        if (value) {
          setLastSeenMap(JSON.parse(value));
        }
      } catch (error) {
        console.log('Error loading chat seen map:', error);
      }
    };

    loadSeenMap();
  }, []);

  const persistSeenMap = async (value: Record<string, string>) => {
    setLastSeenMap(value);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  };

  const refreshChats = useCallback(async () => {
    if (!userToken) {
      setChats([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/chats');
      setChats(response.data.data || []);
    } catch (error: any) {
      console.log('Error fetching chats for badge:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  const markChatAsRead = useCallback(async (chatId: string) => {
    const targetChat = chats.find((chat) => chat._id === chatId);
    const seenAt = targetChat?.lastMessage?.sentAt || new Date().toISOString();
    const nextValue = { ...lastSeenMap, [chatId]: seenAt };
    await persistSeenMap(nextValue);
  }, [chats, lastSeenMap]);

  const unreadCount = useMemo(() => {
    if (!user?.id) {
      return 0;
    }

    return chats.filter((chat) => {
      const sentAt = chat.lastMessage?.sentAt;
      const senderId = chat.lastMessage?.sender?._id;

      if (!sentAt || !senderId || senderId === user.id) {
        return false;
      }

      const seenAt = lastSeenMap[chat._id];
      return !seenAt || new Date(sentAt).getTime() > new Date(seenAt).getTime();
    }).length;
  }, [chats, lastSeenMap, user?.id]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        unreadCount,
        loading,
        refreshChats,
        markChatAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChats = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChats must be used within a ChatProvider');
  }
  return context;
};
