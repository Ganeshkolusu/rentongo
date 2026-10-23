import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, Phone, Trash2 } from "lucide-react";
import apiService, { SOCKET_URL } from "../services/api.service";
import AutomaticLogo from "../assets/icons/AutomaticLogo.png";
import Petrol from "../assets/icons/Petrol.png";
import Location from "../assets/icons/Location.png";
import seats from "../assets/icons/seats.jpeg";
import AClogo from "../assets/icons/ac.png";
import BikeCC from "../assets/icons/BikeCC.png";
import PopupChat from "../components/ui/PopupChat";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import Toast from "../components/ui/Toast";
import ShareLocationToggle from "../components/ui/ShareLocationToggle";

type BookingStatus = "Completed" | "Pending" | "Cancelled" | "Confirmed" | "AutoCancelled";

interface BookingHistory {
  _id?: string;
  customerName?: string;
  contactName?: string;
  startDate?: string;
  FromDate?: string;
  startTime?: string;
  FromTime?: string;
  endDate?: string;
  ToDate?: string;
  endTime?: string;
  ToTime?: string;
  mobile?: string;
  contactNumber?: string;
  status?: BookingStatus;
  userId?: string;
  VechileId?: string;
  totalPrice?: number;
}

interface VehicleData {
  _id: string;
  userId?: string;
  CarName?: string;
  CarModel?: string;
  CarNumber?: string;
  Carseeter?: string;
  RentPerHour?: number;
  RentPerDay?: number;
  carImages?: string[];
  fuelType?: string;
  transmissionType?: string;
  Ac_available?: boolean;
  bikeName?: string;
  bikeModel?: string;
  bikeNumber?: string;
  pricePerKm?: number;
  bikeImages?: string[];
  bikeEngine?: string;
  bikeCC?: string;
  engineCapacity?: string;
  transmission?: string;
  Transmission?: string;
  fuel?: string;
  Fuel?: string;
  description?: string;
  contactName?: string;
  contactNumber?: string;
  Available?: boolean;
  pickupCity?: string;
  pickupCityState?: string;
  pickupArea?: string;
  bookings?: BookingHistory[];
}

const VehicleHistory: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicleId } = useParams<{ vehicleId: string }>();

  const hasFetchedVehicle = useRef(false);
  const hasFetchedBookings = useRef(false);

  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingHistory | null>(null);

  // Delete functionality states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<BookingHistory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  const passedVehicleData = location.state?.vehicleData;
  const passedVehicleType = location.state?.vehicleType;

  const vehicleType =
    passedVehicleType ||
    (passedVehicleData?.CarName || passedVehicleData?.carImages ? "car" : "bike");

  const finalVehicleId = vehicleId || passedVehicleData?._id || passedVehicleData?.id;
  const currentUserId = localStorage.getItem('userId') || vehicleData?.userId || '';

  useEffect(() => {
    if (!finalVehicleId) {
      setError("No vehicle ID provided");
      setLoading(false);
      return;
    }

    if (hasFetchedVehicle.current) {
      return;
    }

    const fetchVehicleDetails = async () => {
      try {
        hasFetchedVehicle.current = true;
        setLoading(true);

        const response =
          vehicleType === "car"
            ? await apiService.car.getCarById(finalVehicleId)
            : await apiService.bike.getBikeById(finalVehicleId);

        const payload = response?.data ?? response;
        const vehicle =
          payload?.car ||
          payload?.bike ||
          payload?.data ||
          payload?.vehicle ||
          payload;

        if (!vehicle || typeof vehicle !== "object") {
          throw new Error("Invalid vehicle response format");
        }

        setVehicleData(vehicle);
        setError("");
      } catch (err: any) {
        hasFetchedVehicle.current = false;
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to load vehicle details";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [finalVehicleId, vehicleType]);

  useEffect(() => {
    if (!finalVehicleId || !vehicleData) {
      setBookingLoading(false);
      return;
    }

    if (hasFetchedBookings.current) {
      setBookingLoading(false);
      return;
    }

    const fetchBookingHistory = async () => {
      try {
        hasFetchedBookings.current = true;
        setBookingLoading(true);

        const ownerId = vehicleData.userId;

        if (!ownerId) {
          console.warn("No ownerId found for vehicle");
          setBookingHistory([]);
          return;
        }

        const vehicleTypeParam = vehicleType === "car" ? "Car" : "Bike";
        console.log("📞 Calling getMyVehicleBookings with:", { ownerId, vehicleTypeParam, finalVehicleId });

        const response = await apiService.chat.getMyVehicleBookings(ownerId, vehicleTypeParam, finalVehicleId);
        console.log("📦 Full API Response:", response);

        let bookingsArray: any[] = [];

        if (response && typeof response === 'object' && 'data' in response) {
          const vehicleTypeKey = vehicleTypeParam.toLowerCase() as 'bike' | 'car';
          const vehicles = response.data?.[vehicleTypeKey];

          console.log(`📦 Vehicles array for ${vehicleTypeKey}:`, vehicles);

          if (Array.isArray(vehicles) && vehicles.length > 0) {
            const vehicle = vehicles.find((v: any) => v._id === finalVehicleId);

            if (vehicle && Array.isArray(vehicle.bookings)) {
              bookingsArray = vehicle.bookings;
              console.log("✅ Found bookings:", bookingsArray);
            } else {
              console.log("⚠️ No bookings found for this vehicle");
            }
          }
        } else if (Array.isArray(response)) {
          bookingsArray = response;
        }

        const transformedBookings = bookingsArray.map((booking: any) => ({
          _id: booking._id,
          customerName: booking.contactName || "Unknown Customer",
          contactName: booking.contactName,
          startDate: booking.FromDate ? new Date(booking.FromDate).toLocaleDateString('en-GB') : "N/A",
          FromDate: booking.FromDate,
          startTime: booking.FromTime?.replace('.', ':') || "N/A",
          FromTime: booking.FromTime,
          endDate: booking.ToDate ? new Date(booking.ToDate).toLocaleDateString('en-GB') : "N/A",
          ToDate: booking.ToDate,
          endTime: booking.ToTime?.replace('.', ':') || "N/A",
          ToTime: booking.ToTime,
          mobile: booking.contactNumber || "N/A",
          contactNumber: booking.contactNumber,
          status: booking.status as BookingStatus,
          userId: booking.userId,
          VechileId: booking.VechileId,
          totalPrice: booking.totalPrice,
        }));

        console.log("✅ Transformed bookings:", transformedBookings);
        setBookingHistory(transformedBookings);
        setBookingError("");
      } catch (err: any) {
        hasFetchedBookings.current = false;
        const errorMessage = err?.message || "Failed to load booking history";
        console.error("❌ Error loading bookings:", err);
        setBookingError(errorMessage);
        setBookingHistory([]);
      } finally {
        setBookingLoading(false);
      }
    };
    fetchBookingHistory();
  }, [finalVehicleId, vehicleData, vehicleType]);

  const handleChatClick = (booking: BookingHistory, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!vehicleData?.userId || !booking.userId || !booking._id) {
      alert("Error: Unable to start chat. Missing required information.");
      return;
    }

    setSelectedBooking(booking);
    setIsChatOpen(true);
  };

  const handleCallClick = (booking: BookingHistory, e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = booking.mobile || booking.contactNumber;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleDeleteClick = (booking: BookingHistory, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookingToDelete(booking);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete?._id) return;

    setIsDeleting(true);
    try {
      await apiService.booking.deleteBooking(bookingToDelete._id);

      // Remove booking from UI
      setBookingHistory(prev => prev.filter(b => b._id !== bookingToDelete._id));

      // Show success toast
      setToast({
        show: true,
        message: 'Booking deleted successfully',
        type: 'success'
      });

      // Close modal
      setDeleteModalOpen(false);
      setBookingToDelete(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete booking';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setBookingToDelete(null);
  };

  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "N/A";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      const visibleDigits = cleaned.slice(-3);
      const maskedCount = cleaned.length - 3;
      return 'X'.repeat(maskedCount) + visibleDigits;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicleData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-red-600 text-lg mb-4">{error || "Vehicle not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isCar = !!vehicleData.CarName || !!vehicleData.carImages || vehicleType === "car";
  let vehicleImages = (isCar ? vehicleData.carImages : vehicleData.bikeImages) || [];
  vehicleImages = vehicleImages.filter((img) => img && img.trim() !== "" && img !== "undefined");

  const carDummyImages = [
    "https://e7.pngegg.com/pngimages/768/421/png-clipart-car-computer-icons-sedan-auto-detailing-auto-driving-rectangle-thumbnail.png",
    "https://png.pngtree.com/png-vector/20191201/ourmid/pngtree-car-vector-logo-design-png-image_2066853.jpg"
  ];

  const bikeDummyImages = [
    "https://w7.pngwing.com/pngs/579/51/png-transparent-computer-icons-motorcycle-bicycle-motorcycle-logo-black-silhouette.png",
    "https://w1.pngwing.com/pngs/381/835/png-transparent-yamaha-logo-car-decal-motorcycle-sticker-sport-bike-yamaha-yzfr1-bicycle-thumbnail.png"
  ];

  const dummyImages = isCar ? carDummyImages : bikeDummyImages;
  if (vehicleImages.length === 0) vehicleImages = dummyImages;

  const carouselImages = [...vehicleImages];
  while (carouselImages.length < 3) {
    carouselImages.push(dummyImages[carouselImages.length % dummyImages.length]);
  }

  const displayName = isCar
    ? `${vehicleData.CarName || "Unknown"} ${vehicleData.CarModel || ""}`.trim()
    : `${vehicleData.bikeName || "Unknown"} ${vehicleData.bikeModel || ""}`.trim();

  const displayPrice = isCar ? vehicleData.RentPerHour || 0 : vehicleData.pricePerKm || 0;

  return (
    <div className="min-h-screen bg-white px-3 sm:px-6 py-4 sm:py-10">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8">
        <div className="flex-1 bg-white">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="relative w-full md:w-[420px] h-[250px] sm:h-[300px] flex-shrink-0 rounded-[10px] border-2 border-transparent hover:border-[#0066FF] transition-all duration-200">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-2xl z-20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-2xl z-20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                {carouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-[#0066FF] w-6" : "bg-gray-700 w-2"}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-[32px] font-bold mb-1">{displayName}</h1>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-[32px] font-bold">₹{displayPrice}</span>
                <span className="text-base text-gray-600">/{isCar ? 'hr' : 'km'}</span>
              </div>
              <div className="border rounded-[10px] mb-4">
                <div className="flex">
                  {isCar ? (
                    <>
                      <div className="flex-1 flex flex-col items-center py-3">
                        <img src={AutomaticLogo} className="w-6 h-6 mb-1.5" alt="transmission" />
                        <span className="text-[13px]">{vehicleData.transmissionType || "Manual"}</span>
                      </div>
                      <div className="w-[1px] bg-gray-200"></div>
                      <div className="flex-1 flex flex-col items-center py-3">
                        <img src={seats} className="w-6 h-6 mb-1.5" alt="seats" />
                        <span className="text-[13px]">{vehicleData.Carseeter || "5"} Seaters</span>
                      </div>
                      <div className="w-[1px] bg-gray-200"></div>
                      <div className="flex-1 flex flex-col items-center py-3">
                        <img src={Petrol} className="w-6 h-6 mb-1.5" alt="fuel" />
                        <span className="text-[13px]">{vehicleData.fuelType || "Petrol"}</span>
                      </div>
                      <div className="w-[1px] bg-gray-200"></div>
                      <div className="flex-1 flex flex-col items-center py-3">
                        <img src={AClogo} className="w-6 h-6 mb-1.5" alt="ac" />
                        <span className="text-[13px]">{vehicleData.Ac_available ? "AC" : "Non-AC"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 flex flex-col items-center py-3">
                        <img src={BikeCC} className="w-6 h-6 mb-1.5" alt="engine" />
                        <span className="text-[13px]">{vehicleData.engineCapacity || "350"} CC</span>
                      </div>
                      <div className="w-[1px] bg-gray-200"></div>
                      <div className="flex-1 flex flex-col items-center py-3">
                        <img src={AutomaticLogo} className="w-6 h-6 mb-1.5" alt="transmission" />
                        <span className="text-[13px]">{vehicleData.transmission || "Manual"}</span>
                      </div>
                      <div className="w-[1px] bg-gray-200"></div>
                      <div className="flex-1 flex flex-col items-center py-3">
                        <img src={Petrol} className="w-6 h-6 mb-1.5" alt="fuel" />
                        <span className="text-[13px]">{vehicleData.fuel || "Petrol"}</span>
                      </div>
                      <div className="w-[1px] bg-gray-200"></div>
                      <div className="flex-1 flex flex-col items-center py-3">
                        <img src={Location} className="w-6 h-6 mb-1.5" alt="location" />
                        <span className="text-[13px]">{vehicleData.pickupCity || "N/A"}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="border rounded-[10px] p-4">
                <h2 className="text-[18px] font-bold mb-2">Description</h2>
                <p className="text-gray-600 text-[14px]">{vehicleData.description || "No description available"}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-[380px]">
          <div className="sticky top-6 bg-white p-6 rounded-[12px] shadow-lg border">
            <h2 className="text-[20px] font-semibold mb-6">Booking History</h2>
            {bookingLoading ? (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-3 text-sm text-gray-600">Loading bookings...</p>
              </div>
            ) : bookingHistory.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-3">📋</div>
                <p className="font-medium">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {bookingHistory.map((booking) => (
                  <div
                    key={booking._id}
                    className="border rounded-lg p-4 hover:border-blue-500 transition-all relative"
                  >
                    <button
                      onClick={(e) => handleDeleteClick(booking, e)}
                      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors z-10"
                      title="Delete booking"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" fill="#666" />
                          <path d="M8 9C5.33333 9 2 10.3333 2 13V14H14V13C14 10.3333 10.6667 9 8 9Z" fill="#666" />
                        </svg>
                      </div>
                      <h3 className="font-semibold pr-8">{booking.customerName}</h3>
                    </div>
                    <div className="space-y-1 text-sm mb-2">
                      <div className="flex gap-2">
                        <span className="text-gray-600">From:</span>
                        <span>{booking.startDate} {booking.startTime}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-600">To:</span>
                        <span>{booking.endDate} {booking.endTime}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-600">Mobile:</span>
                        <span>{formatPhoneNumber(booking.mobile)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${booking.status === "Confirmed" ? "bg-blue-100 text-blue-700" :
                        booking.status === "Completed" ? "bg-green-100 text-green-700" :
                          booking.status === "Cancelled" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                        }`}>
                        {booking.status}
                      </span>
                    </div>

                    {booking.status === "Confirmed" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => handleChatClick(booking, e)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white rounded-full font-semibold"
                        >
                          <MessageCircle size={18} />
                          <span>Chat</span>
                        </button>

                        {booking._id && (
                          <ShareLocationToggle
                            bookingId={booking._id}
                            ownerId={vehicleData?.userId || currentUserId}
                          />
                        )}
                      </div>
                    )}

                    {booking.status === "Completed" && (
                      <div className="mt-3">
                        <div className="bg-green-500 text-white text-center py-2 rounded-full font-semibold shadow-md">
                          ✔ Ride Completed
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {isChatOpen && selectedBooking && vehicleData && (
        <PopupChat
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedBooking(null);
          }}
          pageRole="ownerView"
          currentUserId={vehicleData.userId || currentUserId}
          currentUserName={vehicleData.contactName}
          ownerId={vehicleData.userId || currentUserId}
          ownerName={vehicleData.contactName || 'Owner'}
          ownerAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vehicleData.contactName || 'Owner'}`}
          customerId={selectedBooking.userId || ''}
          customerName={selectedBooking.customerName || selectedBooking.contactName || 'Customer'}
          customerAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking.customerName || 'Customer'}`}
          bookingId={selectedBooking._id || ''}
          vehicleId={selectedBooking._id || ''}
          apiUrl={apiService.chat.apiUrl}
          socketUrl={SOCKET_URL}
          useRealtime={true}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        bookingCustomerName={bookingToDelete?.customerName || 'this customer'}
        isDeleting={isDeleting}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default VehicleHistory;