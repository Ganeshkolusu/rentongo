import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { useListedBikesStore } from "../store/listedBikes.store";
import { useLocation } from "../store/location.context";
import apiService from "../services/api.service";

import OwnerCalendar from "../components/ui/OwnerCalendar/OwnerCalendar";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import BikeLogo from "../assets/icons/BikeLogo.png";
import Location from "../assets/icons/Location.png";
import Search from "../assets/icons/Search.png";
import BikeCC from "../assets/icons/BikeCC.png";
import Petrol from "../assets/icons/Petrol.png";
import enfield from "../assets/images/Enfield.png";
import AutomaticLogo from "../assets/icons/AutomaticLogo.png";

interface Vehicle {
  name: string;
  number: string;
  price: string;
  transmission: string;
  fuel: string;
  location: string;
  rating: string;
  available: boolean;
  image: string;
  id?: string;
  _id?: string;
  engineCapacity?: string;
  cc?: string;
  contactName: string;
  contactNumber: string;
  status?: string;
}

const ListedBikes: React.FC = () => {
  const navigate = useNavigate();
  const { currentCity } = useLocation();
  const { bikes: userListedBikes, deleteBike } = useListedBikesStore();

  const hasFetched = useRef(false);

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [bikes, setBikes] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const [selectedList, setSelectedList] = useState<"cars" | "bikes">("bikes");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingBikeId, setDeletingBikeId] = useState<string | null>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string>("");

  useEffect(() => {
    if (hasFetched.current) {
      console.log("⚠️ Already fetched bikes, skipping...");
      return;
    }

    const fetchMyBikes = async () => {
      try {
        hasFetched.current = true;

        setLoading(true);
        setError("");

        let userId = localStorage.getItem('userId');
        if (!userId || userId.length !== 24 || !/^[a-f0-9]{24}$/i.test(userId)) {
          setError("Invalid or missing userId. Please log in again.");
          setLoading(false);
          return;
        }

        console.log("🏍️ Fetching bikes for user:", userId);

        const response = await apiService.bike.getMyVehicles(userId);
        const responseData = response.data || response;

        let bikesArray = [];
        if (responseData.data && responseData.data.bikes) {
          bikesArray = responseData.data.bikes;
        } else if (responseData.bikes) {
          bikesArray = responseData.bikes;
        } else if (Array.isArray(responseData)) {
          bikesArray = responseData;
        }

        console.log(`✅ Found ${bikesArray.length} bikes`);

        const formattedBikes: Vehicle[] = bikesArray.map((bike: any) => {
          const locationParts = [
            bike.pickupArea,
            bike.pickupCity,
            bike.pickupCityState,
            bike.pickupCityPinCode
          ].filter(Boolean);

          const locationString = locationParts.length > 0
            ? locationParts.join(', ')
            : currentCity || "Unknown";

          return {
            _id: bike._id,
            id: bike._id,
            name: `${bike.bikeName || ''} ${bike.bikeModel || ''}`.trim(),
            number: bike.bikeNumber || "unknown",
            contactNumber: bike.contactNumber?.toString() || "unknown",
            contactName: bike.contactName || "unknown",
            price: bike.pricePerKm?.toString() || "0",
            transmission: bike.transmission || bike.Transmission || "Manual",
            fuel: bike.fuel || bike.fuelType || bike.Fuel || "Petrol",
            location: locationString,
            rating: bike.averageRating?.toString() || "4.0",
            available: bike.Available !== false,
            image: bike.bikeImages && bike.bikeImages.length > 0
              ? bike.bikeImages[0]
              : enfield,
            engineCapacity: bike.bikeEngine || bike.engineCapacity || bike.cc?.toString() || "150",
            cc: bike.cc?.toString() || "150",
            // Status: bike.Status || bike.status || "pending",
            status: bike.Status || bike.status || "pending",
          };
        });

        setBikes(formattedBikes);
      } catch (err: any) {
        console.error("❌ Error fetching bikes:", err);
        hasFetched.current = false;
        const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch bikes";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setMenuOpenIndex(null);
    if (menuOpenIndex !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuOpenIndex]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const allBikes = useMemo(() => {
    const userBikes: Vehicle[] = userListedBikes.map((bike) => ({
      id: bike.id,
      _id: bike.id,
      name: bike.vehicleName,
      number: bike.vehicleNumber || "",
      price: bike.farePrice,
      transmission: bike.transmission || "Manual",
      fuel: bike.fuel || "Petrol",
      engineCapacity: bike.engineCapacity || "150",
      location: bike.city && bike.street ? `${bike.city}, ${bike.street}` : bike.city || currentCity,
      rating: bike.rating?.toString() || "4.0",
      available: true,
      contactName: "unknown",
      contactNumber: "unknown",
      image: bike.photos?.[0] || enfield,
      cc: "150",
      status: "pending",
    }));

    return [...userBikes, ...bikes];
  }, [userListedBikes, bikes, currentCity]);

  const getBikeStatus = (bike: Vehicle) => {
    const status = (bike.status || '').toLowerCase().trim();
    const isPending = status === 'pending';
    const isApproved = status === 'verified' || status === 'approved';
    return { status, isPending, isApproved };
  };

  const handleOpenCalendarModal = (vehicle: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation();

    const { isApproved } = getBikeStatus(vehicle);
    if (!isApproved) {
      return;
    }

    setSelectedVehicle(vehicle);

    let userId = localStorage.getItem('userId');
    if (!userId || userId.length !== 24 || !/^[a-f0-9]{24}$/i.test(userId)) {
      userId = "68f32259cea8a9fa88029262";
    }

    console.log("🔧 Opening calendar for vehicle:", {
      vehicleId: vehicle._id || vehicle.id,
      userId: userId,
    });

    setLoggedInUserId(userId);
    setShowCalendarModal(true);
    setError("");
  };

  const handleEdit = (vehicle: Vehicle) => {
    const { isApproved } = getBikeStatus(vehicle);
    if (!isApproved) {
      return;
    }

    const id = vehicle._id || vehicle.id;

    if (!id) {
      console.error("❌ No vehicle ID found for:", vehicle.name);
      return;
    }

    console.log("✏️ Editing vehicle:", vehicle.name, "ID:", id);

    navigate(`/Bike-Details/${id}`, {
      state: {
        bikeData: vehicle,
        openEditForm: true,
      },
    });

    setMenuOpenIndex(null);
  };

  const handleDelete = (vehicle: Vehicle) => {
    console.log("🗑️ Preparing to delete bike:", vehicle.name);
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
    setMenuOpenIndex(null);
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    const vehicleId = vehicle._id || vehicle.id;

    if (!vehicleId) {
      setError("Cannot delete vehicle without ID");
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      return;
    }

    try {
      setDeletingBikeId(vehicleId);
      console.log('🗑️ Deleting bike with ID:', vehicleId);

      await apiService.bike.deleteBikeById(vehicleId);

      console.log('✅ Bike deleted successfully');

      setBikes(bikes.filter((bike) => {
        const bikeId = bike._id || bike.id;
        return bikeId !== vehicleId;
      }));
      deleteBike(vehicleId);

      setSuccessMessage(`${vehicle.name} deleted successfully!`);
      setError("");
    } catch (error: any) {
      console.error('❌ Error deleting bike:', error);

      const errorMsg = error?.response?.data?.message ||
        error?.message ||
        "Failed to delete vehicle. Please try again.";

      setError(`Failed to delete ${vehicle.name}. ${errorMsg}`);
    } finally {
      setDeletingBikeId(null);
      setMenuOpenIndex(null);
      setShowDeleteModal(false);
      setVehicleToDelete(null);
    }
  };

  const handleMenuToggle = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setMenuOpenIndex(menuOpenIndex === index ? null : index);
  };

  const handleCardClick = (bike: Vehicle) => {
    const { isApproved } = getBikeStatus(bike);
    if (!isApproved) {
      return;
    }
  };

  const handleAddBike = () => {
    navigate('/list-bike');
  };

  const filteredBikes = allBikes.filter((bike) =>
    bike.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && bikes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading bikes...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6 py-6">

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-8xl mx-auto mb-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex items-center w-full md:w-[300px] h-[50px] border rounded-lg px-3 bg-white cursor-pointer border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-200">
            <img src={BikeLogo} alt="Dropdown Logo" className="w-[24px] h-[24px]" />
            <select
              className="flex-1 ml-2 border-none outline-none text-sm bg-transparent"
              value={selectedList}
              onChange={(e) => {
                const value = e.target.value as "cars" | "bikes";
                setSelectedList(value);
                if (value === "cars") navigate("/listed");
              }}
            >
              <option value="bikes">Listed Bikes</option>
              <option value="cars">Listed Cars</option>
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-[300px] h-[50px] transition-all duration-200 rounded-full">
              <img
                src={Search}
                alt="Search"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search Bikes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full rounded-full border pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {filteredBikes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-center max-w-md">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm ? "No bikes found" : "No bikes listed yet"}
              </h2>

              <p className="text-gray-500 mb-8">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start earning by listing your first bike on our platform"}
              </p>

              {!searchTerm && (
                <button
                  onClick={handleAddBike}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                >
                  <Plus size={24} />
                  Add Your First Bike
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-12">

            {filteredBikes.map((bike, index) => {
              const isUnavailable = !bike.available;
              const bikeId = bike._id || bike.id;
              const { isPending, isApproved } = getBikeStatus(bike);

              return (
                <div
                  key={bikeId || `bike-${index}`}
                  onClick={() => handleCardClick(bike)}
                  className={`relative flex flex-col md:flex-row bg-white rounded-xl shadow 
transition-all duration-300
border border-gray-200 hover:border-blue-500
p-3 gap-3 w-full max-w-4xl mx-auto
${!isApproved ? "opacity-60" : "cursor-pointer"}`}

                >
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="w-full md:w-[330px] h-[300px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">

                      <img
                        src={bike.image}
                        alt={bike.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = enfield;
                        }}
                      />
                    </div>

                    <div className="flex flex-col flex-1 font-medium gap-1">

                      <h3
                        className="font-bold text-lg text-gray-900 leading-tight line-clamp-2 overflow-hidden"
                        style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical' }}
                      >
                        {bike.name}
                      </h3>




                      <p className="font-bold text-xl mt-0.5 mb-0.5">

                        ₹{bike.price}
                        <span className="text-gray-500 font-normal text-sm">/km</span>
                      </p>

                      {bike.engineCapacity && (
                        <div className="flex items-center gap-2">
                          <img src={BikeCC} className="w-6 h-6" alt="Engine" />
                          <span>{bike.engineCapacity} CC</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <img src={AutomaticLogo} className="w-5 h-5" alt="Transmission" />
                        <span>{bike.transmission}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <img src={Petrol} className="w-5 h-5" alt="Fuel" />
                        <span>{bike.fuel}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <img src={Location} className="w-5 h-5" alt="Location" />
                        <span className="text-xs">{bike.location}</span>
                      </div>

                      {isPending ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 mt-2 w-3/4 mx-auto">
                          <p className="text-yellow-800 text-sm font-medium text-center">
                            Your Bike is under verification
                          </p>
                        </div>
                      ) : isApproved ? (
                        <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 mt-2 w-3/4 mx-auto">
                          <p className="text-green-800 text-sm font-medium text-center">
                            Your Bike is approved
                          </p>
                        </div>
                      ) : null}


                      <div className="flex flex-col md:flex-row gap-3 mt-3 w-full">
                        <button
                          onClick={(e) => handleOpenCalendarModal(bike, e)}
                          disabled={loading || !isApproved}
                          className={`px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm 
                            bg-red-100 text-red-700 border border-red-300 
                            hover:bg-red-200 hover:shadow-md transition-all duration-200
                            ${!isApproved ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500 border-gray-300" : ""}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isUnavailable ? "Manage Unavailability" : "Add Not Available Slot +"}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isApproved) return;
                            const vehicleId = bike._id || bike.id;
                            console.log("🏍️ Navigating to bike history, ID:", vehicleId);
                            navigate(`/vehicle-history/${vehicleId}`, {
                              state: {
                                vehicleData: bike,
                                vehicleType: "bike"
                              },
                            });
                          }}
                          disabled={!isApproved}
                          className={`flex items-center justify-center bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white text-sm font-semibold px-4 py-1.5 rounded-lg shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-200
                            ${!isApproved ? "opacity-50 cursor-not-allowed bg-gray-400" : ""}`}
                        >
                          View Booking History
                        </button>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 z-10">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                        onClick={(e) => handleMenuToggle(index, e)}
                      >
                        <span className="text-2xl">⋮</span>
                      </button>
                      {menuOpenIndex === index && (
                        <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg min-w-[150px] overflow-hidden">
                          <button
                            className={`w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 transition-all duration-200
                              ${!isApproved ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(bike);
                            }}
                            disabled={!isApproved}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-red-600 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(bike);
                            }}
                            disabled={deletingBikeId === bikeId}
                          >
                            {deletingBikeId === bikeId ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>🗑️ Delete</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isUnavailable && isApproved && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
                        UNAVAILABLE
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCalendarModal && selectedVehicle && loggedInUserId && (
        <OwnerCalendar
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          userRole="owner"
          VechileId={selectedVehicle._id || selectedVehicle.id || ""}
          vechileType="Bike"
          userId={localStorage.getItem('userId') || ""}
        />
      )}

      {showDeleteModal && vehicleToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onConfirm={() => handleDeleteVehicle(vehicleToDelete)}
          onCancel={() => {
            setShowDeleteModal(false);
            setVehicleToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default ListedBikes;