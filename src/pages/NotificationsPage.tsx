
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore, Notification } from "../store/notification.store";
import CarLogo from "../assets/icons/CarLogo.png";
import AutomaticLogo from "../assets/icons/AutomaticLogo.png";
import DriverLogo from "../assets/icons/DriverLogo.png";
import { Bell, CheckCircle, XCircle, Clock, AlertCircle, Trash2 } from "lucide-react";

// Get status badge color and text
const getStatusBadge = (notif: Notification) => {
  // For customer notifications based on type
  if (notif.type === 'booking_confirmed') {
    return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Confirmed', icon: CheckCircle };
  }
  if (notif.type === 'booking_declined') {
    return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Cancelled', icon: XCircle };
  }
  if (notif.type === 'booking_timeout') {
    return { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Expired', icon: Clock };
  }
  if (notif.type === 'ride_completed') {
    return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Completed', icon: CheckCircle };
  }

  // For owner notifications based on bookingStatus
  if (notif.bookingStatus) {
    switch (notif.bookingStatus) {
      case 'Pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending', icon: Clock };
      case 'Confirmed':
        return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Confirmed', icon: CheckCircle };
      case 'Rejected':
        return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Rejected', icon: XCircle };
      case 'Expired':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Expired', icon: Clock };
      case 'Completed':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Completed', icon: CheckCircle };
    }
  }

  return null;
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "";
  const role = localStorage.getItem("role") || "customer";
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "read">("all");

  const {
    notifications,
    markAllAsRead,
    clearAllNotifications,
    fetchNotifications,
    isLoading,
    error,
    deleteNotification,
    markAsRead
  } = useNotificationStore();

  // Fetch notifications and initialize socket
  useEffect(() => {
    if (userId) {
      fetchNotifications(userId);
      const { initializeSocket } = useNotificationStore.getState();
      initializeSocket(userId);
    }
    return () => {
      const { disconnectSocket } = useNotificationStore.getState();
      disconnectSocket();
    };
  }, [userId, fetchNotifications]);

  // Role-based filtering
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    if (role === "owner") {
      filtered = filtered.filter((n) => n.bookingStatus || n.type === "new_booking");
    } else {
      filtered = filtered.filter((n) => n.type !== "new_booking");
    }
    if (filterTab === "unread") filtered = filtered.filter((n) => !n.read);
    else if (filterTab === "read") filtered = filtered.filter((n) => n.read);
    return filtered;
  }, [notifications, role, filterTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {role === "owner" ? "Manage booking requests and updates" : "Track your bookings and activity"}
                </p>
              </div>
              <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {role === "owner" ? "Owner" : "Customer"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => markAllAsRead(userId)} className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Mark all read
              </button>
              <button onClick={() => clearAllNotifications(userId)} className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Clear
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-4 border-t border-gray-200 pt-4">
            <button onClick={() => setFilterTab("all")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filterTab === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              All ({notifications.length})
            </button>
            <button onClick={() => setFilterTab("unread")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filterTab === "unread" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              Unread ({notifications.filter(n => !n.read).length})
            </button>
            <button onClick={() => setFilterTab("read")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filterTab === "read" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              Read ({notifications.filter(n => n.read).length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin mb-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading notifications...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error loading notifications</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}
        {filteredNotifications.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {filterTab === "all" ? "No notifications yet" : `No ${filterTab} notifications`}
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {role === "owner" ? "You'll see booking requests and updates here" : "You'll see your booking confirmations and updates here"}
            </p>
          </div>
        )}
        <div className="grid gap-4">
          {filteredNotifications.map((notif) => {
            const statusBadge = getStatusBadge(notif);
            const StatusIcon = statusBadge?.icon;
            const isNewBookingRequest = role === "owner" && notif.type === "new_booking";

            return (
              <div
                key={notif.id}
                className={`group bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 ${notif.read ? "border-gray-200" : "border-blue-300 bg-gradient-to-r from-blue-50 to-white"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${notif.read ? "bg-gray-100" : "bg-gradient-to-br from-blue-100 to-blue-50"
                    }`}>
                    <img src={CarLogo} alt="Notification" className="w-8 h-8 object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-base">{notif.title}</h3>
                          {statusBadge && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                              {StatusIcon && <StatusIcon className="w-3 h-3" />}
                              {statusBadge.text}
                            </span>
                          )}
                          {!notif.read && <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {new Date(notif.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{notif.message}</p>

                    {notif.vehicleName && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 text-sm mb-3">{notif.vehicleName}</h4>
                        {(notif.customerName || notif.fromDate || notif.toDate || notif.totalPrice) && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 pb-4 border-b border-gray-200">
                            {notif.customerName && (
                              <div>
                                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Customer</p>
                                <p className="text-sm font-semibold text-gray-900">{notif.customerName}</p>
                              </div>
                            )}
                            {notif.fromDate && (
                              <div>
                                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">From</p>
                                <p className="text-sm font-semibold text-gray-900">{notif.fromDate}</p>
                              </div>
                            )}
                            {notif.toDate && (
                              <div>
                                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">To</p>
                                <p className="text-sm font-semibold text-gray-900">{notif.toDate}</p>
                              </div>
                            )}
                            {notif.totalPrice && (
                              <div>
                                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Total</p>
                                <p className="text-sm font-bold text-green-600">₹{notif.totalPrice.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded px-2 py-1.5">
                            <img src={AutomaticLogo} alt="Transmission" className="w-4 h-4" />
                            <span>Automatic</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded px-2 py-1.5">
                            <img src={DriverLogo} alt="Capacity" className="w-4 h-4" />
                            <span>5 Seater</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded px-2 py-1.5">
                            <span>⛽ Petrol</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                      {isNewBookingRequest && (
                        <button onClick={() => navigate("/my-listings")} className="flex-1 min-w-[140px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md">
                          View Request
                        </button>
                      )}
                      {notif.type === "booking_confirmed" && role === "customer" && (
                        <button onClick={() => navigate("/calendar")} className="flex-1 min-w-[140px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md">
                          View Calendar
                        </button>
                      )}
                      {(notif.type === "ride_completed" || notif.bookingStatus === "Completed") && (
                        <button onClick={() => navigate("/feedback")} className="flex-1 min-w-[140px] bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md">
                          Give Feedback
                        </button>
                      )}
                      {!notif.read && (
                        <button onClick={() => markAsRead(notif.id)} className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg transition-colors border border-blue-200">
                          Mark Read
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notif.id)} className="px-4 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors border border-gray-200">
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;


