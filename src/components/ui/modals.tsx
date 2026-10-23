import { useState, useEffect, useRef } from "react";
import {
  Check,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  AlertCircle,
  Truck,
} from "lucide-react";
import io from "socket.io-client";
import apiService, { SOCKET_URL } from "../../services/api.service";


const EXPIRY_TIME = 2 * 60 * 1000;

export default function PriorityBookingSystem() {
  const [bookingQueue, setBookingQueue] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState("confirm");
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const socketRef = useRef(null);
  const timersRef = useRef({});
  const ownerId = localStorage.getItem("userId") || "";

  useEffect(() => {
    if (!currentBooking) return;
    const interval = setInterval(() => {
      const remaining = currentBooking.expiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        handleExpireBooking(currentBooking._id || currentBooking.id);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [currentBooking]);

  useEffect(() => {
    if (!ownerId) return;
    socketRef.current = io(SOCKET_URL, {
      query: { userId: ownerId },
      transports: ["polling", "websocket"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => console.log("✅ Socket connected"));
    socketRef.current.on("new-booking-request", addBookingToQueue);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, [ownerId]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!currentBooking && bookingQueue.length > 0) showNextBooking();
  }, [currentBooking, bookingQueue]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await apiService.booking.getPendingBookingsOfOwner(ownerId);
      // Handle response which could be wrapped in data
      const bookings = Array.isArray(response) ? response : (response as any)?.data || [];
      const pending = bookings.filter((b) => b.status?.toLowerCase() === "pending");
      const bookingsWithTime = pending.map((booking) => ({
        ...booking,
        receivedAt: new Date(booking.createdAt || Date.now()).getTime(),
        expiresAt: new Date(booking.createdAt || Date.now()).getTime() + EXPIRY_TIME,
      }));
      setBookingQueue(bookingsWithTime);
      bookingsWithTime.forEach(startExpiryTimer);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const addBookingToQueue = (booking) => {
    const bookingWithTime = { ...booking, receivedAt: Date.now(), expiresAt: Date.now() + EXPIRY_TIME };
    setBookingQueue((prev) => [...prev, bookingWithTime].sort((a, b) => a.receivedAt - b.receivedAt));
    startExpiryTimer(bookingWithTime);
  };

  const startExpiryTimer = (booking) => {
    const bookingId = booking._id || booking.id;
    const remaining = booking.expiresAt - Date.now();
    if (remaining > 0) {
      timersRef.current[bookingId] = setTimeout(() => handleExpireBooking(bookingId), remaining);
    }
  };

  const handleExpireBooking = async (bookingId) => {
    try {
      await apiService.booking.cancelBooking(bookingId);
      setBookingQueue((prev) => prev.filter((b) => (b._id || b.id) !== bookingId));
      if (currentBooking?._id === bookingId) {
        setCurrentBooking(null);
        setShowModal(false);
      }
      clearTimeout(timersRef.current[bookingId]);
      delete timersRef.current[bookingId];
    } catch (error) {
      console.error("Error expiring booking:", error);
    }
  };

  const showNextBooking = () => {
    if (bookingQueue.length === 0) return;
    const nextBooking = bookingQueue[0];
    setCurrentBooking(nextBooking);
    setShowModal(true);
    setModalState("confirm");
  };

  const handleConfirmBooking = async () => {
    if (!currentBooking) return;
    setActionLoading(true);
    const bookingId = currentBooking._id || currentBooking.id;
    const customerId = currentBooking.userId || currentBooking.customerId;

    try {
      await apiService.booking.confirmBooking(bookingId);
      socketRef.current?.emit("booking-status-update", { bookingId, customerId, status: "accepted", ownerId });
      setModalState("confirmed");
      clearTimeout(timersRef.current[bookingId]);
      delete timersRef.current[bookingId];

      setTimeout(() => {
        setBookingQueue((prev) => prev.filter((b) => (b._id || b.id) !== bookingId));
        setCurrentBooking(null);
        setShowModal(false);
        setModalState("confirm");
        setActionLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert(error.message);
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!currentBooking) return;
    setActionLoading(true);
    const bookingId = currentBooking._id || currentBooking.id;
    const customerId = currentBooking.userId || currentBooking.customerId;

    try {
      await apiService.booking.cancelBooking(bookingId);
      socketRef.current?.emit("booking-status-update", { bookingId, customerId, status: "rejected", ownerId });
      setModalState("rejected");
      clearTimeout(timersRef.current[bookingId]);
      delete timersRef.current[bookingId];

      setTimeout(() => {
        setBookingQueue((prev) => prev.filter((b) => (b._id || b.id) !== bookingId));
        setCurrentBooking(null);
        setShowModal(false);
        setModalState("confirm");
        setActionLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert(error.message);
      setActionLoading(false);
    }
  };

  const getRemainingTime = (booking) => {
    const now = Date.now();
    const remaining = booking.expiresAt - now;

    if (remaining <= 0) return '00:00';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const TimeDisplay = ({ booking }) => {
    const [time, setTime] = useState(getRemainingTime(booking));

    useEffect(() => {
      const interval = setInterval(() => {
        setTime(getRemainingTime(booking));
      }, 1000);

      return () => clearInterval(interval);
    }, [booking]);

    const remaining = booking.expiresAt - Date.now();
    const isExpiring = remaining < 30000;

    return (
      <span className={`font-mono font-bold ${isExpiring ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
        {time}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Owner Dashboard</h1>
              <p className="text-gray-500">
                {bookingQueue.length} pending booking{bookingQueue.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Bell size={20} />
              Notifications
              {bookingQueue.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {bookingQueue.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Notifications</h2>

            {bookingQueue.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending bookings</p>
            ) : (
              <div className="space-y-3">
                {bookingQueue.map((booking, index) => {
                  const bookingId = booking._id || booking.id;
                  const isCurrentBooking = currentBooking && (currentBooking._id || currentBooking.id) === bookingId;

                  return (
                    <div
                      key={bookingId}
                      className={`p-4 rounded-lg border-2 transition ${isCurrentBooking
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {index === 0 && !isCurrentBooking && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                ⭐ NEXT
                              </span>
                            )}
                            {isCurrentBooking && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                                👁️ VIEWING
                              </span>
                            )}
                            <span className="font-semibold text-gray-800">
                              {booking.contactName || booking.customerName || 'Customer'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {booking.vehicleName || booking.VehicleName || 'Vehicle'} •
                            ₹{booking.totalPrice || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock size={16} className="text-orange-600" />
                            <TimeDisplay booking={booking} />
                          </div>
                          <p className="text-xs text-gray-500">expires in</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-orange-900 mb-2">⏱️ Priority System Active</h3>
              <ul className="space-y-1 text-orange-800 text-sm">
                <li>• First booking shows in modal automatically</li>
                <li>• Other bookings wait in queue</li>
                <li>• Each booking expires after <strong>2 minutes</strong></li>
                <li>• Accept or reject quickly to avoid expiry</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {bookingQueue.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Clock className="text-gray-300 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pending Bookings</h3>
            <p className="text-gray-600">All bookings have been processed</p>
          </div>
        )}
      </div>

      {/* EXACT DESIGN FROM IMAGE - Priority Booking Modal */}
      {showModal && currentBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

          {/* Confirmation Modal - Exact Design */}
          {modalState === 'confirm' && (
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
              {/* Timer Badge - Top Right */}
              <div className="absolute -top-3 -right-3 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Clock size={16} />
                  <TimeDisplay booking={currentBooking} />
                </div>
              </div>

              <div className="text-center">
                {/* Blue Circle with Truck Icon - Exactly like image */}
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                  <Truck size={56} className="text-white" strokeWidth={2} />
                </div>

                {/* "You've got a new booking!" Text */}
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  You've got a new booking!
                </h2>

                {/* Accept Button - Exact gradient like image */}
                <button
                  onClick={handleConfirmBooking}
                  disabled={actionLoading}
                  className="w-full mb-4 py-4 rounded-xl font-semibold text-lg text-white bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 hover:from-blue-800 hover:via-blue-700 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin mx-auto" size={24} />
                  ) : (
                    'Accept'
                  )}
                </button>

                {/* Reject Button - Exact style like image */}
                <button
                  onClick={handleRejectBooking}
                  disabled={actionLoading}
                  className="w-full py-4 rounded-xl font-semibold text-lg text-red-600 bg-white border-2 border-red-600 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin mx-auto text-red-600" size={24} />
                  ) : (
                    'Reject'
                  )}
                </button>

                {/* Booking Details - Collapsible */}
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-blue-600 font-semibold text-sm">
                    View booking details
                  </summary>
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                    {(currentBooking.contactName || currentBooking.customerName) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-semibold text-gray-900">
                          {currentBooking.contactName || currentBooking.customerName}
                        </span>
                      </div>
                    )}
                    {(currentBooking.contactNumber || currentBooking.phone) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-semibold text-gray-900">
                          {currentBooking.contactNumber || currentBooking.phone}
                        </span>
                      </div>
                    )}
                    {(currentBooking.vehicleName || currentBooking.VehicleName) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-semibold text-gray-900">
                          {currentBooking.vehicleName || currentBooking.VehicleName}
                        </span>
                      </div>
                    )}
                    {currentBooking.FromDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">From:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(currentBooking.FromDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {currentBooking.ToDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">To:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(currentBooking.ToDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {currentBooking.totalPrice && (
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-gray-700 font-bold">Total:</span>
                        <span className="text-xl text-blue-600 font-bold">
                          ₹{currentBooking.totalPrice}
                        </span>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {modalState === 'confirmed' && (
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 relative animate-fadeIn">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                  <CheckCircle className="text-green-600" size={56} />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Booking Confirmed!
                </h2>

                <p className="text-gray-600 text-lg mb-4">
                  Customer will be notified instantly
                </p>

                {bookingQueue.length > 1 && (
                  <p className="text-sm text-blue-600 font-semibold">
                    Next booking will appear automatically...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rejected Modal */}
          {modalState === 'rejected' && (
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 relative animate-fadeIn">
              <div className="text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                  <XCircle className="text-red-600" size={56} />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Booking Rejected
                </h2>

                <p className="text-gray-600 text-lg mb-4">
                  Customer will be notified instantly
                </p>

                {bookingQueue.length > 1 && (
                  <p className="text-sm text-blue-600 font-semibold">
                    Next booking will appear automatically...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}