import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export interface BookingRecord {
  _id: string;
  arena: {
    _id?: string;
    name: string;
    location?: {
      address?: string;
      city?: string;
    };
    images?: string[];
    price?: number;
  };
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'online' | 'card';
  notes?: string;
  cancellationReason?: string | null;
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'booking' | 'payment' | 'update';
  bookingId?: string;
  arenaId?: string;
  eventTime: string;
}

interface NotificationContextType {
  bookings: BookingRecord[];
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refreshBookings: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  bookings: [],
  notifications: [],
  unreadCount: 0,
  loading: false,
  refreshBookings: async () => {},
});

const parseBookingDateTime = (date: string, time: string) => {
  const bookingDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  bookingDate.setHours(hours, minutes, 0, 0);
  return bookingDate;
};

const buildNotifications = (bookings: BookingRecord[]): AppNotification[] => {
  const now = new Date();

  return bookings
    .flatMap((booking) => {
      const bookingStart = parseBookingDateTime(booking.date, booking.startTime);
      const hoursUntil = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      const arenaName = booking.arena?.name || 'Arena';
      const baseNotification = {
        bookingId: booking._id,
        arenaId: booking.arena?._id,
        eventTime: bookingStart.toISOString(),
      };

      if (booking.status === 'cancelled') {
        return [
          {
            ...baseNotification,
            id: `${booking._id}-cancelled`,
            title: 'Booking cancelled',
            message: `${arenaName} on ${booking.startTime} is marked as cancelled.`,
            type: 'update' as const,
          },
        ];
      }

      const items: AppNotification[] = [];

      if (booking.status === 'confirmed' && hoursUntil >= 0 && hoursUntil <= 24) {
        items.push({
          ...baseNotification,
          id: `${booking._id}-reminder`,
          title: 'Upcoming booking',
          message: `${arenaName} starts at ${booking.startTime}. Keep your squad ready.`,
          type: 'reminder',
        });
      }

      if (booking.paymentStatus === 'pending' && booking.status !== 'cancelled') {
        items.push({
          ...baseNotification,
          id: `${booking._id}-payment`,
          title: 'Payment pending',
          message: `${arenaName} is booked. Payment method: ${booking.paymentMethod}.`,
          type: 'payment',
        });
      }

      if (!items.length && booking.status === 'confirmed' && bookingStart.getTime() >= now.getTime()) {
        items.push({
          ...baseNotification,
          id: `${booking._id}-confirmed`,
          title: 'Booking confirmed',
          message: `${arenaName} is confirmed for ${booking.startTime} to ${booking.endTime}.`,
          type: 'booking',
        });
      }

      return items;
    })
    .sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime());
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userToken } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshBookings = useCallback(async () => {
    if (!userToken) {
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data.data || []);
    } catch (error: any) {
      console.log('Error fetching bookings for notifications:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const notifications = useMemo(() => buildNotifications(bookings), [bookings]);

  return (
    <NotificationContext.Provider
      value={{
        bookings,
        notifications,
        unreadCount: notifications.length,
        loading,
        refreshBookings,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
