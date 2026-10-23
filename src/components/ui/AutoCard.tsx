// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Vehicle } from "../../types/Vehicle";
// import { useReviewStore } from "../../store/review.store";
// import DriverLogo from "../../assets/icons/seats.jpeg";
// import Petrol from "../../assets/icons/fuel.jpeg";
// import { MapPin } from "lucide-react";

// interface AutoCardProps {
//   vehicle: Vehicle;
//   showBookButton?: boolean;
//   onBook?: (vehicle: Vehicle) => void;
//   onEdit?: (vehicle: Vehicle) => void;
//   onDelete?: (vehicle: Vehicle) => void;
// }

// const AutoCard: React.FC<AutoCardProps> = ({
//   vehicle,
//   showBookButton = false,
//   onBook,
//   onEdit,
//   onDelete,
// }) => {
//   const navigate = useNavigate();
//   const { getAverageRating } = useReviewStore();
//   const rating = getAverageRating(vehicle.id);

//   const handleBook = () => {
//     if (onBook) onBook(vehicle);
//     else navigate(`/book-now/${vehicle.id}`);
//   };

//   return (
//     <div
//       onClick={handleBook}
//       className="flex flex-col bg-white shadow-md rounded-xl cursor-pointer border border-transparent
//                  transition-all duration-200 hover:shadow-lg hover:border-blue-500 hover:scale-95
//                  w-full sm:w-[220px] md:w-[240px] lg:w-[260px]"
//     >
//       {/* Auto Image */}
//       <div className="w-full h-48 sm:h-52 md:h-56 lg:h-60 overflow-hidden rounded-t-xl">
//         <img
//           src={vehicle.image}
//           alt={vehicle.name}
//           className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
//         />
//       </div>

//       {/* Auto Info */}
//       <div className="flex flex-col p-3">
//         {/* Name + Rating */}
//         <div className="flex items-center justify-between mb-1">
//           <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
//             {vehicle.name}
//           </h3>
//           <span className="px-1.5 py-0.5 text-xs sm:text-sm bg-yellow-50 border border-yellow-400 text-gray-900 rounded">
//             ⭐ {rating.toFixed(1)}
//           </span>
//         </div>

//         {/* Price */}
//         <p className="text-gray-700 font-bold text-sm sm:text-base mb-2">
//           ₹{vehicle.price} <span className="text-gray-500 font-normal text-xs sm:text-sm">/hr</span>
//         </p>

//         {/* Features */}
//         <div className="flex flex-col gap-1.5 text-gray-600 text-xs sm:text-sm">
//           <div className="flex items-center gap-2">
//             <img src={DriverLogo} alt="Seats" className="w-4 h-4 sm:w-5 sm:h-5" />
//             <span>{vehicle.seats} Seaters</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <img src={Petrol} alt="Fuel" className="w-4 h-4 sm:w-5 sm:h-5" />
//             <span>{vehicle.fuel}</span>
//           </div>
//           <div className="flex items-start gap-2">
//             <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
//             <span className="text-gray-500 line-clamp-2">{vehicle.location}</span>
//           </div>
//         </div>

//         {/* Optional Book Now Button */}
//         {showBookButton && (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               handleBook();
//             }}
//             className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base font-medium"
//           >
//             Book Now
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AutoCard;
export{};
