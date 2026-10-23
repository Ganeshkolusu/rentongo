import { create } from 'zustand';
import io, { Socket } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL, authHeader } from '../services/api.service';

let notificationSocket: Socket | null = null;

export interface Notification {
  id: string;
  _id?: string;
  type: 'ride_completed' | 'booking_confirmed' | 'booking_declined' | 'general' | 'new_booking' | 'booking_timeout' | 'booking_request' | 'chat_message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  vehicleId?: string;
  vehicleName?: string;
  bookingId?: string;
  requiresFeedback?: boolean;
  feedbackGiven?: boolean; // ✅ Track if feedback already submitted
  userId?: string;
  senderId?: string; // for chat_message notifications: who sent the message
  createdAt?: string;

  // Booking details
  bookingStatus?: 'Pending' | 'Confirmed' | 'Rejected' | 'Expired' | 'Completed';
  customerName?: string;
  fromDate?: string;
  toDate?: string;
  totalPrice?: number;
  expiresAt?: number;
  contactNumber?: string;
  customerId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  socketConnected: boolean;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  updateNotificationStatus: (bookingId: string, status: Notification['bookingStatus']) => void;
  markFeedbackGiven: (bookingId: string) => void; // ✅ Mark feedback as submitted

  // Backend sync
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: (userId: string) => Promise<void>;
  resetUnreadCount: () => void;

  // Booking actions
  confirmBooking: (notificationId: string, bookingId: string) => Promise<void>;
  rejectBooking: (notificationId: string, bookingId: string) => Promise<void>;

  // Socket
  initializeSocket: (userId: string) => void;
  disconnectSocket: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  socketConnected: false,

  // ✅ Add notification locally
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: notification._id || `${Date.now()}-${Math.random().toString(36)}`,
      timestamp: new Date(),
      read: false,
    };

    const exists = get().notifications.some(
      n => n.id === newNotification.id || n._id === notification._id
    );

    if (!exists) {
      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));

      console.log('🔔 New notification added. Unread count:', get().unreadCount);
      // No save here: the backend already persists each notification when it creates it.
    }
  },

  // ✅ Update notification status
  updateNotificationStatus: (bookingId: string, status: Notification['bookingStatus']) => {
    console.log('🔔 Updating notification status for booking:', bookingId, 'to:', status);
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.bookingId === bookingId
          ? { ...notif, bookingStatus: status }
          : notif
      ),
    }));
  },

  // ✅ Mark feedback as given
  markFeedbackGiven: (bookingId: string) => {
    console.log('✅ [FRONTEND] Marking feedback as given for booking:', bookingId);

    // ✅ PRODUCTION: Save to localStorage for persistence
    const feedbackGivenKey = 'feedbackGiven';
    const feedbackGiven = JSON.parse(localStorage.getItem(feedbackGivenKey) || '[]');
    if (!feedbackGiven.includes(bookingId)) {
      feedbackGiven.push(bookingId);
      localStorage.setItem(feedbackGivenKey, JSON.stringify(feedbackGiven));
      console.log('✅ [STORAGE] Saved to localStorage:', feedbackGiven);
    }

    // ✅ PRODUCTION: Update state immediately
    set((state) => ({
      notifications: state.notifications.map((notif) => {
        // Match by bookingId, id, or _id
        const isMatch = notif.bookingId === bookingId || notif.id === bookingId || notif._id === bookingId;
        if (isMatch) {
          console.log('✅ [STATE] Updated notification:', notif.id, notif.title);
          return { ...notif, feedbackGiven: true, requiresFeedback: false };
        }
        return notif;
      }),
    }));

    // Optional: Sync with backend (non-blocking)
    fetch(`${API_BASE_URL}/markFeedbackGiven/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    }).catch(err => console.log('⚠️ [API] Backend sync failed (non-critical):', err.message));
  },

  // Set notifications
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount });
    console.log('🔔 Notifications set. Unread count:', unreadCount);
  },

  // Reset unread count
  resetUnreadCount: () => {
    console.log('🔔 Resetting unread count to 0');
    set({ unreadCount: 0 });
  },

  // ✅ Fetch notifications from backend
  fetchNotifications: async (userId: string) => {
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      console.log('🔔 Fetching notifications for user:', userId);
      const response = await fetch(`${API_BASE_URL}/notifications/${userId}`, {
        headers: { ...authHeader() },
      });

      if (response.status === 404) {
        console.log('🔔 Notifications API not available, using local only');
        set({ isLoading: false, error: null });
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      console.log('🔔 Raw API Response:', data);

      // Handle different response structures
      let notificationsArray: any[] = [];
      if (Array.isArray(data)) {
        notificationsArray = data;
      } else if (data.notifications) {
        notificationsArray = data.notifications;
      } else if (data.data) {
        notificationsArray = data.data;
      }

      // ✅ Transform backend notifications with ALL field variations
      const transformedNotifications: Notification[] = notificationsArray.map((notif: any) => {
        const bookingId = notif.bookingId || notif.booking_id || notif._id || notif.id;

        // ✅ PRODUCTION: Load feedback status from localStorage
        const feedbackGivenKey = 'feedbackGiven';
        const feedbackGiven = JSON.parse(localStorage.getItem(feedbackGivenKey) || '[]');
        const hasFeedback = feedbackGiven.includes(bookingId) ||
          feedbackGiven.includes(notif.id) ||
          feedbackGiven.includes(notif._id);

        return {
          id: notif._id || notif.id || Date.now().toString(),
          _id: notif._id,
          type: notif.type || 'general',
          title: notif.title || 'Notification',
          message: notif.message || notif.messages || notif.body || '',
          timestamp: new Date(notif.createdAt || notif.timestamp || Date.now()),
          read: notif.seen ?? notif.read ?? notif.isRead ?? false,

          // ✅ UNIVERSAL VEHICLE NAME HANDLING
          vehicleId: notif.vehicleId || notif.VechileId || notif.VehicleId || notif.vehicle_id,
          vehicleName:
            notif.vehicleName ||
            notif.VehicleName ||
            notif.vehicle_name ||
            notif.carName ||
            notif.CarName ||
            notif.bikeName ||
            notif.BikeName ||
            notif.name ||
            notif.model ||
            notif.Model,

          bookingId: bookingId,
          requiresFeedback: notif.requiresFeedback,
          feedbackGiven: hasFeedback || notif.feedbackGiven || false, // ✅ Use localStorage data
          userId: notif.userId,
          senderId: notif.ownerId,
          createdAt: notif.createdAt,

          // Booking details
          bookingStatus: notif.bookingStatus || notif.status,
          customerName: notif.customerName || notif.customer_name,
          contactNumber: notif.contactNumber || notif.contact_number || notif.phone,
          fromDate: notif.fromDate || notif.from_date || notif.startDate,
          toDate: notif.toDate || notif.to_date || notif.endDate,
          totalPrice: notif.totalPrice || notif.total_price || notif.price,
          expiresAt: notif.expiresAt || notif.expires_at,
          customerId: notif.customerId || notif.customer_id,
        };
      });

      // Merge with local notifications
      const existingNotifications = get().notifications;
      const backendIds = new Set(transformedNotifications.map(n => n._id || n.id));
      const localOnlyNotifications = existingNotifications.filter(
        n => !backendIds.has(n._id || n.id) && !backendIds.has(n.id)
      );

      const allNotifications = [...transformedNotifications, ...localOnlyNotifications];

      // Sort by timestamp (newest first)
      allNotifications.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const unreadCount = allNotifications.filter(n => !n.read).length;

      set({
        notifications: allNotifications,
        unreadCount,
        isLoading: false,
      });

      console.log('🔔 Loaded', allNotifications.length, 'notifications,', unreadCount, 'unread');
    } catch (error: any) {
      console.log('🔔 Notifications API error:', error.message);
      set({ isLoading: false, error: null });
    }
  },

  // ✅ Mark as read
  markAsRead: async (id: string) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id || n._id === id);
      if (notification && !notification.read) {
        const newUnreadCount = Math.max(0, state.unreadCount - 1);
        console.log('🔔 Marking notification as read. New unread count:', newUnreadCount);
        return {
          notifications: state.notifications.map((notif) =>
            notif.id === id || notif._id === id ? { ...notif, read: true } : notif
          ),
          unreadCount: newUnreadCount,
        };
      }
      return state;
    });

    try {
      await fetch(`${API_BASE_URL}/markNotificationRead/${id}`, { method: 'PUT', headers: { ...authHeader() } });
      console.log('🔔 Marked notification as read:', id);
    } catch (error) {
      console.error('🔔 Error marking notification as read:', error);
    }
  },

  // ✅ Mark all as read
  markAllAsRead: async (userId: string) => {
    set((state) => {
      console.log('🔔 Marking all as read. Previous unread:', state.unreadCount);
      return {
        notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
        unreadCount: 0,
      };
    });

    try {
      await fetch(`${API_BASE_URL}/markAllNotificationsRead/${userId}`, { method: 'PUT', headers: { ...authHeader() } });
      console.log('🔔 Marked all notifications as read');
    } catch (error) {
      console.error('🔔 Error marking all as read:', error);
    }
  },

  // ✅ Delete notification
  deleteNotification: async (id: string) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id || n._id === id);
      const newUnreadCount =
        notification && !notification.read ? state.unreadCount - 1 : state.unreadCount;
      console.log('🔔 Deleting notification. New unread count:', newUnreadCount);
      return {
        notifications: state.notifications.filter(
          (notif) => notif.id !== id && notif._id !== id
        ),
        unreadCount: Math.max(0, newUnreadCount),
      };
    });

    try {
      await fetch(`${API_BASE_URL}/deleteNotification/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
      console.log('🔔 Deleted notification:', id);
    } catch (error) {
      console.error('🔔 Error deleting notification:', error);
    }
  },

  // ✅ Clear all notifications
  clearAllNotifications: async (userId: string) => {
    console.log('🔔 Clearing all notifications');
    set({ notifications: [], unreadCount: 0 });

    try {
      await fetch(`${API_BASE_URL}/clearAllNotifications/${userId}`, { method: 'DELETE', headers: { ...authHeader() } });
      console.log('🔔 Cleared all notifications');
    } catch (error) {
      console.error('🔔 Error clearing all notifications:', error);
    }
  },

  // ✅ Confirm booking
  confirmBooking: async (notificationId: string, bookingId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/confirmBooking/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to confirm booking');

      console.log('✅ Booking confirmed:', bookingId);

      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === notificationId
            ? {
              ...notif,
              bookingStatus: 'Confirmed',
              type: 'booking_confirmed' as const,
              requiresFeedback: false, // ✅ No feedback for confirmed bookings
            }
            : notif
        ),
      }));

      if (notificationSocket?.connected) {
        const userId = localStorage.getItem('userId');
        notificationSocket.emit('booking-status-update', {
          bookingId,
          status: 'accepted',
          ownerId: userId,
        });
      }
    } catch (error) {
      console.error('❌ Error confirming booking:', error);
      throw error;
    }
  },

  // ✅ Reject booking
  rejectBooking: async (notificationId: string, bookingId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cancelBooking/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to reject booking');

      console.log('❌ Booking rejected:', bookingId);

      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        const newUnreadCount =
          notification && !notification.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount;
        console.log('🔔 Removing rejected notification. New unread count:', newUnreadCount);
        return {
          notifications: state.notifications.filter((notif) => notif.id !== notificationId),
          unreadCount: newUnreadCount,
        };
      });

      if (notificationSocket?.connected) {
        const userId = localStorage.getItem('userId');
        notificationSocket.emit('booking-status-update', {
          bookingId,
          status: 'rejected',
          ownerId: userId,
        });
      }
    } catch (error) {
      console.error('❌ Error rejecting booking:', error);
      throw error;
    }
  },

  // ✅ Initialize socket
  initializeSocket: (userId: string) => {
    if (!userId) {
      console.log('🔔 No userId for socket initialization');
      return;
    }

    if (notificationSocket) {
      notificationSocket.disconnect();
    }

    console.log('🔔 Initializing notification socket for user:', userId);
    notificationSocket = io(SOCKET_URL, {
      query: { userId },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    notificationSocket.on('connect', () => {
      console.log('🔔 Notification socket connected');
      set({ socketConnected: true });
      get().fetchNotifications(userId);
    });

    notificationSocket.on('disconnect', () => {
      console.log('🔔 Notification socket disconnected');
      set({ socketConnected: false });
    });

    // Listen for new notifications
    notificationSocket.on('new-notification', (data: any) => {
      console.log('🔔 New notification received via socket:', data);

      const vehicleName =
        data.vehicleName ||
        data.VehicleName ||
        data.vehicle_name ||
        data.carName ||
        data.CarName ||
        data.bikeName ||
        data.BikeName ||
        data.name ||
        data.model ||
        data.Model;

      const notification = {
        _id: data._id || data.id,
        type: data.type || 'general',
        title: data.title || 'New Notification',
        message: data.message || data.body || '',
        vehicleId: data.vehicleId || data.VehicleId || data.vehicle_id,
        vehicleName,
        bookingId: data.bookingId || data.booking_id,
        requiresFeedback: data.requiresFeedback,
        feedbackGiven: data.feedbackGiven || false,
        senderId: data.ownerId || data.senderId,
      };

      get().addNotification(notification);
    });

    // Listen for booking status updates (for customers)
    notificationSocket.on('booking-status-update', (data: any) => {
      console.log('🔔 Booking status update received:', data);

      const vehicleName =
        data.vehicleName ||
        data.VehicleName ||
        data.vehicle_name ||
        data.carName ||
        data.CarName ||
        data.bikeName ||
        data.BikeName ||
        data.name ||
        data.model ||
        data.Model ||
        'the vehicle';

      let notificationType: Notification['type'] = 'general';
      let title = 'Booking Update';
      let message = '';
      let requiresFeedback = false;

      if (data.status === 'accepted' || data.status === 'confirmed') {
        notificationType = 'booking_confirmed';
        title = 'Booking Confirmed!';
        message = `Your booking for ${vehicleName} has been accepted.`;
        requiresFeedback = false; // ✅ No feedback for confirmed
      } else if (data.status === 'rejected' || data.status === 'cancelled') {
        notificationType = 'booking_declined';
        title = 'Booking Declined';
        message = `Your booking for ${vehicleName} was declined.`;
      } else if (data.status === 'timeout') {
        notificationType = 'booking_timeout';
        title = 'Booking Timed Out';
        message = `Your booking for ${vehicleName} was auto-cancelled.`;
      }

      get().addNotification({
        type: notificationType,
        title,
        message,
        vehicleName,
        vehicleId: data.vehicleId || data.VehicleId || data.vehicle_id,
        bookingId: data.bookingId || data.booking_id,
        requiresFeedback,
      });
    });

    // ✅ Listen for ride completed (ONLY THIS GETS FEEDBACK)
    notificationSocket.on('ride-completed', (data: any) => {
      console.log('🔔 Ride completed notification received:', data);
 
      const vehicleName =
        data.vehicleName ||
        data.VehicleName ||
        data.vehicle_name ||
        data.carName ||
        data.CarName ||
        data.bikeName ||
        data.BikeName ||
        data.name ||
        data.model ||
        data.Model ||
        'the vehicle';
          
      get().addNotification({
        type: 'ride_completed', // ✅ CRITICAL: This type triggers feedback button
        title: 'Ride Completed!',
        message: `Your ride with ${vehicleName} has been completed. Please provide your feedback.`,
        vehicleName,
        vehicleId: data.vehicleId || data.VehicleId || data.vehicle_id,
        bookingId: data.bookingId || data.booking_id,
        requiresFeedback: true, // ✅ Enable feedback
        feedbackGiven: false,
      });
    });

    // Listen for new booking requests (for owners)
    notificationSocket.on('new-booking-request', (data: any) => {
      console.log('🔔 New booking request received:', data);

      const vehicleName =
        data.vehicleName ||
        data.VehicleName ||
        data.vehicle_name ||
        data.carName ||
        data.CarName ||
        data.bikeName ||
        data.BikeName ||
        data.name ||
        data.model ||
        data.Model ||
        'your vehicle';

      const vehicleId =
        data.vehicleId || data.VechileId || data.VehicleId || data.vehicle_id;

      get().addNotification({
        type: 'booking_request',
        title: 'New Booking Request!',
        message: `You have a new booking request for ${vehicleName}.`,
        vehicleName,
        vehicleId,
        bookingId: data._id || data.id || data.bookingId,
        bookingStatus: 'Pending',
        customerName: data.customerName || data.customer_name,
        contactNumber: data.contactNumber || data.contact_number || data.phone,
        fromDate: data.fromDate || data.from_date || data.startDate,
        toDate: data.toDate || data.to_date || data.endDate,
        totalPrice: data.totalPrice || data.total_price || data.price,
        expiresAt: data.expiresAt || data.expires_at || Date.now() + 2 * 60 * 1000,
        customerId: data.customerId || data.customer_id,
      });
    });
  },

  // Disconnect socket
  disconnectSocket: () => {
    if (notificationSocket) {
      console.log('🔔 Disconnecting notification socket');
      notificationSocket.disconnect();
      notificationSocket = null;
      set({ socketConnected: false });
    }
  },
}));     