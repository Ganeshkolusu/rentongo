import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore, Notification } from "../../../store/notification.store";
import PopupChat from "../../../components/ui/PopupChat";
import apiService, { SOCKET_URL } from "../../../services/api.service";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Car,
  Bike,
  MessageCircle,
} from "lucide-react";

type Category = 'bookings' | 'chats' | 'alerts';
type FilterTab = 'all' | Category;

// ⏱️ EXPIRY TIME: 2 minutes
const EXPIRY_TIME = 2 * 60 * 1000;

// ✅ VEHICLE TYPE DETECTION
const getVehicleType = (notification: any): 'car' | 'bike' | 'unknown' => {
  if (notification.vehicleType) {
    const type = notification.vehicleType.toLowerCase();
    if (type.includes('bike') || type.includes('motorcycle') || type === 'two-wheeler') {
      return 'bike';
    }
    if (type.includes('car') || type.includes('four-wheeler')) {
      return 'car';
    }
  }

  const vehicleName = (
    notification.vehicleName ||
    notification.VehicleName ||
    notification.vehicle_name ||
    notification.carName ||
    notification.CarName ||
    notification.bikeName ||
    notification.BikeName ||
    notification.name ||
    ''
  ).toLowerCase();

  const bikeKeywords = ['bike', 'motorcycle', 'scooter', 'scooty', 'activa', 'access', 'jupiter', 'dio', 'pulsar', 'ktm', 'royal enfield', 'bullet', 'apache', 'fz', 'r15', 'ninja'];
  const carKeywords = ['car', 'suv', 'sedan', 'hatchback', 'swift', 'i20', 'city', 'creta', 'fortuner', 'innova'];

  for (const keyword of bikeKeywords) {
    if (vehicleName.includes(keyword)) {
      return 'bike';
    }
  }

  for (const keyword of carKeywords) {
    if (vehicleName.includes(keyword)) {
      return 'car';
    }
  }

  const seaters = notification.seaters || notification.Carseater || localStorage.getItem('seaters') || '';
  const seaterNum = parseInt(seaters);
  if (seaterNum && seaterNum <= 2) {
    return 'bike';
  }
  if (seaterNum && seaterNum >= 4) {
    return 'car';
  }

  if (notification.type?.toLowerCase().includes('bike') || notification.category?.toLowerCase().includes('bike')) {
    return 'bike';
  }
  if (notification.type?.toLowerCase().includes('car') || notification.category?.toLowerCase().includes('car')) {
    return 'car';
  }

  return 'car';
};

// ✅ GET VEHICLE ICON BASED ON TYPE
const getVehicleIcon = (notification: any) => {
  const vehicleType = getVehicleType(notification);
  return vehicleType === 'bike' ? Bike : Car;
};

// ✅ UNIVERSAL HELPER: Extract vehicle name
const getVehicleName = (notification: any): string => {
  const vehicleName =
    notification.vehicleName ||
    notification.VehicleName ||
    notification.vehicle_name ||
    notification.carName ||
    notification.CarName ||
    notification.bikeName ||
    notification.BikeName ||
    notification.name ||
    notification.model ||
    notification.Model ||
    (notification.vehicleId ? `Vehicle ${notification.vehicleId}` : 'Vehicle');

  return vehicleName;
};

// ✅ Visual treatment (icon + colors) for a notification's type/status.
// Real persisted notifications come from the backend with type "Booking" /
// "BookingStatus" and no bookingStatus field at all — only their title text
// ("Booking Confirmed ✅", "Booking Cancelled ❌", …) distinguishes them, so
// that's checked alongside the type/bookingStatus values the live socket
// events use.
const getTypeVisual = (notif: Notification) => {
  const title = (notif.title || '').toLowerCase();

  if (notif.type === 'chat_message') {
    return { bg: 'bg-indigo-100', fg: 'text-indigo-600', label: null, labelColor: '', Icon: MessageCircle };
  }
  if (notif.type === 'booking_confirmed' || notif.bookingStatus === 'Confirmed' || title.includes('confirmed')) {
    return { bg: 'bg-green-100', fg: 'text-green-600', label: 'Confirmed', labelColor: 'text-green-700', Icon: CheckCircle };
  }
  if (
    notif.type === 'booking_declined' ||
    notif.bookingStatus === 'Rejected' ||
    title.includes('cancelled') ||
    title.includes('declined') ||
    title.includes('rejected')
  ) {
    return { bg: 'bg-red-100', fg: 'text-red-600', label: 'Cancelled', labelColor: 'text-red-700', Icon: XCircle };
  }
  if (
    notif.type === 'booking_timeout' ||
    notif.bookingStatus === 'Expired' ||
    title.includes('expired') ||
    title.includes('timed out') ||
    title.includes('timeout')
  ) {
    return { bg: 'bg-orange-100', fg: 'text-orange-600', label: 'Expired', labelColor: 'text-orange-700', Icon: Clock };
  }
  if (notif.type === 'ride_completed' || notif.bookingStatus === 'Completed' || title.includes('completed')) {
    return { bg: 'bg-blue-100', fg: 'text-blue-600', label: 'Completed', labelColor: 'text-blue-700', Icon: CheckCircle };
  }
  if (notif.bookingStatus === 'Pending' || title.includes('request')) {
    return { bg: 'bg-yellow-100', fg: 'text-yellow-600', label: 'Pending', labelColor: 'text-yellow-700', Icon: Clock };
  }
  return { bg: 'bg-gray-100', fg: 'text-gray-500', label: null, labelColor: '', Icon: Bell };
};

// ✅ Which tab a notification belongs under
const getCategory = (notif: Notification): Category => {
  if (notif.type === 'chat_message') return 'chats';
  const bookingTypes = [
    'Booking', 'BookingStatus', 'booking_confirmed', 'booking_declined',
    'booking_timeout', 'ride_completed', 'booking_request', 'new_booking',
  ];
  if (bookingTypes.includes(notif.type) || notif.bookingStatus || notif.bookingId) {
    return 'bookings';
  }
  return 'alerts';
};

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "";

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    fetchNotifications,
    confirmBooking,
    rejectBooking,
    resetUnreadCount,
  } = useNotificationStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, 'confirm' | 'reject' | null>>({});
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [openChat, setOpenChat] = useState<Notification | null>(null);

  const handleOpenChat = (notification: Notification) => {
    if (!notification.read) markAsRead(notification.id);
    setOpenChat(notification);
  };

  // ✅ Reset unread count when page opens
  useEffect(() => {
    if (userId) {
      resetUnreadCount();
    }
  }, []);

  // ⏱️ AUTO-EXPIRY CHECKER
  useEffect(() => {
    const interval = setInterval(() => {
      notifications.forEach((notification) => {
        if (isNewBookingRequest(notification)) {
          const remaining = notification.expiresAt! - Date.now();
          if (remaining <= 0) {
            handleExpireNotification(notification.id, notification.bookingId!);
          }
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [notifications]);

  useEffect(() => {
    if (userId) {
      fetchNotifications(userId);
    }
  }, [userId, fetchNotifications]);

  const handleRefresh = async () => {
    if (!userId || isRefreshing) return;
    setIsRefreshing(true);
    await fetchNotifications(userId);
    setIsRefreshing(false);
  };

  const getTimePassed = (timestamp: string | Date): string => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getRemainingTime = (expiresAt: number): string => {
    const now = Date.now();
    const remaining = expiresAt - now;
    if (remaining <= 0) return '00:00';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const TimeDisplay = ({ expiresAt }: { expiresAt: number }) => {
    const [time, setTime] = useState(getRemainingTime(expiresAt));

    useEffect(() => {
      const interval = setInterval(() => {
        setTime(getRemainingTime(expiresAt));
      }, 1000);

      return () => clearInterval(interval);
    }, [expiresAt]);

    const remaining = expiresAt - Date.now();
    const isExpiring = remaining < 30000;

    return (
      <span className={`font-mono font-bold ${isExpiring ? 'text-red-600 animate-pulse' : 'text-white'}`}>
        {time}
      </span>
    );
  };

  // ⏰ HANDLE EXPIRY
  const handleExpireNotification = async (notificationId: string, bookingId: string) => {
    try {
      await rejectBooking(notificationId, bookingId);
      await fetchNotifications(userId);
    } catch (error) {
      console.error('Error expiring notification:', error);
    }
  };

  const handleConfirmBooking = async (notification: any) => {
    setActionLoading(prev => ({ ...prev, [notification.id]: 'confirm' }));
    try {
      await confirmBooking(notification.id, notification.bookingId);
      markAsRead(notification.id);
      await fetchNotifications(userId);
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Failed to confirm booking');
    } finally {
      setActionLoading(prev => ({ ...prev, [notification.id]: null }));
    }
  };

  const handleRejectBooking = async (notification: any) => {
    setActionLoading(prev => ({ ...prev, [notification.id]: 'reject' }));
    try {
      await rejectBooking(notification.id, notification.bookingId);
      await fetchNotifications(userId);
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking');
    } finally {
      setActionLoading(prev => ({ ...prev, [notification.id]: null }));
    }
  };

  // ✅ FEEDBACK CLICK HANDLER
  const handleFeedbackClick = (notification: any) => {
    markAsRead(notification.id);
    const vehicleName = getVehicleName(notification);
    const bookingId = notification.bookingId || notification.id || 'temp-' + Date.now();
    const vehicleId = notification.vehicleId || notification.VechileId || notification.VehicleId;

    navigate(
      `/feedback?vehicleId=${vehicleId}&vehicleName=${encodeURIComponent(vehicleName)}&bookingId=${bookingId}`
    );
  };

  // ✅ CHECK IF NOTIFICATION IS A NEW BOOKING REQUEST
  const isNewBookingRequest = (notification: any): boolean => {
    return (
      notification.type === 'booking_request' &&
      notification.bookingStatus === 'Pending' &&
      notification.expiresAt &&
      notification.expiresAt > Date.now()
    );
  };

  // ✅ CHECK IF NOTIFICATION IS BOOKING COMPLETED
  const isBookingCompleted = (notification: any): boolean => {
    return (
      notification.type === 'ride_completed' ||
      notification.bookingStatus === 'Completed' ||
      (notification.type === 'Booking' && notification.title?.includes('Booking Completed'))
    );
  };

  // ---- Per-category unread counts, for the tab badges ----
  const categoryUnread = { bookings: 0, chats: 0, alerts: 0 };
  notifications.forEach((n) => {
    if (!n.read) categoryUnread[getCategory(n)]++;
  });

  // ---- Bucket notifications: action-needed / new (unread) / earlier (read) ----
  const visibleNotifications =
    filterTab === 'all' ? notifications : notifications.filter((n) => getCategory(n) === filterTab);

  const actionItems: any[] = [];
  const newItems: any[] = [];
  const earlierItems: any[] = [];

  visibleNotifications.forEach((notification) => {
    const isCompleted = isBookingCompleted(notification);

    if (isCompleted && !notification.feedbackGiven) {
      actionItems.push({ notification, kind: 'feedback' });
      return;
    }
    if (isCompleted) {
      return; // already reviewed, nothing to show
    }
    if (isNewBookingRequest(notification)) {
      actionItems.push({ notification, kind: 'request' });
      return;
    }
    if (notification.read) {
      earlierItems.push(notification);
    } else {
      newItems.push(notification);
    }
  });

  const isEmpty = actionItems.length === 0 && newItems.length === 0 && earlierItems.length === 0;

  // ---- Row renderer for a regular (non-special) notification ----
  const renderRow = (notification: Notification) => {
    const visual = getTypeVisual(notification);
    const Icon = visual.Icon;
    const vehicleName = getVehicleName(notification);
    const isChat = getCategory(notification) === 'chats';

    return (
      <div
        key={notification.id}
        onClick={isChat ? () => handleOpenChat(notification) : undefined}
        className={`flex gap-3 sm:gap-4 p-4 rounded-2xl transition-colors ${
          notification.read ? 'bg-white' : 'bg-blue-50/60'
        } ${isChat ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      >
        <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center ${visual.bg} ${visual.fg}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-bold text-gray-900">{notification.title}</span>
            <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
              {getTimePassed(notification.timestamp)}
            </span>
          </div>

          {notification.message && (
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {vehicleName && (
              <span className="text-xs text-gray-400">{vehicleName}</span>
            )}
            {visual.label && (
              <>
                <span className="text-gray-300">·</span>
                <span className={`text-xs font-semibold ${visual.labelColor}`}>{visual.label}</span>
              </>
            )}
            {notification.totalPrice ? (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs font-semibold text-green-600">₹{notification.totalPrice}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between flex-shrink-0">
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1" />
          )}
          <div className="flex items-center gap-1 mt-auto">
            {!notification.read && (
              <button
                onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition"
                title="Mark as read"
                aria-label="Mark as read"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
              className="text-gray-300 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition"
              title="Delete notification"
              aria-label="Delete notification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---- Special: feedback prompt card ----
  const renderFeedbackCard = (notification: any) => {
    const vehicleName = getVehicleName(notification);
    const vehicleType = getVehicleType(notification);

    return (
      <div
        key={`feedback-${notification.id}`}
        className="flex items-center gap-4 bg-white border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-sm"
      >
        <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900">Share your experience</h3>
          <p className="text-sm text-gray-600">
            How was your {vehicleType === 'bike' ? 'ride' : 'trip'} with {vehicleName}?
          </p>
        </div>
        <button
          onClick={() => handleFeedbackClick(notification)}
          className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          Give feedback
        </button>
      </div>
    );
  };

  // ---- Special: pending booking request card (Yes/No + countdown) ----
  const renderRequestCard = (notification: any) => {
    const vehicleName = getVehicleName(notification);
    const vehicleType = getVehicleType(notification);
    const VehicleIcon = getVehicleIcon(notification);
    const loading = actionLoading[notification.id];

    return (
      <div
        key={notification.id}
        className="bg-white border border-orange-200 rounded-2xl p-4 sm:p-5 shadow-sm relative"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center bg-orange-100 text-orange-600">
              <VehicleIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {notification.title || "New Booking Request"}
              </h3>
              <p className="text-xs text-gray-400">{vehicleName}</p>
            </div>
          </div>
          <div className="flex-shrink-0 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <TimeDisplay expiresAt={notification.expiresAt!} />
          </div>
        </div>

        {(notification.customerName || notification.fromDate || notification.totalPrice) && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
            {notification.customerName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="font-semibold text-gray-900">{notification.customerName}</span>
              </div>
            )}
            {notification.contactNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="font-semibold text-blue-600">{notification.contactNumber}</span>
              </div>
            )}
            {notification.fromDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">From</span>
                <span className="font-semibold text-gray-900">{notification.fromDate}</span>
              </div>
            )}
            {notification.toDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">To</span>
                <span className="font-semibold text-gray-900">{notification.toDate}</span>
              </div>
            )}
            {notification.totalPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-green-600">₹{notification.totalPrice}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => handleConfirmBooking(notification)}
            disabled={loading !== null}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading === 'confirm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Accept</>}
          </button>
          <button
            onClick={() => handleRejectBooking(notification)}
            disabled={loading !== null}
            className="flex-1 py-3 rounded-xl font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /> Decline</>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-900" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4.5 h-4.5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              {([
                { key: 'all' as const, label: 'All', count: unreadCount },
                { key: 'bookings' as const, label: 'Bookings', count: categoryUnread.bookings },
                { key: 'chats' as const, label: 'Chats', count: categoryUnread.chats },
                { key: 'alerts' as const, label: 'Alerts', count: categoryUnread.alerts },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 flex-shrink-0 ${
                    filterTab === tab.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-[10px] font-bold rounded-full min-w-[16px] px-1 ${filterTab === tab.key ? 'bg-white/20' : 'bg-blue-100 text-blue-700'}`}>
                      {tab.count > 9 ? '9+' : tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead(userId)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => clearAllNotifications(userId)}
                  className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear all</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoading && notifications.length === 0 ? (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading notifications...</p>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-16">
            <Bell className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold mb-1">
              {filterTab === 'all' ? "No notifications yet" : `No ${filterTab} yet`}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {filterTab === 'all' ? "You'll see booking and chat updates here." : "Check back later."}
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {actionItems.length > 0 && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400 pl-1">
                  Needs your action
                </span>
                <div className="space-y-3">
                  {actionItems.map(({ notification, kind }) =>
                    kind === 'feedback' ? renderFeedbackCard(notification) : renderRequestCard(notification)
                  )}
                </div>
              </div>
            )}

            {newItems.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400 pl-1">
                  New
                </span>
                <div className="space-y-2">{newItems.map(renderRow)}</div>
              </div>
            )}

            {earlierItems.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400 pl-1">
                  Earlier
                </span>
                <div className="space-y-2">{earlierItems.map(renderRow)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {openChat && (
        <PopupChat
          isOpen={!!openChat}
          onClose={() => setOpenChat(null)}
          pageRole="customerView"
          currentUserId={userId}
          currentUserName={localStorage.getItem('userName') || 'You'}
          ownerId={openChat.senderId || ''}
          ownerName={openChat.title.replace('New message from ', '') || 'Chat'}
          customerId={userId}
          customerName={localStorage.getItem('userName') || 'You'}
          bookingId={openChat.bookingId || ''}
          vehicleId={openChat.vehicleId}
          apiUrl={apiService.chat.apiUrl}
          socketUrl={SOCKET_URL}
        />
      )}
    </div>
  );
};

export default Notifications;
