// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useBookingStore } from "../store/booking.store";
// import { useListedCarsStore } from "../store/listedCars.store";
// // import { useListedAutosStore } from "../store/listedAutos.store";
// import { Calendar, User, Phone, ArrowLeft } from "lucide-react";
// import { useListedBikesStore } from "store/listedBikes.store";
// const MyListingBookings: React.FC = () => {
//   const navigate = useNavigate();
//   const { bookings } = useBookingStore();
//   const { cars } = useListedCarsStore();
//   // const { autos } = useListedAutosStore();
// const {bikes} =useListedBikesStore();
//   // const myVehicleIds = [...cars.map((c) => c.id), ...autos.map((a) => a.id)];
// const myVehicleIds=[...cars.map((c) => c.id), ...bikes.map((b)=> b.id)];
//   const myListingBookings = bookings.filter((b) =>
//     myVehicleIds.includes(b.vehicleId)
//   );

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Booked":
//         return "bg-yellow-100 text-yellow-700 border-yellow-300";
//       case "Picked":
//         return "bg-blue-100 text-blue-700 border-blue-300";
//       case "Completed":
//         return "bg-green-100 text-green-700 border-green-300";
//       default:
//         return "bg-gray-100 text-gray-700 border-gray-300";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex items-center gap-4 mb-6">
//           <button
//             onClick={() => navigate(-1)}
//             className="p-2 hover:bg-gray-100 rounded-lg transition"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//             My Listing Bookings
//           </h1>
//         </div>

//         {myListingBookings.length === 0 ? (
//           <div className="bg-white rounded-xl shadow-md p-8 text-center">
//             <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               No bookings yet
//             </h3>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {myListingBookings.map((b) => (
//               <div
//                 key={b.id}
//                 className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition"
//               >
//                 <div className="flex flex-col sm:flex-row justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold">{b.vehicleName}</h3>
//                     <p className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(b.status)}`}>
//                       {b.status}
//                     </p>
//                     <p className="mt-2 text-sm text-gray-600">
//                       Duration: {b.startDate} {b.startTime} → {b.endDate} {b.endTime}
//                     </p>
//                     <p className="text-sm text-gray-600">Model: {b.modelNo || "N/A"}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-2xl font-bold text-green-600">₹{b.price}</p>
//                     <p className="text-xs text-gray-500">Earning</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyListingBookings;
export default {};