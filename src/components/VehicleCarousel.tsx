import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VehicleCard from "./ui/VehicleCard";
import { Vehicle } from "../types/Vehicle";

interface VehicleCarouselProps {
  vehicles: Vehicle[];
  title: string;
  onBook?: (vehicle: Vehicle) => void;
  onViewMore?: () => void;
  className?: string;
}

const VehicleCarousel: React.FC<VehicleCarouselProps> = ({
  vehicles,
  title,
  onBook,
  onViewMore,
  className = "",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-500">No vehicles available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">
          {onViewMore && (
            <button
              onClick={onViewMore}
              className="text-blue-600 hover:underline font-medium text-sm"
            >
              View More →
            </button>
          )}
          {vehicles.length > 1 && (
            <div className="flex gap-1 ml-4">
              <button
                onClick={scrollLeft}
                className="bg-white hover:bg-gray-50 border rounded-full p-2 shadow-sm transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={scrollRight}
                className="bg-white hover:bg-gray-50 border rounded-full p-2 shadow-sm transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 scroll-smooth scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="flex-shrink-0 w-80">
            <VehicleCard
              vehicle={vehicle}
              onBook={onBook ? () => onBook(vehicle) : undefined}
            />
          </div>
        ))}
      </div>


    </div>
  );
};

export default VehicleCarousel;