import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  role?: string;
  position?: string;
}

const positions = ['Any', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { logout, updateUser, user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      setProfile(response.data.data);
    } catch (error: any) {
      console.log('Error loading profile:', error.response?.data || error.message);
      Alert.alert('Unable to load profile', 'We could not load your profile right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/users/me', {
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        position: profile.position,
      });
      const updated = response.data.data;
      setProfile(updated);
      await updateUser({
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      });
      Alert.alert('Profile updated', 'Your profile has been saved successfully.');
    } catch (error: any) {
      Alert.alert('Could not save profile', error.response?.data?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {user?.role === 'user' ? <NotificationBell navigation={navigation} dark /> : null}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProfile} tintColor="#F97316" />}
        showsVerticalScrollIndicator={false}
      >
        {loading || !profile ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.heroCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile.name?.slice(0, 1).toUpperCase() || 'P'}</Text>
              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <Text style={styles.profileRole}>
                {profile.role === 'owner' ? 'Futsal Owner' : profile.role === 'admin' ? 'Admin' : 'Player'}
              </Text>
            </View>

            {user?.role === 'user' ? (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Personal Details</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.name}
                    onChangeText={(value) => setProfile((current) => (current ? { ...current, name: value } : current))}
                  />
                  <TextInput
                    style={styles.input}
                    value={profile.phone || ''}
                    placeholder="Phone number"
                    placeholderTextColor="#8A949C"
                    onChangeText={(value) => setProfile((current) => (current ? { ...current, phone: value } : current))}
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profile.bio || ''}
                    placeholder="Short bio"
                    placeholderTextColor="#8A949C"
                    multiline
                    onChangeText={(value) => setProfile((current) => (current ? { ...current, bio: value } : current))}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Position</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
                    {positions.map((position) => (
                      <TouchableOpacity
                        key={position}
                        style={[styles.choiceChip, profile.position === position && styles.choiceChipActive]}
                        onPress={() => setProfile((current) => (current ? { ...current, position } : current))}
                      >
                        <Text style={[styles.choiceText, profile.position === position && styles.choiceTextActive]}>{position}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
                  <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('TeamHub')}>
                  <Text style={styles.secondaryButtonText}>Open Team Management</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {user?.role !== 'user' ? (
              <View style={styles.ownerInfoCard}>
                <Text style={styles.ownerInfoLabel}>Name</Text>
                <Text style={styles.ownerInfoValue}>{profile.name}</Text>
                <Text style={[styles.ownerInfoLabel, styles.ownerInfoLabelSpacing]}>Email</Text>
                <Text style={styles.ownerInfoValue}>{profile.email}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F1E8' },
  header: {
    backgroundColor: '#12212B',
    paddingTop: 58,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  content: { flex: 1 },
  loadingContainer: { paddingVertical: 80, alignItems: 'center' },
  body: { padding: 20 },
  heroCard: { backgroundColor: '#12212B', borderRadius: 24, padding: 20, alignItems: 'center' },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 36, fontWeight: '800' },
  profileName: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 14 },
  profileEmail: { color: '#D6DEE5', fontSize: 14, marginTop: 6 },
  profileRole: { color: '#D6DEE5', fontSize: 12, marginTop: 6, textTransform: 'capitalize' },
  ownerInfoCard: { marginTop: 24, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18 },
  ownerInfoLabel: { color: '#6B7280', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  ownerInfoLabelSpacing: { marginTop: 16 },
  ownerInfoValue: { marginTop: 6, color: '#12212B', fontSize: 16, fontWeight: '700' },
  section: { marginTop: 24 },
  sectionTitle: { color: '#12212B', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#12212B',
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  choiceRow: { paddingBottom: 10 },
  choiceChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  choiceChipActive: { backgroundColor: '#12212B', borderColor: '#12212B' },
  choiceText: { color: '#42515C', fontSize: 13, fontWeight: '700' },
  choiceTextActive: { color: '#FFFFFF' },
  primaryButton: { marginTop: 24, backgroundColor: '#F97316', borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryButton: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6DCC8', paddingVertical: 15, alignItems: 'center' },
  secondaryButtonText: { color: '#12212B', fontSize: 15, fontWeight: '800' },
  logoutButton: { marginTop: 12, backgroundColor: '#7F1D1D', borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  logoutButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  bottomSpacer: { height: 90 },
});

export default ProfileScreen;
