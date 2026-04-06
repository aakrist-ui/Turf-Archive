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

interface OwnerArena {
  _id: string;
  name: string;
  price: number;
  contactPhone?: string;
  openingTime?: string;
  closingTime?: string;
  location?: {
    city?: string;
    address?: string;
  };
}

const OwnerArenasScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [arenas, setArenas] = useState<OwnerArena[]>([]);

  const loadArenas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/owner/arenas');
      setArenas(response.data.data || []);
    } catch (error) {
      console.log('Error loading owner arenas:', error);
      Alert.alert('Could not load arenas', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadArenas);
    return unsubscribe;
  }, [navigation, loadArenas]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadArenas} tintColor="#111827" />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Manage Arenas</Text>
          <Text style={styles.pageSubtitle}>Add, edit or remove your listed arenas.</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('OwnerArenaEditor', { arenaId: null })}
        >
          <Text style={styles.addButtonText}>Add Arena</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : arenas.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No owner arenas yet</Text>
          <Text style={styles.emptyText}>Create your first arena to make it available on the customer side.</Text>
        </View>
      ) : (
        arenas.map((arena) => (
          <TouchableOpacity
            key={arena._id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('OwnerArenaEditor', { arenaId: arena._id })}
          >
            <Text style={styles.cardTitle}>{arena.name}</Text>
            <Text style={styles.cardMeta}>{arena.location?.city || 'Kathmandu Valley'}</Text>
            <Text style={styles.cardMeta}>{arena.location?.address || 'Address not set'}</Text>
            <Text style={styles.cardMeta}>NPR {arena.price} per hour</Text>
            <Text style={styles.cardMeta}>
              {arena.openingTime || '06:00'} - {arena.closingTime || '23:00'}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 20, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  pageTitle: { fontSize: 26, fontWeight: '700', color: '#111827' },
  pageSubtitle: { marginTop: 6, fontSize: 14, color: '#4B5563' },
  addButton: { backgroundColor: '#111827', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  loadingBlock: { paddingVertical: 48, alignItems: 'center' },
  emptyCard: { marginTop: 20, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  emptyText: { marginTop: 6, fontSize: 14, color: '#6B7280' },
  card: { marginTop: 14, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  cardMeta: { marginTop: 5, fontSize: 13, color: '#4B5563' },
});

export default OwnerArenasScreen;
