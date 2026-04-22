import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';

interface AdminArena {
  _id: string;
  name: string;
  isActive: boolean;
  location?: { city?: string; address?: string };
  owner?: { name?: string; email?: string };
}

const AdminArenasScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [arenas, setArenas] = useState<AdminArena[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadArenas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/arenas');
      setArenas(response.data.data || []);
    } catch (error) {
      console.log('Error loading admin arenas:', error);
      Alert.alert('Could not load arenas', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArenas();
  }, [loadArenas]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadArenas);
    return unsubscribe;
  }, [loadArenas, navigation]);

  const toggleArenaStatus = async (item: AdminArena) => {
    try {
      setUpdatingId(item._id);
      const response = await api.put(`/admin/arenas/${item._id}/status`, {
        isActive: !item.isActive,
      });
      setArenas((current) => current.map((arena) => (arena._id === item._id ? response.data.data : arena)));
    } catch (error: any) {
      Alert.alert('Could not update arena', error.response?.data?.message || 'Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteArena = async (item: AdminArena) => {
    Alert.alert('Delete arena', `Remove ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/arenas/${item._id}`);
            setArenas((current) => current.filter((arena) => arena._id !== item._id));
          } catch (error: any) {
            Alert.alert('Could not delete arena', error.response?.data?.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadArenas} tintColor="#111827" />}
    >
      <Text style={styles.title}>Arenas</Text>
      <Text style={styles.subtitle}>Control active status and remove bad entries.</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : !arenas.length ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No arenas found</Text>
          <Text style={styles.emptyText}>Arena moderation tools will appear here once listings are available.</Text>
        </View>
      ) : (
        arenas.map((item) => (
          <View key={item._id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.location?.city || 'Kathmandu Valley'}</Text>
            <Text style={styles.cardMeta}>{item.location?.address || 'Address not set'}</Text>
            <Text style={styles.cardMeta}>
              Owner: {item.owner?.name || 'Seeded listing'} {item.owner?.email ? `| ${item.owner.email}` : ''}
            </Text>
            <Text style={styles.cardMeta}>{item.isActive ? 'active' : 'inactive'}</Text>
            <TouchableOpacity style={styles.button} onPress={() => toggleArenaStatus(item)} disabled={updatingId === item._id}>
              <Text style={styles.buttonText}>
                {updatingId === item._id ? 'Saving...' : item.isActive ? 'Deactivate Arena' : 'Activate Arena'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => deleteArena(item)}>
              <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
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
  button: { marginTop: 12, backgroundColor: '#111827', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  deleteButton: { backgroundColor: '#FEE2E2' },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  deleteButtonText: { color: '#B91C1C' },
});

export default AdminArenasScreen;
