import React from "react";
import { useNavigate } from "react-router-dom";
import { Vehicle } from "../../types/Vehicle";
import { useReviewStore } from "../../store/review.store";
import DriverLogo from "../../assets/icons/seats.jpeg";
import Petrol from "../../assets/icons/fuel.jpeg";
import { MapPin } from "lucide-react";

interface BikeCardProps {
  vehicle: Vehicle;
  showBookButton?: boolean;

  onBook?: (vehicle: Vehicle) => void;
}

const BikeCard: React.FC<BikeCardProps> = ({ vehicle, onBook }) => {
  const navigate = useNavigate();
  const { getAverageRating } = useReviewStore();
  const rating = getAverageRating(vehicle.id);
  const handleCardClick = () => {
    if (onBook) {
      onBook(vehicle);
    } else {
      navigate(`/book-now/${vehicle.id}`, {
        state: { vehicleType: vehicle.type || 'bike' }
      });
    }
  };
  return (

    <div
      onClick={handleCardClick}
      className="w-full border-b pb-5 cursor-pointer p-2 hover:bg-gray-50 transition"
    >
      {/* Image on top */}
      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="w-full h-48 object-cover rounded-xl"
      />

      {/* Details Below */}
      <div className="mt-3">
        {/* Name + Rating */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{vehicle.name}</h2>

          <div className="flex items-center gap-1 border border-yellow-400 px-2 py-1 rounded-lg text-yellow-500 text-sm">
            ⭐ {vehicle.rating}
          </div>
        </div>

        {/* Price */}
        <p className="text-2xl font-bold mt-1">
          ₹{vehicle.price}
          <span className="text-gray-500 text-base font-normal">/day</span>
        </p>

        {/* Features */}
        <div className="mt-2 text-gray-700 space-y-1 text-sm">


          <p className="flex items-center gap-2"> <img src={Petrol} alt="Fuel" className="w-4 h-4 sm:w-5 sm:h-5" /> {vehicle.fuel}</p>
        </div>

        {/* Location */}
        <p className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
          {vehicle.location}
        </p>
        <p>{vehicle.distance}km away</p>
      </div>
    </div>
  );
};

export default BikeCard;

