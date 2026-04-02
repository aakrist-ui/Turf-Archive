import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../context/ChatContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ArenasScreen from '../screens/ArenaScreen';
import BookingsScreen from '../screens/BookingScreen';
import ChatsScreen from '../screens/ChatsScreen';
import TeamsScreen from '../screens/TeamScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ArenaDetailScreen from '../screens/ArenaDetailScreen';
import CreateBookingScreen from '../screens/CreateBookingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  ArenaDetails: { arenaId: string; arena: any };
  BookingScreen: { arenaId: string };
  ChatRoom: { chatId: string; recipientName: string };
  TeamHub: undefined;
  Notifications: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator();

const iconStyle = (focused: boolean) => ({
  fontSize: 20,
  opacity: focused ? 1 : 0.5,
});

const HomeTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>🏠</Text>;
const ArenaTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>🏟️</Text>;
const BookingTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>📅</Text>;
const ProfileTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>👤</Text>;
const ChatTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>💬</Text>;

const AuthNavigator = () => (
  <AuthStack.Navigator
    initialRouteName="Login"
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#1a1d29' },
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => {
  const { unreadCount } = useChats();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1C1C2E',
          borderTopColor: '#2A2A45',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#00E5FF',
        tabBarInactiveTintColor: '#666688',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeTabIcon,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Arenas"
        component={ArenasScreen}
        options={{
          tabBarIcon: ArenaTabIcon,
          tabBarLabel: 'Arenas',
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarIcon: BookingTabIcon,
          tabBarLabel: 'Bookings',
        }}
      />
      <Tab.Screen
      name="Chats"
      component={ChatsScreen}
      options={{
        tabBarIcon: ChatTabIcon,
        tabBarLabel: 'Chats',
        tabBarBadge: unreadCount > 0 ? ' ' : undefined,
        tabBarBadgeStyle: {
          backgroundColor: '#EF4444',
          minWidth: 8,
          height: 8,
          borderRadius: 4,
        },
      }}
    />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ProfileTabIcon,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => (
  <MainStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#0D0D1A' },
    }}
  >
    <MainStack.Screen name="MainTabs" component={MainTabs} />
    <MainStack.Screen name="ArenaDetails" component={ArenaDetailScreen} />
    <MainStack.Screen name="BookingScreen" component={CreateBookingScreen} />
    <MainStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    <MainStack.Screen name="TeamHub" component={TeamsScreen} />
    <MainStack.Screen name="Notifications" component={NotificationsScreen} />
  </MainStack.Navigator>
);

const AppNavigator = () => {
  const { userToken } = useAuth();

  return <NavigationContainer>{userToken ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>;
};

export default AppNavigator;
