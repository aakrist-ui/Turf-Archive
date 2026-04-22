import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NotificationBell from '../components/NotificationBell';
import { useNotifications } from '../context/NotificationContext';

const formatEventTime = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { notifications, refreshBookings, loading } = useNotifications();

  const groupedNotifications = useMemo(() => {
    const now = new Date();

    return [...notifications]
      .sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime())
      .map((item) => {
        const eventDate = new Date(item.eventTime);
        const diffHours = Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        let label = formatEventTime(item.eventTime);

        if (item.type === 'reminder' && diffHours >= 0 && diffHours <= 24) {
          label = diffHours <= 1 ? 'Starting soon' : `In ${diffHours} hrs`;
        }

        return { ...item, label };
      });
  }, [notifications]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <NotificationBell navigation={navigation} dark />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshBookings} tintColor="#F97316" />}
        showsVerticalScrollIndicator={false}
      >
        {groupedNotifications.length ? (
          groupedNotifications.map((notification) => (
            <View key={notification.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{notification.title}</Text>
                <Text style={styles.cardMeta}>{notification.label}</Text>
              </View>
              <Text style={styles.cardBody}>{notification.message}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>Booking reminders and updates will show up here once you start reserving arenas.</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  header: {
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#12212B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#243744',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    color: '#12212B',
    fontSize: 18,
    fontWeight: '800',
  },
  cardMeta: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardBody: {
    marginTop: 10,
    color: '#4F5D67',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    padding: 24,
    marginTop: 20,
  },
  emptyTitle: {
    color: '#12212B',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: '#5F6B74',
    fontSize: 14,
    lineHeight: 21,
  },
  bottomSpacer: {
    height: 90,
  },
});

export default NotificationsScreen;
