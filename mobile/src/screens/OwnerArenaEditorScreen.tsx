import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';

const defaultForm = {
  name: '',
  description: '',
  address: '',
  city: 'Kathmandu',
  neighborhood: '',
  price: '',
  contactPhone: '',
  openingTime: '06:00',
  closingTime: '23:00',
  capacity: '10',
  facilities: '',
  images: '',
  isActive: true,
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const OwnerArenaEditorScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const arenaId = route.params?.arenaId as string | null;
  const isEditing = Boolean(arenaId);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [slotSaving, setSlotSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [slotDate, setSlotDate] = useState(formatLocalDate(new Date()));
  const [slotText, setSlotText] = useState('06:00-07:00\n07:00-08:00\n08:00-09:00');

  const screenTitle = useMemo(() => (isEditing ? 'Edit Arena' : 'Add Arena'), [isEditing]);

  const handleBackToOwnerSection = () => {
    navigation.navigate('MainTabs', { screen: 'OwnerHome' });
  };

  const loadArena = useCallback(async () => {
    if (!arenaId) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/owner/arenas');
      const arena = (response.data.data || []).find((item: any) => item._id === arenaId);

      if (!arena) {
        Alert.alert('Arena not found', 'This arena is not available anymore.');
        handleBackToOwnerSection();
        return;
      }

      setForm({
        name: arena.name || '',
        description: arena.description || '',
        address: arena.location?.address || '',
        city: arena.location?.city || 'Kathmandu',
        neighborhood: arena.location?.neighborhood || '',
        price: arena.price ? String(arena.price) : '',
        contactPhone: arena.contactPhone || '',
        openingTime: arena.openingTime || '06:00',
        closingTime: arena.closingTime || '23:00',
        capacity: arena.capacity ? String(arena.capacity) : '10',
        facilities: Array.isArray(arena.facilities) ? arena.facilities.join(', ') : '',
        images: Array.isArray(arena.images) ? arena.images.join('\n') : '',
        isActive: arena.isActive !== false,
      });
    } catch (error) {
      console.log('Error loading owner arena:', error);
      Alert.alert('Could not load arena', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [arenaId, navigation]);

  useEffect(() => {
    loadArena();
  }, [loadArena]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.price.trim()) {
      Alert.alert('Missing fields', 'Name, address, city and price are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        contactPhone: form.contactPhone.trim(),
        openingTime: form.openingTime.trim(),
        closingTime: form.closingTime.trim(),
        capacity: Number(form.capacity),
        facilities: form.facilities,
        images: form.images,
        isActive: form.isActive,
        location: {
          address: form.address.trim(),
          city: form.city.trim(),
          neighborhood: form.neighborhood.trim(),
        },
      };

      if (isEditing) {
        await api.put(`/owner/arenas/${arenaId}`, payload);
      } else {
        await api.post('/owner/arenas', payload);
      }

      Alert.alert('Saved', 'Arena details have been updated.', [
        {
          text: 'OK',
          onPress: handleBackToOwnerSection,
        },
      ]);
    } catch (error: any) {
      Alert.alert('Could not save arena', error.response?.data?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!arenaId) {
      return;
    }

    Alert.alert('Delete arena', 'This will remove the arena from the customer side as well.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setSaving(true);
            await api.delete(`/owner/arenas/${arenaId}`);
            Alert.alert('Deleted', 'Arena removed successfully.', [
              { text: 'OK', onPress: handleBackToOwnerSection },
            ]);
          } catch (error: any) {
            Alert.alert('Could not delete arena', error.response?.data?.message || 'Please try again.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const handleSaveSlots = async () => {
    if (!arenaId) {
      Alert.alert('Save the arena first', 'Create the arena before managing time slots.');
      return;
    }

    const slots = slotText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [startTime, endTime] = item.split('-').map((value) => value.trim());
        return { startTime, endTime };
      })
      .filter((slot) => slot.startTime && slot.endTime);

    try {
      setSlotSaving(true);
      await api.put(`/owner/arenas/${arenaId}/slots`, {
        date: slotDate,
        slots,
      });
      Alert.alert('Slots updated', 'The customer booking screen will use these time slots for that date.');
    } catch (error: any) {
      Alert.alert('Could not update slots', error.response?.data?.message || 'Please try again.');
    } finally {
      setSlotSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToOwnerSection}>
          <Text style={styles.backButtonText}>Back to Home Page</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.pageTitle}>{screenTitle}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Arena Details</Text>
        <FormInput label="Arena Name" value={form.name} onChangeText={(value) => handleChange('name', value)} />
        <FormInput label="Address" value={form.address} onChangeText={(value) => handleChange('address', value)} />
        <FormInput label="City" value={form.city} onChangeText={(value) => handleChange('city', value)} />
        <FormInput label="Neighborhood" value={form.neighborhood} onChangeText={(value) => handleChange('neighborhood', value)} />
        <FormInput label="Price per hour (NPR)" value={form.price} keyboardType="numeric" onChangeText={(value) => handleChange('price', value)} />
        <FormInput label="Contact phone" value={form.contactPhone} onChangeText={(value) => handleChange('contactPhone', value)} />
        <FormInput label="Opening time" value={form.openingTime} onChangeText={(value) => handleChange('openingTime', value)} />
        <FormInput label="Closing time" value={form.closingTime} onChangeText={(value) => handleChange('closingTime', value)} />
        <FormInput label="Capacity" value={form.capacity} keyboardType="numeric" onChangeText={(value) => handleChange('capacity', value)} />
        <FormInput label="Facilities" value={form.facilities} onChangeText={(value) => handleChange('facilities', value)} placeholder="Parking, Lights, Changing Room" />
        <FormInput label="Image URLs" value={form.images} onChangeText={(value) => handleChange('images', value)} multiline placeholder="One image URL per line" />
        <FormInput label="Description" value={form.description} onChangeText={(value) => handleChange('description', value)} multiline />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Arena active on customer side</Text>
          <Switch value={form.isActive} onValueChange={(value) => handleChange('isActive', value)} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Time Slots</Text>
        <FormInput label="Date" value={slotDate} onChangeText={setSlotDate} placeholder="YYYY-MM-DD" />
        <FormInput
          label="Slots"
          value={slotText}
          onChangeText={setSlotText}
          multiline
          placeholder="06:00-07:00&#10;07:00-08:00"
        />
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSaveSlots} disabled={slotSaving}>
          <Text style={styles.secondaryButtonText}>{slotSaving ? 'Saving slots...' : 'Save Slots for Date'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : isEditing ? 'Update Arena' : 'Create Arena'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton} onPress={handleBackToOwnerSection}>
        <Text style={styles.homeButtonText}>Go to Owner Home</Text>
      </TouchableOpacity>

      {isEditing ? (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={saving}>
          <Text style={styles.deleteButtonText}>Delete Arena</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

const FormInput = ({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: any;
  placeholder?: string;
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 20, paddingTop: 28, paddingBottom: 120 },
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  headerRow: { marginBottom: 10 },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  backButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  pageTitle: { fontSize: 26, fontWeight: '700', color: '#111827' },
  section: { marginTop: 18, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#111827',
  },
  inputMultiline: { minHeight: 88 },
  switchRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { flex: 1, marginRight: 12, color: '#111827', fontSize: 14, fontWeight: '500' },
  primaryButton: { marginTop: 18, backgroundColor: '#111827', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  homeButton: { marginTop: 12, backgroundColor: '#DBEAFE', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  homeButtonText: { color: '#1D4ED8', fontSize: 14, fontWeight: '700' },
  secondaryButton: { marginTop: 6, backgroundColor: '#E5E7EB', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { color: '#111827', fontSize: 14, fontWeight: '600' },
  deleteButton: { marginTop: 12, backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  deleteButtonText: { color: '#B91C1C', fontSize: 15, fontWeight: '600' },
});

export default OwnerArenaEditorScreen;
