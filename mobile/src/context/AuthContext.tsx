import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  userToken: string | null;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  user: null,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in when app starts
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        setUserToken(token);
        setUser(JSON.parse(userData));
        console.log('User auto-logged in');
      }
    } catch (error) {
      console.log('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, userData: User) => {
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Update state 
      setUserToken(token);
      setUser(userData);

      console.log('✅ Login successful, token saved');
    } catch (error) {
      console.log('❌ Error saving login data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');

      setUserToken(null);
      setUser(null);

      console.log('✅ Logout successful');
    } catch (error) {
      console.log('❌ Error during logout:', error);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.log('Error updating user data:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        user,
        login,
        logout,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
