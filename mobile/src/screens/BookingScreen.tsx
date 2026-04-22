import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationBell from '../components/NotificationBell';
import { BookingRecord, useNotifications } from '../context/NotificationContext';
import api from '../services/api';

const formatBookingDate = (date: string) =>
  new Date(date).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const isUpcomingBooking = (booking: BookingRecord) => {
  const bookingDate = new Date(booking.date);
  return booking.status !== 'cancelled' && bookingDate.getTime() >= new Date().setHours(0, 0, 0, 0);
};

const BookingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { bookings, refreshBookings, loading, upsertBooking, pushNotification } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'history'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredBookings = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return activeFilter === 'upcoming' ? sorted.filter(isUpcomingBooking) : sorted.filter((booking) => !isUpcomingBooking(booking));
  }, [activeFilter, bookings]);

  const cancelBooking = async (bookingId: string) => {
    try {
      setCancellingId(bookingId);
      const response = await api.put(`/bookings/${bookingId}/cancel`, {
        cancellationReason: 'Cancelled from mobile app',
      });
      const cancelledBooking = response.data.data;

      upsertBooking(cancelledBooking);
      pushNotification({
        id: `${cancelledBooking._id}-cancelled`,
        title: 'Booking cancelled',
        message: `${cancelledBooking.arena?.name || 'Arena'} on ${cancelledBooking.startTime} is marked as cancelled.`,
        type: 'update',
        bookingId: cancelledBooking._id,
        arenaId: cancelledBooking.arena?._id,
        eventTime: new Date().toISOString(),
      });
      await refreshBookings();
    } catch (error: any) {
      Alert.alert('Unable to cancel', error.response?.data?.message || 'Something went wrong while cancelling the booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const promptCancel = (bookingId: string) => {
    Alert.alert('Cancel booking', 'Do you want to cancel this booking?', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: () => cancelBooking(bookingId) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bookings</Text>
          <Text style={styles.headerSubtitle}>Manage your upcoming games and past reservations.</Text>
        </View>
        <NotificationBell navigation={navigation} dark />
      </View>

      <View style={styles.filterRow}>
        {[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'history', label: 'History' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterChip, activeFilter === item.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(item.key as 'upcoming' | 'history')}
          >
            <Text style={[styles.filterText, activeFilter === item.key && styles.filterTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshBookings} tintColor="#F97316" />}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length ? (
          filteredBookings.map((booking) => (
            <View key={booking._id} style={styles.card}>
              <Image
                source={{ uri: booking.arena?.images?.[0] || 'https://placehold.co/600x400/111827/E5E7EB?text=Arena' }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardBody}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{booking.arena?.name || 'Arena booking'}</Text>
                  <Text style={[styles.statusBadge, booking.status === 'cancelled' ? styles.statusCancelled : styles.statusConfirmed]}>
                    {booking.status}
                  </Text>
                </View>
                <Text style={styles.cardMeta}>{formatBookingDate(booking.date)}</Text>
                <Text style={styles.cardMeta}>{booking.startTime} - {booking.endTime}</Text>
                <Text style={styles.cardMeta}>Payment: {booking.paymentMethod} | {booking.paymentStatus}</Text>
                <Text style={styles.cardPrice}>NPR {booking.totalPrice}</Text>

                {activeFilter === 'upcoming' && booking.status !== 'cancelled' ? (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => promptCancel(booking._id)}
                    disabled={cancellingId === booking._id}
                  >
                    <Text style={styles.cancelButtonText}>
                      {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{activeFilter === 'upcoming' ? 'No upcoming bookings' : 'No booking history yet'}</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'upcoming'
                ? 'Reserve a slot from an arena page and it will appear here right away.'
                : 'Finished or cancelled bookings will be grouped here.'}
            </Text>
            {activeFilter === 'upcoming' ? (
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Arenas')}>
                <Text style={styles.primaryButtonText}>Browse Arenas</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  header: {
    paddingTop: 58,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: '#12212B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  headerSubtitle: {
    marginTop: 6,
    color: '#C2CBD2',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 250,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 14,
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6DCC8',
  },
  filterChipActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  filterText: {
    color: '#42515C',
    fontSize: 13,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginTop: 12,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6DCC8',
    marginBottom: 14,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardBody: {
    padding: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    color: '#12212B',
    fontSize: 20,
    fontWeight: '800',
  },
  statusBadge: {
    overflow: 'hidden',
    textTransform: 'capitalize',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusConfirmed: {
    color: '#14532D',
    backgroundColor: '#DCFCE7',
  },
  statusCancelled: {
    color: '#991B1B',
    backgroundColor: '#FEE2E2',
  },
  cardMeta: {
    marginTop: 7,
    color: '#5F6B74',
    fontSize: 14,
  },
  cardPrice: {
    marginTop: 12,
    color: '#B45309',
    fontSize: 18,
    fontWeight: '800',
  },
  cancelButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1F2',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  cancelButtonText: {
    color: '#BE123C',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    padding: 24,
    marginTop: 8,
  },
  emptyTitle: {
    color: '#12212B',
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 10,
    color: '#5F6B74',
    fontSize: 14,
    lineHeight: 21,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#F97316',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  bottomSpacer: {
    height: 90,
  },
});

export default BookingsScreen;
