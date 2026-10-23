import React, { useState, useEffect } from "react";
import { X, Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "../../services/api.service";



const bookingAPI = {

  getVehicleAvailability: async (vehicleId, vehicleType) => {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📡 FETCHING VEHICLE AVAILABILITY (Customer Calendar)");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🚗 Vehicle ID:", vehicleId);
      console.log("🏷️ Vehicle Type:", vehicleType);

      const url = `${API_BASE_URL}/getVehicleAvailability?vechileType=${vehicleType}&VechileId=${vehicleId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.success || !data.availability) {
        console.log("⚠️ No availability data found");
        return { 
          allUnavailableDates: [], 
          ownerBlockedDates: [], 
          customerBookedDates: [] 
        };
      }

      console.log("✅ Raw API Response:", data);

      // Extract ALL unavailable dates (Owner blocked + Customer booked)
      const allUnavailableDates = data.availability
        .filter((item) => item.status === "Unavailable")
        .map((item) => item.date);

      // Separate owner blocked dates
      const ownerBlockedDates = data.availability
        .filter((item) => item.status === "Unavailable" && !item.isCustomerBooking)
        .map((item) => item.date);

      // Separate customer booked dates
      const customerBookedDates = data.availability
        .filter((item) => item.status === "Unavailable" && item.isCustomerBooking === true)
        .map((item) => item.date);

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📊 AVAILABILITY SUMMARY (Customer Calendar)");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔒 Total Unavailable Dates:", allUnavailableDates.length);
      console.log("   All Unavailable:", allUnavailableDates);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("👤 Owner Blocked Dates:", ownerBlockedDates.length);
      console.log("   Owner Dates:", ownerBlockedDates);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🧑 Customer Booked Dates:", customerBookedDates.length);
      console.log("   Customer Dates:", customerBookedDates);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return { 
        allUnavailableDates, 
        ownerBlockedDates, 
        customerBookedDates 
      };

    } catch (error) {
      console.error("❌ API error:", error);
      return { 
        allUnavailableDates: [], 
        ownerBlockedDates: [], 
        customerBookedDates: [] 
      };
    }
  },

  /**
   * Create a new booking (this will automatically block dates)
   */
  createBooking: async (payload) => {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📤 CREATING BOOKING FROM CUSTOMER CALENDAR");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📋 Booking Payload:", payload);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      const urlencoded = new URLSearchParams();
      urlencoded.append("userId", payload.userId || "customer_default");
      urlencoded.append("vechileType", payload.vehicleType);
      urlencoded.append("VechileId", payload.vehicleId);
      urlencoded.append("fromDate", payload.startDate);
      urlencoded.append("toDate", payload.endDate);
      urlencoded.append("fromTime", payload.startTime.replace(":", "."));
      urlencoded.append("toTime", payload.endTime.replace(":", "."));
      urlencoded.append("isNotAvailable", "true");
      urlencoded.append("bikeImages", "");
      urlencoded.append("isCustomerBooking", "true"); // 🔥 Mark as customer booking

      console.log("📤 Request Body:", Object.fromEntries(urlencoded));

      const response = await fetch(`${API_BASE_URL}/createNotAvailability`, {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded
      });
      
      const data = await response.json();
      
      console.log("✅ Booking API Response:", data);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🎉 BOOKING CREATED & DATES BLOCKED!");
      console.log("📅 From:", payload.startDate, "To:", payload.endDate);
      console.log("⏰ Time:", payload.startTime, "-", payload.endTime);
      console.log("🔒 These dates are now BLOCKED for:");
      console.log("   ✅ Owner Calendar");
      console.log("   ✅ All Customer Calendars");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return { success: response.ok, data };
    } catch (error) {
      console.error("❌ Booking API error:", error);
      return { success: false, error: error.message };
    }
  }
};

// ==========================================
// BOOKING CONFIRMATION POPUP
// ==========================================

const BookingConfirmationPopup = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  bookingDetails,
  vehicleDetails 
}) => {
  if (!isOpen) return null;

  const { startDate, endDate, startTime, endTime, totalDays, totalPrice } = bookingDetails;
  const { vehicleName, vehicleType, pricePerDay } = vehicleDetails;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Confirm Booking</h2>
              <p className="text-blue-100 text-sm">Review your rental details</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Vehicle Details</h3>
            <p className="text-lg font-bold text-gray-900">{vehicleName}</p>
            <p className="text-sm text-gray-600">Type: {vehicleType}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="text-blue-600 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Pickup Date</p>
                <p className="font-semibold text-gray-900">{startDate}</p>
                <p className="text-sm text-gray-500">Time: {startTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-blue-600 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Return Date</p>
                <p className="font-semibold text-gray-900">{endDate}</p>
                <p className="text-sm text-gray-500">Time: {endTime}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rate per day</span>
              <span className="font-semibold">₹{pricePerDay}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total days</span>
              <span className="font-semibold">{totalDays} days</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total Amount</span>
              <span className="text-blue-600">₹{totalPrice}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
            <p className="text-xs text-amber-800">
              These dates will be blocked for all other customers once confirmed.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CUSTOMER BOOKING CALENDAR
// ==========================================

const CustomerBookingCalendar = ({
  isOpen = true,
  onClose = () => {},
  onConfirm,
  
  // Props
  vehicleId = localStorage.getItem("vehicleId") || "V001",
  vehicleType = localStorage.getItem("vehicletype") || "Car",
  vehicleName = "Vehicle",
  pricePerDay = 1500,
  userId = localStorage.getItem("userId") || "customer_default"
}) => {

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [activeInput, setActiveInput] = useState("start");

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // 🔥 NEW: Separate tracking for different types of blocked dates
  const [allUnavailableDates, setAllUnavailableDates] = useState([]);
  const [ownerBlockedDates, setOwnerBlockedDates] = useState([]);
  const [customerBookedDates, setCustomerBookedDates] = useState([]);

  // Auto-refresh interval
  const [refreshInterval, setRefreshInterval] = useState(null);

  // ==============================
  // LOAD BLOCKED DATES FROM API
  // ==============================

  useEffect(() => {
    if (isOpen) {
      console.log("📅 Customer Calendar Opened - Loading blocked dates...");
      loadBlockedDates();
      
      // Auto-refresh every 30 seconds to sync with backend
      const interval = setInterval(() => {
        console.log("🔄 Auto-refresh: Loading blocked dates...");
        loadBlockedDates();
      }, 30000);
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
        console.log("🛑 Customer Calendar Closed - Stopped auto-refresh");
      };
    } else {
      if (refreshInterval) clearInterval(refreshInterval);
    }
  }, [isOpen, vehicleId, vehicleType]);

  const loadBlockedDates = async () => {
    setLoading(true);
    try {
      const { 
        allUnavailableDates, 
        ownerBlockedDates, 
        customerBookedDates 
      } = await bookingAPI.getVehicleAvailability(vehicleId, vehicleType);
      
      setAllUnavailableDates(allUnavailableDates || []);
      setOwnerBlockedDates(ownerBlockedDates || []);
      setCustomerBookedDates(customerBookedDates || []);

      console.log("🎯 State Updated in Customer Calendar:");
      console.log("   All Unavailable:", allUnavailableDates?.length || 0);
      console.log("   Owner Blocked:", ownerBlockedDates?.length || 0);
      console.log("   Customer Booked:", customerBookedDates?.length || 0);

    } catch (error) {
      console.error("Failed to load blocked dates:", error);
      showMessage("Failed to load availability", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // DATE UTILITIES
  // ==============================

  const formatDateAPI = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const formatDisplay = (date) => {
    if (!date) return "Select Date";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // 🔥 Check if date is blocked (ANY unavailable date)
  const isDateBlocked = (date) => {
    const formatted = formatDateAPI(date);
    return allUnavailableDates.includes(formatted);
  };

  // 🔥 Check if date is owner blocked specifically
  const isOwnerBlocked = (date) => {
    const formatted = formatDateAPI(date);
    return ownerBlockedDates.includes(formatted);
  };

  // 🔥 Check if date is customer booked specifically
  const isCustomerBooked = (date) => {
    const formatted = formatDateAPI(date);
    return customerBookedDates.includes(formatted);
  };

  const isSelected = (date) =>
    selectedStartDate?.getTime() === date.getTime() ||
    selectedEndDate?.getTime() === date.getTime();

  const isInRange = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isAnyDateInRangeBlocked = (start, end) => {
    const cur = new Date(start);
    while (cur <= end) {
      if (isDateBlocked(cur)) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  // ==============================
  // DATE SELECTION
  // ==============================

  const handleDateClick = (date) => {
    if (isPastDate(date)) {
      showMessage("⚠️ Cannot select past dates", "error");
      return;
    }

    if (isDateBlocked(date)) {
      if (isOwnerBlocked(date)) {
        showMessage("⚠️ This date is blocked by the owner", "error");
        console.log("🚫 Attempted to select owner-blocked date:", formatDateAPI(date));
      } else if (isCustomerBooked(date)) {
        showMessage("⚠️ This date is already booked by another customer", "error");
        console.log("🚫 Attempted to select customer-booked date:", formatDateAPI(date));
      } else {
        showMessage("⚠️ This date is unavailable", "error");
      }
      return;
    }

    if (activeInput === "start") {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setActiveInput("end");
      showMessage("✓ Pickup date selected. Now select return date.", "success");
      return;
    }

    if (activeInput === "end") {
      if (!selectedStartDate) {
        showMessage("⚠️ Select pickup date first", "error");
        return;
      }

      if (date < selectedStartDate) {
        showMessage("⚠️ Return date cannot be before pickup", "error");
        return;
      }

      if (isAnyDateInRangeBlocked(selectedStartDate, date)) {
        showMessage("⚠️ Some dates in this range are unavailable", "error");
        return;
      }

      setSelectedEndDate(date);
      setActiveInput(null);
      showMessage("✓ Dates selected successfully!", "success");
    }
  };

  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  // ==============================
  // BOOKING LOGIC
  // ==============================

  const totalDays = () => {
    if (!selectedStartDate || !selectedEndDate) return 0;
    return (
      Math.ceil(
        (selectedEndDate.getTime() - selectedStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const totalPrice = () => totalDays() * pricePerDay;

  const handleProceedToConfirm = () => {
    if (!selectedStartDate || !selectedEndDate) {
      showMessage("⚠️ Please select both dates", "error");
      return;
    }
    setShowConfirmPopup(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    showMessage("Processing booking...", "info");

    const payload = {
      userId,
      vehicleId,
      vehicleType,
      vehicleName,
      startDate: formatDateAPI(selectedStartDate),
      endDate: formatDateAPI(selectedEndDate),
      startTime,
      endTime,
      totalDays: totalDays(),
      totalPrice: totalPrice(),
      pricePerDay
    };

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 CUSTOMER CONFIRMING BOOKING");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Booking Details:", payload);

    // Call custom callback if provided (e.g., from BookNow page)
    if (onConfirm) {
      onConfirm(payload);
      setShowConfirmPopup(false);
      setLoading(false);
      return;
    }

    // Default: Send to API to create booking and block dates
    const result = await bookingAPI.createBooking(payload);

    if (result.success) {
      showMessage("✓ Booking confirmed! Dates blocked for everyone.", "success");
      setShowConfirmPopup(false);
      
      // Reload blocked dates immediately to show the newly booked dates
      console.log("🔄 Reloading blocked dates to show new booking...");
      await loadBlockedDates();
      
      // Reset and close after success
      setTimeout(() => {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setActiveInput("start");
        onClose();
      }, 2000);
    } else {
      showMessage("❌ Booking failed. Please try again.", "error");
    }
    
    setLoading(false);
  };

  // ==============================
  // CALENDAR RENDERING
  // ==============================

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const renderDays = () => {
    const days = [];

    for (let i = 0; i < firstDay; i++)
      days.push(<div key={"e" + i}></div>);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        d
      );

      const past = isPastDate(date);
      const blocked = isDateBlocked(date);
      const ownerBlocked = isOwnerBlocked(date);
      const customerBooked = isCustomerBooked(date);
      const sel = isSelected(date);
      const rang = isInRange(date);

      let cls =
        "relative rounded-lg p-3 text-center transition-all font-semibold duration-200 ";

      if (past) {
        cls += "text-gray-300 bg-gray-50 cursor-not-allowed";
      } else if (blocked) {
        if (customerBooked) {
          // Customer booked dates - orange color
          cls += "bg-orange-100 text-orange-700 line-through cursor-not-allowed relative border-2 border-orange-400";
        } else if (ownerBlocked) {
          // Owner blocked dates - red color
          cls += "bg-red-50 text-red-500 line-through cursor-not-allowed relative border-2 border-red-400";
        } else {
          // Generic blocked
          cls += "bg-red-50 text-red-500 line-through cursor-not-allowed relative";
        }
      } else if (sel) {
        cls += "bg-blue-600 text-white ring-4 ring-blue-300 scale-110 shadow-lg z-10";
      } else if (rang) {
        cls += "bg-blue-100 text-blue-700 shadow-sm";
      } else {
        cls += "hover:bg-blue-50 hover:scale-105 cursor-pointer hover:shadow-md";
      }

      days.push(
        <button
          key={d}
          disabled={past || blocked}
          className={cls}
          onClick={() => handleDateClick(date)}
          title={
            past 
              ? "Past date" 
              : customerBooked 
                ? "Booked by another customer"
                : ownerBlocked 
                  ? "Blocked by owner"
                  : "Available"
          }
        >
          <span className="relative z-10">{d}</span>
          {blocked && (
            <span className="absolute inset-0 flex items-center justify-center">
              <X size={16} className={customerBooked ? "text-orange-500" : "text-red-400"} />
            </span>
          )}
        </button>
      );
    }
    return days;
  };

  // ==============================
  // MAIN RENDER
  // ==============================

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-40 overflow-y-auto">
        <div className="bg-white max-w-5xl w-full rounded-2xl shadow-2xl my-8">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-3">
                  <Calendar size={28} />
                  Book Your {vehicleType}
                </h2>
                <p className="text-blue-100">{vehicleName} • ₹{pricePerDay}/day</p>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div
                className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                  activeInput === "start" 
                    ? "border-blue-500 bg-blue-50 shadow-md" 
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setActiveInput("start")}
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar size={16} />
                  Pickup Date
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatDisplay(selectedStartDate)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={16} className="text-gray-400" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  />
                </div>
              </div>

              <div
                className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                  activeInput === "end" 
                    ? "border-blue-500 bg-blue-50 shadow-md" 
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setActiveInput("end")}
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar size={16} />
                  Return Date
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatDisplay(selectedEndDate)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={16} className="text-gray-400" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  />
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white mb-6 relative">
              {loading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading availability...</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1
                      )
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft size={24} />
                </button>

                <h3 className="text-xl font-bold text-gray-800">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric"
                  })}
                </h3>

                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      )
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-3">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-sm font-bold text-gray-600 p-2"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {renderDays()}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded"></div>
                  <span className="text-gray-600">In Range</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 border-2 border-red-400 rounded relative">
                    <X size={12} className="text-red-400 absolute inset-0 m-auto" />
                  </div>
                  <span className="text-gray-600">Owner Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border-2 border-orange-400 rounded relative">
                    <X size={12} className="text-orange-500 absolute inset-0 m-auto" />
                  </div>
                  <span className="text-gray-600">Customer Booked</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                  <p className="text-xs text-red-600 mb-1">Owner Blocked</p>
                  <p className="text-lg font-bold text-red-700">{ownerBlockedDates.length}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                  <p className="text-xs text-orange-600 mb-1">Customer Booked</p>
                  <p className="text-lg font-bold text-orange-700">{customerBookedDates.length}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                  <p className="text-xs text-green-600 mb-1">Available</p>
                  <p className="text-lg font-bold text-green-700">
                    {daysInMonth - allUnavailableDates.filter(date => {
                      const d = new Date(date);
                      return d.getMonth() === currentMonth.getMonth() && 
                             d.getFullYear() === currentMonth.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${
                  messageType === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : messageType === "error"
                    ? "bg-red-50 border border-red-200 text-red-800"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
                }`}
              >
                {messageType === "success" && <CheckCircle size={20} />}
                {messageType === "error" && <AlertCircle size={20} />}
                <span className="font-medium">{message}</span>
              </div>
            )}

            {/* Summary */}
            {selectedStartDate && selectedEndDate && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-4 border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-3">Booking Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Days</p>
                    <p className="text-lg font-bold text-gray-900">{totalDays()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rate/Day</p>
                    <p className="text-lg font-bold text-gray-900">₹{pricePerDay}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">₹{totalPrice()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Button */}
            <button
              disabled={!selectedStartDate || !selectedEndDate || loading}
              onClick={handleProceedToConfirm}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
            >
              {loading ? "Processing..." : selectedStartDate && selectedEndDate 
                ? "Proceed to Confirm Booking" 
                : "Select Dates to Continue"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      <BookingConfirmationPopup
        isOpen={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={handleConfirm}
        bookingDetails={{
          startDate: formatDisplay(selectedStartDate),
          endDate: formatDisplay(selectedEndDate),
          startTime,
          endTime,
          totalDays: totalDays(),
          totalPrice: totalPrice()
        }}
        vehicleDetails={{
          vehicleName,
          vehicleType,
          pricePerDay
        }}
      />
    </>
  );
};

export default CustomerBookingCalendar;
