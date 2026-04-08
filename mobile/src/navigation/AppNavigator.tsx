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
import OwnerDashboardScreen from '../screens/OwnerDashboardScreen';
import OwnerArenasScreen from '../screens/OwnerArenasScreen';
import OwnerArenaEditorScreen from '../screens/OwnerArenaEditorScreen';
import OwnerBookingsScreen from '../screens/OwnerBookingsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminArenasScreen from '../screens/AdminArenasScreen';
import AdminBookingsScreen from '../screens/AdminBookingsScreen';

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
  OwnerArenaEditor: { arenaId: string | null };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator();

const iconStyle = (focused: boolean) => ({
  fontSize: 18,
  opacity: focused ? 1 : 0.55,
});

const HomeTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>{'\u{1F3E0}'}</Text>;
const ArenaTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>{'\u{1F3DF}\u{FE0F}'}</Text>;
const BookingTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>{'\u{1F4C5}'}</Text>;
const ProfileTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>{'\u{1F464}'}</Text>;
const ChatTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>{'\u{1F4AC}'}</Text>;
const DashboardTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>D</Text>;
const ReservationTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>R</Text>;
const OwnerArenaTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>A</Text>;
const OwnerProfileTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>P</Text>;
const AdminUsersTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>U</Text>;
const AdminArenaTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>A</Text>;
const AdminBookingTabIcon = ({ focused }: { focused: boolean }) => <Text style={iconStyle(focused)}>B</Text>;

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

const CustomerTabs = () => {
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

const OwnerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E5E7EB',
        borderTopWidth: 1,
        height: 66,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarActiveTintColor: '#111827',
      tabBarInactiveTintColor: '#6B7280',
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
      },
    }}
  >
    <Tab.Screen
      name="OwnerHome"
      component={OwnerDashboardScreen}
      options={{
        tabBarIcon: DashboardTabIcon,
        tabBarLabel: 'Dashboard',
      }}
    />
    <Tab.Screen
      name="OwnerArenas"
      component={OwnerArenasScreen}
      options={{
        tabBarIcon: OwnerArenaTabIcon,
        tabBarLabel: 'Arenas',
      }}
    />
    <Tab.Screen
      name="OwnerBookings"
      component={OwnerBookingsScreen}
      options={{
        tabBarIcon: ReservationTabIcon,
        tabBarLabel: 'Reservations',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: OwnerProfileTabIcon,
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E5E7EB',
        borderTopWidth: 1,
        height: 66,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarActiveTintColor: '#111827',
      tabBarInactiveTintColor: '#6B7280',
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
      },
    }}
  >
    <Tab.Screen
      name="AdminHome"
      component={AdminDashboardScreen}
      options={{
        tabBarIcon: DashboardTabIcon,
        tabBarLabel: 'Dashboard',
      }}
    />
    <Tab.Screen
      name="AdminUsers"
      component={AdminUsersScreen}
      options={{
        tabBarIcon: AdminUsersTabIcon,
        tabBarLabel: 'Users',
      }}
    />
    <Tab.Screen
      name="AdminArenas"
      component={AdminArenasScreen}
      options={{
        tabBarIcon: AdminArenaTabIcon,
        tabBarLabel: 'Arenas',
      }}
    />
    <Tab.Screen
      name="AdminBookings"
      component={AdminBookingsScreen}
      options={{
        tabBarIcon: AdminBookingTabIcon,
        tabBarLabel: 'Bookings',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: OwnerProfileTabIcon,
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
);

const MainNavigator = ({ role }: { role?: string }) => (
  <MainStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: role === 'user' ? '#0D0D1A' : '#F3F4F6' },
    }}
  >
    <MainStack.Screen
      name="MainTabs"
      component={role === 'admin' ? AdminTabs : role === 'owner' ? OwnerTabs : CustomerTabs}
    />
    {role === 'user' ? <MainStack.Screen name="ArenaDetails" component={ArenaDetailScreen} /> : null}
    {role === 'user' ? <MainStack.Screen name="BookingScreen" component={CreateBookingScreen} /> : null}
    {role === 'user' ? <MainStack.Screen name="ChatRoom" component={ChatRoomScreen} /> : null}
    {role === 'user' ? <MainStack.Screen name="TeamHub" component={TeamsScreen} /> : null}
    {role === 'user' ? <MainStack.Screen name="Notifications" component={NotificationsScreen} /> : null}
    {role === 'owner' ? <MainStack.Screen name="OwnerArenaEditor" component={OwnerArenaEditorScreen} /> : null}
  </MainStack.Navigator>
);

const AppNavigator = () => {
  const { userToken, user } = useAuth();

  return (
    <NavigationContainer>
      {userToken ? <MainNavigator role={user?.role || 'user'} /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
