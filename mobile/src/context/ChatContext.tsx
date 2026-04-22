import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
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
  isChatUnread: (chat: ChatRecord) => boolean;
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  unreadCount: 0,
  loading: false,
  refreshChats: async () => {},
  markChatAsRead: async () => {},
  isChatUnread: () => false,
});

const STORAGE_KEY_PREFIX = 'chatLastSeenMap';

const normalizeId = (value: unknown) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && '_id' in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)._id);
  }

  return String(value);
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userToken, user } = useAuth();
  const currentUserId = user?.id || (user as any)?._id || '';
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const storageKey = currentUserId ? `${STORAGE_KEY_PREFIX}:${currentUserId}` : STORAGE_KEY_PREFIX;

  useEffect(() => {
    const loadSeenMap = async () => {
      if (!currentUserId) {
        setLastSeenMap({});
        return;
      }

      try {
        const value = await AsyncStorage.getItem(storageKey);
        if (value) {
          setLastSeenMap(JSON.parse(value));
        } else {
          setLastSeenMap({});
        }
      } catch (error) {
        console.log('Error loading chat seen map:', error);
      }
    };

    loadSeenMap();
  }, [currentUserId, storageKey]);

  const persistSeenMap = async (value: Record<string, string>) => {
    setLastSeenMap(value);
    if (currentUserId) {
      await AsyncStorage.setItem(storageKey, JSON.stringify(value));
    }
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

  useEffect(() => {
    if (!userToken) {
      return;
    }

    const syncChats = () => {
      refreshChats();
    };

    const intervalId = setInterval(syncChats, 4000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncChats();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [refreshChats, userToken]);

  const markChatAsRead = useCallback(async (chatId: string) => {
    const targetChat = chats.find((chat) => chat._id === chatId);
    const seenAt = targetChat?.lastMessage?.sentAt || new Date().toISOString();
    const nextValue = { ...lastSeenMap, [chatId]: seenAt };
    await persistSeenMap(nextValue);
  }, [chats, lastSeenMap]);

  const isChatUnread = useCallback((chat: ChatRecord) => {
    if (!currentUserId) {
      return false;
    }

    const sentAt = chat.lastMessage?.sentAt;
    const senderId = normalizeId(chat.lastMessage?.sender?._id);

    if (!sentAt || !senderId || senderId === currentUserId) {
      return false;
    }

    const seenAt = lastSeenMap[chat._id];
    return !seenAt || new Date(sentAt).getTime() > new Date(seenAt).getTime();
  }, [currentUserId, lastSeenMap]);

  const unreadCount = useMemo(() => {
    return chats.filter(isChatUnread).length;
  }, [chats, isChatUnread]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        unreadCount,
        loading,
        refreshChats,
        markChatAsRead,
        isChatUnread,
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
