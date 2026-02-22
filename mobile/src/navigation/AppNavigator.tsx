import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  ArenaDetails: { arenaId: string; arena: any };
  BookingScreen: { arenaId: string };
  BookingHistory: undefined;
  ChatRoom: { chatId: string; recipientName: string };
  CreateTeam: undefined;
  Notifications: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator();

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

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1C1C2E',
        borderTopColor: '#2A2A45',
        borderTopWidth: 1,
        height: 62,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarActiveTintColor: '#00E5FF',
      tabBarInactiveTintColor: '#666688',
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏟️</Text>,
        tabBarLabel: 'Arenas',
      }}
    />
  </Tab.Navigator>
);

const MainNavigator = () => (
  <MainStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#0D0D1A' },
    }}
  >
    <MainStack.Screen name="MainTabs" component={MainTabs} />
  </MainStack.Navigator>
);

const AppNavigator = () => {
  const { userToken } = useAuth();

  return (
    <NavigationContainer>
      {userToken ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;