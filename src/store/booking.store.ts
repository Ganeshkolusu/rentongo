
// ==================== FILE 1: booking.store.ts ====================
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ==================== TYPE DEFINITIONS ====================

/**
 * All possible booking statuses in the system
 */
export type BookingStatus =
  | "Pending"       // Customer booked, waiting for owner approval
  | "Confirmed"     // Owner accepted the booking
  | "Cancelled"     // Owner rejected the booking
  | "AutoCancelled" // System auto-cancelled (owner didn't respond)
  | "Completed";    // Ride/rental completed

/**
 * Booking interface - represents a single booking in the system
 */
export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  vehicleType: "Car" | "Auto" | "Bike";
  customerName: string;
  contactNumber: string;
  bookingDate: string;
  bookingTime: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  modelNo: string;
  status: BookingStatus;
  price: number;
  priceUnit?: string;
  rejectionReason?: string; // Reason provided by owner when rejecting
}

/**
 * Zustand store interface
 */
interface BookingStore {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  deleteBooking: (id: string) => void;
  getBookingById: (id: string) => Booking | undefined;
  clearAllBookings: () => void;
  setBookings: (bookings: Booking[]) => void;
}

// ==================== ZUSTAND STORE ====================

/**
 * Main booking store with localStorage persistence
 */
export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      bookings: [],

      /**
       * Add a new booking (avoids duplicates)
       */
      addBooking: (booking) =>
        set((state) => {
          const exists = state.bookings.some((b) => b.id === booking.id);
          if (exists) {
            console.log("⚠️ Booking already exists, skipping:", booking.id);
            return state;
          }
          console.log("✅ Adding new booking:", booking.id);
          return { bookings: [...state.bookings, booking] };
        }),

      /**
       * Update booking details
       */
      updateBooking: (id, updates) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id ? { ...booking, ...updates } : booking
          ),
        })),

      /**
       * Update booking status only
       */
      updateBookingStatus: (id, status) =>
        set((state) => {
          console.log(`📝 Updating booking ${id} status to: ${status}`);
          return {
            bookings: state.bookings.map((booking) =>
              booking.id === id ? { ...booking, status } : booking
            ),
          };
        }),

      /**
       * Delete a booking
       */
      deleteBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.filter((booking) => booking.id !== id),
        })),

      /**
       * Get booking by ID
       */
      getBookingById: (id) => get().bookings.find((booking) => booking.id === id),

      /**
       * Clear all stored bookings
       */
      clearAllBookings: () =>
        set(() => ({
          bookings: [],
        })),

      /**
       * Replace all bookings with new data (for API sync)
       */
      setBookings: (bookings) =>
        set(() => {
          console.log(`📦 Syncing ${bookings.length} bookings from API`);
          return { bookings };
        }),
    }),
    {
      name: "booking-storage", // localStorage key
      version: 2, // Increment this when schema changes
    }
  )
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Maps API status strings to frontend BookingStatus enum
 * Handles case-insensitive matching and unknown statuses
 * 
 * @param apiStatus - Status string from API
 * @returns Typed BookingStatus enum value
 * 
 * @example
 * mapApiStatus("pending") // returns "Pending"
 * mapApiStatus("CONFIRMED") // returns "Confirmed"
 * mapApiStatus("unknown") // returns "Pending" (default)
 */
export const mapApiStatus = (apiStatus?: string): BookingStatus => {
  if (!apiStatus) return "Pending";

  const status = apiStatus.toLowerCase().trim();

  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "cancelled":
      return "Cancelled";
    case "autocancelled":
      return "AutoCancelled";
    case "completed":
      return "Completed";
    default:
      console.warn(`⚠️ Unknown status received: "${apiStatus}", defaulting to Pending`);
      return "Pending";
  }
};

/**
 * Get user-friendly status message
 * 
 * @param status - BookingStatus enum value
 * @returns Human-readable status message
 */
export const getStatusMessage = (status: BookingStatus): string => {
  switch (status) {
    case "Pending":
      return "Pending approval from owner";
    case "Confirmed":
      return "Booking confirmed by owner";
    case "Cancelled":
      return "Booking rejected by owner";
    case "AutoCancelled":
      return "Booking automatically cancelled";
    case "Completed":
      return "Ride completed successfully";
    default:
      return "Unknown status";
  }
};

/**
 * Get Tailwind CSS classes for status badge styling
 * 
 * @param status - BookingStatus enum value
 * @returns Tailwind CSS class string
 */
export const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case "Pending":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "Confirmed":
      return "bg-green-50 text-green-700 border border-green-200";
    case "Cancelled":
      return "bg-red-50 text-red-600 border border-red-200";
    case "AutoCancelled":
      return "bg-orange-50 text-orange-700 border border-orange-200";
    case "Completed":
      return "bg-purple-50 text-purple-700 border border-purple-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

/**
 * Determines if a status change should trigger a popup notification
 * Only shows popups for terminal states (Cancelled, AutoCancelled, Completed)
 * 
 * @param oldStatus - Previous booking status
 * @param newStatus - New booking status
 * @returns true if popup should be shown
 */
export const shouldShowPopup = (
  oldStatus: BookingStatus | undefined,
  newStatus: BookingStatus
): boolean => {
  // Don't show popup if status hasn't changed
  if (oldStatus === newStatus) return false;

  // Only show popup for terminal states or rejections
  return (
    newStatus === "Cancelled" ||
    newStatus === "AutoCancelled" ||
    newStatus === "Completed"
  );
};

/**
 * Map vehicle type string to typed value
 * Handles various input formats (case-insensitive)
 * 
 * @param type - Vehicle type string from API
 * @returns Typed vehicle type
 */
export const mapVehicleType = (type: string | undefined): "Car" | "Auto" | "Bike" => {
  if (!type) return "Car";
  const lower = type.toLowerCase();
  if (lower.includes("auto")) return "Auto";
  if (lower.includes("bike")) return "Bike";
  return "Car";
};

/**
 * Format API date string to readable DD/MM/YYYY format
 * 
 * @param dateStr - ISO date string from API
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatApiDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr.trim());
    return !isNaN(date.getTime())
      ? date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      : dateStr;
  } catch {
    return dateStr;
  }
};

/**
 * Format API time string from HH.MM to 12-hour format (HH:MM AM/PM)
 * 
 * @param timeStr - Time string in HH.MM format from API
 * @returns Formatted time string (HH:MM AM/PM)
 * 
 * @example
 * formatApiTime("14.30") // returns "02:30 PM"
 * formatApiTime("09.15") // returns "09:15 AM"
 */
export const formatApiTime = (timeStr: string): string => {
  try {
    const [hours, minutes] = timeStr.split(".");
    const hour = parseInt(hours);
    const min = minutes || "00";
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour.toString().padStart(2, "0")}:${min} ${period}`;
  } catch {
    return timeStr;
  }
};

/**
 * Get icon component for booking status
 * Returns SVG path data for status icons
 * 
 * @param status - BookingStatus enum value
 * @returns SVG path string
 */
export const getStatusIcon = (status: BookingStatus): string => {
  switch (status) {
    case "Pending":
      return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z";
    case "Confirmed":
      return "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z";
    case "Cancelled":
      return "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";
    case "AutoCancelled":
      return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z";
    case "Completed":
      return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z";
    default:
      return "";
  }
};

// ==================== BOOKING STATISTICS ====================

/**
 * Calculate booking statistics from a list of bookings
 * Useful for dashboard displays
 * 
 * @param bookings - Array of bookings
 * @returns Statistics object with counts for each status
 */
export const getBookingStats = (bookings: Booking[]) => {
  return {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    confirmed: bookings.filter((b) => b.status === "Confirmed").length,
    cancelled: bookings.filter((b) => b.status === "Cancelled").length,
    autoCancelled: bookings.filter((b) => b.status === "AutoCancelled").length,
    completed: bookings.filter((b) => b.status === "Completed").length,
  };
};

/**
 * Filter bookings by status
 * 
 * @param bookings - Array of bookings
 * @param status - Status to filter by
 * @returns Filtered array of bookings
 */
export const filterBookingsByStatus = (
  bookings: Booking[],
  status: BookingStatus
): Booking[] => {
  return bookings.filter((b) => b.status === status);
};

/**
 * Sort bookings by date (newest first)
 * 
 * @param bookings - Array of bookings
 * @returns Sorted array of bookings
 */
export const sortBookingsByDate = (bookings: Booking[]): Booking[] => {
  return [...bookings].sort((a, b) => {
    const dateA = new Date(a.bookingDate).getTime();
    const dateB = new Date(b.bookingDate).getTime();
    return dateB - dateA; // Newest first
  });
};

// ==================== VALIDATION HELPERS ====================

/**
 * Validate if a booking can be cancelled
 * 
 * @param booking - Booking object
 * @returns true if booking can be cancelled
 */
export const canCancelBooking = (booking: Booking): boolean => {
  return booking.status === "Pending" || booking.status === "Confirmed";
};

/**
 * Validate if a booking can be edited
 * 
 * @param booking - Booking object
 * @returns true if booking can be edited
 */
export const canEditBooking = (booking: Booking): boolean => {
  return booking.status === "Pending";
};

/**
 * Check if booking is in terminal state (cannot be changed)
 * 
 * @param booking - Booking object
 * @returns true if booking is in terminal state
 */
export const isTerminalStatus = (booking: Booking): boolean => {
  return (
    booking.status === "Cancelled" ||
    booking.status === "AutoCancelled" ||
    booking.status === "Completed"
  );
};