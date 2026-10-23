import React, { useState } from "react";
import { Search } from "lucide-react";
import VehicleSection from "../components/VehicleSection";
import DateTimePicker from "../components/ui/DateTimePicker";
import FilterCard, { FilterState } from "../components/ui/FilterCard";
import PromoSlides from "../components/PromoSlides";
import { vehicles } from "./data/Vehicle";
import Filter from "../assets/icons/FilterLogo.png";
import NearbyCars from "./NearByCars";
import NearbyBikes from "./NearByBikes";
import { useNavigate } from "react-router-dom";
import Modal from "../components/ui/modals";

const Rental: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const handleRange = (data: any) => {
    console.log("Selected Range:", data);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* 🔹 Promo Slides */}
      <div className="px-4 sm:px-6 py-4">
        <PromoSlides />
      </div>

      {/* 🔹 Search & Date Pickers */}
      <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">
            Select Date & Time
          </h3>
          {/* ✅ Horizontal Calendars */}
          <div className="flex flex-col sm:flex-row gap-3">
            <DateTimePicker
              value={startDate}
              onChange={setStartDate}
              minDate={new Date().toISOString().split("T")[0]}
            />
            <DateTimePicker
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
            />
          </div>
        </div>

        {/* 🔹 Search & Filter */}
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex items-center bg-white border rounded-full relative flex-1 md:w-[300px] h-[40px]">
            <Search className="w-6 h-6 text-gray-500 mr-4 ml-2" />
            <input
              type="text"
              placeholder="Search by name or location..."
              className="flex-1 outline-none text-gray-700 text-sm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white text-lm font-semibold px-4 py-1 rounded-md hover:opacity-100 transition-all"
            >
              <img src={Filter} alt="Filter" className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {/* 🔹 Filter Modal */}
            {isFilterOpen && (
              <FilterCard
                onApply={(filters) => {
                  setAppliedFilters(filters);
                  setIsFilterOpen(false);
                }}
                onClose={() => setIsFilterOpen(false)}
                initialFilters={appliedFilters || {}}
              />
            )}
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {appliedFilters && (
        <div className="px-4 sm:px-6 py-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-blue-800">Active Filters:</h4>
              <button
                onClick={() => setAppliedFilters(null)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {appliedFilters.priceRange && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  ₹{appliedFilters.priceRange[0]} - ₹{appliedFilters.priceRange[1]}
                </span>
              )}
              {appliedFilters.fuelType && appliedFilters.fuelType !== "All" && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {appliedFilters.fuelType}
                </span>
              )}
              {appliedFilters.transmission && appliedFilters.transmission !== "All" && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {appliedFilters.transmission}
                </span>
              )}
              {appliedFilters.distance && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Within {appliedFilters.distance}km
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🚗 Cars Section */}
      {(!appliedFilters || appliedFilters.vehicleType === "cars") && (
        <div className="px-4 sm:px-6">
          <div className="flex w-full items-center justify-between mb-4 sm:mb-6 mt-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Nearby Cars
            </h2>
            <button
              onClick={() => navigate("/nearby-cars")}
              className="text-black font-semibold hover:underline"
            >
              View More →
            </button>
          </div>
          <NearbyCars
            limit={4}
            searchText={searchText}
            filters={appliedFilters && appliedFilters.vehicleType === "cars" ? {
              priceRange: appliedFilters.priceRange,
              fuelType: appliedFilters.fuelType,
              transmission: appliedFilters.transmission,
              distance: appliedFilters.distance,
              carName: appliedFilters.selectedVehicles?.[0]
            } : undefined}
          />
        </div>
      )}

      {/* 🏍 Bikes Section */}
      {(!appliedFilters || appliedFilters.vehicleType === "bikes") && (
        <div className="px-4 sm:px-6 mt-2">
          <div className="flex w-full items-center justify-between mb-4 sm:mb-6 mt-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Nearby Bikes
            </h2>
            <button
              onClick={() => navigate("/nearby-bikes")}
              className="text-black font-semibold hover:underline"
            >
              View More →
            </button>
          </div>
          <NearbyBikes
            limit={4}
            searchText={searchText}
            filters={appliedFilters && appliedFilters.vehicleType === "bikes" ? {
              priceRange: appliedFilters.priceRange,
              distance: appliedFilters.distance,
              bikeName: appliedFilters.selectedVehicles?.[0]
            } : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default Rental;