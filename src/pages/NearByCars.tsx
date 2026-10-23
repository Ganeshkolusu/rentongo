
import React, { useState, useEffect } from "react";
import apiService from "../services/api.service";
import { useLocation } from "../store/location.context";
import VehicleCard from "../components/ui/VehicleCard";
interface Car {
  _id: string;
  CarName: string;
  CarModel?: string;
  Carseater: string | number;
  fuelType: string;
  transmissionType: string;
  kmDriven: number;
  description?: string;
  RentPerDay: number;
  pickupArea?: string;
  pickupCity?: string;
  pickupCityState?: string;
  pickupCityCountry?: string;
  carImages?: string[];
  distance?: string | number;
  averageRating?: string | number;
  totalReviews?: number;
}

interface NearbyCarsProps {
  limit?: number;
  searchText?: string;
  filters?: {
    priceRange?: [number, number];
    fuelType?: string;
    transmission?: string;
    searchText?: string;
    distance?: number;
    carName?: string;
  };
  onResultsChange?: (hasResults: boolean) => void;
}

const NearbyCars: React.FC<NearbyCarsProps> = ({ limit, filters, searchText, onResultsChange }) => {
  const { coordinates, currentCity } = useLocation();

  const [vehicles, setVehicles] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range] = useState(5);

  useEffect(() => {
    const fetchNearbyCars = async () => {
      try {
        setLoading(true);
        setError("");

        const { latitude, longitude } = coordinates;
        const distanceToUse = filters?.distance || 10;

        console.log("🚗 Fetching nearby cars with distance:", distanceToUse);

        const response = await apiService.car.getNearbyCars(latitude, longitude, distanceToUse);
        const responseData = response.data || response;
        const carsArray = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData.data)
            ? responseData.data
            : responseData.cars || [];

        const formattedCars: Car[] = carsArray.map((car: any) => ({
          _id: car._id,
          CarName: car.CarName || "Unknown Car",
          CarModel: car.CarModel || "N/A",
          Carseater: car.Carseater || "4",
          fuelType: car.fuelType || "N/A",
          transmissionType: car.transmissionType || "N/A",
          kmDriven: car.kmDriven || 0,
          description: car.description || "No description available",
          RentPerDay: car.RentPerDay || 0,
          pickupArea: car.pickupArea || "Unknown",
          pickupCity: car.pickupCity || currentCity,
          pickupCityState: car.pickupCityState || "",
          pickupCityCountry: car.pickupCityCountry || "",
          carImages:
            Array.isArray(car.carImages) && car.carImages.length > 0
              ? car.carImages
              : ["https://via.placeholder.com/400x250?text=No+Image"],
          distance: car.distance || "0",
          averageRating: car.averageRating || "0.0",
          totalReviews: car.totalReviews || 0,
        }));
        setVehicles(formattedCars);
        console.log("🚗 Fetched", formattedCars.length, "cars");
      } catch (err: any) {
        console.error("Error fetching nearby cars:", err);
        setError(err.message || "Failed to fetch nearby cars.");
      } finally {
        setLoading(false);
      }
    };
    fetchNearbyCars();
  }, [coordinates, currentCity, range, filters?.distance]);

  const filteredCars = React.useMemo(() => {
    let filtered = vehicles;

    const effectiveSearchText = searchText || filters?.searchText;

    if (effectiveSearchText && effectiveSearchText.trim()) {
      const searchLower = effectiveSearchText.toLowerCase().trim();
      filtered = filtered.filter(
        car =>
          car.CarName.toLowerCase().includes(searchLower) ||
          car.CarModel?.toLowerCase().includes(searchLower) ||
          car.pickupArea?.toLowerCase().includes(searchLower) ||
          car.pickupCity?.toLowerCase().includes(searchLower)
      );
    }

    if (filters) {
      if (filters.priceRange) {
        filtered = filtered.filter(
          car => car.RentPerDay >= filters.priceRange![0] &&
            car.RentPerDay <= filters.priceRange![1]
        );
      }

      if (filters.fuelType && filters.fuelType !== "All") {
        filtered = filtered.filter(
          car => car.fuelType.toLowerCase().includes(filters.fuelType!.toLowerCase())
        );
      }

      if (filters.transmission && filters.transmission !== "All") {
        filtered = filtered.filter(
          car => car.transmissionType.toLowerCase().includes(filters.transmission!.toLowerCase())
        );
      }

      if (filters.carName && filters.carName.trim()) {
        const carNameLower = filters.carName.toLowerCase().trim();
        filtered = filtered.filter(
          car => car.CarName.toLowerCase().includes(carNameLower)
        );
      }

      // Distance filtering
      const distance = filters.distance || 0;
      if (distance && distance > 0) {
        console.log("📍 Filtering by distance:", distance, "km");
        filtered = filtered.filter(
          car => {
            const carDistance = parseFloat(String(car.distance || 0));
            const isWithinDistance = carDistance <= distance;
            return isWithinDistance;
          }
        );
        console.log("📍 After distance filter:", filtered.length, "cars within", distance, "km");
      }
    }

    return limit ? filtered.slice(0, limit) : filtered;
  }, [vehicles, filters, limit, searchText]);

  // Notify parent when search results change
  useEffect(() => {
    if (onResultsChange && searchText) {
      onResultsChange(filteredCars.length > 0);
    }
  }, [filteredCars.length, searchText, onResultsChange]);

  const displayedCars = filteredCars;

  return (
    <div className={limit ? "w-full" : "bg-gray-50 min-h-screen p-6 flex flex-col"}>
      {!limit && (
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Nearby Cars
        </h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-full text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 col-span-full text-center">{error}</p>
        ) : displayedCars.length > 0 ? (
          displayedCars.map((v) => (
            <VehicleCard
              key={v._id}
              vehicle={{
                id: v._id,
                name: v.CarName,
                price: v.RentPerDay,
                transmission: v.transmissionType,
                fuel: v.fuelType,
                seats: Number(v.Carseater) || 0,
                location: `${v.pickupArea || ""}, ${v.pickupCity || ""}`,
                rating: Number(v.averageRating) || 4.4,
                distance: String(v.distance),
                image:
                  v.carImages?.[0] ||
                  "https://via.placeholder.com/400x250?text=No+Image",
              }}
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            {searchText || filters?.searchText
              ? `No cars found matching "${searchText || filters?.searchText}"`
              : "No cars available nearby."}
          </p>
        )}
      </div>
    </div>
  );
};

export default NearbyCars;