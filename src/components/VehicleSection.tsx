
import React from "react";
import { useNavigate } from "react-router-dom";
import VehicleCard from "./ui/VehicleCard";
import BikeCard from "./ui/BikeCard";

type VehicleType = "Car" | "Auto" | "Bike";

interface VehicleSectionProps {
  title: string;
  vehicles: typeof import("../pages/data/Vehicle").vehicles;
  showBookButton?: boolean;
  type: VehicleType;
  hideViewMore?: boolean;
  viewMoreLink?: string;
}
const VehicleSection: React.FC<VehicleSectionProps> = ({
  title,
  vehicles,
  showBookButton = false,
  type,
  hideViewMore = false,
  viewMoreLink,
}) => {
  const navigate = useNavigate();

  // ✅ Filter and limit to 4
  const visibleVehicles = vehicles
    .filter((v) => v.type === type)
    .slice(0, 4);

  const handleViewMore = () => {
    if (viewMoreLink) navigate(viewMoreLink);
  };

  return (
    <div className="px-6 py-4 mb-6">
      {/* Title + View More */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {!hideViewMore && (
          <button
            onClick={handleViewMore}
            className="text-blue-600 hover:underline font-medium"
          >
            View More →
          </button>
        )}
      </div>
      {/* Vehicle Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleVehicles.map((v) =>
          type === "Car" ? (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onBook={() => navigate(`/book-now/${v.id}`)}
            />
          ) : type === "Bike" ? (
            <BikeCard
              key={v.id}
              vehicle={v}
              onBook={() => navigate(`/book-now/${v.id}`)}
            />
          ) : null
        )}
      </div>
    </div>
  );
};

export default VehicleSection;
