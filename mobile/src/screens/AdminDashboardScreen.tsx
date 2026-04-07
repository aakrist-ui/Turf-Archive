import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';

interface Summary {
  users: number;
  owners: number;
  arenas: number;
  bookings: number;
}

const AdminDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary>({ users: 0, owners: 0, arenas: 0, bookings: 0 });

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/summary');
      setSummary(response.data.data);
    } catch (error) {
      console.log('Error loading admin summary:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const cards = [
    { label: 'Users', value: summary.users, screen: 'AdminUsers' },
    { label: 'Owners', value: summary.owners, screen: 'AdminUsers' },
    { label: 'Arenas', value: summary.arenas, screen: 'AdminArenas' },
    { label: 'Bookings', value: summary.bookings, screen: 'AdminBookings' },
  ];

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadSummary);
    return unsubscribe;
  }, [navigation, loadSummary]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSummary} tintColor="#111827" />}
    >
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>A simple overview of the system.</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : (
        cards.map((card) => (
          <TouchableOpacity
            key={card.label}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(card.screen)}
          >
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </TouchableOpacity>
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
  card: { marginTop: 14, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18 },
  cardValue: { fontSize: 28, fontWeight: '700', color: '#111827' },
  cardLabel: { marginTop: 6, fontSize: 14, color: '#6B7280' },
});

export default AdminDashboardScreen;
