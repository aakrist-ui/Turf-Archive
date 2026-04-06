import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';

interface SummaryData {
  arenaCount: number;
  bookingCount: number;
  upcomingBookings: Array<{
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    arena?: { name?: string };
    user?: { name?: string; phone?: string };
  }>;
}

const OwnerDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData>({
    arenaCount: 0,
    bookingCount: 0,
    upcomingBookings: [],
  });

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/owner/summary');
      setSummary(response.data.data);
    } catch (error) {
      console.log('Error loading owner summary:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSummary} tintColor="#111827" />}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.pageTitle}>Owner Dashboard</Text>
      <Text style={styles.pageSubtitle}>Manage your arenas and reservations.</Text>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.arenaCount}</Text>
          <Text style={styles.statLabel}>Arenas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.bookingCount}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('OwnerArenas')}>
          <Text style={styles.actionText}>Manage Arenas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('OwnerBookings')}>
          <Text style={styles.actionText}>View Reservations</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Upcoming Reservations</Text>

      {loading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : summary.upcomingBookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No upcoming reservations yet.</Text>
        </View>
      ) : (
        summary.upcomingBookings.map((booking) => (
          <View key={booking._id} style={styles.bookingCard}>
            <Text style={styles.bookingArena}>{booking.arena?.name || 'Arena'}</Text>
            <Text style={styles.bookingMeta}>
              {new Date(booking.date).toDateString()} | {booking.startTime} - {booking.endTime}
            </Text>
            <Text style={styles.bookingMeta}>Player: {booking.user?.name || 'Unknown player'}</Text>
            {booking.user?.phone ? <Text style={styles.bookingMeta}>Phone: {booking.user.phone}</Text> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 20, paddingBottom: 100 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: '#111827' },
  pageSubtitle: { marginTop: 6, fontSize: 14, color: '#4B5563' },
  statRow: { flexDirection: 'row', marginTop: 20, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18 },
  statValue: { fontSize: 28, fontWeight: '700', color: '#111827' },
  statLabel: { marginTop: 6, fontSize: 13, color: '#6B7280' },
  actionRow: { marginTop: 16, gap: 10 },
  actionButton: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  actionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  sectionTitle: { marginTop: 28, fontSize: 18, fontWeight: '700', color: '#111827' },
  loadingBlock: { paddingVertical: 40, alignItems: 'center' },
  emptyCard: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16 },
  emptyText: { color: '#6B7280', fontSize: 14 },
  bookingCard: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16 },
  bookingArena: { fontSize: 16, fontWeight: '700', color: '#111827' },
  bookingMeta: { marginTop: 4, fontSize: 13, color: '#4B5563' },
});

export default OwnerDashboardScreen;
