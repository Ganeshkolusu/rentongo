
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { useListedCarsStore } from "../store/listedCars.store";
import { useLocation } from "../store/location.context";
import apiService from "../services/api.service";
import OwnerCalendar from "../components/ui/OwnerCalendar/OwnerCalendar";

import BlackCar from "../assets/images/BlackCar.png";
import AutomaticLogo from "../assets/icons/AutomaticLogo.png";
import DriverLogo from "../assets/icons/DriverLogo.png";
import CarLogo from "../assets/icons/CarLogo.png";

import Petrol from "../assets/icons/Petrol.png";
import Location from "../assets/icons/Location.png";
import Search from "../assets/icons/Search.png";
import FilterCard from "../components/ui/FilterCard";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

interface Vehicle {
  name: string;
  number: string;
  price: string;
  transmission: string;
  fuel: string;
  seats: string;
  location: string;
  rating: string;
  available: boolean;
  image: string;
  id?: string;
  _id?: string;
  contactNumber: number | string;
  contactName: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  status?: string;
}

interface ApiCar {
  _id: string;
  carName: string;
  carModel: string;
  carNumber: string;
  pricePerHour: number;
  transmission?: string;
  fuelType?: string;
  seatingCapacity?: number;
  location?: string;
  carImages?: string[];
  rating?: number;
  isAvailable?: boolean;
  contactNumber: number;
  contactName: string;
  status?: string;
}

const ListedCars: React.FC = () => {
  const navigate = useNavigate();
  const { currentCity } = useLocation();
  const { cars: userListedCars, deleteCar } = useListedCarsStore();

  const hasFetched = useRef(false);

  // State management
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const [selectedList, setSelectedList] = useState<"cars" | "bikes">("cars");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [deletingCarId, setDeletingCarId] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const loggedInUserId = localStorage.getItem('userId') || " ";

  useEffect(() => {
    if (hasFetched.current) {
      console.log("⚠️ Already fetched cars, skipping...");
      return;
    }

    const fetchMyCars = async () => {
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

        console.log("🚗 Fetching cars for user:", userId);

        const response = await apiService.car.getMyVehicles(userId);
        const responseData = response.data || response;
        let carsArray = [];
        if (responseData.data && responseData.data.cars) {
          carsArray = responseData.data.cars;
        } else if (responseData.cars) {
          carsArray = responseData.cars;
        } else if (Array.isArray(responseData)) {
          carsArray = responseData;
        }

        console.log(`✅ Found ${carsArray.length} cars`);

        const formattedCars: Vehicle[] = carsArray.map((car: any) => {
          const locationParts = [
            car.pickupArea,
            car.pickupCity,
            car.pickupCityState,
            car.pickupCityPinCode
          ].filter(Boolean);

          const locationString = locationParts.length > 0
            ? locationParts.join(', ')
            : currentCity;

          return {
            _id: car._id,
            id: car._id,
            name: `${car.CarName} ${car.CarModel}`,
            number: car.CarNumber || "Unknown",
            contactNumber: car.contactNumber || "unknown",
            contactName: car.contactName || "unknown",
            price: car.RentPerHour || "0",
            description: car.description || "No description",
            kmDriven: car.KmDriven || car.kmDriven || "unknown",
            transmission: car.transmissionType || car.transmission || "Manual",
            fuel: car.fuelType || car.fuel || "Petrol",
            seats: `${car.Carseater || 5} Seaters`,
            location: locationString,
            rating: car.rating?.toString() || "4.0",
            available: car.Available !== false && car.isAvailable !== false,
            image: car.carImages && car.carImages.length > 0
              ? car.carImages[0]
              : BlackCar,
            status: car.Status || car.status || "pending",
          };
        });

        setCars(formattedCars);
      } catch (err: any) {
        console.error("❌ Error fetching cars:", err);
        hasFetched.current = false;
        const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch cars";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCars();

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

  const allCars = useMemo(() => {
    const userCars: Vehicle[] = userListedCars.map((car) => ({
      name: `${car.carName} ${car.model}`,
      number: car.carNumber || "Unknown",
      price: car.rentPrice,
      transmission: car.transmission,
      fuel: car.fuel,
      seats: "5 Seaters",
      location: `${car.city}, ${car.street}`,
      rating: car.rating.toString(),
      available: true,
      image: car.photos[0] || BlackCar,
      id: car.id,
      contactName: car.ownerName,
      contactNumber: car.contactNumber || "N/A",
      status: "pending",
    }));
    return [...userCars, ...cars];
  }, [userListedCars, cars]);

  const getCarStatus = (car: Vehicle) => {
    const status = (car.status || '').toLowerCase().trim();
    const isPending = status === 'pending';
    const isApproved = status === 'verified' || status === 'approved';
    return { status, isPending, isApproved };
  };

  const handleOpenAvailabilityModal = (vehicle: any, e: React.MouseEvent) => {
    e.stopPropagation();

    const { isApproved } = getCarStatus(vehicle);
    if (!isApproved) {
      return;
    }

    setSelectedVehicle(vehicle);
    setShowCalendarModal(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    const { isApproved } = getCarStatus(vehicle);
    if (!isApproved) {
      return;
    }

    const id = vehicle._id || vehicle.id;

    if (!id) {
      console.error("❌ No vehicle ID found for:", vehicle.name);
      return;
    }

    console.log("✏️ Editing vehicle:", vehicle.name, "ID:", id);

    navigate(`/Car-Details/${id}`, {
      state: {
        carData: vehicle,
        openEditForm: true,
      },
    });

    setMenuOpenIndex(null);
  };

  const handleDelete = (vehicle: Vehicle) => {
    console.log("🗑️ Preparing to delete vehicle:", vehicle.name);
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
      setDeletingCarId(vehicleId);
      console.log('🗑️ Deleting car with ID:', vehicleId);

      await apiService.car.deleteCarById(vehicleId);

      console.log('✅ Car deleted successfully');

      setCars(cars.filter((car) => {
        const carId = car._id || car.id;
        return carId !== vehicleId;
      }));
      deleteCar(vehicleId);

      setSuccessMessage(`${vehicle.name} deleted successfully!`);
      setError("");
    } catch (error: any) {
      console.error('❌ Error deleting car:', error);

      const errorMsg = error?.response?.data?.message ||
        error?.message ||
        "Failed to delete vehicle. Please try again.";

      setError(`Failed to delete ${vehicle.name}. ${errorMsg}`);
    } finally {
      setDeletingCarId(null);
      setMenuOpenIndex(null);
      setShowDeleteModal(false);
      setVehicleToDelete(null);
    }
  };

  const handleMenuToggle = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setMenuOpenIndex(menuOpenIndex === index ? null : index);
  };

  const handleCardClick = (car: Vehicle) => {
    const { isApproved } = getCarStatus(car);
    if (!isApproved) {
      return;
    }
  };

  const handleAddCar = () => {
    navigate('/list-car');
  };

  const filteredCars = allCars.filter((car) =>
    car.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && cars.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading cars...</span>
      </div>
    );
  }

  return (


    <div className="min-h-screen bg-gray-50 px-0 sm:px-2 lg:px-3 py-6">


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
      <div className="max-w-8xl mx-auto mb-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex items-center w-full md:w-[300px] h-[50px] border rounded-lg px-3 bg-white cursor-pointer border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-200">
            <img src={CarLogo} alt="Dropdown Logo" className="w-[24px] h-[24px]" />
            <select
              className="flex-1 ml-2 border-none outline-none text-sm bg-transparent"
              value={selectedList}
              onChange={(e) => {
                const value = e.target.value as "cars" | "bikes";
                setSelectedList(value);
                if (value === "bikes") navigate("/listed-bike");
              }}
            >
              <option value="cars">Listed Cars</option>
              <option value="bikes">Listed Bikes</option>
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
                placeholder="Search Cars..."
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
        {filteredCars.length === 0 ? (
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm ? "No cars found" : "No cars listed yet"}
              </h2>

              <p className="text-gray-500 mb-8">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start earning by listing your first car on our platform"}
              </p>

              {!searchTerm && (
                <button
                  onClick={handleAddCar}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                >
                  <Plus size={24} />
                  Add Your First Car
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-16">
            {filteredCars.map((car, index) => {
              const isUnavailable = !car.available;
              const carId = car._id || car.id;
              const { isPending, isApproved } = getCarStatus(car);

              return (
                <div
                  key={carId || `car-${index}`}
                  onClick={() => handleCardClick(car)}
                  className={`relative flex flex-col md:flex-row bg-white rounded-xl shadow 
transition-all duration-300
border border-gray-200 hover:border-blue-500
p-3 gap-3 w-full max-w-4xl mx-auto
${!isApproved ? "opacity-60" : "cursor-pointer"}`}
                >
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="w-full md:w-[330px] h-[300px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">

                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = BlackCar;
                        }}
                      />
                    </div>

                    <div className="flex flex-col flex-1 font-medium gap-1">
                      <h3
                        className="font-bold text-lg text-gray-900 leading-tight line-clamp-2 overflow-hidden"
                        style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', maxWidth: "350px" }}
                      >
                        {car.name}
                      </h3>


                      <p className="font-bold text-xl mt-0.5 mb-0.5">


                        ₹{car.price}
                        <span className="text-gray-500 font-normal text-sm">/hr</span>
                      </p>

                      <div className="flex items-center gap-2">
                        <img src={AutomaticLogo} className="w-6 h-6" alt="Transmission" />
                        <span>{car.transmission}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <img src={DriverLogo} className="w-6 h-6" alt="Seats" />
                        <span>{car.seats}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <img src={Petrol} className="w-5 h-5" alt="Fuel" />
                        <span>{car.fuel}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <img src={Location} className="w-5 h-5" alt="Location" />
                        <span className="text-xs">{car.location}</span>
                      </div>

                      {isPending ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 mt-2 w-3/4 mx-auto">
                          <p className="text-yellow-800 text-sm font-medium text-center">
                            Your car is under verification
                          </p>
                        </div>
                      ) : isApproved ? (
                        <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 mt-2 w-3/4 mx-auto">
                          <p className="text-green-800 text-sm font-medium text-center">
                            Your car is approved
                          </p>
                        </div>
                      ) : null}

                      <div className="flex flex-col md:flex-row gap-3 mt-3 w-full">
                        <button
                          onClick={(e) => handleOpenAvailabilityModal(car, e)}
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
                            const vehicleId = car._id || car.id;
                            console.log("🚗 Navigating to car history, ID:", vehicleId);
                            navigate(`/vehicle-history/${vehicleId}`, {
                              state: {
                                vehicleData: car,
                                vehicleType: "car"
                              },
                            });
                          }}
                          disabled={!isApproved}
                          className={`flex items-center justify-center bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white text-sm font-semibold px-4 py-1.5 rounded-lg shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-200
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
                              handleEdit(car);
                            }}
                            disabled={!isApproved}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-red-600 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(car);
                            }}
                            disabled={deletingCarId === carId}
                          >
                            {deletingCarId === carId ? (
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

      {showFilter && <FilterCard onApply={() => setShowFilter(false)} />}

      {showCalendarModal && selectedVehicle && loggedInUserId && (
        <OwnerCalendar
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          userRole="owner"
          VechileId={selectedVehicle._id || selectedVehicle.id || ""}
          vechileType="Car"
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

export default ListedCars;

