
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL, SOCKET_URL } from "../../../services/api.service";

// --------------------------
// TYPES
// --------------------------
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
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
}

interface BookingContextType {
  pendingBookings: Booking[];
  currentBooking: Booking | null;
  showPopup: boolean;

  acceptBooking: (id: string) => Promise<void>;
  rejectBooking: (id: string) => Promise<void>;
  closePopup: () => void;
}

// --------------------------
// SOUND NOTIFICATION
// --------------------------
const playNotificationSound = () => {
  const audio = new Audio("/notification.mp3");
  audio.play();
};

// --------------------------
// CONTEXT
// --------------------------
const BookingContext = createContext<BookingContextType | null>(null);
export const useBookings = () => useContext(BookingContext)!;

// --------------------------
// PROVIDER
// --------------------------
export const BookingProvider: React.FC<{ children: any }> = ({ children }) => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  // Dynamic ownerId - get from localStorage without static fallback
  const getOwnerId = (): string | null => {
    let ownerId = localStorage.getItem("ownerId");
    const isValidMongoId = (id: string | null) => id && /^[a-f0-9]{24}$/i.test(id);

    if (isValidMongoId(ownerId)) return ownerId;

    const userId = localStorage.getItem("userId");
    if (isValidMongoId(userId)) return userId;

    try {
      const userProfile = localStorage.getItem("userProfile");
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        if (isValidMongoId(profile.userId)) return profile.userId;
        if (isValidMongoId(profile._id)) return profile._id;
      }
    } catch (e) {}

    return ownerId;
  };

  const ownerId = getOwnerId();
  const authToken = localStorage.getItem("authToken");

  // ----------------------------
  // REAL-TIME SOCKET SETUP
  // ----------------------------
  useEffect(() => {
    if (!authToken) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      auth: { token: authToken },
    });

    console.log("🔌 Socket connected:", socketRef.current.id);

    // Join owner room
    socketRef.current.emit("join_owner_room", ownerId);

    // Listen for booking event
    socketRef.current.on("newBooking", (booking: Booking) => {
      console.log("🔥 REAL-TIME BOOKING RECEIVED:", booking);

      playNotificationSound();
      setCurrentBooking(booking);
      setShowPopup(true);

      // add newly received booking to pending state
      setPendingBookings((prev) => [booking, ...prev]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // --------------------------
  // ACCEPT BOOKING
  // --------------------------
  const acceptBooking = async (bookingId: string) => {
    try {
      await fetch(
        `${API_BASE_URL}/confirmBooking/${bookingId}/Confirmed`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setPendingBookings((prev) =>
        prev.filter((b) => b._id !== bookingId)
      );

      setShowPopup(false);
      setCurrentBooking(null);
    } catch (err) {
      console.log("❌ Accept error:", err);
    }
  };

  // --------------------------
  // REJECT BOOKING
  // --------------------------
  const rejectBooking = async (bookingId: string) => {
    try {
      await fetch(`${API_BASE_URL}/deleteBooking/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setPendingBookings((prev) =>
        prev.filter((b) => b._id !== bookingId)
      );

      setShowPopup(false);
      setCurrentBooking(null);
    } catch (err) {
      console.log("❌ Reject error:", err);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        pendingBookings,
        currentBooking,
        showPopup,
        acceptBooking,
        rejectBooking,
        closePopup: () => setShowPopup(false),
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
