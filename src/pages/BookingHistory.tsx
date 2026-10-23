
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PopupChat from "../components/ui/PopupChat";
import apiService, { SOCKET_URL } from "../services/api.service";
import AutomaticLogo from "../assets/icons/AutomaticLogo.png";
import Petrol from "../assets/icons/Petrol.png";
import Location from "../assets/icons/Location.png";
import seats from "../assets/icons/seats.jpeg";
import AClogo from "../assets/icons/ac.png";
import BikeCC from "../assets/icons/BikeCC.png";
import { Loader2, MessageCircle, Phone, AlertCircle, MapPin, Navigation } from "lucide-react";

interface VehicleData {
  _id: string;
  userId?: string;
  ownerId?: string;
  vehicleType?: string;
  CarName?: string;
  carName?: string;
  CarModel?: string;
  CarNumber?: string;
  Carseater?: string;
  RentPerHour?: number;
  RentPerDay?: number;
  carImages?: string[];
  fuelType?: string;
  transmissionType?: string;
  Ac_available?: boolean;
  kmDriven?: number;
  bikeName?: string;
  bikeModel?: string;
  bikeNumber?: string;
  pricePerKm?: number;
  bikeImages?: string[];
  bikeCC?: string;
  engineCapacity?: string;
  bikeEngine?: string;
  description?: string;
  contactName?: string;
  contactNumber?: string;
  Available?: boolean;
  pickupCity?: string;
  pickupCityState?: string;
  pickupArea?: string;
  pickupLatitude?: string;
  pickupLongitude?: string;
  latitude?: string;
  longitude?: string;
}

interface Booking {
  _id?: string;
  bookingId?: string;
  userId?: string;
  status?: string;
  vehicleName?: string;
  price?: number;
  pickupAddress?: string;
  dropAddress?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  distance?: string;
}

const BookingDetail: React.FC = () => {
  const { vehicleId: urlVehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<string | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [drivingDistance, setDrivingDistance] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);

  const passedVehicleData = location.state?.vehicleData;
  const passedBooking = location.state?.booking;
  const openContact = location.state?.openContact || false;
  const passedVehicleType = location.state?.vehicleType || passedVehicleData?.vehicleType;

  const vehicleType = passedVehicleType ||
    (passedVehicleData?.CarName || passedVehicleData?.carName || passedVehicleData?.carImages || passedVehicleData?.RentPerHour ? "car" : "bike");

  const vehicleId = urlVehicleId || passedVehicleData?._id;

  const isConfirmed = passedBooking?.status?.toLowerCase() === "confirmed";

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Calculate road distance using Google Maps Distance Matrix API
  const fetchRoadDistance = async (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
    try {
      // Using Google Maps Distance Matrix API via CORS proxy or direct call
      const origin = `${fromLat},${fromLng}`;
      const destination = `${toLat},${toLng}`;
      
      // Alternative: Calculate using OpenRouteService or direct embed
      // For now, we'll use a more accurate calculation with road factor
      const straightDistance = calculateDistance(fromLat, fromLng, toLat, toLng);
      
      // Apply road distance factor (typically 1.2-1.3x for urban areas)
      // This accounts for roads not being straight lines
      const roadFactor = 1.25; // 25% longer than straight line
      const estimatedRoadDistance = straightDistance * roadFactor;
      
      console.log("🛣️ Road distance estimation:", {
        straightLine: straightDistance.toFixed(2) + " km",
        estimated: estimatedRoadDistance.toFixed(2) + " km",
        factor: roadFactor
      });
      
      return {
        distance: estimatedRoadDistance,
        duration: Math.ceil(estimatedRoadDistance * 2) // Rough estimate: 30 km/h average
      };
    } catch (error) {
      console.error("Distance calculation error:", error);
      return null;
    }
  };

  // Get customer's current location and calculate distance
  useEffect(() => {
    if (vehicleData && isConfirmed) {
      // Parse coordinates - handle both string and number formats
      const vehicleLatStr = vehicleData.latitude || vehicleData.pickupLatitude;
      const vehicleLngStr = vehicleData.longitude || vehicleData.pickupLongitude;
      
      const vehicleLat = typeof vehicleLatStr === 'string' ? parseFloat(vehicleLatStr) : vehicleLatStr;
      const vehicleLng = typeof vehicleLngStr === 'string' ? parseFloat(vehicleLngStr) : vehicleLngStr;

      console.log("🔍 Vehicle coordinates:", { 
        raw: { lat: vehicleLatStr, lng: vehicleLngStr },
        parsed: { lat: vehicleLat, lng: vehicleLng }
      });

      // Validate coordinates
      if (vehicleLat && vehicleLng && !isNaN(vehicleLat) && !isNaN(vehicleLng) && 
          vehicleLat !== 0 && vehicleLng !== 0) {
        setDistanceLoading(true);
        
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const customerLat = position.coords.latitude;
              const customerLng = position.coords.longitude;
              
              setCustomerLocation({ lat: customerLat, lng: customerLng });
              
              // Calculate straight-line distance
              const straightDistance = calculateDistance(customerLat, customerLng, vehicleLat, vehicleLng);
              
              // Fetch road distance estimate
              const roadData = await fetchRoadDistance(customerLat, customerLng, vehicleLat, vehicleLng);
              
              if (roadData) {
                const roadDistance = roadData.distance;
                
                console.log("📍 Distance calculation:", {
                  customerLocation: { lat: customerLat, lng: customerLng },
                  vehicleLocation: { lat: vehicleLat, lng: vehicleLng },
                  straightLineKm: straightDistance.toFixed(2),
                  roadDistanceKm: roadDistance.toFixed(2),
                  estimatedMinutes: roadData.duration
                });
                
                // Display road distance
                if (roadDistance < 1) {
                  setDrivingDistance(`${Math.round(roadDistance * 1000)} m`);
                } else {
                  setDrivingDistance(`${roadDistance.toFixed(1)} km`);
                }
                
                // Set estimated time
                setEstimatedTime(`${roadData.duration} min`);
              } else {
                // Fallback to straight line
                if (straightDistance < 1) {
                  setDrivingDistance(`${Math.round(straightDistance * 1000)} m`);
                } else {
                  setDrivingDistance(`${straightDistance.toFixed(1)} km`);
                }
              }
              
              // Keep straight-line distance for reference
              if (straightDistance < 1) {
                setCalculatedDistance(`${Math.round(straightDistance * 1000)} m`);
              } else {
                setCalculatedDistance(`${straightDistance.toFixed(1)} km`);
              }
              
              setDistanceLoading(false);
            },
            (error) => {
              console.error("❌ Location error:", error.message);
              setDistanceLoading(false);
              setCalculatedDistance(null);
              setDrivingDistance(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        } else {
          console.warn("⚠️ Geolocation not supported");
          setDistanceLoading(false);
        }
      } else {
        console.warn("⚠️ Invalid vehicle coordinates:", { vehicleLat, vehicleLng });
        setDistanceLoading(false);
      }
    }
  }, [vehicleData, isConfirmed]);

  useEffect(() => {
    console.log("🔍 Booking Detail Debug:", {
      passedBooking,
      isConfirmed,
      vehicleData,
      calculatedDistance
    });
  }, [passedBooking, isConfirmed, vehicleData, calculatedDistance]);

  useEffect(() => {
    if (openContact && passedBooking) {
      setIsChatOpen(true);
    }
  }, [openContact, passedBooking]);

  useEffect(() => {
    const loadVehicleData = async () => {
      if (passedVehicleData && passedVehicleData._id &&
        (passedVehicleData.CarName || passedVehicleData.carName || passedVehicleData.bikeName)) {
        setVehicleData(passedVehicleData);
        setLoading(false);
        setError("");
        return;
      }

      if (!vehicleId) {
        setError("No vehicle ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let result;
        if (vehicleType === "car") {
          result = await apiService.car.getCarById(vehicleId);
        } else {
          result = await apiService.bike.getBikeById(vehicleId);
        }

        const payload = result?.data ?? result;
        let data = payload?.car || payload?.bike || payload?.data || payload?.vehicle || payload;

        if (data?.bike) data = data.bike;
        if (data?.car) data = data.car;

        if (!data || typeof data !== "object" || !data._id) {
          throw new Error("Invalid vehicle response format");
        }

        setVehicleData(data);
        setError("");
      } catch (err: any) {
        if (passedVehicleData && passedVehicleData._id) {
          setVehicleData(passedVehicleData);
          setError("");
        } else {
          const errorMessage = err?.response?.data?.message || err?.message || "Failed to load vehicle details";
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    loadVehicleData();
  }, [vehicleId, vehicleType, passedVehicleData]);

  const handleChatClick = () => {
    if (!isConfirmed) {
      console.warn("⚠️ Chat blocked - booking not confirmed");
      alert("Chat is only available for confirmed bookings");
      return;
    }
    if (!chatBookingId || !vehicleOwnerId) {
      console.warn("⚠️ Chat blocked - missing booking or owner id", { chatBookingId, vehicleOwnerId });
      alert("Unable to open chat: booking information is missing. Please go back and try again.");
      return;
    }
    setIsChatOpen(true);
  };

  // Enhanced function to open live navigation in Google Maps
  const openLiveNavigation = () => {
    const vehicleLat = vehicleData?.latitude || vehicleData?.pickupLatitude;
    const vehicleLng = vehicleData?.longitude || vehicleData?.pickupLongitude;

    if (!vehicleLat || !vehicleLng) {
      // Fallback to search if coordinates are not available
      const searchQuery = encodeURIComponent(
        `${vehicleData?.pickupArea || ''} ${vehicleData?.pickupCity || ''} ${vehicleData?.pickupCityState || ''}`.trim()
      );
      if (searchQuery) {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
        window.open(mapsUrl, "_blank");
      } else {
        alert("Vehicle location is not available");
      }
      return;
    }

    // Request real-time location permission and open navigation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          
          // Open Google Maps with navigation from current location to destination
          // Using dir (directions) API with current location as origin
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLng}&destination=${vehicleLat},${vehicleLng}&travelmode=driving`;
          
          console.log("🗺️ Opening live navigation:", {
            from: `${currentLat},${currentLng}`,
            to: `${vehicleLat},${vehicleLng}`,
            url: mapsUrl
          });
          
          window.open(mapsUrl, "_blank");
        },
        (error) => {
          console.error("❌ Geolocation error:", error);
          
          // Fallback: Open without current location (user can enable location in Google Maps)
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${vehicleLat},${vehicleLng}&travelmode=driving`;
          
          alert("Location access denied. Opening navigation without current location. Please enable location in Google Maps for live tracking.");
          window.open(mapsUrl, "_blank");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      // Browser doesn't support geolocation
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${vehicleLat},${vehicleLng}&travelmode=driving`;
      alert("Geolocation not supported. Opening navigation - please allow location access in Google Maps.");
      window.open(mapsUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || "Vehicle not found"}</p>
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

  const isCar = vehicleType === "car" || !!vehicleData.CarName || !!vehicleData.carName || !!vehicleData.carImages;

  let vehicleImages = (isCar ? vehicleData.carImages : vehicleData.bikeImages) || [];
  vehicleImages = vehicleImages.filter((img) => img && img.trim() !== "" && img !== "undefined");

  const carDummyImages = [
    "https://e7.pngegg.com/pngimages/768/421/png-clipart-car-computer-icons-sedan-auto-detailing-auto-driving-rectangle-thumbnail.png",
    "https://png.pngtree.com/png-vector/20191201/ourmid/pngtree-car-vector-logo-design-png-image_2066853.jpg",
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
    ? vehicleData.CarName || vehicleData.carName || passedBooking?.vehicleName || "Unknown Vehicle"
    : vehicleData.bikeName || passedBooking?.vehicleName || "Unknown Bike";

  const displayPrice = isCar
    ? vehicleData.RentPerHour || passedBooking?.price || 0
    : vehicleData.pricePerKm || passedBooking?.price || 0;

  const priceUnit = isCar ? "/hr" : "/km";

  const currentUserId = localStorage.getItem('userId') || 'temp-user-' + Date.now();
  const vehicleOwnerId = vehicleData.userId || vehicleData.ownerId || '';
  // NOTE: passedBooking comes from MyBookings.tsx, which names the real booking id `id`, not `_id` -
  // check `.id` first so this doesn't silently fall back to vehicleId and create a mismatched chat thread.
  const chatBookingId = passedBooking?.id || passedBooking?._id || passedBooking?.bookingId || '';

  const enabledButtonClass = "flex-1 flex items-center justify-center gap-2 sm:gap-3 text-white font-semibold text-[16px] sm:text-[18px] transition-all duration-200 hover:opacity-90 rounded-full bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] py-3 sm:py-0 cursor-pointer";
  const disabledButtonClass = "flex-1 flex items-center justify-center gap-2 sm:gap-3 text-gray-400 font-semibold text-[16px] sm:text-[18px] rounded-full bg-gray-200 cursor-not-allowed py-3 sm:py-0";

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 py-4 sm:py-6 flex justify-center">
      <div className="max-w-[900px] w-full bg-white p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col md:flex-row">
        {/* Vehicle Image Carousel */}
        {carouselImages.length > 0 ? (
          <div className="relative w-full md:w-[420px] h-[250px] sm:h-[300px] md:h-[300px] flex-shrink-0 rounded-[10px] border-2 border-transparent hover:border-[#0066FF] transition-all duration-200 overflow-hidden mx-auto md:mx-0">
            <img
              src={carouselImages[currentImage]}
              alt={displayName}
              className="w-full h-full object-cover transition-all duration-500 rounded-[10px]"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImage((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
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
                setCurrentImage((prev) => prev === carouselImages.length - 1 ? 0 : prev + 1);
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
                  onClick={() => setCurrentImage(idx)}
                  className={`h-2 rounded-full transition-all ${idx === currentImage ? "bg-[#0066FF] w-6" : "bg-gray-700 w-2"}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-[10px]">
            <span className="text-gray-400 text-lg">No Image Available</span>
          </div>
        )}

        {/* Vehicle Details */}
        <div className="flex flex-col ml-0 md:ml-6 mt-4 sm:mt-6 md:mt-0 flex-1">
          <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#000000] leading-tight cursor-pointer hover:underline hover:decoration-[#0066FF] hover:decoration-2 transition-all" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
            {displayName}
          </h1>

          <div className="flex items-baseline mt-2 cursor-pointer hover:underline hover:decoration-[#0066FF] hover:decoration-2">
            <span className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>₹{displayPrice}</span>
            <span className="text-gray-500 ml-2 text-sm">{priceUnit}</span>
          </div>

          {/* Vehicle Features */}
          <div className="flex items-center mt-4 border border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-[#0066FF] hover:border-2">
            {isCar ? (
              <>
                <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-3 px-2 sm:px-4">
                  <img src={AutomaticLogo} className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-1.5" alt="transmission" />
                  <span className="text-[11px] sm:text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{vehicleData.transmissionType || "Manual"}</span>
                </div>
                <div className="w-[1px] h-10 sm:h-12 bg-[#E5E5E5]"></div>
                <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-3 px-2 sm:px-4">
                  <img src={seats} className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-1.5" alt="seats" />
                  <span className="text-[11px] sm:text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{vehicleData.Carseater || "5"} Seats</span>
                </div>
                <div className="w-[1px] h-10 sm:h-12 bg-[#E5E5E5]"></div>
                <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-3 px-2 sm:px-4">
                  <img src={Petrol} className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-1.5" alt="fuel" />
                  <span className="text-[11px] sm:text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{vehicleData.fuelType || "Petrol"}</span>
                </div>
                <div className="w-[1px] h-10 sm:h-12 bg-[#E5E5E5]"></div>
                <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-3 px-2 sm:px-4">
                  <img src={AClogo} className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-1.5" alt="ac" />
                  <span className="text-[11px] sm:text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{vehicleData.Ac_available ? "AC" : "Non-AC"}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 flex flex-col items-center justify-center py-3 px-4">
                  <img src={BikeCC} className="w-6 h-6 mb-1.5" alt="engine" />
                  <span className="text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {vehicleData.engineCapacity || vehicleData.bikeEngine || vehicleData.bikeCC || "350"} CC
                  </span>
                </div>
                <div className="w-[1px] h-12 bg-[#E5E5E5]"></div>
                <div className="flex-1 flex flex-col items-center justify-center py-3 px-4">
                  <img src={AutomaticLogo} className="w-6 h-6 mb-1.5" alt="transmission" />
                  <span className="text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {vehicleData.transmissionType || "Manual"}
                  </span>
                </div>
                <div className="w-[1px] h-10 sm:h-12 bg-[#E5E5E5]"></div>
                <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-3 px-2 sm:px-4">
                  <img src={Petrol} className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-1.5" alt="fuel" />
                  <span className="text-[11px] sm:text-[13px] text-[#333333] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Petrol</span>
                </div>
                <div className="w-[1px] h-10 sm:h-12 bg-[#E5E5E5]"></div>
                <div className="flex flex-col items-center px-3 sm:px-4 py-2 sm:py-3">
                  <img src={Location} className="w-6 h-6 mb-1.5" alt="location" />
                  <span className="text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {vehicleData.pickupCity || vehicleData.pickupArea || "N/A"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Description Card */}
          <div className="border border-[#E5E5E5] rounded-[10px] p-3 sm:p-4 bg-white mb-3 sm:mb-4 mt-3 sm:mt-4 cursor-pointer hover:border-[#0066FF] hover:border-2 transition-all duration-200 w-full max-w-full">
            <h2 className="text-[16px] sm:text-[18px] font-bold text-[#000000] mb-2 cursor-pointer hover:underline hover:decoration-[#0066FF] hover:decoration-2 transition-all" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Description</h2>
            <p className="text-[#666666] text-[13px] sm:text-[14px] leading-[1.6] min-h-[40px] break-words whitespace-normal overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {vehicleData.description || "No description available"}
            </p>
          </div>

          {/* Status indicator when not confirmed */}
          {!isConfirmed && passedBooking?.status && (
            <div className="mb-3 sm:mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-amber-700">
                Chat and navigation are available only for <span className="font-semibold">Confirmed</span> bookings.
                Current status: <span className="font-semibold">{passedBooking.status === "AutoCancelled" ? "Auto Cancelled" : passedBooking.status}</span>
              </p>
            </div>
          )}
             
          {/* Vehicle Pickup Location & Distance - Only for Confirmed Bookings */}
          {passedBooking?.status && passedBooking.status.toLowerCase() === "confirmed" && (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl mb-4">
              {/* Distance Display */}
              {(drivingDistance || distanceLoading) && (
                <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        {distanceLoading ? (
                          <Loader2 className="text-white animate-spin" size={18} />
                        ) : (
                          <Navigation className="text-white" size={18} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-700">Driving Distance</span>
                        {estimatedTime && (
                          <span className="text-xs text-gray-500">Est. time: {estimatedTime}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {distanceLoading ? "..." : drivingDistance}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Estimated road distance • Actual may vary based on traffic
                  </p>
                </div>
              )}

              {/* Vehicle Pickup Location */}
              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="text-white" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Vehicle Pickup Location
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {vehicleData.pickupArea && vehicleData.pickupCity 
                        ? `${vehicleData.pickupArea}, ${vehicleData.pickupCity}${vehicleData.pickupCityState ? ', ' + vehicleData.pickupCityState : ''}`
                        : vehicleData.pickupCity || vehicleData.pickupArea || "Location not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Navigation Button */}
              <button
                onClick={openLiveNavigation}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-98 cursor-pointer"
              >
                <Navigation size={18} />
                <span>Start Live Navigation</span>
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Opens Google Maps with turn-by-turn directions from your current location
              </p>
            </div>
          )}

          {/* Action Button for Non-Confirmed */}
          {(!passedBooking?.status || passedBooking.status.toLowerCase() !== "confirmed") && passedBooking && (
            <div className="mb-4">
              <button
                onClick={() => navigate(-1)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all duration-200"
              >
                Back to Bookings
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 h-[50px] sm:h-[56px]">
            <button
              onClick={handleChatClick}
              disabled={!isConfirmed}
              className={isConfirmed ? enabledButtonClass : disabledButtonClass}
              style={{ fontFamily: 'Inter, sans-serif' }}
              title={!isConfirmed ? "Chat is available only for confirmed bookings" : ""}
            >
              <MessageCircle size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              <span>Chat</span>
            </button>
          </div>

          <PopupChat
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            pageRole="customerView"
            currentUserId={currentUserId}
            currentUserName={localStorage.getItem('userName') || 'You'}
            ownerId={vehicleOwnerId}
            ownerName={vehicleData.contactName || "Vehicle Owner"}
            ownerAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vehicleData.contactName || "Owner"}`}
            customerId={currentUserId}
            customerName={localStorage.getItem('userName') || 'You'}
            customerAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStorage.getItem('userName') || 'You'}`}
            bookingId={chatBookingId}
            vehicleId={vehicleData._id}
            apiUrl={apiService.chat.apiUrl}
            socketUrl={SOCKET_URL}
            useRealtime={true}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;