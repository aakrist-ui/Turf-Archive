import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

interface Slot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface Arena {
  _id: string;
  name: string;
  price: number;
  priceUnit: string;
  openingTime: string;
  closingTime: string;
  location: {
    address: string;
    city: string;
  };
}

const getDateOption = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return {
    label: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : date.toLocaleDateString([], { weekday: 'short' }),
    value: date.toISOString().split('T')[0],
    subtitle: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
  };
};

const CreateBookingScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { arenaId } = route.params;
  const { refreshBookings } = useNotifications();
  const [arena, setArena] = useState<Arena | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(getDateOption(0).value);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const dateOptions = useMemo(() => [0, 1, 2].map(getDateOption), []);

  const loadArenaAndSlots = useCallback(async () => {
    try {
      setLoading(true);
      const [arenaResponse, slotsResponse] = await Promise.all([
        api.get(`/arenas/${arenaId}`),
        api.get(`/arenas/${arenaId}/slots/${selectedDate}`),
      ]);

      setArena(arenaResponse.data.data);
      const availableSlots = (slotsResponse.data.data || []).filter((slot: Slot) => !slot.isBooked);
      setSlots(availableSlots);

      if (!availableSlots.some((slot: Slot) => slot.startTime === selectedSlot?.startTime && slot.endTime === selectedSlot?.endTime)) {
        setSelectedSlot(availableSlots[0] || null);
      }
    } catch (error: any) {
      console.log('Error loading booking details:', error.response?.data || error.message);
      Alert.alert('Unable to load', 'We could not load this arena booking schedule right now.');
    } finally {
      setLoading(false);
    }
  }, [arenaId, selectedDate, selectedSlot]);

  useEffect(() => {
    loadArenaAndSlots();
  }, [loadArenaAndSlots]);

  const totalPrice = useMemo(() => (arena && selectedSlot ? arena.price : 0), [arena, selectedSlot]);

  const handleBooking = async () => {
    if (!arena || !selectedSlot) {
      Alert.alert('Select a slot', 'Choose an available time slot before continuing.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/bookings', {
        arena: arena._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: notes.trim() || undefined,
        paymentMethod: 'cash',
      });

      await refreshBookings();
      Alert.alert('Booking confirmed', `${arena.name} is booked for ${selectedSlot.startTime} to ${selectedSlot.endTime}.`, [
        {
          text: 'View bookings',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }),
        },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Could not complete the booking.';
      Alert.alert('Booking failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Arena</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadArenaAndSlots} tintColor="#F97316" />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.loadingText}>Loading available slots...</Text>
          </View>
        ) : arena ? (
          <View style={styles.body}>
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>{arena.name}</Text>
              <Text style={styles.heroMeta}>{arena.location.address}</Text>
              <Text style={styles.heroPrice}>NPR {arena.price}/{arena.priceUnit}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Date</Text>
              <View style={styles.optionRow}>
                {dateOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.choiceChip, selectedDate === option.value && styles.choiceChipActive]}
                    onPress={() => setSelectedDate(option.value)}
                  >
                    <Text style={[styles.choiceLabel, selectedDate === option.value && styles.choiceLabelActive]}>{option.label}</Text>
                    <Text style={[styles.choiceSubLabel, selectedDate === option.value && styles.choiceLabelActive]}>{option.subtitle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Slots</Text>
              {slots.length ? (
                <View style={styles.slotGrid}>
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime;
                    return (
                      <TouchableOpacity
                        key={`${slot.startTime}-${slot.endTime}`}
                        style={[styles.slotCard, isSelected && styles.slotCardActive]}
                        onPress={() => setSelectedSlot(slot)}
                      >
                        <Text style={[styles.slotTime, isSelected && styles.slotTimeActive]}>{slot.startTime}</Text>
                        <Text style={[styles.slotMeta, isSelected && styles.slotMetaActive]}>{slot.endTime}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.helperText}>No free one-hour slots are listed for this date yet.</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add teammate notes, team name, or arrival details"
                placeholderTextColor="#8A949C"
                multiline
              />
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{selectedDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : 'Select a slot'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>NPR {totalPrice}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]} onPress={handleBooking} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Confirming...' : 'Confirm Booking'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  header: {
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#12212B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#243744',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 52,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    color: '#5A6572',
    fontSize: 15,
  },
  body: {
    padding: 20,
  },
  heroCard: {
    backgroundColor: '#12212B',
    borderRadius: 24,
    padding: 18,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  heroMeta: {
    marginTop: 8,
    color: '#D6DEE5',
    fontSize: 14,
    lineHeight: 20,
  },
  heroPrice: {
    marginTop: 12,
    color: '#F3C574',
    fontSize: 20,
    fontWeight: '800',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#12212B',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    paddingVertical: 14,
    alignItems: 'center',
  },
  choiceChipActive: {
    backgroundColor: '#12212B',
  },
  choiceLabel: {
    color: '#12212B',
    fontSize: 14,
    fontWeight: '800',
  },
  choiceSubLabel: {
    marginTop: 4,
    color: '#69747D',
    fontSize: 12,
  },
  choiceLabelActive: {
    color: '#FFFFFF',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    paddingVertical: 16,
    alignItems: 'center',
  },
  slotCardActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  slotTime: {
    color: '#12212B',
    fontSize: 15,
    fontWeight: '800',
  },
  slotTimeActive: {
    color: '#FFFFFF',
  },
  slotMeta: {
    marginTop: 4,
    color: '#69747D',
    fontSize: 12,
  },
  slotMetaActive: {
    color: '#FFF3E6',
  },
  helperText: {
    color: '#69747D',
    fontSize: 14,
    lineHeight: 20,
  },
  notesInput: {
    minHeight: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#12212B',
    fontSize: 15,
    textAlignVertical: 'top',
  },
  summaryCard: {
    marginTop: 24,
    backgroundColor: '#FFF8EC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1DFC0',
    padding: 18,
  },
  summaryTitle: {
    color: '#12212B',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  summaryLabel: {
    color: '#69747D',
    fontSize: 14,
  },
  summaryValue: {
    color: '#12212B',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6DCC8',
  },
  primaryButton: {
    backgroundColor: '#F97316',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  bottomSpacer: {
    height: 110,
  },
});

export default CreateBookingScreen;
