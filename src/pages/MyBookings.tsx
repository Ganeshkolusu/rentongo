import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw, X } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import {
  useBookingStore,
  Booking,
  BookingStatus,
  mapApiStatus,
  getStatusColor,
  shouldShowPopup,
  mapVehicleType,
  formatApiDate,
  getStatusMessage
} from "../store/booking.store";
import apiService from "../services/api.service";
import Auto from "../assets/images/Auto.png";
import LiveTrackingMap from "../components/LiveTrackingMap";

interface RejectionModalData {
  bookingId: string;
  vehicleType: string;
  fromDate: string;
  fromTime: string;
  status: BookingStatus;
  rejectionReason?: string;
}

interface ApiBookingResponse {
  booking: {
    _id: string;
    userId: string;
    vechileType: string;
    VechileId: string;
    pricePerKm: number;
    pricePerHour: number;
    pricePerDay: number;
    contactNumber: string;
    contactName: string;
    FromDate: string;
    ToDate: string;
    FromTime: string;
    ToTime: string;
    totalHours: number;
    totalPrice: number;
    status?: string;
    rejectionReason?: string;
    createdAt?: string;
  };
  vehicle: {
    _id: string;
    CarName?: string;
    carName?: string;
    bikeName?: string;
    carImages?: string[];
    bikeImages?: string[];
    RentPerHour?: number;
    RentPerDay?: number;
  };
}

// 24-hour time formatter function - converts any time format to 24-hour
const formatTimeTo24Hour = (timeString: string | undefined): string => {
  if (!timeString) return "N/A";

  try {
    // If already in HH:MM format (24-hour), return as is
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }

    // Handle 12-hour format with AM/PM
    const time12hrMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (time12hrMatch) {
      let hours = parseInt(time12hrMatch[1]);
      const minutes = time12hrMatch[2];
      const period = time12hrMatch[3].toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    // If it's just a number (like "10"), assume it's hours
    if (/^\d{1,2}$/.test(timeString)) {
      return `${timeString.padStart(2, '0')}:00`;
    }

    return timeString;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { bookings, setBookings, updateBookingStatus } = useBookingStore();

  const [searchText, setSearchText] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionModalData, setRejectionModalData] = useState<RejectionModalData | null>(null);
  const [bookingsDataCache, setBookingsDataCache] = useState<ApiBookingResponse[]>([]);
  const [trackingBookingId, setTrackingBookingId] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showRejectionModal ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRejectionModal]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      loadBookings();
    }
  }, []);

  /**
   * Main function to load bookings using apiService
   */
  const loadBookings = async (silent = false) => {
    if (!silent) setIsLoadingBookings(true);
    setIsRefreshing(true);

    try {
      const userId = localStorage.getItem("userId") || " ";
      console.log("🔍 Fetching bookings for user:", userId);

      // ✅ Use your existing API service
      const response = await apiService.booking.getAllBookings(userId);
      console.log("📦 Raw API Response:", response);

      // Extract bookings array from various possible response structures
      let bookingsData: ApiBookingResponse[] = [];
      if (response?.data) {
        bookingsData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        bookingsData = response;
      } else if (response?.bookings) {
        bookingsData = Array.isArray(response.bookings) ? response.bookings : [];
      }

      console.log("📦 Extracted bookings data:", bookingsData);

      if (bookingsData && bookingsData.length > 0) {
        setBookingsDataCache(bookingsData);

        const convertedBookings: Booking[] = bookingsData.map((item) => {
          const apiBooking = item.booking;
          const vehicle = item.vehicle;

          const newStatus = mapApiStatus(apiBooking.status);

          console.log("🔄 Status mapping:", {
            bookingId: apiBooking._id,
            originalStatus: apiBooking.status,
            mappedStatus: newStatus
          });

          // Check if we should show popup
          const existingBooking = bookings.find((b) => b.id === apiBooking._id);

          if (existingBooking && shouldShowPopup(existingBooking.status, newStatus)) {
            setRejectionModalData({
              bookingId: apiBooking._id,
              vehicleType: apiBooking.vechileType,
              fromDate: formatApiDate(apiBooking.FromDate),
              fromTime: formatTimeTo24Hour(apiBooking.FromTime),
              status: newStatus,
              rejectionReason: apiBooking.rejectionReason,
            });
            setShowRejectionModal(true);
          }

          const vehicleName =
            vehicle?.CarName ||
            vehicle?.carName ||
            vehicle?.bikeName ||
            `${apiBooking.vechileType} Vehicle`;

          const vehicleImage =
            (vehicle?.carImages && vehicle.carImages[0]) ||
            (vehicle?.bikeImages && vehicle.bikeImages[0]) ||
            Auto;

          // Smart price calculation
          const price = (() => {
            const pricePerKm = Number(apiBooking.pricePerKm) || 0;
            const pricePerHour = Number(apiBooking.pricePerHour) || 0;
            const pricePerDay = Number(apiBooking.pricePerDay) || 0;
            const totalPrice = Number(apiBooking.totalPrice) || 0;
            const totalHours = Number(apiBooking.totalHours) || 1;
            const vehicleRentPerHour = Number(vehicle?.RentPerHour) || 0;
            const vehicleRentPerDay = Number(vehicle?.RentPerDay) || 0;

            if (pricePerKm > 0) return pricePerKm;
            if (pricePerHour > 0) return pricePerHour;
            if (pricePerDay > 0) return pricePerDay;
            if (totalPrice > 0 && totalHours > 0) return totalPrice / totalHours;
            if (vehicleRentPerHour > 0) return vehicleRentPerHour;
            if (vehicleRentPerDay > 0) return vehicleRentPerDay;
            return 0;
          })();

          const priceUnit = (() => {
            if (Number(apiBooking.pricePerKm) > 0) return "/km";
            if (Number(apiBooking.pricePerHour) > 0) return "/hour";
            if (Number(apiBooking.pricePerDay) > 0) return "/day";
            if (Number(vehicle?.RentPerHour) > 0) return "/hour";
            if (Number(vehicle?.RentPerDay) > 0) return "/day";
            return "/hour";
          })();

          return {
            id: apiBooking._id,
            vehicleId: apiBooking.VechileId,
            vehicleName,
            vehicleImage,
            vehicleType: mapVehicleType(apiBooking.vechileType),
            customerName: apiBooking.contactName,
            contactNumber: apiBooking.contactNumber,
            bookingDate: formatApiDate(apiBooking.createdAt || apiBooking.FromDate),
            bookingTime: formatTimeTo24Hour(apiBooking.FromTime),
            startDate: formatApiDate(apiBooking.FromDate),
            startTime: formatTimeTo24Hour(apiBooking.FromTime),
            endDate: formatApiDate(apiBooking.ToDate),
            endTime: formatTimeTo24Hour(apiBooking.ToTime),
            modelNo: apiBooking._id.slice(0, 10).toUpperCase(),
            status: newStatus,
            price,
            priceUnit,
            rejectionReason: apiBooking.rejectionReason,
          };
        });

        console.log("✅ Converted bookings:", convertedBookings);
        setBookings(convertedBookings);
      } else {
        console.log("📭 No bookings found");
        setBookings([]);
      }
    } catch (error: any) {
      console.error("❌ Error fetching bookings:", error);
      alert(`Failed to load bookings: ${error.message}`);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
      setIsRefreshing(false);
    }
  };

  const handleBookingClick = (booking: Booking) => {
    if (!booking.vehicleId) {
      alert("Vehicle details not found.");
      return;
    }

    const type = booking.vehicleType.toLowerCase();
    const bookingResponse = bookingsDataCache.find((item) => item.booking._id === booking.id);
    const vehicleData = bookingResponse?.vehicle;

    navigate(`/booking-detail/${booking.vehicleId}`, {
      state: {
        booking,
        vehicleType: type,
        openContact: false,
        vehicleData: vehicleData || {
          _id: booking.vehicleId,
          vehicleType: type,
          bikeName: booking.vehicleName,
          carName: booking.vehicleName,
          bikeImages: booking.vehicleImage ? [booking.vehicleImage] : [],
          carImages: booking.vehicleImage ? [booking.vehicleImage] : [],
          pricePerKm: booking.price,
          RentPerHour: booking.price,
        },
      },
    });
  };

  const handleRefresh = () => loadBookings();

  const getFilteredBookings = () => {
    if (!searchText) return bookings;
    const search = searchText.toLowerCase();
    return bookings.filter(
      (b) =>
        b.vehicleName?.toLowerCase().includes(search) ||
        b.contactNumber?.includes(searchText) ||
        b.status?.toLowerCase().includes(search)
    );
  };

  const filteredBookings = getFilteredBookings();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content with blur when modal is open */}
      <div className={`transition-all duration-300 ${showRejectionModal ? 'blur-sm pointer-events-none' : ''}`}>
        {/* Header Section - Mobile Responsive */}
        <div className="bg-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto">
            {/* Mobile: Stack vertically, Desktop: Flex row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Heading */}
              <h1 className="text-2xl sm:text-[32px] font-black text-gray-900 tracking-tight">
                My Bookings
              </h1>

              {/* Search and Refresh */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative flex-1 sm:flex-initial sm:w-80">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 rounded-[10px] border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-[10px] text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${isRefreshing
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white hover:opacity-90'
                    }`}
                >
                  <RefreshCw size={16} className={`sm:w-[18px] sm:h-[18px] ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Mobile Responsive */}
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Bookings Count */}
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-[15px] font-medium text-gray-900">
              {filteredBookings.length} Booking{filteredBookings.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Loading State */}
          {isLoadingBookings ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-200 border-t-[#3D5AFE] rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-900 text-sm sm:text-base">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center shadow-sm">
              <p className="text-sm sm:text-base text-gray-900">
                {searchText ? "No bookings match your search" : "No bookings found"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => handleBookingClick(booking)}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm border-2 border-transparent cursor-pointer transition-all duration-300 overflow-hidden hover:border-[#3D5AFE] hover:shadow-[0_4px_12px_rgba(61,90,254,0.15)]"
                >
                  <div className="p-4 sm:p-7">
                    {/* Mobile: Stack vertically, Desktop: Flex row */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Vehicle Image */}
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="w-full sm:w-[330px] h-[350px] sm:h-[200px] bg-gradient-to-br from-indigo-50 to-indigo-200 rounded-xl overflow-hidden flex items-center justify-center">
                          <img
                            src={booking.vehicleImage}
                            alt={booking.vehicleName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = Auto;
                            }}
                          />
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1">
                        {/* Vehicle Name and Price */}
                        <div className="mb-2 sm:mb-2.5">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mb-1.5">
                            {booking.vehicleName}
                          </h3>

                          {/* Price */}
                          <div className="text-base sm:text-lg font-bold text-gray-900">
                            ₹{(booking.price || 0).toFixed(0)}
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {booking.priceUnit || "/hour"}
                            </span>
                          </div>
                        </div>

                        {/* Info Grid - Mobile optimized */}
                        <div className="flex flex-col gap-1.5 mb-2 sm:mb-2.5">
                          {/* Date Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-5">
                            <div className="flex items-center gap-2">
                              <svg className="w-[13px] h-[13px] text-gray-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                              </svg>
                              <span className="text-xs text-gray-900 font-medium">From:</span>
                              <span className="text-xs font-semibold text-gray-900">{booking.startDate}</span>
                            </div>
                            {booking.endDate && (
                              <div className="flex items-center gap-2">
                                <svg className="w-[13px] h-[13px] text-gray-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                                </svg>
                                <span className="text-xs text-gray-900 font-medium">To:</span>
                                <span className="text-xs font-semibold text-gray-900">{booking.endDate}</span>
                              </div>
                            )}
                          </div>

                          {/* Time Row - Now in 24-hour format */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-5">
                            <div className="flex items-center gap-2">
                              <svg className="w-[13px] h-[13px] text-gray-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                <polyline points="12 6 12 12 16 14" strokeWidth="2" />
                              </svg>
                              <span className="text-xs text-gray-900 font-medium">From:</span>
                              <span className="text-xs font-semibold text-gray-900">{booking.startTime}</span>
                            </div>
                            {booking.endTime && (
                              <div className="flex items-center gap-2">
                                <svg className="w-[13px] h-[13px] text-gray-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                  <polyline points="12 6 12 12 16 14" strokeWidth="2" />
                                </svg>
                                <span className="text-xs text-gray-900 font-medium">To:</span>
                                <span className="text-xs font-semibold text-gray-900">{booking.endTime}</span>
                              </div>
                            )}
                          </div>

                          {/* Mobile Number */}
                          <div className="flex items-center gap-2">
                            <svg className="w-[13px] h-[13px] text-gray-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-xs text-gray-900 font-medium">Mobile:</span>
                            <span className="text-xs font-semibold text-gray-900">
                              {booking.contactNumber ? booking.contactNumber.replace(/\d(?=\d{3})/g, "X") : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-900 font-medium">Status:</span>
                          <span className={`px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold ${getStatusColor(booking.status)}`}>
                            {booking.status === "AutoCancelled" ? "Auto Cancelled" : booking.status}
                          </span>
                          {booking.status === "Confirmed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTrackingBookingId(booking.id);
                              }}
                              className="px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              📍 Track Owner
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rejection/Cancellation Modal - Mobile Responsive */}
      {showRejectionModal && rejectionModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center">
                <X size={48} className="sm:w-[56px] sm:h-[56px] text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-[28px] font-bold text-center mb-3 sm:mb-4">
              Booking {rejectionModalData.status === "AutoCancelled" ? "Auto Cancelled" : "Rejected"}
            </h2>

            <p className="text-base sm:text-lg text-gray-600 text-center mb-4 sm:mb-6">
              {rejectionModalData.status === "AutoCancelled"
                ? `Your booking for the ${rejectionModalData.vehicleType} was automatically cancelled because the owner didn't respond in time.`
                : `The owner rejected your booking for the ${rejectionModalData.vehicleType}.`
              }
            </p>

            <div className="bg-gray-50 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 text-sm text-gray-700 border border-gray-200">
              <div className="flex justify-between mb-3">
                <span className="font-semibold">Booking ID:</span>
                <span className="font-medium text-right break-all">{rejectionModalData.bookingId.slice(0, 10)}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="font-semibold">Date:</span>
                <span className="font-medium">{rejectionModalData.fromDate}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="font-semibold">Time:</span>
                <span className="font-medium">{rejectionModalData.fromTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Status:</span>
                <span className="font-medium">
                  {rejectionModalData.status === "AutoCancelled" ? "Auto Cancelled" : rejectionModalData.status}
                </span>
              </div>
            </div>

            {rejectionModalData.rejectionReason && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm font-bold text-amber-800 mb-2">Reason:</p>
                <p className="text-sm text-amber-700">{rejectionModalData.rejectionReason}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionModalData(null);
                }}
                className="w-full sm:flex-1 bg-gray-100 text-gray-900 font-bold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionModalData(null);
                  navigate("/rental");
                }}
                className="w-full sm:flex-1 bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white font-bold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                Find Another Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Owner-Tracking Modal */}
      {trackingBookingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Owner's Live Location</h2>
              <button
                onClick={() => setTrackingBookingId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>
            <div className="h-[350px] sm:h-[400px]">
              <LiveTrackingMap bookingId={trackingBookingId} markerLabel="Owner" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;