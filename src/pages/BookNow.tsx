
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { vehicles } from "./data/Vehicle";
import { Vehicle } from "../types/Vehicle";
import { Star, Loader2, RefreshCw, Trash2, Edit, MoreVertical, CheckCircle, XCircle, Clock } from "lucide-react";
import apiService, { API_BASE_URL, authHeader } from "../services/api.service";
import CustomerBookingCalendar from "../components/ui/CustomerBookingCalendar"
import WaitingPopup from "../components/ui/WaitingPopup";
import BookingAcceptance from "../components/ui/BookingAcceptance";
import BookingRejectModal from "../components/ui/BookingRejectModal";
import PopupChat from "../components/ui/PopupChat";
import { useReviewStore } from "../store/review.store";
import { useNotificationStore } from "../store/notification.store";
import { useBookingStore } from "../store/booking.store";
import toast from "react-hot-toast";

import Automatic from "../assets/icons/automatic.jpeg";
import Seats from "../assets/icons/seats.jpeg";
import Fuel from "../assets/icons/fuel.jpeg";
// import LocationIcon from "../assets/icons/Location.png";
import ac from "../assets/icons/ac.png";
import CalenderLogo from "../assets/icons/CalanderLogo.png";
import ClockIcon from "../assets/icons/ClockIcon.png";
//  import VehicleAvailabilityCalendar from "../components/AvailabilityDateTimeModal";
import CustomerCalendar from "../components/ui/CustomerCalender";
interface Review {
  _id: string;
  userId: string;
  vehicleId: string;
  rating: number;
  review?: string;
  reviewText?: string;
  comment?: string;
  feedback?: string;
  userName?: string;
  createdAt?: string;
}

interface BookingData {
  _id: string;
  userId: string;
  ownerId?: string;
  vehicleId: string;
  vehicleName?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  FromDate: string;
  ToDate: string;
  pricePerDay: number;   // ⭐ ADD THIS
  ac: boolean | string | any;
  FromTime: string;
  ToTime: string;
  totalPrice: string;
  customerName?: string;
  contactNumber?: string;
  createdAt?: string;
}
 
const bookingAPIService = {

  createCustomerBooking: async (payload: any) => {
    try {
      console.log("📤 Creating customer booking:", payload);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      const urlencoded = new URLSearchParams();
      urlencoded.append("userId", payload.userId);
      if (payload.ownerId) {
        urlencoded.append("ownerId", payload.ownerId); // 🔥 CRITICAL: Owner ID for pending bookings
      }
      urlencoded.append("vechileType", payload.vehicleType);
      urlencoded.append("VechileId", payload.vehicleId);
      urlencoded.append("pricePerKm", payload.pricePerKm || "0");
      urlencoded.append("pricePerDay", payload.pricePerDay || "0");
      urlencoded.append("contactNumber", payload.contactNumber || "");
      urlencoded.append("contactName", payload.contactName || "");
      urlencoded.append("latitude", payload.latitude || "17.438095");
      urlencoded.append("longitude", payload.longitude || "78.4485");
      urlencoded.append("FromDate", payload.fromDate);
      urlencoded.append("ToDate", payload.toDate);
      urlencoded.append("FromTime", payload.fromTime);
      urlencoded.append("ToTime", payload.toTime);
      urlencoded.append("totalHours", payload.totalHours || "0");
      urlencoded.append("totalDays", payload.totalDay || "0");
      urlencoded.append("totalPrice", payload.totalPrice || "0");

      const response = await fetch(`${API_BASE_URL}/Bookings`, {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded
      });

      const data = await response.json();

      console.log("✅ Booking API Response:", data);

      return { success: response.ok, data };
    } catch (error: any) {
      console.error("❌ Booking API Error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Block dates as unavailable (triggered after booking)
   */
  blockDatesAsUnavailable: async (payload: any) => {
    try {
      console.log("🔒 Blocking dates as unavailable:", payload);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      const urlencoded = new URLSearchParams();
      urlencoded.append("userId", payload.userId);
      urlencoded.append("vechileType", payload.vehicleType);
      urlencoded.append("VechileId", payload.vehicleId);
      urlencoded.append("fromDate", payload.fromDate);
      urlencoded.append("toDate", payload.toDate);
      urlencoded.append("fromTime", payload.fromTime);
      urlencoded.append("toTime", payload.toTime);
      urlencoded.append("isNotAvailable", "true");
      urlencoded.append("bikeImages", "");
      urlencoded.append("isCustomerBooking", "true"); // 🔥 Mark as customer booking

      const response = await fetch(`${API_BASE_URL}/createNotAvailability`, {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded
      });

      const data = await response.json();

      console.log("✅ Date Blocking Response:", data);

      return { success: response.ok, data };
    } catch (error: any) {
      console.error("❌ Date Blocking Error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all bookings for a vehicle
   */
  getAllBookings: async (vehicleId: string, vehicleType: string) => {
    try {
      console.log(`📡 Fetching all bookings for ${vehicleType} ID: ${vehicleId}`);

      const url = `${API_BASE_URL}/getBookings?vehicleId=${vehicleId}&vehicleType=${vehicleType}`;

      const response = await fetch(url);
      const data = await response.json();

      console.log("✅ All Bookings Response:", data);

      return { success: response.ok, bookings: data.bookings || [] };
    } catch (error: any) {
      console.error("❌ Get Bookings Error:", error);
      return { success: false, bookings: [] };
    }
  },

  /**
   * Get vehicle availability (includes owner blocked + customer booked dates)
   */
  getVehicleAvailability: async (vehicleId: string, vehicleType: string) => {
    try {
      console.log(`📡 Fetching availability for ${vehicleType} ID: ${vehicleId}`);

      const url = `${API_BASE_URL}/getVehicleAvailability?vechileType=${vehicleType}&VechileId=${vehicleId}`;

      const response = await fetch(url);
      const data = await response.json();

      console.log("✅ Availability Response:", data);

      if (!data.success || !data.availability) {
        return { success: false, unavailableDates: [], customerBookedDates: [] };
      }

      // Separate owner blocked and customer booked dates
      const unavailableDates = data.availability
        .filter((item: any) => item.status === "Unavailable")
        .map((item: any) => item.date);

      const customerBookedDates = data.availability
        .filter((item: any) => item.status === "Unavailable" && item.isCustomerBooking)
        .map((item: any) => item.date);

      console.log("📊 Unavailable Dates:", unavailableDates);
      console.log("📊 Customer Booked Dates:", customerBookedDates);

      return {
        success: true,
        unavailableDates,
        customerBookedDates
      };
    } catch (error: any) {
      console.error("❌ Get Availability Error:", error);
      return { success: false, unavailableDates: [], customerBookedDates: [] };
    }
  }
};

const BookNow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const vehicle: Vehicle | undefined = vehicles.find((v) => v.id === id);

  const {
    getReviewsByVehicleId,
    getAverageRating,
    getTotalReviewCount,
    getRatingDistribution,
  } = useReviewStore();
  const { addNotification } = useNotificationStore();
  const { addBooking } = useBookingStore();

  const [apiCarData, setApiCarData] = useState<any>(null);
  const [loadingCarData, setLoadingCarData] = useState(true);
  const [carDataError, setCarDataError] = useState("");
  const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
  const [showContactButtons, setShowContactButtons] = useState(false);
  const [showWaitingPopup, setShowWaitingPopup] = useState(false);
  const [showAcceptance, setShowAcceptance] = useState(false);
  const [waitingTimerSeconds, setWaitingTimerSeconds] = useState<number>(180);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [apiReviews, setApiReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string>("");
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [apiAverageRating, setApiAverageRating] = useState<number>(0);
  const [loadingAverageRating, setLoadingAverageRating] = useState<boolean>(false);
  const [isDeletingReview, setIsDeletingReview] = useState<boolean>(false);
  const [menuOpenIndex, setMenuOpenIndex] = useState<string | null>(null);

  const [currentBookingStatus, setCurrentBookingStatus] = useState<'pending' | 'confirmed' | 'rejected' | null>(null);
  const [isPollingBookingStatus, setIsPollingBookingStatus] = useState(false);
  const [bookingStatusMessage, setBookingStatusMessage] = useState<string>("");

  const [selectedPriceType, setSelectedPriceType] = useState<'day' | 'hour'>('day');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [withDriver, setWithDriver] = useState(false);

  // ============================================================================
  // DYNAMIC USER ID - Get from localStorage (no static fallback)
  // ============================================================================
  const getDynamicUserId = (): string | null => {
    // Try direct userId first
    let userId = localStorage.getItem('userId');

    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    const isValidMongoId = (id: string | null) => id && /^[a-f0-9]{24}$/i.test(id);

    if (isValidMongoId(userId)) {
      return userId;
    }

    // Try userProfile
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        if (isValidMongoId(profile.userId)) return profile.userId;
        if (isValidMongoId(profile._id)) return profile._id;
      }
    } catch (e) {
      console.log("Could not parse userProfile");
    }

    // Try user object
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        if (isValidMongoId(userData.userId)) return userData.userId;
        if (isValidMongoId(userData._id)) return userData._id;
      }
    } catch (e) {
      console.log("Could not parse user");
    }

    // Return whatever we have (might be null)
    console.warn("⚠️ No valid userId found in localStorage");
    return userId;
  };

  const currentUserId = getDynamicUserId();

  // ============================================================================
  // BOOKING STATUS POLLING
  // ============================================================================
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    if (bookingId && isPollingBookingStatus) {
      console.log("🔄 Starting booking status polling for:", bookingId);

      pollingInterval = setInterval(async () => {
        try {
          console.log("📡 Polling booking status...");

          // 🔥 REAL API CALL to check booking status from backend
          const response = await fetch(`${API_BASE_URL}/getBookingById/${bookingId}`, {
            headers: { ...authHeader() },
          });

          if (!response.ok) {
            console.log("⚠️ Booking status API returned:", response.status);
            return;
          }

          const data = await response.json();
          console.log("📦 Booking status response:", data);

          // Extract status from response (handle different response formats)
          const booking = data.booking || data.data || data;
          const status = (booking?.status || booking?.Status || 'pending').toLowerCase();

          console.log("📊 Current booking status:", status);

          if (status === 'confirmed') {
            console.log("✅ Booking CONFIRMED by owner!");
            setCurrentBookingStatus('confirmed');
            setIsPollingBookingStatus(false);
            setShowWaitingPopup(false);
            setBookingStatusMessage("✅ Owner accepted your booking!");

            toast.success("🎉 Booking Confirmed by Owner!", {
              duration: 5000,
              position: 'top-center',
            });
            setTimeout(() => {
              setShowContactButtons(true);
              setBookingStatusMessage("");
            }, 2000);

          } else if (status === 'rejected' || status === 'cancelled' || status === 'declined') {
            console.log("❌ Booking REJECTED/CANCELLED by owner! Status:", status);
            setCurrentBookingStatus('rejected');
            setIsPollingBookingStatus(false);
            setShowWaitingPopup(false);
            setBookingStatusMessage("❌ Owner rejected your booking");

            toast.error("Booking was rejected by the owner", {
              duration: 5000,
              position: 'top-center',
            });

            setTimeout(() => {
              setBookingStatusMessage("");
              setBookingId(null);
              setSelectedDateTime(null);
            }, 3000);
          }
        } catch (error) {
          console.error("❌ Error polling booking status:", error);
        }
      }, 3000);

      setTimeout(() => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setIsPollingBookingStatus(false);
          console.log("⏰ Polling timeout reached");
        }
      }, 180000);
    }
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        console.log("🛑 Stopped booking status polling");
      }
    };
  }, [bookingId, isPollingBookingStatus, currentBookingStatus]);

  // ============================================================================
  // EXISTING VEHICLE DATA FETCH (unchanged)
  // ============================================================================
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (id) {
        try {
          setLoadingCarData(true);
          setCarDataError("");

          const vehicleType = location.state?.vehicleType || vehicle?.type || 'car';

          console.log(`📡 Fetching ${vehicleType} details for ID: ${id}`);

          let response;
          let vehicleData = null;
          let successType = vehicleType;
          localStorage.setItem("vehicletype", successType);

          try {
            if (vehicleType.toLowerCase() === 'bike') {
              response = await apiService.bike.getBikeById(id);
              console.log("✅ Bike API response:", response);

              if ((response as any).bike) {
                vehicleData = (response as any).bike;
              } else if ((response as any).data) {
                vehicleData = (response as any).data;
              } else {
                vehicleData = response;
              }
            } else {
              response = await apiService.car.getCarById(id);
              console.log("✅ Car API response:", response);

              if ((response as any).car) {
                vehicleData = (response as any).car;
              } else if ((response as any).data) {
                vehicleData = (response as any).data;
              } else {
                vehicleData = response;
              }
            }
          } catch (apiError: any) {
            console.warn(`⚠️ ${vehicleType} API failed (${apiError.message}), trying alternate type...`);

            try {
              if (vehicleType.toLowerCase() === 'bike') {
                console.log("🔄 Trying Car API as fallback...");
                response = await apiService.car.getCarById(id);
                successType = 'car';
                if ((response as any).car) vehicleData = (response as any).car;
                else if ((response as any).data) vehicleData = (response as any).data;
                else vehicleData = response;
                console.log("✅ Car API (fallback) succeeded!");
              } else {
                console.log("🔄 Trying Bike API as fallback...");
                response = await apiService.bike.getBikeById(id);
                successType = 'bike';
                if ((response as any).bike) vehicleData = (response as any).bike;
                else if ((response as any).data) vehicleData = (response as any).data;
                else vehicleData = response;
                console.log("✅ Bike API (fallback) succeeded!");
              }
            } catch (fallbackError: any) {
              console.error("❌ Both APIs failed!");
              throw new Error(
                `Vehicle not found. This ${vehicleType} (ID: ${id}) may not exist in the database or has been removed.`
              );
            }
          }

          if (vehicleData) {
            console.log("🎯 Final vehicle data to set:", vehicleData);
            console.log(`✅ Successfully loaded as ${successType.toUpperCase()}`);
            setApiCarData(vehicleData);
          } else {
            throw new Error("No vehicle data received from API");
          }
        } catch (err: any) {
          console.error(`❌ Error fetching vehicle details:`, err);
          setCarDataError(err.message || "Failed to load vehicle details");

          toast.error(err.message || "Failed to load vehicle details", {
            duration: 5000,
            position: 'top-center',
          });
        } finally {
          setLoadingCarData(false);
        }
      }
    };

    fetchVehicleDetails();
  }, [id, location.state]);

  // ============================================================================
  // EXISTING REVIEW EFFECTS (unchanged)
  // ============================================================================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        console.log("👁️ Page became visible - Refreshing reviews");
        setTimeout(() => {
          fetchReviewsByVehicleId(id, false);
          fetchAverageRating(id, false);
        }, 300);
      }
    };

    const handleFocus = () => {
      if (id) {
        console.log("🎯 Window focused - Refreshing reviews");
        setTimeout(() => {
          fetchReviewsByVehicleId(id, false);
          fetchAverageRating(id, false);
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  useEffect(() => {
    if (id) {
      console.log("🔄 Initial review fetch triggered for vehicle:", id);
      fetchReviewsByVehicleId(id);
      fetchAverageRating(id);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const intervalId = setInterval(() => {
        console.log("🔄 Auto-refreshing reviews...");
        fetchReviewsByVehicleId(id, true);
        fetchAverageRating(id, true);
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showWaitingPopup && waitingTimerSeconds > 0) {
      interval = setInterval(() => {
        setWaitingTimerSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showWaitingPopup, waitingTimerSeconds]);

  useEffect(() => {
    if (showWaitingPopup && waitingTimerSeconds === 0) {
      handleTimerComplete();
    }
  }, [waitingTimerSeconds, showWaitingPopup]);

  useEffect(() => {
    const handleClickOutside = () => setMenuOpenIndex(null);
    if (menuOpenIndex !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuOpenIndex]);

  useEffect(() => {
    const editingReviewId = sessionStorage.getItem('editingReviewId');
    const returnToVehicleId = sessionStorage.getItem('returnToVehicleId');

    if (editingReviewId && returnToVehicleId === id && apiReviews.length > 0) {
      const updatedReview = apiReviews.find(r => r._id === editingReviewId);
      if (updatedReview) {
        console.log("🎯 UPDATED REVIEW CONFIRMED IN UI!");
        console.log("📊 Review Data:", updatedReview);
      }
    }
  }, [apiReviews, id]);

  // ============================================================================
  // REVIEW FUNCTIONS (unchanged)
  // ============================================================================
  const isUserReview = (review: Review): boolean => {
    const dynamicUserId = getDynamicUserId();
    return review.userId === dynamicUserId;
  };

  const handleMenuToggle = (reviewId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setMenuOpenIndex(menuOpenIndex === reviewId ? null : reviewId);
  };

  const handleRefreshReviews = () => {
    if (id) {
      console.log("🔄 Manual refresh triggered");
      fetchReviewsByVehicleId(id, false);
      fetchAverageRating(id, false);
    }
  };

  const handleEditClick = (review: Review) => {
    console.log("✏️ Navigating to feedback page for review:", review._id);
    const currentVehicle = vehicle || (apiCarData ? {
      name: apiCarData.CarName || 'Unknown Vehicle',
    } : null);

    sessionStorage.setItem('editingReviewId', review._id);
    sessionStorage.setItem('returnToVehicleId', id || '');

    navigate(`/feedback?vehicleId=${id}&vehicleName=${encodeURIComponent(currentVehicle?.name || '')}&reviewId=${review._id}`);
    setMenuOpenIndex(null);
  };

  const handleDeleteReview = async (reviewId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsDeletingReview(true);
    setMenuOpenIndex(null);

    try {
      console.log("🗑️ Deleting review:", reviewId);

      await apiService.review.deleteReview(reviewId);

      toast.success('✅ Review deleted successfully', {
        duration: 2000,
        position: 'top-right',
      });

      if (id) {
        setTimeout(() => {
          fetchReviewsByVehicleId(id, false);
          fetchAverageRating(id, false);
        }, 500);
      }
    } catch (error: any) {
      console.error('❌ Error deleting review:', error);

      toast.error(`Error: ${error.message}`, {
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsDeletingReview(false);
    }
  };

  const fetchAverageRating = async (vehicleId: string, silent: boolean = false) => {
    if (!silent) {
      setLoadingAverageRating(true);
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⭐ FETCHING AVERAGE RATING");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Vehicle ID:", vehicleId);

    try {
      const vehicleType = "Car";
      const result = await apiService.review.getAverageRating(vehicleId, vehicleType as 'car' | 'bike');

      console.log("✅ Average Rating Response:", result);

      if ((result as any).success && (result as any).averageRating !== undefined) {
        const avgRating = parseFloat((result as any).averageRating);
        setApiAverageRating(avgRating);
        console.log("⭐ Average Rating Set:", avgRating);
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch average rating:", error.message);
    } finally {
      if (!silent) {
        setLoadingAverageRating(false);
      }
    }
  };

  const fetchReviewsByVehicleId = async (vehicleId: string, silent: boolean = false) => {
    const now = Date.now();

    if (now - lastFetchTime < 5000 && silent) {
      console.log("⏳ Skipping fetch - too soon after last request");
      return;
    }
    setLastFetchTime(now);

    if (!silent) {
      setLoadingReviews(true);
      setReviewsError("");
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 FETCHING REVIEWS FOR VEHICLE (Production API)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Vehicle ID:", vehicleId);

    // 🔥 Get vehicle type dynamically from state or localStorage
    const vehicleType = location.state?.vehicleType || vehicle?.type || localStorage.getItem("vehicletype") || 'car';
    const normalizedVehicleType = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1).toLowerCase();

    console.log("🚗 Vehicle Type:", normalizedVehicleType);
    console.log("🌐 API URL:", `${API_BASE_URL}/getReviews?vechileType=${normalizedVehicleType}&VechileId=${vehicleId}`);

    try {
      // 🔥 PRODUCTION API CALL with dynamic parameters
      const apiUrl = `${API_BASE_URL}/getReviews?vechileType=${normalizedVehicleType}&VechileId=${vehicleId}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Reviews API Response:", result);

      // Handle different response formats
      let reviews: Review[] = [];

      if (result.success && Array.isArray(result.reviews)) {
        reviews = result.reviews;
      } else if (result.success && Array.isArray(result.data)) {
        reviews = result.data;
      } else if (Array.isArray(result.reviews)) {
        reviews = result.reviews;
      } else if (Array.isArray(result.data)) {
        reviews = result.data;
      } else if (Array.isArray(result)) {
        reviews = result;
      }

      console.log("🎉 SUCCESS: Reviews found!", reviews.length);
      console.log("📝 Review Details:", JSON.stringify(reviews.slice(0, 2), null, 2));

      setApiReviews(reviews);

      // Calculate and set average rating
      if (reviews.length > 0) {
        const avgRating = calculateAverageRating(reviews);
        setApiAverageRating(avgRating);
        console.log("⭐ Average Rating:", avgRating);
      } else {
        setApiAverageRating(0);
      }

      // Check for updated review (from edit flow)
      const editingReviewId = sessionStorage.getItem('editingReviewId');
      if (editingReviewId) {
        const updatedReview = reviews.find((r: any) => r._id === editingReviewId);
        if (updatedReview) {
          console.log("✨ Updated review detected!");
          console.log("⭐ NEW Rating:", updatedReview.rating);
          console.log("💬 NEW Text:", updatedReview.review || updatedReview.reviewText);

          toast.success(`🎉 Review updated! New rating: ${updatedReview.rating}★`, {
            duration: 3000,
            position: 'top-center',
          });
        }

        setTimeout(() => {
          console.log("🧹 Clearing editingReviewId from sessionStorage");
          sessionStorage.removeItem('editingReviewId');
        }, 5000);
      }

      if (!silent) {
        if (reviews.length > 0) {
          toast.success(`✅ Loaded ${reviews.length} review(s)`, {
            duration: 2000,
            position: 'top-right',
          });
        } else {
          toast("No reviews yet for this vehicle", {
            duration: 2000,
            position: 'top-right',
          });
        }
      }

      return reviews;
    } catch (error: any) {
      console.error("❌ Fetch reviews failed:", error.message);
      console.error("❌ Error details:", error);

      setReviewsError("Unable to load reviews.");
      setApiReviews([]);
      setApiAverageRating(0);

      if (!silent) {
        toast.error("Failed to load reviews", {
          duration: 3000,
          position: 'top-right',
        });
      }
    } finally {
      if (!silent) {
        setLoadingReviews(false);
      }
    }
  };

  const calculateAverageRating = (reviews: Review[]): number => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;
    return Number(average.toFixed(1));
  };

  const calculateRatingDistribution = (reviews: Review[]) => {
    const distribution = [5, 4, 3, 2, 1].map(stars => {
      const count = reviews.filter(r => r.rating === stars).length;
      const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
      return { stars, count, percentage };
    });
    return distribution;
  };

  // ============================================================================
  // 🔥 NEW COMPREHENSIVE BOOKING FUNCTIONS
  // ============================================================================
  const mapVehicleTypeForAPI = (type: Vehicle["type"] | undefined): "Car" | "Auto" | "Bike" => {
    if (!type) {
      console.warn("⚠️ Vehicle type is undefined/null, defaulting to 'Car'");
      return "Car";
    }

    const normalized = type.toLowerCase();
    const typeMap: Record<string, "Car" | "Auto" | "Bike"> = {
      car: "Car",
      auto: "Auto",
      bike: "Bike",
    };

    return typeMap[normalized] || "Car";
  };

  const mapVehicleTypeForStore = (type: Vehicle["type"] | undefined): "Car" | "Auto" | "Bike" => {
    const typeMap: Record<string, "Car" | "Auto" | "Bike"> = {
      car: "Car",
      auto: "Auto",
      bike: "Bike",
    };
    return type ? typeMap[type.toLowerCase()] || "Car" : "Car";
  };

  const calculateTotalHours = (
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string
  ): number => {
    try {
      const parseTime = (timeStr: string) => {
        const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
        if (!match) return { hours: 0, minutes: 0 };

        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2] || '0');
        const period = match[3]?.toUpperCase();

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return { hours, minutes };
      };

      const startTimeParsed = parseTime(startTime);
      const endTimeParsed = parseTime(endTime);

      const start = new Date(startDate);
      start.setHours(startTimeParsed.hours, startTimeParsed.minutes, 0, 0);

      const end = new Date(endDate);
      end.setHours(endTimeParsed.hours, endTimeParsed.minutes, 0, 0);

      const diffInMs = end.getTime() - start.getTime();
      const hours = Math.ceil(diffInMs / (1000 * 60 * 60));

      return hours > 0 ? hours : 1;
    } catch (error) {
      console.error("❌ Error calculating hours:", error);
      return 1;
    }
  };


  const formatDateForAPI = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error("❌ Date formatting error:", error);
    }
    return dateString;
  };

  const formatTimeForAPI = (timeString: string): string => {
    try {
      const ampmMatch = timeString.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
      if (ampmMatch) {
        let hours = parseInt(ampmMatch[1]);
        const minutes = ampmMatch[2] || '00';
        const period = ampmMatch[3].toUpperCase();

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, '0')}.${minutes}`;
      }
    } catch (error) {
      console.error("❌ Time formatting error:", error);
    }
    return timeString;
  };

  // ============================================================================
  // 🔥 CALCULATE HOURLY AND DAILY PRICES
  // ============================================================================
  const vehicleData = apiCarData || {};
  const vehicleType = location.state?.vehicleType || vehicle?.type || 'car';
  const isCar = !!vehicleData.CarName || !!vehicleData.carImages || vehicleType === "car";

  // Get base hourly price from API
  const baseHourlyPrice = parseInt(
    isCar
      ? (vehicleData.RentPerHour || vehicleData.pricePerHour || '0')
      : (vehicleData.pricePerKm || vehicleData.pricePerHour || '0')
  );

  // Use the vehicle's actual configured daily rate (set by the owner);
  // only estimate from the hourly rate when there is no real day-rate
  // (e.g. bikes are priced per-km/hour and have no RentPerDay field).
  const baseDailyPrice = isCar && vehicleData.RentPerDay
    ? parseInt(vehicleData.RentPerDay)
    : baseHourlyPrice * 24;

  console.log("💰 PRICE CALCULATION:");
  console.log("   Hourly Price:", baseHourlyPrice);
  console.log("   Daily Price:", baseDailyPrice);

  const currentVehicle = vehicle || (apiCarData ? {
    id: apiCarData._id || apiCarData.id || id || '',
    name: apiCarData.CarName || apiCarData.bikeName || 'Unknown Vehicle',
    image: (apiCarData.carImages && apiCarData.carImages.length > 0)
      ? apiCarData.carImages[0]
      : (apiCarData.bikeImages && apiCarData.bikeImages.length > 0)
        ? apiCarData.bikeImages[0]
        : apiCarData.carImage || apiCarData.bikeImage || apiCarData.image || 'https://via.placeholder.com/400',
    price: baseHourlyPrice.toString(), // Store hourly price as base
    pricePerHour: baseHourlyPrice, // 🔥 NEW: Explicit hourly price
    pricePerDay: baseDailyPrice,   // 🔥 NEW: Calculated daily price
    type: (apiCarData.bikeName ? 'bike' : 'car') as Vehicle["type"],
    transmission: apiCarData.transmissionType || 'Manual',
    fuel: apiCarData.fuelType || 'Petrol',
    seats: apiCarData.Carseater || apiCarData.seatingCapacity || '2',
    ac: apiCarData.ac || false,
    ownerId: apiCarData.ownerId || apiCarData.userId || '', // Owner of the vehicle
  } : null);
  /**
   * 🔥 MAIN BOOKING CREATION FUNCTION WITH DATE BLOCKING
   */
  const createBookingAPI = async (
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string
  ) => {
    if (!currentVehicle) {
      setApiError("Vehicle information is missing");
      return null;
    }

    setIsSubmittingBooking(true);
    setApiError("");

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      const totalHours = calculateTotalHours(startDate, endDate, startTime, endTime);

      // 🔥 Use correct price based on selected type with type guard
      const pricePerHour = ("pricePerHour" in currentVehicle) ? currentVehicle.pricePerHour : parseInt(String(currentVehicle.price))

      const pricePerDay = ("pricePerDay" in currentVehicle) ? currentVehicle.pricePerDay : parseInt(String(currentVehicle.price))
        * 24;

      const priceToUse = selectedPriceType === 'hour'
        ? pricePerHour
        : pricePerDay;

      const driverFee = isCar && withDriver && vehicleData?.driverAvailable ? Number(vehicleData.driverFee) || 0 : 0;

      const totalPrice = (selectedPriceType === 'hour'
        ? totalHours * pricePerHour
        : Math.ceil(totalHours / 24) * pricePerDay) + driverFee;

      // Format dates for API (YYYY-MM-DD format)
      const formattedFromDate = formatDateForAPI(startDate);
      const formattedToDate = formatDateForAPI(endDate);

      // Format times for API (H.MM format like 9.00)
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        return `${parseInt(hours)}.${minutes || "00"}`;
      };

      const formattedFromTime = formatTime(startTime);
      const formattedToTime = formatTime(endTime);

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔥 CREATING COMPREHENSIVE BOOKING");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📅 From Date:", formattedFromDate);
      console.log("📅 To Date:", formattedToDate);
      console.log("⏰ From Time:", formattedFromTime);
      console.log("⏰ To Time:", formattedToTime);
      console.log("🕐 Total Hours:", totalHours);
      console.log("💵 Price Type:", selectedPriceType);
      console.log("💰 Price Per Unit:", priceToUse);
      console.log("💰 Total Price:", totalPrice);
      console.log("🚗 Vehicle ID:", currentVehicle.id);
      console.log("👤 User ID:", userData?._id || currentUserId);

      // STEP 1: Create the booking (Optional - for your records)
      const bookingPayload = {
        userId: userData?._id || currentUserId,
        ownerId: currentVehicle.ownerId, // 🔥 CRITICAL: Owner ID for pending bookings notification
        vehicleType: mapVehicleTypeForAPI(currentVehicle.type),
        vehicleId: currentVehicle.id,
        pricePerKm: String(priceToUse),
        pricePerDay: String(totalPrice),
        contactNumber: userData?.contactNumber || "",

        contactName: userData?.name || "",
        latitude: userData?.latitude || "17.438095",
        longitude: userData?.longitude || "78.4485",
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        fromTime: formattedFromTime,
        toTime: formattedToTime,
        totalHours: totalHours.toString(),
        // totalDays: totalDays.toString(),
        totalPrice: totalPrice.toString(),
        withDriver,
      };

      console.log("👨‍💼 Owner ID being sent:", currentVehicle.ownerId);

      console.log("📤 STEP 1: Creating Booking Record...");
      console.log("📋 Booking Payload:", bookingPayload);

      let newBookingId = `BOOK-${Date.now()}`;

      try {
        // Uses the real, auth-attached /createBooking endpoint — the old
        // bookingAPIService.createCustomerBooking posted to a URL
        // (/Bookings) that doesn't exist on the backend and had no auth
        // header, so it always failed silently and fell through to a fake
        // temp booking ID below.
        const bookingResult: any = await apiService.booking.createBooking(bookingPayload);
        if (bookingResult?.booking?._id) {
          newBookingId = bookingResult.booking._id;
          console.log("✅ Booking record created with ID:", newBookingId);
        } else {
          console.log("⚠️ Using temporary booking ID:", newBookingId);
        }
      } catch (bookingError: any) {
        console.log("⚠️ Booking API failed, using temp ID. Error:", bookingError);
        const message = bookingError?.response?.data?.message || bookingError?.message || "Failed to create booking";
        alert(message);
        return;
      }

      setBookingId(newBookingId);
      setCurrentBookingStatus('pending');

      // STEP 2: Block dates as unavailable (CRITICAL - This shows the red strike)
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📤 STEP 2: Blocking dates as UNAVAILABLE...");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Create blocking payload matching your API format exactly
      const blockingPayload = {
        userId: userData?._id || currentUserId,
        vechileType: mapVehicleTypeForAPI(currentVehicle.type), // Note: API uses 'vechileType'
        VechileId: currentVehicle.id, // Note: Capital V
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        fromTime: formattedFromTime,
        toTime: formattedToTime,
        isNotAvailable: "true",
        bikeImages: "",
        isCustomerBooking: "true" // Mark as customer booking
      };

      console.log("📋 Blocking Payload:", JSON.stringify(blockingPayload, null, 2));

      const blockingResult = await bookingAPIService.blockDatesAsUnavailable(blockingPayload);

      if (blockingResult.success) {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ Dates successfully BLOCKED in all calendars!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎉 BOOKING + DATE BLOCKING COMPLETE!");
        console.log("📊 Booking ID:", newBookingId);
        console.log("🔒 Blocked Dates:", formattedFromDate, "to", formattedToDate);
        console.log("⏰ Blocked Times:", formattedFromTime, "to", formattedToTime);
        console.log("📍 Vehicle:", currentVehicle.name);
        console.log("🔴 These dates will now show with RED STRIKE in:");
        console.log("   ✅ Owner Calendar (orange - customer booked)");
        console.log("   ✅ All Customer Calendars (red strike - unavailable)");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        toast.success("🎉 Booking created & dates blocked across all calendars!", {
          duration: 5000,
          position: 'top-center',
        });
      } else {
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("❌ FAILED TO BLOCK DATES!");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("Error:", blockingResult.error);
        console.error("Payload used:", blockingPayload);
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        toast.error("❌ Booking created but dates NOT blocked. Please contact support.", {
          duration: 5000,
          position: 'top-center',
        });
      }

      // Start polling for booking status and show waiting popup
      setIsPollingBookingStatus(true);
      setShowWaitingPopup(true);
      setWaitingTimerSeconds(120); // 2 minutes default timer

      return { success: true, bookingId: newBookingId };

    } catch (error: any) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ CRITICAL ERROR in booking process!");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      toast.error("❌ Booking failed: " + error.message, {
        duration: 5000,
        position: 'top-center',
      });

      return { success: false, error: error.message };
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleTimerComplete = () => {
    console.log("⏰ Timer completed - Checking booking status");

    if (currentBookingStatus === 'confirmed') {
      console.log("✅ Booking was confirmed - showing contact buttons");
      setShowWaitingPopup(false);
      setShowContactButtons(true);
    } else if (currentBookingStatus === 'rejected') {
      console.log("❌ Booking was rejected");
      setShowWaitingPopup(false);
      toast.error("Booking was rejected by owner");
    } else {
      console.log("⏰ No response from owner - timeout");
      setShowWaitingPopup(false);
      toast("Owner hasn't responded yet. Please try calling them.", {
        duration: 5000,
        position: 'top-center',
      });
      setShowContactButtons(true);
    }
  };
  const handleCloseWaiting = () => {
    console.log("❌ WaitingPopup closed manually");
    setShowWaitingPopup(false);
    setWaitingTimerSeconds(180);
  };

  const handleCallOwner = () => {
    console.log("📞 Customer calling owner...");
    console.log("🎉 Call initiated - Opening success modal");
    setTimeout(() => {
      handleConfirmBooking();
    }, 1000);
  };

  const handleConfirmBooking = () => {
    if (!currentVehicle || !selectedDateTime) {
      console.error("❌ Cannot confirm booking");
      return;
    }

    const currentDate = new Date();
    console.log("🎉 Confirming booking with ID:", bookingId);

    setShowSuccessModal(true);
  };

  // ============================================================================
  // LOADING STATES
  // ============================================================================
  if (loadingCarData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center space-y-4 p-8">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
          <p className="text-xl text-gray-700 font-semibold">Loading vehicle details...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch the car information</p>
        </div>
      </div>
    );
  }

  if (carDataError && !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl">❌</div>
          <p className="text-xl text-red-600 font-bold">Error Loading Vehicle</p>
          <p className="text-gray-600">{carDataError}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition font-semibold"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle && !apiCarData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl">🚗</div>
          <p className="text-xl text-gray-700 font-bold">Vehicle Not Found</p>
          <p className="text-gray-600">The vehicle you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition font-semibold"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentVehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8">
          <p className="text-xl text-gray-700">Vehicle data not available!</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const vehicleReviews = getReviewsByVehicleId(currentVehicle?.id || '');
  const averageRating = getAverageRating(currentVehicle?.id || '');
  const totalReviews = getTotalReviewCount(currentVehicle?.id || '');
  const ratingDistribution = getRatingDistribution(currentVehicle?.id || '');

  const displayReviews = apiReviews.length > 0 ? apiReviews : vehicleReviews;

  const displayAverageRating = apiAverageRating > 0
    ? apiAverageRating
    : (apiReviews.length > 0
      ? calculateAverageRating(apiReviews)
      : averageRating);

  const displayTotalReviews = apiReviews.length > 0
    ? apiReviews.length
    : totalReviews;

  const displayRatingDistribution = apiReviews.length > 0
    ? calculateRatingDistribution(apiReviews)
    : ratingDistribution;

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // Fallback if no vehicle data
  if (!currentVehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8">
          <p className="text-xl text-gray-700">Vehicle data not available!</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 🔥 Prepare vehicle images
  let vehicleImages = (isCar ? vehicleData.carImages : vehicleData.bikeImages) || [];
  vehicleImages = vehicleImages.filter((img: string) => img && img.trim() !== "" && img !== "undefined");

  const carDummyImages = [
    "https://e7.pngegg.com/pngimages/768/421/png-clipart-car-computer-icons-sedan-auto-detailing-auto-driving-rectangle-thumbnail.png",
    "https://png.pngtree.com/png-vector/20191201/ourmid/pngtree-car-vector-logo-design-png-image_2066853.jpg"
  ];

  const bikeDummyImages = [
    "https://w7.pngwing.com/pngs/579/51/png-transparent-computer-icons-motorcycle-bicycle-motorcycle-logo-black-silhouette.png",
    "https://w1.pngwing.com/pngs/381/835/png-transparent-yamaha-logo-car-decal-motorcycle-sticker-sport-bike-yamaha-yzfr1-bicycle-thumbnail.png"
  ];

  const dummyImages = isCar ? carDummyImages : bikeDummyImages;

  if (vehicleImages.length === 0) {
    vehicleImages = dummyImages;
  }

  const carouselImages = [...vehicleImages];
  while (carouselImages.length < 3) {
    carouselImages.push(dummyImages[carouselImages.length % dummyImages.length]);
  }

  const displayName = isCar
    ? `${vehicleData.CarName || "Unknown"} ${vehicleData.CarModel || ""}`.trim()
    : `${vehicleData.bikeName || "Unknown"} ${vehicleData.bikeModel || ""}`.trim();

  return (
    <div className="max-w-8xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: Vehicle Image */}
      <div className="lg:col-span-1">
        <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-[10px] border-2 border-transparent hover:border-[#0066FF] transition-all duration-200">
          <img
            src={carouselImages[currentImageIndex]}
            alt={displayName}
            className="w-full h-full object-cover transition-all duration-500 rounded-[10px]"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
            }}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-2xl z-20 transition-all cursor-pointer border border-gray-200"
            type="button"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
            }}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-2xl z-20 transition-all cursor-pointer border border-gray-200"
            type="button"
            aria-label="Next image"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-2 rounded-full transition-all ${idx === currentImageIndex
                  ? "bg-[#0066FF] w-6"
                  : "bg-gray-700 w-2"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN: Vehicle Details & Booking */}
      <div className="lg:col-span-1">
        <h1 className="text-4xl font-bold mb-4">{currentVehicle.name}</h1>

        {/* 🔥 UPDATED PRICE BOXES - Shows different prices */}
        <div className="flex items-center gap-3 mb-6">
          <div
            onClick={() => setSelectedPriceType('day')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPriceType === 'day'
              ? 'border-transparent bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white'
              : 'border-gray-300 bg-white hover:border-blue-300'
              }`}
          >
            <img src={CalenderLogo} alt="Calendar" className="w-6 h-6" />
            <div className="flex flex-col">
              <span className={`text-xs ${selectedPriceType === 'day' ? 'text-white' : 'text-gray-500'}`}>
                Daily
              </span>
              {/* <span className={`text-lg font-bold ${selectedPriceType === 'day' ? 'text-white' : 'text-gray-900'}`}>
                ₹{currentVehicle.pricePerDay}/day
              </span> */}
              <span className={`text-lg font-bold ${selectedPriceType === 'day' ? 'text-white' : 'text-gray-900'}`}>
                ₹{("pricePerDay" in currentVehicle) ? currentVehicle.pricePerDay : parseInt(String(currentVehicle.price))
                  * 24}/day
              </span>
            </div>
          </div>

          <div
            onClick={() => setSelectedPriceType('hour')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPriceType === 'hour'
              ? 'border-transparent bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white'
              : 'border-gray-300 bg-white hover:border-blue-300'
              }`}
          >
            <img src={ClockIcon} alt="Clock" className="w-6 h-6" />
            <div className="flex flex-col">
              <span className={`text-xs ${selectedPriceType === 'hour' ? 'text-white' : 'text-gray-500'}`}>
                Hourly
              </span>
              <span className={`text-lg font-bold ${selectedPriceType === 'hour' ? 'text-white' : 'text-gray-900'}`}>
                ₹{("pricePerHour" in currentVehicle) ? currentVehicle.pricePerHour : parseInt(String(currentVehicle.price))
                }/hr
              </span>
            </div>
          </div>
        </div>

        {/* Icons Row */}
        <div className="flex items-center justify-between bg-white border-2 border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-[50px] h-[50px] flex items-center justify-center">
              <img src={Automatic} alt="Transmission" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm text-gray-700">{currentVehicle.transmission}</span>
          </div>
          <div className="w-px h-16 bg-gray-300"></div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-[50px] h-[50px] flex items-center justify-center">
              <img src={Seats} alt="Seats" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm text-gray-700">{currentVehicle.seats} Seaters</span>
          </div>
          <div className="w-px h-16 bg-gray-300"></div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-[50px] h-[50px] flex items-center justify-center">
              <img src={Fuel} alt="Fuel" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm text-gray-700">{currentVehicle.fuel}</span>
          </div>
          <div className="w-px h-16 bg-gray-300"></div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-[50px] h-[50px] flex items-center justify-center">
              <img src={ac} alt="AC" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm text-gray-700">
              {"ac" in currentVehicle && currentVehicle.ac ? "AC" : "Non-AC"}
            </span>

          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-4xl font-bold text-gray-900 mb-2">Description</h3>
          <div className="w-full min-h-[35px] border border-gray-300 rounded-lg p-3 text-sm text-gray-700">
            {apiCarData?.description || 'Very good vehicle with excellent condition and comfortable seating.'}
          </div>
        </div>

        {/* BOOKING STATUS BANNER */}
        {bookingStatusMessage && (
          <div className={`mb-4 p-4 rounded-lg border-2 flex items-center gap-3 animate-pulse ${currentBookingStatus === 'confirmed'
            ? 'bg-green-50 border-green-400'
            : 'bg-red-50 border-red-400'
            }`}>
            {currentBookingStatus === 'confirmed' ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800">{bookingStatusMessage}</p>
                  <p className="text-sm text-green-600">You can now contact the owner</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-800">{bookingStatusMessage}</p>
                  <p className="text-sm text-red-600">Please try another vehicle</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* POLLING STATUS INDICATOR */}
        {isPollingBookingStatus && !bookingStatusMessage && (
          <div className="mb-4 p-4 rounded-lg border-2 border-blue-400 bg-blue-50 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
            <div>
              <p className="font-bold text-blue-800">Waiting for owner's response...</p>
              <p className="text-sm text-blue-600">The owner will be notified shortly</p>
            </div>
          </div>
        )}
        {/* Book Now Button */}
        {!showContactButtons ? (
          <button
            onClick={() => setIsDateTimeModalOpen(true)}
            disabled={isSubmittingBooking || currentBookingStatus === 'rejected'}
            className={`w-full bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white py-3 px-6 rounded-lg
                        font-semibold hover:opacity-90 transition-all shadow-md
                        disabled:opacity-50 disabled:cursor-not-allowed mb-6`}
          >
            {isSubmittingBooking
              ? "Processing..."
              : currentBookingStatus === 'rejected'
                ? "Booking Rejected"
                : "Book Now"}
          </button>
        ) : (
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
              <img
                src="https://ui-avatars.com/api/?name=Manoj+Kumar&background=6B7280&color=fff&size=48"
                alt="Manoj Kumar"
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Manoj Kumar</h4>
                <p className="text-sm text-gray-500">Vehicle Owner</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-orange-700 flex-1">
                Please call the owner to discuss booking details and confirm availability.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition"
              >
                💬 Chat
              </button>
              <button
                onClick={handleCallOwner}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition shadow-md"
              >
                📞 Call Owner
              </button>
            </div>
          </div>
        )}

        {/* DateTime Modal */}
        {isDateTimeModalOpen && (
          <CustomerCalendar
            isOpen={isDateTimeModalOpen}
            onClose={() => setIsDateTimeModalOpen(false)}
            userRole="customer"
            VechileId={currentVehicle?.id || id || ''}
            vechileType={mapVehicleTypeForAPI(currentVehicle?.type)}
            userId={localStorage.getItem("userId") || currentUserId}
            ownerId={apiCarData?.ownerId || apiCarData?.userId || ''}
            pricePerDay={("pricePerDay" in currentVehicle) ? currentVehicle.pricePerDay : parseInt(String(currentVehicle.price))
              * 24}
            pricePerHour={("pricePerHour" in currentVehicle) ? currentVehicle.pricePerHour : baseHourlyPrice}
            driverAvailable={isCar && !!vehicleData?.driverAvailable}
            driverFee={Number(vehicleData?.driverFee) || 0}
            vehicleName={currentVehicle?.name || 'Vehicle'}
            latitude={localStorage.getItem("latitude")}
            longitude={localStorage.getItem("longitude")}
            onBookingComplete={(booking) => {
              console.log("Booking completed!", booking);
              setIsDateTimeModalOpen(false);
              toast.success("Booking confirmed!");
            }}
          />
        )}
      </div>

      {/* RIGHT COLUMN: Reviews (unchanged, keeping existing code) */}
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-3xl font-bold">Rating & Reviews</h3>
          <div className="flex items-center gap-2">
            {(loadingReviews || loadingAverageRating) && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            )}
            <button
              onClick={handleRefreshReviews}
              disabled={loadingReviews || loadingAverageRating}
              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Refresh reviews"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${(loadingReviews || loadingAverageRating) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {apiReviews.length > 0 && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <span className="text-xs text-green-700 font-medium">
              ✓ Live reviews from API
            </span>
            <span className="text-xs text-gray-500">
              (Updated {new Date(lastFetchTime).toLocaleTimeString()})
            </span>
          </div>
        )}

        {sessionStorage.getItem('editingReviewId') && !loadingReviews && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 animate-pulse">
            <span className="text-xs text-blue-700 font-medium">
              🔄 Refreshing to show your updated review...
            </span>
          </div>
        )}

        <div className="flex items-center mt-2 mb-2 justify-between bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-gray-900">{displayAverageRating}</span>
            <span className="text-xs text-gray-600 mt-1">out of 5</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={i < Math.floor(displayAverageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  size={20}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 mt-1">
              {displayTotalReviews} Review{displayTotalReviews !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2 bg-white p-4 rounded-lg border">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Rating Breakdown</h4>
          {displayRatingDistribution.map((r) => (
            <div key={r.stars} className="flex items-center text-sm">
              <span className="w-8 text-gray-700 font-medium">{r.stars}<span className="text-yellow-400 text-xl">★</span></span>
              <div className="flex-1 bg-gray-200 h-3 rounded-full mx-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${r.percentage}%` }}
                />
              </div>
              <span className="text-gray-500 text-xs min-w-[45px] text-right">
                {r.count} ({r.percentage}%)
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 max-h-[500px] overflow-y-auto pr-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 sticky top-0 bg-white py-2 z-10">
            Customer Reviews ({displayTotalReviews})
          </h4>

          {displayReviews.length > 0 ? (
            displayReviews.map((review, idx) => {
              const canEdit = isUserReview(review);
              const wasJustEdited = sessionStorage.getItem('editingReviewId') === review._id;
              const isMenuOpen = menuOpenIndex === review._id;

              return (
                <div
                  key={review._id || idx}
                  className={`border rounded-xl p-4 transition-all duration-500 relative ${wasJustEdited
                    ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-2xl ring-2 ring-green-400 ring-offset-2'
                    : canEdit
                      ? 'border-blue-200 bg-blue-50 hover:shadow-md'
                      : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                >
                  {wasJustEdited && (
                    <div className="absolute -top-3 -right-3 z-20 animate-bounce">
                      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white text-xs px-4 py-2 rounded-full font-bold shadow-xl flex items-center gap-2">
                        <span className="text-lg animate-spin">✨</span>
                        <span className="font-extrabold">JUST UPDATED!</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${wasJustEdited
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 ring-2 ring-green-300'
                        : 'bg-gradient-to-br from-blue-400 to-purple-400'
                        }`}>
                        {(review.userName || `User ${idx + 1}`).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-gray-900 text-sm ${wasJustEdited ? 'text-green-800' : ''
                            }`}>
                            {review.userName || `User ${idx + 1}`}
                          </span>
                          {canEdit && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                              You
                            </span>
                          )}
                          {wasJustEdited && (
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
                              Updated
                            </span>
                          )}
                        </div>
                        {review.createdAt && (
                          <p className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`flex px-2 py-1 rounded-lg border ${wasJustEdited
                        ? 'bg-green-100 border-green-300 ring-2 ring-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                        }`}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>

                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleMenuToggle(review._id, e)}
                          className={`p-1.5 rounded-full transition-all duration-200 ${isMenuOpen
                            ? 'bg-blue-100 text-blue-600'
                            : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          aria-label="Review options"
                          title={canEdit ? "Edit or delete review" : "Review options"}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {isMenuOpen && (
                          <div
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-30 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {canEdit ? (
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(review);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 transition-colors group"
                                >
                                  <Edit size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                                  <span className="font-medium text-gray-700 group-hover:text-blue-700">Edit Review</span>
                                </button>

                                <div className="border-t border-gray-100"></div>

                                <button
                                  onClick={(e) => handleDeleteReview(review._id, e)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                                >
                                  <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                  <span className="font-medium group-hover:text-red-700">Delete Review</span>
                                </button>
                              </div>
                            ) : (
                              <div className="py-3 px-4">
                                <p className="text-xs text-gray-500 text-center">
                                  You can only edit your own reviews
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed mt-2 mb-3 ${wasJustEdited
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-700'
                    }`}>
                    {review.review || review.reviewText || review.comment || review.feedback || "No comment provided"}
                  </p>

                  {wasJustEdited && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-lg shadow-inner">
                      <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1">
                        <span className="text-base">✅</span>
                        <span>Review Successfully Updated!</span>
                      </p>
                      <div className="space-y-1 text-xs text-green-700">
                        <p><strong>New Rating:</strong> {review.rating} ⭐</p>
                        <p><strong>New Review:</strong> {review.review || review.reviewText || 'No comment'}</p>
                        <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-gray-500 font-medium mb-1">No reviews yet</p>
              <p className="text-gray-400 text-sm">
                Be the first to review this vehicle!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showWaitingPopup && (
        <WaitingPopup
          isOpen={showWaitingPopup}
          bookingId={bookingId || undefined}
          bookingStatus={bookingStatusMessage || "Waiting for owner response..."}
          timer={waitingTimerSeconds}
          onClose={handleCloseWaiting}
          onTimerComplete={handleTimerComplete}
          onTimeout={() => {
            console.log("⏰ WaitingPopup timeout");
            setShowWaitingPopup(false);
            setIsPollingBookingStatus(false);
            toast.error("Request timed out. Please try again.", {
              duration: 5000,
              position: 'top-center',
            });
          }}
        />
      )}

      {showAcceptance && bookingId && (
        <BookingAcceptance
          bookingId={bookingId}
          onAccept={() => {
            console.log("✅ Booking accepted by owner!");
            setShowAcceptance(false);
            setCurrentBookingStatus('confirmed');
            setShowWaitingPopup(false);
            setBookingStatusMessage("✅ Owner accepted your booking!");

            toast.success("🎉 Booking Confirmed by Owner!", {
              duration: 5000,
              position: 'top-center',
            });

            setTimeout(() => {
              setShowContactButtons(true);
              setBookingStatusMessage("");
            }, 2000);
          }}
          onReject={(reason?: string) => {
            console.log("❌ Booking rejected by owner. Reason:", reason);
            setShowAcceptance(false);
            setCurrentBookingStatus('rejected');
            setShowWaitingPopup(false);
            setBookingStatusMessage("❌ Owner rejected your booking");

            toast.error(`Booking rejected${reason ? `: ${reason}` : ''}`, {
              duration: 5000,
              position: 'top-center',
            });

            setTimeout(() => {
              setBookingStatusMessage("");
              setBookingId(null);
              setSelectedDateTime(null);
            }, 3000);
          }}
          onClose={() => {
            console.log("❌ Acceptance modal closed");
            setShowAcceptance(false);
          }}
        />
      )}

      {showRejectModal && (
        <BookingRejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onReject={async (reason: string) => {
            console.log("❌ Rejecting booking with reason:", reason);

            try {
              if (bookingId) {
                setCurrentBookingStatus('rejected');
                setShowRejectModal(false);
                setShowWaitingPopup(false);
                setBookingStatusMessage("❌ Booking rejected");

                toast.error(`Booking rejected: ${reason}`, {
                  duration: 5000,
                  position: 'top-center',
                });

                setTimeout(() => {
                  setBookingStatusMessage("");
                  setBookingId(null);
                  setSelectedDateTime(null);
                }, 3000);
              }
            } catch (error) {
              console.error("❌ Error rejecting booking:", error);
              toast.error("Failed to reject booking");
            }
          }}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="text-center">
              <div className="mb-6 relative">
                <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-green-500 rounded-full animate-ping opacity-20"></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Your call with the owner was successful. Your booking has been confirmed!
              </p>

              {selectedDateTime && currentVehicle && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-3 text-center">Booking Summary</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium text-gray-900">{currentVehicle.name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedDateTime.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} at {selectedDateTime.startTime}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">To:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedDateTime.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} at {selectedDateTime.endTime}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Duration:</span>
                        <span className="font-medium text-gray-900">
                          {calculateTotalHours(
                            selectedDateTime.startDate,
                            selectedDateTime.endDate,
                            selectedDateTime.startTime,
                            selectedDateTime.endTime
                          )} hours
                        </span>
                      </div>

                      <div className="flex justify-between mt-1">
                        <span className="text-gray-600">Price per {selectedPriceType}:</span>
                        <span className="font-medium text-gray-900">
                          ₹{selectedPriceType === 'hour'
                            ? (("pricePerHour" in currentVehicle) ? currentVehicle.pricePerHour : parseInt(String(currentVehicle.price))
                            )
                            : (("pricePerDay" in currentVehicle) ? currentVehicle.pricePerDay : parseInt(String(currentVehicle.price))
                              * 24)
                          }
                        </span>
                      </div>

                      {isCar && vehicleData?.driverAvailable && (
                        <label className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 cursor-pointer">
                          <span className="flex items-center gap-2 text-gray-700 text-sm">
                            <input
                              type="checkbox"
                              checked={withDriver}
                              onChange={(e) => setWithDriver(e.target.checked)}
                              className="w-4 h-4"
                            />
                            Book with driver (+₹{Number(vehicleData.driverFee) || 0})
                          </span>
                        </label>
                      )}

                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-300">
                        <span className="font-semibold text-gray-900">Total Price:</span>
                        <span className="font-bold text-blue-600 text-lg">
                          ₹{(selectedPriceType === 'hour'
                            ? calculateTotalHours(
                              selectedDateTime.startDate,
                              selectedDateTime.endDate,
                              selectedDateTime.startTime,
                              selectedDateTime.endTime
                            ) * (("pricePerHour" in currentVehicle) ? currentVehicle.pricePerHour : parseInt(String(currentVehicle.price))
                            )
                            : Math.ceil(calculateTotalHours(
                              selectedDateTime.startDate,
                              selectedDateTime.endDate,
                              selectedDateTime.startTime,
                              selectedDateTime.endTime
                            ) / 24) * (("pricePerDay" in currentVehicle) ? currentVehicle.pricePerDay : parseInt(String(currentVehicle.price))
                              * 24)
                          ) + (isCar && withDriver && vehicleData?.driverAvailable ? (Number(vehicleData.driverFee) || 0) : 0)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {bookingId && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Booking ID</p>
                  <p className="text-sm font-mono font-semibold text-blue-900">{bookingId}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/mybookings');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition shadow-md"
                >
                  View My Bookings
                </button>

                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/rental');
                  }}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(isSubmittingBooking || isDeletingReview) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-2xl">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold">
              {isSubmittingBooking ? "Processing your booking..." : "Deleting review..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookNow;