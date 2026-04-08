import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
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

const AdminBookingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.log('Error loading admin bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

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
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardMeta: { marginTop: 4, fontSize: 13, color: '#6B7280' },
});

export default AdminBookingsScreen;
