import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';

interface AdminBooking {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  arena?: { name?: string };
  user?: { name?: string; email?: string };
}

const AdminBookingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.log('Error loading admin bookings:', error);
      Alert.alert('Could not load bookings', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadBookings);
    return unsubscribe;
  }, [loadBookings, navigation]);

  const updateBookingStatus = async (item: AdminBooking, status: string) => {
    try {
      setUpdatingId(item._id);
      const response = await api.put(`/bookings/${item._id}/status`, { status });
      setBookings((current) => current.map((booking) => (booking._id === item._id ? response.data.data : booking)));
    } catch (error: any) {
      Alert.alert('Could not update booking', error.response?.data?.message || 'Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadBookings} tintColor="#111827" />}
    >
      <Text style={styles.title}>Bookings</Text>
      <Text style={styles.subtitle}>A simple system-wide booking list.</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : !bookings.length ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bookings found</Text>
          <Text style={styles.emptyText}>System-wide bookings will appear here once players start reserving arenas.</Text>
        </View>
      ) : (
        bookings.map((item) => (
          <View key={item._id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.arena?.name || 'Arena'}</Text>
            <Text style={styles.cardMeta}>{new Date(item.date).toDateString()}</Text>
            <Text style={styles.cardMeta}>
              {item.startTime} - {item.endTime}
            </Text>
            <Text style={styles.cardMeta}>User: {item.user?.name || 'Unknown'}</Text>
            <Text style={styles.cardMeta}>{item.user?.email || 'No email'}</Text>
            <Text style={styles.cardMeta}>Status: {item.status}</Text>
            <View style={styles.actionRow}>
              {item.status !== 'completed' ? (
                <TouchableOpacity
                  style={[styles.button, styles.completeButton]}
                  onPress={() => updateBookingStatus(item, 'completed')}
                  disabled={updatingId === item._id}
                >
                  <Text style={styles.completeButtonText}>{updatingId === item._id ? 'Saving...' : 'Mark Completed'}</Text>
                </TouchableOpacity>
              ) : null}
              {item.status !== 'cancelled' ? (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => updateBookingStatus(item, 'cancelled')}
                  disabled={updatingId === item._id}
                >
                  <Text style={styles.cancelButtonText}>{updatingId === item._id ? 'Saving...' : 'Cancel'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 6, fontSize: 14, color: '#6B7280' },
  loadingWrap: { paddingVertical: 48, alignItems: 'center' },
  card: { marginTop: 14, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16 },
  emptyCard: { marginTop: 14, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptyText: { marginTop: 6, fontSize: 14, color: '#6B7280', lineHeight: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardMeta: { marginTop: 4, fontSize: 13, color: '#6B7280' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  button: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  completeButton: { backgroundColor: '#DCFCE7' },
  completeButtonText: { color: '#166534', fontSize: 13, fontWeight: '700' },
  cancelButton: { backgroundColor: '#FEE2E2' },
  cancelButtonText: { color: '#B91C1C', fontSize: 13, fontWeight: '700' },
});

export default AdminBookingsScreen;
