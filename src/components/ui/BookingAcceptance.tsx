import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { bookingAPI } from '../../services/api.service';

interface Booking {
  _id: string;
  customerId: string;
  customerName?: string;
  vehicleId: string;
  vehicleName?: string;
  vehicleType?: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  createdAt: string;
}

interface BookingContextType {
  pendingBookings: Booking[];
  showPopup: boolean;
  currentBooking: Booking | null;
  acceptBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string) => Promise<void>;
  closePopup: () => void;
}

// ============================================
// NOTIFICATION SOUND
// ============================================
const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

// ============================================
// BOOKING CONTEXT
// ============================================
const BookingContext = createContext<BookingContextType | null>(null);

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBookings must be used within BookingProvider');
  return context;
};

// ============================================
// BOOKING PROVIDER WITH POLLING
// ============================================
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [previousBookingIds, setPreviousBookingIds] = useState<Set<string>>(new Set<string>());

  const getOwnerId = (): string | null => {
    let ownerId = localStorage.getItem('ownerId');
    const isValidMongoId = (id: string | null) => id && /^[a-f0-9]{24}$/i.test(id);

    if (isValidMongoId(ownerId)) return ownerId;

    const userId = localStorage.getItem('userId');
    if (isValidMongoId(userId)) return userId;

    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        if (isValidMongoId(profile.userId)) return profile.userId;
        if (isValidMongoId(profile._id)) return profile._id;
      }
    } catch (e) { }

    console.warn("⚠️ No valid ownerId found in localStorage");
    return ownerId;
  };

  // Fetch pending bookings using API service
  const fetchPendingBookings = useCallback(async () => {
    try {
      const ownerId = getOwnerId();
      if (!ownerId) {
        console.warn("⚠️ No ownerId available, skipping fetch");
        return;
      }

      console.log("📥 Fetching pending bookings for owner:", ownerId);

      // Use centralized API service
      const response = await bookingAPI.getPendingBookingsOfOwner(ownerId);
      const data = response.data;
      const bookings = Array.isArray(data) ? data : data.bookings || [];

      console.log("✅ Fetched bookings:", bookings);

      // Check for new bookings
      const currentIds = new Set<string>(bookings.map((b: Booking) => b._id));
      const newBookings = bookings.filter((b: Booking) => !previousBookingIds.has(b._id));

      if (newBookings.length > 0 && previousBookingIds.size > 0) {
        console.log('🔔 New booking detected!', newBookings[0]);
        playNotificationSound();
        setCurrentBooking(newBookings[0]);
        setShowPopup(true);
      }

      setPendingBookings(bookings);
      setPreviousBookingIds(currentIds);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
    }
  }, [previousBookingIds]);

  // Polling effect
  useEffect(() => {
    fetchPendingBookings(); // Initial fetch
    const interval = setInterval(fetchPendingBookings, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [fetchPendingBookings]);

  // Accept booking using API service
  const acceptBooking = async (bookingId: string) => {
    try {
      console.log("✅ Accepting booking:", bookingId);

      // Use centralized API service
      await bookingAPI.confirmBooking(bookingId);

      // Update state
      setPendingBookings(prev => prev.filter(b => b._id !== bookingId));
      setShowPopup(false);
      setCurrentBooking(null);

      console.log("✅ Booking accepted successfully");

      // Refresh bookings
      setTimeout(fetchPendingBookings, 1000);
    } catch (error) {
      console.error('❌ Error accepting booking:', error);
      alert('Failed to accept booking. Please try again.');
    }
  };

  // Reject booking using API service
  const rejectBooking = async (bookingId: string) => {
    try {
      console.log("❌ Rejecting booking:", bookingId);

      // Use centralized API service
      await bookingAPI.deleteBooking(bookingId);

      // Update state
      setPendingBookings(prev => prev.filter(b => b._id !== bookingId));
      setShowPopup(false);
      setCurrentBooking(null);

      console.log("✅ Booking rejected successfully");

      // Refresh bookings
      setTimeout(fetchPendingBookings, 1000);
    } catch (error) {
      console.error('❌ Error rejecting booking:', error);
      alert('Failed to reject booking. Please try again.');
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <BookingContext.Provider
      value={{
        pendingBookings,
        showPopup,
        currentBooking,
        acceptBooking,
        rejectBooking,
        closePopup,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// ============================================
// BOOKING ACCEPTANCE COMPONENT
// ============================================
interface BookingAcceptanceProps {
  isOpen?: boolean;
  bookingId: string;
  onAccept: () => void;
  onReject: () => void;
  onClose?: () => void;
}

export const BookingAcceptance: React.FC<BookingAcceptanceProps> = ({
  isOpen = true,
  onAccept,
  onReject,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Booking acceptance dialog"
    >
      <div
        className="absolute inset-0 bg-black/50"
        style={{ backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-12 mx-4 w-full"
        style={{
          animation: "fadeIn 0.28s ease-out",
          maxWidth: "650px",
          minHeight: "400px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full border-2 border-blue-500"
                  style={{
                    width: `${120 + i * 36}px`,
                    height: `${120 + i * 36}px`,
                    opacity: 0.3 - i * 0.07,
                    animation: `pulse 2s infinite ${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <div
              className="relative w-36 h-36 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                boxShadow: "0 10px 40px rgba(59, 130, 246, 0.4)",
              }}
            >
              <svg
                width="72"
                height="72"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8 leading-tight">
          You've got a new booking!
        </h2>

        <div className="space-y-4">
          <button
            onClick={onAccept}
            className="w-full text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
            style={{
              background: "linear-gradient(to right, #0B0E92, #69A6F0)",
            }}
          >
            Accept
          </button>

          <button
            onClick={onReject}
            className="w-full bg-white text-red-600 font-bold py-4 px-6 rounded-xl border-2 border-red-600 hover:bg-red-50 transition-all duration-200 text-lg"
          >
            Reject
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-6 w-full text-sm text-gray-500 hover:text-gray-700"
            aria-label="Close booking dialog"
          >
            Close
          </button>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes pulse {
            0%,100% { transform: scale(0.9); opacity: 0.32; }
            50% { transform: scale(1.06); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
};

// ============================================
// WRAPPER COMPONENT WITH API INTEGRATION
// ============================================
const BookingAcceptanceWithAPI: React.FC = () => {
  const { showPopup, currentBooking, acceptBooking, rejectBooking, closePopup } = useBookings();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = async () => {
    if (!currentBooking || isAccepting) return;
    setIsAccepting(true);
    try {
      await acceptBooking(currentBooking._id);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!currentBooking || isRejecting) return;
    setIsRejecting(true);
    try {
      await rejectBooking(currentBooking._id);
    } finally {
      setIsRejecting(false);
    }
  };

  if (!showPopup || !currentBooking) return null;

  return (
    <BookingAcceptance
      isOpen={showPopup}
      bookingId={currentBooking._id}
      onAccept={handleAccept}
      onReject={handleReject}
      onClose={closePopup}
    />
  );
};

// ============================================
// DEMO RENTAL PAGE
// ============================================
const RentalPage: React.FC = () => {
  const { pendingBookings } = useBookings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚗 RentOnGo - Rental Page
        </h1>
        <p className="text-gray-600 mb-6">
          This is your rental page. The booking acceptance popup will appear automatically
          when a new booking is received (checks every 3 seconds).
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
          <p className="text-blue-800 font-semibold mb-2">
            ✅ Real-time Booking System Active
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Polls for new bookings every 3 seconds</li>
            <li>• Plays sound notification on new booking</li>
            <li>• Shows BookingAcceptance popup automatically</li>
            <li>• Works on every page of your app</li>
            <li>• Uses centralized API service</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            📊 Current Status:
          </p>
          <p className="text-sm text-gray-600">
            <strong>Owner ID:</strong>{' '}
            <code className="bg-gray-200 px-2 py-1 rounded ml-1">
              {localStorage.getItem('ownerId') || localStorage.getItem('userId') || 'Not set'}
            </code>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Pending Bookings:</strong>{' '}
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded ml-1 font-semibold">
              {pendingBookings.length}
            </span>
          </p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-800 font-semibold mb-2">
            🎯 Key Improvements:
          </p>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✅ All API calls use centralized API service</li>
            <li>✅ No direct fetch/axios calls in components</li>
            <li>✅ Proper error handling and loading states</li>
            <li>✅ Clean separation of concerns</li>
            <li>✅ Easy to maintain and test</li>
          </ul>
        </div>
      </div>
    </div>
  );
};



export default BookingAcceptance;

