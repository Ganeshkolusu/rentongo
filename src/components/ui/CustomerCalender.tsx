import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from "lucide-react";
import CalendarGrid from "./CustomerCalendar/CalendarGrid";
import BookingSummary from "./CustomerCalendar/BookingSummary";
import TimeSelector from "./CustomerCalendar/TimeSelector";
import Legend from "./CustomerCalendar/Legend";
import BookingModal from "./CustomerCalendar/BookingModal";
import MyBookingsModal from "./CustomerCalendar/MyBookingsModal";
import MessageDisplay from "./CustomerCalendar/MessageDisplay";
import { useNotificationStore } from "../../store/notification.store";
import { useBookingModalStore } from "../../store/booking-modal.store";
import { API_BASE_URL, authHeader } from "../../services/api.service";

interface CustomerCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  VechileId: string;
  vechileType: string;
  userId: string;
  ownerId?: string;
  pricePerDay?: number;
  pricePerKm?: number;
  pricePerHour?: number;
  driverAvailable?: boolean;
  driverFee?: number;
  vehicleName?: string;
  latitude?: string;
  longitude?: string;
  contactNumber?: string;
  contactName?: string;
  onBookingComplete?: (booking: any) => void;
}

const API_BASE = API_BASE_URL;

export default function CustomerCalendar({
  isOpen,
  onClose,
  userRole,
  VechileId,
  vechileType,
  userId,
  latitude = "17.438095",
  longitude = "78.4485",
  ownerId: propOwnerId,
  pricePerDay = 0,
  pricePerKm = 0,
  pricePerHour = 0,
  driverAvailable = false,
  driverFee = 0,
  vehicleName = "Vehicle",
  contactNumber: propContactNumber,
  contactName: propContactName,
  onBookingComplete
}: CustomerCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("18:00");
  const [withDriver, setWithDriver] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [loading, setLoading] = useState(false);

  const [ownerBlockedDates, setOwnerBlockedDates] = useState<string[]>([]);
  const [confirmedBookedDates, setConfirmedBookedDates] = useState<string[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addNotification } = useNotificationStore();

  const showCustomerNotification = (title: string, message: string, type: 'booking_confirmed' | 'booking_declined' | 'general' = 'general') => {
    console.log("🔔 Adding notification to store:", title, message);
    addNotification({
      type,
      title,
      message,
      vehicleId: VechileId,
      vehicleName: vehicleName,
      bookingId: activeBookingId || undefined
    });
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // ✅ UPDATED: Differentiate by slot.type
  const fetchOwnerBlocks = React.useCallback(async () => {
    try {
      setLoading(true);
      const startDate = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
      const endDate = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));

      const response = await fetch(
        `${API_BASE}/getVehicleAvailability?VechileId=${VechileId}&vechileType=${vechileType}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();

      console.log("=== AVAILABILITY API Response ===", JSON.stringify(data, null, 2));

      if (data && Array.isArray(data.availability)) {
        const ownerBlockedDates: string[] = [];
        const customerBookedDates: string[] = [];

        data.availability.forEach((item: any) => {
          // Only process dates that are marked as Unavailable
          if (item.status === "Unavailable" && Array.isArray(item.slots)) {

            // Check the type of each slot to determine the color
            const hasNotAvailable = item.slots.some((slot: any) => slot.type === "NotAvailable");
            const hasBooking = item.slots.some((slot: any) => slot.type === "Booking");

            if (hasNotAvailable && hasBooking) {
              // If BOTH types exist on same date, prioritize showing as Booking (GREEN)
              customerBookedDates.push(item.date);
              console.log(`🟢 Customer booked (with owner block): ${item.date}`);
            } else if (hasBooking) {
              // 🟢 GREEN - Customer booking only
              customerBookedDates.push(item.date);
              console.log(`🟢 Customer booked: ${item.date}`);
            } else if (hasNotAvailable) {
              // 🔴 RED - Owner manually blocked only
              ownerBlockedDates.push(item.date);
              console.log(`🔴 Owner blocked: ${item.date}`);
            }
          }
        });

        setOwnerBlockedDates(ownerBlockedDates);
        setConfirmedBookedDates(customerBookedDates);

        console.log("📊 Summary:");
        console.log("  - Owner blocked dates (RED):", ownerBlockedDates.length);
        console.log("  - Customer booked dates (GREEN):", customerBookedDates.length);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      showMsg("error", "Failed to load availability");
    } finally {
      setLoading(false);
    }
  }, [currentMonth, VechileId, vechileType]);

  const fetchBookings = React.useCallback(async () => {
    try {
      setLoading(true);

      const activeBookingIdLocal = localStorage.getItem("activeBookingId") || "";

      if (!activeBookingIdLocal) {
        console.log("⚠ No active booking ID in localStorage");
        setMyBookings([]);
        return;
      }

      const response = await fetch(`${API_BASE}/getBookingById/${activeBookingIdLocal}`, {
        headers: { ...authHeader() },
      });
      const data = await response.json();

      console.log("=== MY BOOKINGS API Response ===", JSON.stringify(data, null, 2));

      if (!data || !data.booking) {
        console.warn("⚠ No booking data returned from server.");
        setMyBookings([]);
        return;
      }

      const bookings = Array.isArray(data.booking) ? data.booking : [data.booking];
      const myBookingsList: any[] = [];

      bookings.forEach((item: any) => {
        const isConfirmed = item.status?.toLowerCase() === "confirmed" ||
          item.bookingStatus?.toLowerCase() === "confirmed";

        myBookingsList.push({
          id: item._id,
          from: (item.FromDate || item.from)?.split("T")[0],
          to: (item.ToDate || item.to)?.split("T")[0],
          fromTime: item.FromTime || item.fromTime || "06:00",
          toTime: item.ToTime || item.toTime || "18:00",
          customerId: item.customerId || item.userId,
          status: item.status || item.bookingStatus,
          isConfirmed
        });
      });

      setMyBookings(myBookingsList.filter(b => b.customerId === userId));

    } catch (error) {
      console.error("Error fetching bookings:", error);
      showMsg("error", "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && VechileId && vechileType) {
      fetchOwnerBlocks();
      fetchBookings();
    }
  }, [isOpen, VechileId, vechileType, fetchOwnerBlocks, fetchBookings]);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDateForAPI = (date: Date): string => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}-${m}-${d}`;
  };

  const formatTimeForAPI = (time: string): string => {
    const [hours, minutes] = time.split(":");
    return `${parseInt(hours)}.${minutes}`;
  };

  const formatDisplay = (date: Date | null): string => {
    if (!date) return "Select";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isOwnerBlocked = (date: Date) => ownerBlockedDates.includes(formatDate(date));
  const isConfirmedBooking = (date: Date) => confirmedBookedDates.includes(formatDate(date));
  const isUnavailable = (date: Date) => isOwnerBlocked(date) || isConfirmedBooking(date);

  const showMsg = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleDateClick = (date: Date) => {
    if (isPast(date)) return;

    if (isUnavailable(date)) {
      if (isConfirmedBooking(date)) {
        showMsg("error", "❌ This date is already booked by another customer");
      } else if (isOwnerBlocked(date)) {
        showMsg("error", "❌ Owner has blocked this date");
      } else {
        showMsg("error", "❌ This date is unavailable");
      }
      return;
    }

    if (!selectedStart) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else if (!selectedEnd) {
      if (date < selectedStart) {
        showMsg("error", "End date must be after start");
        return;
      }
      const curr = new Date(selectedStart);
      while (curr <= date) {
        if (isUnavailable(curr)) {
          showMsg("error", "Some dates in range are unavailable");
          return;
        }
        curr.setDate(curr.getDate() + 1);
      }
      setSelectedEnd(date);
    } else {
      setSelectedStart(date);
      setSelectedEnd(null);
    }
  };

  const calculateTotalHours = (): number => {
    if (!selectedStart || !selectedEnd) return 0;

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const start = new Date(selectedStart);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(selectedEnd);
    end.setHours(endH, endM, 0, 0);

    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    return diffHours > 0 ? diffHours : 1;
  };

  const calculateTotalDays = (): number => {
    if (!selectedStart || !selectedEnd) return 0;
    const diffTime = Math.abs(selectedEnd.getTime() - selectedStart.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Base rental price only (no driver fee) — used for both the hourly and
  // daily estimate so shortening the selected hours actually lowers the
  // price instead of always charging the flat per-day rate.
  const calculateBasePrice = (): number => {
    if (!selectedStart || !selectedEnd) return 0;

    const totalHours = calculateTotalHours();
    const hourlyTotal = pricePerHour > 0 ? totalHours * pricePerHour : null;
    const dailyTotal = pricePerDay > 0 ? calculateTotalDays() * pricePerDay : null;

    // If both rates exist, charge whichever is cheaper for the selected
    // window — a short window is billed hourly, a near-full-day window
    // never exceeds the flat day rate.
    if (hourlyTotal !== null && dailyTotal !== null) {
      return Math.min(hourlyTotal, dailyTotal);
    }
    return hourlyTotal ?? dailyTotal ?? 0;
  };

  // The owner's driver fee is a per-day rate, charged once for each day of
  // the trip (a 3-day booking with a driver costs 3x the per-day fee).
  const calculateDriverTotal = (): number => {
    if (!driverAvailable || !withDriver) return 0;
    return driverFee * calculateTotalDays();
  };

  const calculateTotalPrice = (): number => {
    const base = calculateBasePrice();
    if (!base) return 0;
    return base + calculateDriverTotal();
  };

  const handleCustomerBook = () => {
    if (!selectedStart || !selectedEnd) {
      alert("Please select start and end dates first!");
      return;
    }

    setShowBookingModal(false);
    setTimeout(() => {
      performBooking();
    }, 100);
  };

  const performBooking = async () => {
    if (!selectedStart || !selectedEnd) return;

    try {
      setLoading(true);

      let contactNumber = propContactNumber || localStorage.getItem("contactNumber") || "";

      if (!contactNumber) {
        try {
          const userProfile = localStorage.getItem("userProfile");
          if (userProfile) {
            const profile = JSON.parse(userProfile);
            contactNumber = profile.phone || profile.contactNumber || profile.mobileNumber || "";
          }
        } catch (e) {
          console.log("Could not parse userProfile");
        }
      }

      if (!contactNumber) {
        try {
          const user = localStorage.getItem("user");
          if (user) {
            const userData = JSON.parse(user);
            contactNumber = userData.phone || userData.contactNumber || userData.mobileNumber || "";
          }
        } catch (e) {
          console.log("Could not parse user");
        }
      }

      if (!contactNumber) {
        console.warn("⚠ No contact number found - will prompt user");
        const userPhone = prompt("Please enter your contact number to complete the booking:");
        if (userPhone && userPhone.trim()) {
          contactNumber = userPhone.trim();
          localStorage.setItem("contactNumber", contactNumber);
        }
      }

      const contactName = propContactName || localStorage.getItem("userName") || localStorage.getItem("contactName") || "";
      const ownerId = propOwnerId || localStorage.getItem("vehicleOwnerId") || "";

      const totalHours = calculateTotalHours();
      const totalPrice = calculateTotalPrice();

      const formData = new URLSearchParams();
      formData.append("userId", userId);
      formData.append("vechileType", vechileType);
      formData.append("VechileId", VechileId);

      if (ownerId) {
        formData.append("ownerId", ownerId);
      }

      formData.append("pricePerKm", String(pricePerKm || pricePerDay || 0));
      formData.append("contactNumber", contactNumber);
      formData.append("contactName", contactName);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("FromDate", formatDateForAPI(selectedStart));
      formData.append("ToDate", formatDateForAPI(selectedEnd));
      formData.append("FromTime", formatTimeForAPI(startTime));
      formData.append("ToTime", formatTimeForAPI(endTime));
      formData.append("totalHours", String(totalHours));
      formData.append("totalPrice", String(totalPrice));

      if (driverAvailable && withDriver) {
        formData.append("withDriver", "true");
        formData.append("driverFee", String(driverFee));
      }

      const response = await fetch(`${API_BASE}/createBooking`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", ...authHeader() },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        const bookingId = data.booking?._id || data._id || data.bookingId;

        if (bookingId) {
          localStorage.setItem("activeBookingId", bookingId);
          setActiveBookingId(bookingId);

          useBookingModalStore.getState().showCustomerWaitingPopup(bookingId, vehicleName);

          showCustomerNotification(
            "Booking Request Sent!",
            `Your booking request for ${vehicleName} has been sent to the owner. Waiting for response...`
          );

          setTimeout(() => {
            startPolling(bookingId);
          }, 10000);
        } else {
          showMsg("error", "Booking created but no ID received");
          return;
        }

        showMsg("success", "Booking request sent!");
        setSelectedStart(null);
        setSelectedEnd(null);

        if (onBookingComplete) {
          onBookingComplete(data);
        }
      } else {
        const errorMsg = data.message || "Please try again";
        showCustomerNotification("Booking Failed", errorMsg);
        showMsg("error", errorMsg);
      }
    } catch (error: any) {
      showCustomerNotification(
        "Booking Failed",
        "Network error - Please check your connection"
      );
      showMsg("error", "Network error - Please try again");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (bookingId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/getBookingById/${bookingId}`, {
          headers: { ...authHeader() },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const status = data.booking?.status || data.status || "";

        if (status.toLowerCase() === "confirmed") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          useBookingModalStore.getState().showCustomerAcceptedModal(vehicleName);

          showCustomerNotification(
            "Booking Confirmed!",
            `Your booking for ${vehicleName} has been accepted by the owner.`,
            'booking_confirmed'
          );

          await fetchBookings();
          await fetchOwnerBlocks();

          setTimeout(() => {
            setActiveBookingId(null);
          }, 1500);

        } else if (status.toLowerCase() === "cancelled" || status.toLowerCase() === "autocancelled" || status.toLowerCase() === "rejected") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          if (status.toLowerCase() === "autocancelled") {
            useBookingModalStore.getState().showCustomerTimeoutModal(vehicleName);
          } else {
            useBookingModalStore.getState().showCustomerRejectedModal(vehicleName);
          }

          showCustomerNotification(
            "Booking Rejected",
            `Your booking for ${vehicleName} was declined by the owner.`,
            'booking_declined'
          );

          await fetchBookings();
          await fetchOwnerBlocks();

          setTimeout(() => {
            setActiveBookingId(null);
          }, 1500);
        }
      } catch (error) {
        console.error("❌ Polling error:", error);
      }
    }, 5000);
  };

  const handleCancelBooking = async (booking: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/deleteBooking/${booking.id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });

      if (response.ok) {
        showMsg("success", "Booking cancelled");
        await fetchBookings();
        await fetchOwnerBlocks();
      } else {
        showMsg("error", "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      showMsg("error", "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < offset; i++) days.push(<div key={`e${i}`} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const past = isPast(date);
      const ownerBlocked = isOwnerBlocked(date);
      const confirmedBooked = isConfirmedBooking(date);
      const unavailable = isUnavailable(date);
      const isSelectedStart = selectedStart && formatDate(selectedStart) === formatDate(date);
      const isSelectedEnd = selectedEnd && formatDate(selectedEnd) === formatDate(date);
      const isInRange = selectedStart && selectedEnd && date > selectedStart && date < selectedEnd;

      let cls = "h-10 sm:h-12 rounded-lg font-medium flex items-center justify-center relative transition text-sm ";

      if (past) {
        cls += "bg-gray-100 text-gray-400 cursor-not-allowed";
      } else if (confirmedBooked) {
        // 🟢 GREEN - Customer already booked (check this FIRST for priority)
        cls += "bg-green-100 border-2 border-green-400 text-green-700 cursor-not-allowed";
      } else if (ownerBlocked) {
        // 🔴 RED - Owner manually blocked
        cls += "bg-red-100 border-2 border-red-400 text-red-700 cursor-not-allowed";
      } else if (isSelectedStart || isSelectedEnd) {
        cls += "bg-black text-white border-2 border-blue-700";
      } else if (isInRange) {
        cls += "bg-blue-200 text-blue-800";
      } else {
        cls += "bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:opacity-90 cursor-pointer";
      }

      days.push(
        <button key={d} className={cls} disabled={past || unavailable} onClick={() => handleDateClick(date)}>
          {d}
          {confirmedBooked && (
            <span
              className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
              title="Already booked"
            />
          )}
          {ownerBlocked && !confirmedBooked && (
            <span
              className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
              title="Owner blocked"
            />
          )}
        </button>
      );
    }
    return days;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-200 z-10">
            <X size={20} />
          </button>

          {loading && (
            <div className="absolute top-3 left-3 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 z-10">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-sm">Loading...</span>
            </div>
          )}

          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={24} />
              <div>
                <h2 className="font-bold text-lg">Book {vehicleName}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Customer</span>
              </div>
            </div>
            {myBookings.length > 0 && (
              <button onClick={() => setShowMyBookings(true)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                My Bookings ({myBookings.length})
              </button>
            )}
          </div>

          <MessageDisplay type={message.type} text={message.text} />

          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-semibold">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
                <div key={d} className="text-center font-medium text-gray-500 text-xs py-1">{d}</div>
              ))}
            </div>

            <CalendarGrid days={renderCalendar()} />

            <Legend />

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <BookingSummary
                  selectedStart={selectedStart}
                  selectedEnd={selectedEnd}
                  totalHours={calculateTotalHours()}
                  totalPrice={calculateTotalPrice()}
                  formatDisplay={formatDisplay}
                  driverAvailable={driverAvailable}
                  driverFee={driverFee}
                  totalDays={calculateTotalDays()}
                  basePrice={calculateBasePrice()}
                  withDriver={withDriver}
                  onWithDriverChange={setWithDriver}
                />
                <TimeSelector
                  startTime={startTime}
                  endTime={endTime}
                  setStartTime={setStartTime}
                  setEndTime={setEndTime}
                />
              </div>

              <button onClick={handleCustomerBook} disabled={!selectedStart || !selectedEnd || loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition flex items-center justify-center gap-2">
                <ShoppingCart size={18} /> Book Now
              </button>
            </div>
          </div>

          <BookingModal
            show={showBookingModal}
            loading={loading}
            vehicleName={vehicleName}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            startTime={startTime}
            endTime={endTime}
            totalHours={calculateTotalHours()}
            totalPrice={calculateTotalPrice()}
            formatDisplay={formatDisplay}
            onConfirm={handleCustomerBook}
            onCancel={() => setShowBookingModal(false)}
          />

          <MyBookingsModal
            show={showMyBookings}
            bookings={myBookings}
            loading={loading}
            onCancelBooking={handleCancelBooking}
            onClose={() => setShowMyBookings(false)}
          />
        </div>
      </div>
    </>
  );
}