
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api.service";
import { useLocation } from "../store/location.context";
import BikeCard from "../components/ui/BikeCard";
interface Bike {
  _id: string;
  bikeName: string;
  bikeModel: string;
  bikeNumber: string;
  pricePerKm: number;
  description?: string;
  contactName?: string;
  contactNumber?: string;
  pickupArea?: string;
  pickupCity?: string;
  pickupCityState?: string;
  pickupCityCountry?: string;
  bikeImages?: string[];
  distance?: string | number;
  averageRating?: string | number;
  totalReviews?: number;
}

interface NearbyBikesProps {
  limit?: number;
  searchText?: string;
  filters?: {
    priceRange?: [number, number];
    searchText?: string;
    distance?: number;
    bikeName?: string;
  };
  onResultsChange?: (hasResults: boolean) => void;
}

const NearbyBikes: React.FC<NearbyBikesProps> = ({ limit, filters, searchText, onResultsChange }) => {
  const navigate = useNavigate();
  const { coordinates, currentCity } = useLocation();

  const [vehicles, setVehicles] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range] = useState(5);

  useEffect(() => {
    const fetchNearbyBikes = async () => {
      try {
        setLoading(true);
        setError("");

        const { latitude, longitude } = coordinates;
        const distanceToUse = filters?.distance || 10;

        console.log(`🏍️ Fetching bikes for ${currentCity} with distance:`, distanceToUse);

        const response = await apiService.bike.getNearbyBikes(latitude, longitude, distanceToUse);
        const responseData = response.data || response;
        const bikesArray = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData.data)
            ? responseData.data
            : responseData.bikes || [];

        const formattedBikes: Bike[] = bikesArray.map((bike: any) => ({
          _id: bike._id,
          bikeName: bike.bikeName || "Unknown Bike",
          bikeModel: bike.bikeModel || "N/A",
          bikeNumber: bike.bikeNumber || "N/A",
          description: bike.description || "No description available",
          pricePerKm: bike.pricePerKm || 0,
          contactName: bike.contactName || "N/A",
          contactNumber: bike.contactNumber || "N/A",
          pickupArea: bike.pickupArea || "Unknown",
          pickupCity: bike.pickupCity || currentCity,
          pickupCityState: bike.pickupCityState || "",
          pickupCityCountry: bike.pickupCityCountry || "",
          bikeImages:
            Array.isArray(bike.bikeImages) && bike.bikeImages.length > 0
              ? bike.bikeImages
              : ["https://via.placeholder.com/400x250?text=No+Image"],
          distance: bike.distance || "0",
          averageRating: bike.averageRating || "4.4",
          totalReviews: bike.totalReviews || 0,
        }));
        setVehicles(formattedBikes);
        console.log("🏍️ Fetched", formattedBikes.length, "bikes");
      } catch (err: any) {
        console.error("Error fetching nearby bikes:", err);
        setError(err.message || "Failed to fetch nearby bikes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchNearbyBikes();
  }, [coordinates, currentCity, range, filters?.distance]);

  const filteredBikes = React.useMemo(() => {
    let filtered = vehicles;

    const effectiveSearchText = searchText || filters?.searchText;

    if (effectiveSearchText && effectiveSearchText.trim()) {
      const searchLower = effectiveSearchText.toLowerCase().trim();
      filtered = filtered.filter(
        bike =>
          bike.bikeName.toLowerCase().includes(searchLower) ||
          bike.bikeModel?.toLowerCase().includes(searchLower) ||
          bike.pickupArea?.toLowerCase().includes(searchLower) ||
          bike.pickupCity?.toLowerCase().includes(searchLower)
      );
    }

    if (filters) {
      if (filters.priceRange) {
        filtered = filtered.filter(
          bike => bike.pricePerKm >= filters.priceRange![0] &&
            bike.pricePerKm <= filters.priceRange![1]
        );
      }

      if (filters.bikeName && filters.bikeName.trim()) {
        const bikeNameLower = filters.bikeName.toLowerCase().trim();
        filtered = filtered.filter(
          bike => bike.bikeName.toLowerCase().includes(bikeNameLower)
        );
      }

      // Distance filtering
      const distance = filters.distance || 0;
      if (distance && distance > 0) {
        console.log("📍 Filtering bikes by distance:", distance, "km");
        filtered = filtered.filter(
          bike => {
            const bikeDistance = parseFloat(String(bike.distance || 0));
            const isWithinDistance = bikeDistance <= distance;
            return isWithinDistance;
          }
        );
        console.log("📍 After distance filter:", filtered.length, "bikes within", distance, "km");
      }
    }

    return limit ? filtered.slice(0, limit) : filtered;
  }, [vehicles, filters, limit, searchText]);

  // Notify parent when search results change
  useEffect(() => {
    if (onResultsChange && searchText) {
      onResultsChange(filteredBikes.length > 0);
    }
  }, [filteredBikes.length, searchText, onResultsChange]);

  const displayedBikes = filteredBikes;

  return (
    <div className={limit ? "w-full" : "bg-gray-50 min-h-screen p-6 flex flex-col"}>
      {!limit && (
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Nearby Bikes
        </h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-full text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 col-span-full text-center">{error}</p>
        ) : displayedBikes.length > 0 ? (
          displayedBikes.map((v) => (
            <BikeCard
              key={v._id}
              vehicle={{
                id: v._id,
                name: v.bikeName,
                model: v.bikeModel,
                price: v.pricePerKm,
                transmission: "Manual",
                fuel: "Petrol",
                seats: 2,
                location: `${v.pickupArea || ""}, ${v.pickupCity || ""}`,
                rating: Number(v.averageRating) || 0,
                distance: String(v.distance || 0),
                image:
                  v.bikeImages?.[0] ||
                  "https://via.placeholder.com/400x250?text=No+Image",
              }}
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            {searchText || filters?.searchText
              ? `No bikes found matching "${searchText || filters?.searchText}"`
              : "No bikes available nearby."}
          </p>
        )}
      </div>
    </div>
  );
};

export default NearbyBikes;