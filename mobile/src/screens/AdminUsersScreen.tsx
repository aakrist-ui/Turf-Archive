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

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

const AdminUsersScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.log('Error loading admin users:', error);
      Alert.alert('Could not load users', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleUser = async (item: AdminUser) => {
    try {
      const response = await api.put(`/admin/users/${item._id}/status`, {
        isActive: !item.isActive,
      });
      setUsers((current) => current.map((user) => (user._id === item._id ? response.data.data : user)));
    } catch (error: any) {
      Alert.alert('Could not update user', error.response?.data?.message || 'Please try again.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadUsers} tintColor="#111827" />}
    >
      <Text style={styles.title}>Users</Text>
      <Text style={styles.subtitle}>Activate or deactivate accounts.</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : (
        users.map((item) => (
          <View key={item._id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.email}</Text>
            <Text style={styles.cardMeta}>
              {item.role} | {item.isActive ? 'active' : 'inactive'}
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => toggleUser(item)}>
              <Text style={styles.buttonText}>{item.isActive ? 'Deactivate' : 'Activate'}</Text>
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardMeta: { marginTop: 4, fontSize: 13, color: '#6B7280' },
  button: { marginTop: 12, backgroundColor: '#111827', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});

export default AdminUsersScreen;
