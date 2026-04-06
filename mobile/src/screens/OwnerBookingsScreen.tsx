import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';

interface OwnerBooking {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  arena?: { name?: string };
  user?: { name?: string; phone?: string; email?: string };
}

const statusOptions = ['confirmed', 'completed', 'cancelled'];

const OwnerBookingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/owner/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.log('Error loading owner bookings:', error);
      Alert.alert('Could not load reservations', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      setUpdatingId(bookingId);
      const response = await api.put(`/owner/bookings/${bookingId}/status`, { status });
      setBookings((current) => current.map((booking) => (booking._id === bookingId ? response.data.data : booking)));
    } catch (error: any) {
      Alert.alert('Could not update reservation', error.response?.data?.message || 'Please try again.');
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
      <Text style={styles.pageTitle}>Reservations</Text>
      <Text style={styles.pageSubtitle}>Review customer bookings for your arenas.</Text>

      {loading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No reservations found for your arenas yet.</Text>
        </View>
      ) : (
        bookings.map((booking) => (
          <View key={booking._id} style={styles.card}>
            <Text style={styles.cardTitle}>{booking.arena?.name || 'Arena'}</Text>
            <Text style={styles.cardMeta}>
              {new Date(booking.date).toDateString()} | {booking.startTime} - {booking.endTime}
            </Text>
            <Text style={styles.cardMeta}>Player: {booking.user?.name || 'Unknown'}</Text>
            {booking.user?.phone ? <Text style={styles.cardMeta}>Phone: {booking.user.phone}</Text> : null}
            {booking.user?.email ? <Text style={styles.cardMeta}>Email: {booking.user.email}</Text> : null}
            <Text style={styles.priceText}>NPR {booking.totalPrice}</Text>
            <Text style={styles.statusText}>Status: {booking.status}</Text>

            <View style={styles.statusRow}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.statusButton, booking.status === status && styles.statusButtonActive]}
                  onPress={() => updateStatus(booking._id, status)}
                  disabled={updatingId === booking._id}
                >
                  <Text
                    style={[styles.statusButtonText, booking.status === status && styles.statusButtonTextActive]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
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
  pageTitle: { fontSize: 26, fontWeight: '700', color: '#111827' },
  pageSubtitle: { marginTop: 6, fontSize: 14, color: '#4B5563' },
  loadingBlock: { paddingVertical: 48, alignItems: 'center' },
  emptyCard: { marginTop: 18, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16 },
  emptyText: { color: '#6B7280', fontSize: 14 },
  card: { marginTop: 14, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardMeta: { marginTop: 4, fontSize: 13, color: '#4B5563' },
  priceText: { marginTop: 8, fontSize: 14, fontWeight: '700', color: '#111827' },
  statusText: { marginTop: 6, fontSize: 13, fontWeight: '600', color: '#374151' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  statusButtonActive: { backgroundColor: '#111827', borderColor: '#111827' },
  statusButtonText: { color: '#374151', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  statusButtonTextActive: { color: '#FFFFFF' },
});

export default OwnerBookingsScreen;
