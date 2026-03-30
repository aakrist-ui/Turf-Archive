import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell: React.FC<{ navigation: any; dark?: boolean }> = ({ navigation, dark = true }) => {
  const { unreadCount } = useNotifications();

  return (
    <TouchableOpacity
      style={[styles.button, dark ? styles.buttonDark : styles.buttonLight]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Text style={[styles.icon, dark ? styles.iconDark : styles.iconLight]}>🔔</Text>
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonDark: {
    backgroundColor: '#243744',
  },
  buttonLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCC8',
  },
  icon: {
    fontSize: 18,
  },
  iconDark: {
    color: '#FFFFFF',
  },
  iconLight: {
    color: '#12212B',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});

export default NotificationBell;
